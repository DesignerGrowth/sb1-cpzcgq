import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, storage } from '../firebase';
import { usePomodoro } from '../contexts/PomodoroContext';
import { toast } from 'react-toastify';
import { createInitialUserSettings } from '../utils/database';
import { ref, getDownloadURL } from 'firebase/storage';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { isDarkMode } = usePomodoro();
  const navigate = useNavigate();
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
        setLogoLight('');
        setLogoDark('');
      }
    };
    fetchLogos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await createInitialUserSettings(userCredential.user.uid, name, email);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please use a different email or try logging in.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  const logoSrc = isDarkMode ? logoDark : logoLight;

  return (
    <div className={`flex items-center justify-center min-h-screen w-full px-4 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-lg shadow-md ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex justify-center mb-6">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt="Karao Logo" 
              className="h-auto w-full max-w-[215px] max-h-[32px] object-contain"
            />
          ) : (
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Karao
            </span>
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Sign Up</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;