import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart2, Clock, CheckSquare, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { signOut } from 'firebase/auth';
import { auth, storage } from '../firebase';
import { toast } from 'react-toastify';
import { ref, getDownloadURL } from 'firebase/storage';

interface NavigationProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, persistentDarkMode } = usePomodoro();
  const [logoLight, setLogoLight] = useState('');
  const [logoDark, setLogoDark] = useState('');

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const lightLogoRef = ref(storage, 'Logos/Logo Karao _ Light Mode.png');
        const darkLogoRef = ref(storage, 'Logos/Logo Karao _ Dark Mode.png');
        const lightLogoUrl = await getDownloadURL(lightLogoRef);
        const darkLogoUrl = await getDownloadURL(darkLogoRef);
        setLogoLight(lightLogoUrl);
        setLogoDark(darkLogoUrl);
      } catch (error) {
        console.error('Error fetching logos:', error);
      }
    };
    fetchLogos();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Logout error:', error);
    }
  };

  const logoSrc = isDarkMode ? logoDark : logoLight;

  const navItems = [
    { path: '/', name: 'Analytics Dashboard', icon: BarChart2 },
    { path: '/pomodoro', name: 'Pomodoro Timer', icon: Clock },
    { path: '/tasks', name: 'Task Management', icon: CheckSquare },
    { path: '/settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      <button 
        onClick={toggleMobileMenu} 
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-blue-500 text-white shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <nav className={`${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-800'} w-64 h-screen fixed left-0 top-0 z-20 overflow-y-auto transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-lg`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <img src={logoSrc} alt="Karao Logo" className="h-12 w-auto" />
          </div>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-900'
                      : isDarkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggleMobileMenu();
                    }
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-2 rounded-md text-sm font-medium ${
              isDarkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
          </label>
        </div>
      </nav>
    </>
  );
};

export default Navigation;