import React from 'react';
import TaskManager from '../components/TaskManager';
import ProductivityReview from '../components/ProductivityReview';
import { usePomodoro } from '../contexts/PomodoroContext';

const TaskManagement: React.FC = () => {
  const { isDarkMode } = usePomodoro();

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 p-4 sm:p-6">Task Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
        <TaskManager />
        <ProductivityReview />
      </div>
    </div>
  );
};

export default TaskManagement;