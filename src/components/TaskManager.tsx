import React, { useState, KeyboardEvent } from 'react';
import { Edit2, Trash2, Play, Pause, Plus, Minus, StopCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { usePomodoro } from '../contexts/PomodoroContext';

const TaskManager: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    startPomodoro,
    pausePomodoro,
    continuePomodoro,
    stopPomodoro,
    isDarkMode,
    isActive,
    isPaused,
    activeTaskId,
    isBreak,
    minutes,
    seconds
  } = usePomodoro();
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask('');
      toast.success('Task added successfully!');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingTaskId !== null) {
        handleSaveEdit();
      } else {
        handleAddTask();
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask(task.title);
  };

  const handleSaveEdit = () => {
    if (editingTaskId !== null && newTask.trim()) {
      updateTask({ ...tasks.find(t => t.id === editingTaskId)!, title: newTask.trim() });
      setEditingTaskId(null);
      setNewTask('');
      toast.success('Task updated successfully!');
    }
  };

  const handleDeleteTask = (id: number) => {
    deleteTask(id);
    toast.success('Task deleted successfully!');
  };

  const handleToggleComplete = (task: Task) => {
    updateTask({ ...task, completed: !task.completed });
  };

  const handleIncrementPomodoro = (task: Task) => {
    updateTask({ ...task, pomodoroGoal: task.pomodoroGoal + 1 });
  };

  const handleDecrementPomodoro = (task: Task) => {
    if (task.pomodoroGoal > 1) {
      updateTask({ ...task, pomodoroGoal: task.pomodoroGoal - 1 });
    }
  };

  const handleStartPomodoro = (taskId: number) => {
    if (isBreak) {
      toast.warning("It's break time. Please wait until the break is over to start a new session.");
    } else {
      startPomodoro(taskId);
    }
  };

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-md w-full mx-auto ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Tasks</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-800'
          }`}
          placeholder="Add a new task"
        />
        <button
          onClick={editingTaskId !== null ? handleSaveEdit : handleAddTask}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
        >
          {editingTaskId !== null ? 'Save' : <Plus size={20} />}
        </button>
      </div>
      <ul className="space-y-4">
        {sortedTasks.map(task => (
          <li key={task.id} className={`p-4 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className={`text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEditTask(task)} className="text-blue-500 hover:text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button onClick={() => handleDecrementPomodoro(task)} className="text-gray-500 hover:text-gray-600">
                  <Minus size={18} />
                </button>
                <span>{task.pomodoros}/{task.pomodoroGoal} Pomodoros</span>
                <button onClick={() => handleIncrementPomodoro(task)} className="text-gray-500 hover:text-gray-600">
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-2">
                  {isActive && activeTaskId === task.id ? (
                    <>
                      <button
                        onClick={isPaused ? continuePomodoro : pausePomodoro}
                        className={`px-4 py-2 rounded-full font-semibold text-white ${
                          isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                        disabled={isBreak}
                      >
                        {isPaused ? <Play size={18} /> : <Pause size={18} />}
                      </button>
                      <button
                        onClick={stopPomodoro}
                        className="px-4 py-2 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600"
                      >
                        <StopCircle size={18} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStartPomodoro(task.id)}
                      className={`px-4 py-2 rounded-full font-semibold text-white ${
                        isActive || isBreak
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      disabled={isActive || isBreak}
                    >
                      <Play size={18} />
                    </button>
                  )}
                </div>
                {(isActive || isPaused) && activeTaskId === task.id && (
                  <div className="text-xs font-mono">
                    {formatTime(minutes, seconds)}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${Math.min((task.pomodoros / task.pomodoroGoal) * 100, 100)}%` }}
              ></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;