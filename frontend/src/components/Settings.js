import React, { useState, useEffect } from 'react';
import '../styles/settings.css';
import { api } from '../services/api';

/**
 * Компонент настроек для выбора LLM модели и управления API ключами
 */
const Settings = ({ isOpen, onClose }) => {
  const availableModels = [
    { id: 'gpt-3.5', name: 'GPT-3.5' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'yandexgpt', name: 'YandexGPT' },
    { id: 'gigachat', name: 'GigaChat' },
  ];

  // Состояния для хранения выбранной модели и API ключа
  const [selectedModel, setSelectedModel] = useState('gpt-3.5');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Загрузка настроек при инициализации
  useEffect(() => {
    const savedSettings = localStorage.getItem('llmSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSelectedModel(settings.model || 'gpt-3.5');
      setApiKey(settings.apiKey || '');
    }
  }, []);

  // Обработчик сохранения настроек
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    try {
      await api.llm.saveLLMSettings('openai', apiKey);
      
      const settings = {
        model: selectedModel,
        apiKey: apiKey
      };
      
      localStorage.setItem('llmSettings', JSON.stringify(settings));
      onClose();
      alert('Настройки успешно сохранены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось сохранить API ключ');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Настройки</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSaveSettings}>
          <div className="form-group">
            <label htmlFor="modelSelect">Выберите модель LLM:</label>
            <select
              id="modelSelect"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              required
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="apiKeyInput">API ключ:</label>
            <div className="api-key-container">
              <input
                id="apiKeyInput"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите ваш API ключ"
                required
              />
              <button 
                type="button" 
                className="toggle-visibility"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-button">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 