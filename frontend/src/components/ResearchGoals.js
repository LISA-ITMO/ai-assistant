import React, { useState } from 'react';
import '../styles/research-goals.css';

const ResearchGoals = ({ initialGoals = [], initialTasks = [], onSave }) => {
  const [goals, setGoals] = useState(initialGoals);
  const [tasks, setTasks] = useState(initialTasks);
  const [editMode, setEditMode] = useState(false);

  const handleGoalChange = (index, value) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleSave = () => {
    onSave({ goals, tasks });
    setEditMode(false);
  };

  return (
    <div className="research-goals">
      <h2>Цели и задачи исследования</h2>
      
      <div className="goals-section">
        <h3>Цели:</h3>
        {editMode ? (
          <ul>
            {goals.map((goal, index) => (
              <li key={index}>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {goals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="tasks-section">
        <h3>Задачи:</h3>
        {editMode ? (
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>{task}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="actions">
        {editMode ? (
          <button onClick={handleSave}>Сохранить</button>
        ) : (
          <button onClick={() => setEditMode(true)}>Редактировать</button>
        )}
      </div>
    </div>
  );
};

export default ResearchGoals; 