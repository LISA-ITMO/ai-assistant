import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

const SettingsModal = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('llmSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setApiKey(settings.apiKey || '');
      setProvider(settings.provider || 'openai');
    }
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      localStorage.setItem('llmSettings', JSON.stringify({
        apiKey,
        provider
      }));

      await new Promise(resolve => setTimeout(resolve, 500));

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Ошибка при сохранении настроек: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Настройки</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="settings-section">
            <h3>Настройки LLM</h3>
            
            <div className="form-group">
              <label htmlFor="provider">Провайдер:</label>
              <select 
                id="provider" 
                value={provider} 
                onChange={e => setProvider(e.target.value)}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="local">Локальная модель</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="api-key">API ключ:</label>
              <input 
                type="password" 
                id="api-key" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)}
                placeholder="Введите ваш API ключ"
              />
              <p className="form-hint">
                Ваш API ключ хранится только локально в вашем браузере и не отправляется на наши серверы.
              </p>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              Настройки успешно сохранены!
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Отмена</button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 