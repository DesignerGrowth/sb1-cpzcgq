import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { saveTask, updateTask as updateTaskInDb, deleteTask as deleteTaskInDb, savePomodoroSession, getTasks, getUserSettings, saveUserSettings, updateTotalBreaks } from '../utils/database';
import { toast } from 'react-toastify';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  pomodoros: number;
  pomodoroGoal: number;
}

interface PomodoroContextType {
  tasks: Task[];
  addTask: (title: string) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: number) => void;
  startPomodoro: (taskId: number) => void;
  pausePomodoro: () => void;
  continuePomodoro: () => void;
  stopPomodoro: () => void;
  resetPomodoro: () => void;
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
  minutes: number;
  seconds: number;
  workTime: number;
  breakTime: number;
  setWorkTime: (time: number) => void;
  setBreakTime: (time: number) => void;
  activeTaskId: number | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  persistentDarkMode: boolean;
  updatePersistentDarkMode: (mode: boolean) => void;
  totalBreaks: number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalBreaks, setTotalBreaks] = useState(0);
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [minutes, setMinutes] = useState(workTime);
  const [seconds, setSeconds] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [persistentDarkMode, setPersistentDarkMode] = useState(isDarkMode);

  const addTask = useCallback(async (title: string) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      completed: false,
      pomodoros: 0,
      pomodoroGoal: 1,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    const user = auth.currentUser;
    if (user) {
      await saveTask(user.uid, newTask);
    }
  }, []);

  const updateTask = useCallback(async (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
    const user = auth.currentUser;
    if (user) {
      await updateTaskInDb(user.uid, updatedTask);
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    const user = auth.currentUser;
    if (user) {
      await deleteTaskInDb(user.uid, id);
    }
  }, []);

  const startPomodoro = useCallback((taskId: number) => {
    setIsActive(true);
    setIsPaused(false);
    setActiveTaskId(taskId);
    setMinutes(workTime);
    setSeconds(0);
    setIsBreak(false);
  }, [workTime]);

  const pausePomodoro = useCallback(() => {
    setIsPaused(true);
  }, []);

  const continuePomodoro = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stopPomodoro = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setActiveTaskId(null);
    resetPomodoro();
  }, []);

  const resetPomodoro = useCallback(() => {
    setMinutes(workTime);
    setSeconds(0);
    setIsBreak(false);
  }, [workTime]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  const updatePersistentDarkMode = useCallback((newMode: boolean) => {
    setPersistentDarkMode(newMode);
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userTasks = await getTasks(user.uid);
        setTasks(userTasks);
        const settings = await getUserSettings(user.uid);
        if (settings) {
          setWorkTime(settings.pomodoroTime || 25);
          setBreakTime(settings.breakTime || 5);
          updatePersistentDarkMode(settings.darkMode || false);
          setTotalBreaks(settings.totalBreaks || 0);
        }
      } else {
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, [updatePersistentDarkMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          if (isBreak) {
            setIsBreak(false);
            setMinutes(workTime);
            setTotalBreaks(prev => {
              const newTotalBreaks = prev + 1;
              const user = auth.currentUser;
              if (user) {
                updateTotalBreaks(user.uid, newTotalBreaks);
              }
              return newTotalBreaks;
            });
          } else {
            setIsBreak(true);
            setMinutes(breakTime);
            if (activeTaskId !== null) {
              const task = tasks.find(t => t.id === activeTaskId);
              if (task) {
                const updatedTask = { ...task, pomodoros: task.pomodoros + 1 };
                updateTask(updatedTask);
                if (updatedTask.pomodoros >= updatedTask.pomodoroGoal) {
                  stopPomodoro();
                  toast.success(`Task "${task.title}" completed!`);
                }
              }
            }
          }
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, minutes, seconds, isBreak, workTime, breakTime, activeTaskId, tasks, updateTask, stopPomodoro]);

  const contextValue: PomodoroContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    startPomodoro,
    pausePomodoro,
    continuePomodoro,
    stopPomodoro,
    resetPomodoro,
    isActive,
    isPaused,
    isBreak,
    minutes,
    seconds,
    workTime,
    breakTime,
    setWorkTime,
    setBreakTime,
    activeTaskId,
    isDarkMode,
    toggleDarkMode,
    persistentDarkMode,
    updatePersistentDarkMode,
    totalBreaks,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};