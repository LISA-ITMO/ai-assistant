import React, { useState, useEffect } from 'react';
import '../styles/search-form.css';

/**
 * Компонент формы поиска для начала исследования
 */
const SearchForm = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recentTopics, setRecentTopics] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const savedTopics = localStorage.getItem('recentTopics');
    if (savedTopics) {
      setRecentTopics(JSON.parse(savedTopics).slice(0, 5));
    }
  }, []);

  const saveToRecentTopics = (topic) => {
    const updatedTopics = [topic, ...recentTopics.filter(t => t !== topic)].slice(0, 5);
    setRecentTopics(updatedTopics);
    localStorage.setItem('recentTopics', JSON.stringify(updatedTopics));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveToRecentTopics(query);
      onSubmit(query);
    }
  };

  const handleSuggestionClick = (topic) => {
    setQuery(topic);
    saveToRecentTopics(topic);
    onSubmit(topic);
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