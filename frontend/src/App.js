import React, { useState } from 'react';

import ResponseDisplay from './components/ResponseDisplay';
import Settings from './components/Settings';
import TopicModal from './components/TopicModal';
import FileManager from './components/FileManager';

import './styles/main.css';
import './styles/modal.css';

import { api } from './services/api';

/**
 * Главный компонент приложения для обработки PDF документов
 */
function App() {
  // Состояния приложения
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  // Состояния для управления представлениями
  const [currentView, setCurrentView] = useState('search');
  
  // Состояния для модального окна уточнения темы
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [suggestedTopic, setSuggestedTopic] = useState('');
  const [finalTopic, setFinalTopic] = useState('');

  /**
   * Обработчик отправки формы поиска
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim() === '') return;

    const savedSettings = localStorage.getItem('llmSettings');
    const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

    if (!apiKey) {
      setError('Пожалуйста, введите ваш OpenAI API ключ в настройках.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.llm.refineTopic(query, apiKey);
      setSuggestedTopic(data.refined_topic);
      setIsTopicModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработчик выбора оригинальной темы
   */
  const handleKeepOriginal = () => {
    setFinalTopic(query);
    setIsTopicModalOpen(false);
    setCurrentView('files');
  };

  /**
   * Обработчик выбора предложенной темы
   */
  const handleUseSuggested = () => {
    setFinalTopic(suggestedTopic);
    setIsTopicModalOpen(false);
    setCurrentView('files');
  };

  /**
   * Обработчик загрузки файлов
   * @param {FileList} files
   */
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      
      const response = await fetch(API_ENDPOINTS.FILES.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Ошибка сервера: ${response.status}`
        );
      }

      const result = await response.json();
      
    } catch (err) {
      setError('Ошибка при загрузке файлов: ' + err.message);
      console.error('Ошибка загрузки:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Рендер содержимого в зависимости от текущего представления
   */
  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return (
          <div className="search-container">
            <h2>Введите тему вашего исследования</h2>
            <form onSubmit={handleSubmit} className="centered-form">
              <input
                type="text"
                className="centered-input"
                placeholder="Например: Влияние социальных сетей на подростков"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="next-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Обработка...
                  </>
                ) : 'Далее'}
              </button>
            </form>
            {error && (
              <div className="error-message">
                <strong>Ошибка:</strong> {error}
              </div>
            )}
          </div>
        );
      
      case 'files':
        return (
          <div className="files-container">
            <h2>Загрузка материалов для исследования</h2>
            <p className="topic-header">Тема: <strong>{finalTopic}</strong></p>
            
            <FileManager 
              apiEndpoints={API_ENDPOINTS.FILES}
              onUpload={handleFileUpload}
              isLoading={isLoading}
            />
          </div>
        );
      
      case 'results':
        return (
          <ResponseDisplay 
            response={response} 
            isLoading={isLoading}
            query={finalTopic}
            onReset={() => {
              setCurrentView('search');
              setQuery('');
              setFinalTopic('');
              setResponse('');
            }}
          />
        );
      
      default:
        return <div>Неизвестное представление</div>;
    }
  };

  return (
    <div className="App">
      {/* Шапка приложения */}
      <header className="App-header">
        <h1 onClick={() => setCurrentView('search')} style={{ cursor: 'pointer' }}>
          A.R.T.H.U.R.
        </h1>
        <p className="App-subtitle">
          Academic Research Tool for Helpful Understanding and Retrieval
        </p>
        
        <button 
          className="settings-button" 
          onClick={() => setIsSettingsOpen(true)}
        >
          Настройки
        </button>
      </header>
      
      {/* Основное содержимое */}
      <main className={`App-main ${currentView === 'search' ? 'centered-content' : ''}`}>
        {/* Основной контент */}
        {renderContent()}
      </main>
      
      {/* Подвал */}
      <footer className="App-footer">
        <p>&copy; 2025 Roman Kharkovskoy</p>
      </footer>

      {/* Модальные окна */}
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <TopicModal
        isOpen={isTopicModalOpen}
        originalTopic={query}
        suggestedTopic={suggestedTopic}
        onKeepOriginal={handleKeepOriginal}
        onUseSuggested={handleUseSuggested}
        onClose={() => setIsTopicModalOpen(false)}
      />
    </div>
  );
}

export default App;