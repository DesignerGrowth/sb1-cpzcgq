import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { usePomodoro } from '../contexts/PomodoroContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductivityReview: React.FC = () => {
  const { tasks, isDarkMode, totalBreaks } = usePomodoro();
  const [timeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const getProductivityData = useMemo(() => {
    return [
      { name: 'Completed Tasks', value: tasks.filter(task => task.completed).length },
      { name: 'Total Pomodoros', value: tasks.reduce((sum, task) => sum + task.pomodoros, 0) },
      { name: 'Total Breaks', value: totalBreaks },
    ];
  }, [tasks, timeframe, totalBreaks]);

  const chartData = {
    labels: getProductivityData.map(item => item.name),
    datasets: [
      {
        label: 'Value',
        data: getProductivityData.map(item => item.value),
        backgroundColor: isDarkMode ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#ffffff' : '#000000',
        },
      },
      title: {
        display: true,
        text: 'Productivity Overview',
        color: isDarkMode ? '#ffffff' : '#000000',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#4b5563',
        },
        grid: {
          color: isDarkMode ? '#334155' : '#e5e7eb',
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#4b5563',
        },
        grid: {
          color: isDarkMode ? '#334155' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-md w-full mx-auto ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Productivity Review</h2>
      <div className="mb-4">
        <label className="mr-2">Timeframe: {timeframe}</label>
      </div>
      <div className="h-64 sm:h-80 mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <ul className="list-disc list-inside text-sm sm:text-base">
          <li>Total tasks: {tasks.length}</li>
          <li>Completed tasks: {tasks.filter(task => task.completed).length}</li>
          <li>Total Pomodoros: {tasks.reduce((sum, task) => sum + task.pomodoros, 0)}</li>
          <li>Total Breaks: {totalBreaks}</li>
          <li>Completion rate: {((tasks.filter(task => task.completed).length / tasks.length) * 100).toFixed(2)}%</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductivityReview;