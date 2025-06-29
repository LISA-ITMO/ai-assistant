import React from 'react';
import '../../styles/research-goals.css';

const ResearchGoals = ({ goals, tasks }) => {
  return (
    <div className="research-goals-container">
      <div className="goals-section">
        <h2>Цель исследования</h2>
        {goals && goals.length > 0 ? (
          <div className="goal-content">
            {goals.map((goal, index) => (
              <p key={index}>{goal}</p>
            ))}
          </div>
        ) : (
          <p className="no-goal">Цель исследования не указана</p>
        )}
      </div>

      <div className="tasks-section">
        <h2>Задачи исследования</h2>
        {tasks && tasks.length > 0 ? (
          <ol className="tasks-list">
            {tasks.map((task, index) => (
              <li key={index} className="task-item">
                {task}
              </li>
            ))}
          </ol>
        ) : (
          <p className="no-tasks">Задачи исследования не указаны</p>
        )}
      </div>
    </div>
  );
};

export default ResearchGoals; 