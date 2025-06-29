import React, { useState, useEffect } from 'react';
import '../styles/settings.css';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

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

  const [selectedModel, setSelectedModel] = useState('gpt-3.5');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('llmSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSelectedModel(settings.model || 'gpt-3.5');
      setApiKey(settings.apiKey || '');
    }
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      if (!apiKey.trim()) {
        throw new Error('API ключ не может быть пустым');
      }

      const settings = {
        model: selectedModel,
        apiKey: apiKey.trim()
      };
      
      localStorage.setItem('llmSettings', JSON.stringify(settings));
      setSaveSuccess(true);
      toast.success('Настройки успешно сохранены');
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Ошибка:', error);
      setSaveError(error.message || 'Не удалось сохранить настройки. Пожалуйста, попробуйте снова.');
      toast.error(error.message || 'Не удалось сохранить настройки');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Настройки</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <form onSubmit={handleSaveSettings}>
            <div className="settings-section">
              <h3>Выбор модели</h3>
              <div className="model-selection">
                {availableModels.map((model) => (
                  <div 
                    key={model.id} 
                    className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="model-radio">
                      <div className={`radio-inner ${selectedModel === model.id ? 'active' : ''}`}></div>
                    </div>
                    <span className="model-name">{model.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="settings-section">
              <h3>API ключ</h3>
              <div className="api-key-input">
                <input 
                  type={showApiKey ? "text" : "password"} 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Введите ваш API ключ"
                />
                <button 
                  type="button" 
                  className="toggle-visibility" 
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="api-key-info">
                API ключ необходим для доступа к выбранной модели. 
                Ключ хранится только в вашем браузере и не передается третьим лицам.
              </p>
            </div>
            
            {saveError && (
              <div className="settings-error">
                <span className="error-icon">⚠️</span>
                {saveError}
              </div>
            )}
            
            {saveSuccess && (
              <div className="settings-success">
                <span className="success-icon">✅</span>
                Настройки успешно сохранены!
              </div>
            )}
            
            <div className="settings-actions">
              <button 
                type="submit" 
                className="save-button"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="loading-spinner"></span>
                    Сохранение...
                  </>
                ) : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings; 