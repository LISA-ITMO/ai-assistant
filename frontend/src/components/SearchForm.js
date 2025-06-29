import React, { useState, useEffect } from 'react';
import '../styles/search-form.css';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

const SearchForm = ({ onSubmit, isLoading, initialQuery, error, hasExistingResearch, existingTopic, onContinueResearch, onResetResearch }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentTopics, setRecentTopics] = useState([]);

  useEffect(() => {
    const savedTopics = localStorage.getItem('recentTopics');
    if (savedTopics) {
      setRecentTopics(JSON.parse(savedTopics));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await api.research.refineTopic(query, 'chatgpt');
      
      if (response && response.refined_topic) {
        // Сохраняем тему в историю
        const updatedTopics = [query, ...recentTopics.filter(t => t !== query)].slice(0, 5);
        setRecentTopics(updatedTopics);
        localStorage.setItem('recentTopics', JSON.stringify(updatedTopics));
        
        // Вызываем onSubmit с оригинальной и уточненной темой
        onSubmit(query, response.refined_topic);
      } else {
        toast.error('Не удалось уточнить тему исследования');
      }
    } catch (error) {
      console.error('Error refining topic:', error);
      toast.error(`Ошибка при уточнении темы: ${error.message}`);
    }
  };

  const handleSuggestionClick = (topic) => {
    setQuery(topic);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container">
      <h2>Начните ваше исследование</h2>
      <p className="search-description">
        Введите тему вашего исследования, и мы поможем сформулировать цели и задачи
      </p>
      
      <form onSubmit={handleSubmit} className="search-form">
        <div className={`input-wrapper ${isInputFocused ? 'focused' : ''}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsInputFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Например: Влияние социальных сетей на психологию подростков"
            className="search-input"
            disabled={isLoading}
          />
          {query && (
            <button 
              type="button" 
              className="clear-button"
              onClick={() => setQuery('')}
            >
              ×
            </button>
          )}
        </div>
        
        {showSuggestions && recentTopics.length > 0 && (
          <div className="recent-topics">
            <h4>Недавние темы:</h4>
            <ul>
              {recentTopics.map((topic, index) => (
                <li key={index} onClick={() => handleSuggestionClick(topic)}>
                  <span className="history-icon">⟲</span> {topic}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button 
          type="submit" 
          className="start-button"
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Анализируем тему...
            </>
          ) : (
            <>
              <span className="button-icon">🔍</span>
              Начать исследование
            </>
          )}
        </button>
      </form>
      
      {hasExistingResearch && (
        <div className="continue-research">
          <p>У вас есть сохраненное исследование по теме: <strong>{existingTopic}</strong></p>
          <button className="continue-button" onClick={onContinueResearch}>
            Продолжить исследование
          </button>
          <button className="reset-button" onClick={onResetResearch}>
            Начать новое
          </button>
        </div>
      )}
      
      <div className="search-tips">
        <h4>Советы для лучших результатов:</h4>
        <ul>
          <li>Формулируйте тему конкретно и чётко</li>
          <li>Указывайте область исследования (психология, экономика и т.д.)</li>
          <li>Добавляйте ключевые аспекты, которые хотите исследовать</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchForm; 