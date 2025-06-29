import React from 'react';
import '../styles/navigation.css';

const Navigation = ({ currentView, setCurrentView }) => {
  return (
    <nav className="navigation">
      <ul className="nav-list">
        <li className={currentView === 'goals' ? 'active' : ''}>
          <a 
            href="goals" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('goals');
            }}
          >
            Цели и задачи
          </a>
        </li>
        <li className={currentView === 'files' ? 'active' : ''}>
          <a 
            href="files" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('files');
            }}
          >
            Управление файлами
          </a>
        </li>
        <li className={currentView === 'research' ? 'active' : ''}>
          <a 
            href="research" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('research');
            }}
            className="start-research-button"
          >
            Исследование
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 