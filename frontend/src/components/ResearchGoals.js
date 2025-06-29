import React, { useState, useEffect, useRef } from 'react';
import '../styles/research-goals.css';

const ResearchGoals = ({ topic, onSave, initialGoals = [], initialTasks = [] }) => {
  const [goals, setGoals] = useState(initialGoals);
  const [tasks, setTasks] = useState(initialTasks);
  const [isDirty, setIsDirty] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [dragType, setDragType] = useState(null);
  const isInitialMount = useRef(true);

  const adjustTextareaHeight = (element) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (JSON.stringify(initialGoals) !== JSON.stringify(goals) || 
        JSON.stringify(initialTasks) !== JSON.stringify(tasks)) {
      setGoals(initialGoals);
      setTasks(initialTasks);
    }
  }, [initialGoals, initialTasks]);

  const handleGoalChange = (index, value) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
    setIsDirty(true);
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
    setIsDirty(true);
  };

  const handleAddGoal = () => {
    setGoals([...goals, '']);
    setIsDirty(true);
  };

  const handleAddTask = () => {
    setTasks([...tasks, '']);
    setIsDirty(true);
  };

  const handleRemoveGoal = (index) => {
    if (goals.length <= 1) return;
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
    setIsDirty(true);
  };

  const handleRemoveTask = (index) => {
    if (tasks.length <= 1) return;
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    setIsDirty(true);
  };

  const handleMoveGoalUp = (index) => {
    if (index === 0) return;
    const newGoals = [...goals];
    [newGoals[index - 1], newGoals[index]] = [newGoals[index], newGoals[index - 1]];
    setGoals(newGoals);
    setIsDirty(true);
  };

  const handleMoveGoalDown = (index) => {
    if (index === goals.length - 1) return;
    const newGoals = [...goals];
    [newGoals[index], newGoals[index + 1]] = [newGoals[index + 1], newGoals[index]];
    setGoals(newGoals);
    setIsDirty(true);
  };

  const handleMoveTaskUp = (index) => {
    if (index === 0) return;
    const newTasks = [...tasks];
    [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
    setTasks(newTasks);
    setIsDirty(true);
  };

  const handleMoveTaskDown = (index) => {
    if (index === tasks.length - 1) return;
    const newTasks = [...tasks];
    [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
    setTasks(newTasks);
    setIsDirty(true);
  };

  const handleDragStart = (e, index, type) => {
    setDragItem(index);
    setDragType(type);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnter = (e, index) => {
    setDragOverItem(index);
    e.preventDefault();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    
    if (dragItem !== null && dragOverItem !== null && dragType) {
      if (dragType === 'goals') {
        const newGoals = [...goals];
        const item = newGoals[dragItem];
        newGoals.splice(dragItem, 1);
        newGoals.splice(dragOverItem, 0, item);
        setGoals(newGoals);
      } else if (dragType === 'tasks') {
        const newTasks = [...tasks];
        const item = newTasks[dragItem];
        newTasks.splice(dragItem, 1);
        newTasks.splice(dragOverItem, 0, item);
        setTasks(newTasks);
      }
      setIsDirty(true);
    }
    
    setDragItem(null);
    setDragOverItem(null);
    setDragType(null);
  };

  const handleSave = () => {
    const filteredGoals = goals.filter(goal => goal.trim() !== '');
    const filteredTasks = tasks.filter(task => task.trim() !== '');
    
    if (filteredGoals.length === 0 || filteredTasks.length === 0) {
      alert('Пожалуйста, добавьте хотя бы одну цель и одну задачу');
      return;
    }
    
    onSave({
      goals: filteredGoals,
      tasks: filteredTasks
    });
    
    setIsDirty(false);
  };

  return (
    <div className="research-goals-container">
      <div className="goals-header">
        <h2>Цели и задачи исследования</h2>
        <p>Определите основные цели и задачи для вашего исследования по теме: <br></br><strong>{topic}</strong></p>
      </div>
      
      <div className="goals-section">
        <h3 className="section-title">Цель исследования</h3>
        <p>Цель определяет, чего вы хотите достичь в результате исследования.</p>
        
        <div className="items-list">
          {goals.map((goal, index) => (
            <div 
              key={`goal-${index}`} 
              className="goal-item"
              draggable
              onDragStart={(e) => handleDragStart(e, index, 'goals')}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle">⋮⋮</div>
              <div className="item-content">
                <textarea
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  onInput={(e) => adjustTextareaHeight(e.target)}
                  placeholder={`Цель ${index + 1}`}
                  ref={(el) => el && adjustTextareaHeight(el)}
                />
              </div>
              <div className="item-actions">
                <button 
                  className="item-action-btn move-up" 
                  onClick={() => handleMoveGoalUp(index)}
                  disabled={index === 0}
                  title="Переместить вверх"
                >
                  ↑
                </button>
                <button 
                  className="item-action-btn move-down" 
                  onClick={() => handleMoveGoalDown(index)}
                  disabled={index === goals.length - 1}
                  title="Переместить вниз"
                >
                  ↓
                </button>
                <button 
                  className="item-action-btn delete" 
                  onClick={() => handleRemoveGoal(index)}
                  disabled={goals.length <= 1}
                  title="Удалить"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="add-item-btn" onClick={handleAddGoal}>
          + Добавить цель
        </button>
      </div>
      
      <div className="tasks-section">
        <h3 className="section-title">Задачи исследования</h3>
        <p>Задачи — это конкретные шаги, которые необходимо выполнить для достижения целей.</p>
        
        <div className="items-list">
          {tasks.map((task, index) => (
            <div 
              key={`task-${index}`} 
              className="task-item"
              draggable
              onDragStart={(e) => handleDragStart(e, index, 'tasks')}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle">⋮⋮</div>
              <div className="item-content">
                <textarea
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  onInput={(e) => adjustTextareaHeight(e.target)}
                  placeholder={`Задача ${index + 1}`}
                  ref={(el) => el && adjustTextareaHeight(el)}
                />
              </div>
              <div className="item-actions">
                <button 
                  className="item-action-btn move-up" 
                  onClick={() => handleMoveTaskUp(index)}
                  disabled={index === 0}
                  title="Переместить вверх"
                >
                  ↑
                </button>
                <button 
                  className="item-action-btn move-down" 
                  onClick={() => handleMoveTaskDown(index)}
                  disabled={index === tasks.length - 1}
                  title="Переместить вниз"
                >
                  ↓
                </button>
                <button 
                  className="item-action-btn delete" 
                  onClick={() => handleRemoveTask(index)}
                  disabled={tasks.length <= 1}
                  title="Удалить"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="add-item-btn" onClick={handleAddTask}>
          + Добавить задачу
        </button>
      </div>
      
      <div className="actions-bar">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={!isDirty}
        >
          Сохранить цели и задачи
        </button>
      </div>
    </div>
  );
};

export default ResearchGoals; 