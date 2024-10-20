import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { User, Upload } from 'lucide-react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-toastify';
import { saveUserSettings, getUserSettings, uploadProfilePicture } from '../utils/database';

const Settings: React.FC = () => {
  const { isDarkMode, workTime, breakTime, setWorkTime, setBreakTime, updatePersistentDarkMode } = usePomodoro();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localDarkMode, setLocalDarkMode] = useState(isDarkMode);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setProfilePictureURL(user.photoURL || '');

      getUserSettings(user.uid).then((settings) => {
        if (settings) {
          setRole(settings.role || '');
          setWorkTime(settings.pomodoroTime || 25);
          setBreakTime(settings.breakTime || 5);
          setLocalDarkMode(settings.darkMode || false);
        }
      });
    }
  }, [setWorkTime, setBreakTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        let photoURL = profilePictureURL;
        if (profilePicture) {
          photoURL = await uploadProfilePicture(user.uid, profilePicture);
        }

        await updateProfile(user, { displayName: name, photoURL });

        const settings = {
          name,
          email,
          role,
          profilePictureUrl: photoURL,
          pomodoroTime: workTime,
          breakTime,
          darkMode: localDarkMode,
        };

        await saveUserSettings(user.uid, settings);
        updatePersistentDarkMode(localDarkMode);

        toast.success('Settings saved successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error: any) {
        console.error('Error updating settings:', error);
        toast.error('Failed to update settings. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className={`w-full p-2 rounded-md bg-gray-200 text-gray-600`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Profile Picture</label>
          <div className="flex items-center space-x-4">
            {profilePictureURL && (
              <img src={profilePictureURL} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            )}
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              <Upload size={20} className="inline mr-2" />
              Upload New Picture
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Pomodoro Time (minutes)</label>
          <input
            type="number"
            value={workTime}
            onChange={(e) => setWorkTime(Number(e.target.value))}
            className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Break Time (minutes)</label>
          <input
            type="number"
            value={breakTime}
            onChange={(e) => setBreakTime(Number(e.target.value))}
            className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            min="1"
          />
        </div>
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localDarkMode}
              onChange={(e) => setLocalDarkMode(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>Dark Mode</span>
          </label>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;