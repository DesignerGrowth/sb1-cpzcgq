import React, { useState, useMemo, useEffect } from 'react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getUserSettings } from '../utils/database';
import { auth } from '../firebase';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsDashboard: React.FC = () => {
  const { isDarkMode, tasks = [], totalBreaks = 0 } = usePomodoro();
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [userWorkTime, setUserWorkTime] = useState(25);
  const [userBreakTime, setUserBreakTime] = useState(5);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const settings = await getUserSettings(user.uid);
        if (settings) {
          setUserWorkTime(settings.pomodoroTime || 25);
          setUserBreakTime(settings.breakTime || 5);
        }
      }
    };
    fetchUserSettings();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.id).toISOString().split('T')[0];
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [tasks, startDate, endDate]);

  const analyticsData = useMemo(() => {
    const totalWorkSessions = filteredTasks.reduce((sum, task) => sum + task.pomodoros, 0);
    const totalSessions = totalWorkSessions + totalBreaks;
    const totalWorkTime = totalWorkSessions * userWorkTime;
    const totalBreakTime = totalBreaks * userBreakTime;
    const totalTime = totalWorkTime + totalBreakTime;
    const taskCompletionRate = filteredTasks.length > 0 ? filteredTasks.filter(task => task.completed).length / filteredTasks.length : 0;

    const productiveHours: { [key: string]: { work: number, break: number } } = {};
    filteredTasks.forEach(task => {
      const hour = new Date(task.id).getHours();
      const hourKey = `${hour}:00`;
      if (!productiveHours[hourKey]) {
        productiveHours[hourKey] = { work: 0, break: 0 };
      }
      productiveHours[hourKey].work += task.pomodoros;
    });

    // Distribute break sessions evenly across hours
    const breakPerHour = totalBreaks / Object.keys(productiveHours).length;
    Object.keys(productiveHours).forEach(hourKey => {
      productiveHours[hourKey].break += breakPerHour;
    });

    return {
      totalWorkSessions,
      totalBreakSessions: totalBreaks,
      totalSessions,
      totalWorkTime,
      totalBreakTime,
      totalTime,
      taskCompletionRate,
      productiveHours,
    };
  }, [filteredTasks, totalBreaks, userWorkTime, userBreakTime]);

  const chartData = {
    labels: Object.keys(analyticsData.productiveHours),
    datasets: [
      {
        label: 'Work Sessions',
        data: Object.values(analyticsData.productiveHours).map(hour => hour.work),
        backgroundColor: isDarkMode ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Break Sessions',
        data: Object.values(analyticsData.productiveHours).map(hour => hour.break),
        backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Productive Hours',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
      },
      x: {
        stacked: true,
      },
    },
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="mb-6 flex space-x-4">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-2">Total Sessions</h2>
          <p className="text-3xl font-bold">{analyticsData.totalSessions}</p>
          <p className="text-sm mt-2">Work: {analyticsData.totalWorkSessions} | Break: {analyticsData.totalBreakSessions}</p>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-2">Total Time</h2>
          <p className="text-3xl font-bold">{analyticsData.totalTime} minutes</p>
          <p className="text-sm mt-2">Work: {analyticsData.totalWorkTime} min | Break: {analyticsData.totalBreakTime} min</p>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-2">Task Completion Rate</h2>
          <p className="text-3xl font-bold">{(analyticsData.taskCompletionRate * 100).toFixed(2)}%</p>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-2">Total Breaks</h2>
          <p className="text-3xl font-bold">{analyticsData.totalBreakSessions}</p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Productive Hours</h2>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;