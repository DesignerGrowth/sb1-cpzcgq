import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PomodoroProvider } from './contexts/PomodoroContext'
import ErrorBoundary from './components/ErrorBoundary'

const root = ReactDOM.createRoot(document.getElementById('root')!);

const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <PomodoroProvider>
            <App />
          </PomodoroProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Error rendering app:", error);
    root.render(
      <div>
        <h1>An error occurred</h1>
        <p>Please check the console for more details.</p>
      </div>
    );
  }
};

renderApp();