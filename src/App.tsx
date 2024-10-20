import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PomodoroProvider } from './contexts/PomodoroContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './components/Navigation';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import PomodoroTimer from './pages/PomodoroTimer';
import TaskManagement from './pages/TaskManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { usePomodoro } from './contexts/PomodoroContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, checkFirestoreConnection } from './utils/firebase';
import ErrorBoundary from './components/ErrorBoundary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppContent() {
  const { isDarkMode } = usePomodoro();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const checkConnection = setInterval(checkFirestoreConnection, 30000); // Check every 30 seconds
    return () => clearInterval(checkConnection);
  }, []);

  return (
    <Router>
      <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <>
                  <Navigation isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
                  <div className="flex w-full">
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 ml-0 md:ml-64 mt-16 md:mt-0">
                      <Routes>
                        <Route path="/" element={<AnalyticsDashboard />} />
                        <Route path="/pomodoro" element={<PomodoroTimer />} />
                        <Route path="/tasks" element={<TaskManagement />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </main>
                  </div>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      <ToastContainer />
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <PomodoroProvider>
        <AppContent />
      </PomodoroProvider>
    </ErrorBoundary>
  );
}

export default App;