import React from 'react';
import type { AppInterface } from '../appsContextApi';

interface AppLauncherProps {
  chosenApp: AppInterface | undefined;
  onClose: ()=>void;
}

export default function AppLauncher ({chosenApp, onClose}: AppLauncherProps) {

  const renderApp = () => {
    if (!chosenApp) {
      return (
        <div className="text-white text-center">
          <p>No app selected</p>
        </div>
      );
    }

    if (!React.isValidElement(chosenApp.main)) {
      return (
        <div className="text-white text-center">
          <p>Unable to launch app.</p>
        </div>
      );
    }

    return React.cloneElement(
      chosenApp.main as React.ReactElement<Record<string, unknown>>,
      { onGameEnd: onClose }
    );
  };

  return (
    <div
      className="relative w-full h-full pb-19 overflow-hidden bg-gray-900" // Dark background, overflow hidden for scaling
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-700/50 text-white hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors duration-200"
        >
          {/* SVG for the 'X' icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          maxHeight: '100vh',
          maxWidth: '100vw',
          overflow: 'auto',
        }}
      >
        {renderApp()}

      </div>
    </div>
  )
}
