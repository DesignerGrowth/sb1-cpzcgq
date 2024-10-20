import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usePomodoro } from '../contexts/PomodoroContext';
import { Play, Pause, StopCircle, Plus } from 'lucide-react';
import { getUserSettings, saveUserSettings } from '../utils/database';
import { auth } from '../firebase';

const PomodoroTimer: React.FC = () => {
  const {
    isActive,
    isPaused,
    isBreak,
    minutes,
    seconds,
    workTime,
    breakTime,
    tasks,
    isDarkMode,
    startPomodoro,
    pausePomodoro,
    continuePomodoro,
    stopPomodoro,
    resetPomodoro,
    setWorkTime,
    setBreakTime,
    addTask,
    activeTaskId,
    updateTask
  } = usePomodoro();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [localWorkTime, setLocalWorkTime] = useState(workTime);
  const [localBreakTime, setLocalBreakTime] = useState(breakTime);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const settings = await getUserSettings(user.uid);
        if (settings) {
          setWorkTime(settings.pomodoroTime || 25);
          setBreakTime(settings.breakTime || 5);
          setLocalWorkTime(settings.pomodoroTime || 25);
          setLocalBreakTime(settings.breakTime || 5);
        }
      }
    };
    fetchUserSettings();
  }, [setWorkTime, setBreakTime]);

  useEffect(() => {
    if (activeTaskId !== null) {
      setSelectedTaskId(activeTaskId);
    }
  }, [activeTaskId]);

  useEffect(() => {
    if (!isActive) {
      resetPomodoro();
    }
  }, [isActive, resetPomodoro]);

  const handleStart = () => {
    if (selectedTaskId !== null) {
      startPomodoro(selectedTaskId);
    } else {
      toast.error('Please select a task before starting the timer.');
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
      toast.success('New task added successfully!');
    }
  };

  const handleWorkTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLocalWorkTime(value);
      setWorkTime(value);
      if (auth.currentUser) {
        await saveUserSettings(auth.currentUser.uid, { pomodoroTime: value });
      }
    }
  };

  const handleBreakTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLocalBreakTime(value);
      setBreakTime(value);
      if (auth.currentUser) {
        await saveUserSettings(auth.currentUser.uid, { breakTime: value });
      }
    }
  };

  const handleStop = () => {
    stopPomodoro();
    resetPomodoro();
  };

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} p-4 sm:p-8 rounded-lg shadow-md max-w-md mx-auto`}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Pomodoro Timer</h1>
      <div className="text-center mb-4">
        <span className={`text-lg font-semibold ${isBreak ? 'text-green-500' : 'text-red-500'}`}>
          {isBreak ? 'Break Session' : 'Work Session'}
        </span>
      </div>
      <div className="text-6xl sm:text-8xl font-bold text-center mb-8">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Task</label>
        <select
          value={selectedTaskId || ''}
          onChange={(e) => setSelectedTaskId(Number(e.target.value))}
          className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          disabled={isActive}
        >
          <option value="">Select a task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title} ({task.pomodoros}/{task.pomodoroGoal})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Add New Task</label>
        <div className="flex">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className={`flex-grow p-2 rounded-l-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            placeholder="Enter task title"
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mb-6">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
          >
            <Play size={20} className="mr-2" /> Start
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? continuePomodoro : pausePomodoro}
              className={`px-6 py-2 text-white rounded-md flex items-center ${
                isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {isPaused ? <Play size={20} className="mr-2" /> : <Pause size={20} className="mr-2" />}
              {isPaused ? 'Continue' : 'Pause'}
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
            >
              <StopCircle size={20} className="mr-2" /> Stop
            </button>
          </>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Pomodoro Time (minutes)</label>
        <input
          type="number"
          value={localWorkTime}
          onChange={handleWorkTimeChange}
          className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          min="1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Break Time (minutes)</label>
        <input
          type="number"
          value={localBreakTime}
          onChange={handleBreakTimeChange}
          className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          min="1"
        />
      </div>
    </div>
  );
};

export default PomodoroTimer;