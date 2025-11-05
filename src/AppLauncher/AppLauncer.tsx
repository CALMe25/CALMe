// import React from 'react'
import React from 'react';
import type { AppInterface } from '../appsContextApi';

interface AppLauncherProps {
  chosenApp: AppInterface | undefined;
  onClose: ()=>void;
}

export default function AppLauncer ({chosenApp, onClose}: AppLauncherProps) {

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

    if (chosenApp.name === 'matching-cards') {
      return React.cloneElement(chosenApp.main as React.ReactElement<Record<string, unknown>>, {
        onGameEnd: onClose,
      });
    }

    const elementProps = (chosenApp.main.props ?? {}) as Record<string, unknown>;

    if (typeof elementProps.onGameEnd === 'function') {
      return React.cloneElement(chosenApp.main as React.ReactElement<Record<string, unknown>>, {
        onGameEnd: onClose,
      });
    }

    return chosenApp.main;
  };

  return (
    <div
      className="relative w-full h-full pb-19 flex items-center justify-center overflow-hidden bg-gray-900" // Dark background for the display area

    >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-700/50 text-white hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors duration-200"
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
        className={`flex items-center justify-center p-4 px-4`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {renderApp()}

      </div>
    </div>
  )
}
