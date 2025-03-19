import React from 'react';
import '../styles/navigation.css';

const Navigation = ({ currentView, setCurrentView }) => {
  return (
    <nav className="navigation">
      <ul>
        <li>
          <button 
            className={currentView === 'files' ? 'active' : ''} 
            onClick={() => setCurrentView('files')}
          >
            Управление файлами
          </button>
        </li>
        <li>
          <button 
            className={currentView === 'goals' ? 'active' : ''} 
            onClick={() => setCurrentView('goals')}
          >
            Цели и задачи
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 