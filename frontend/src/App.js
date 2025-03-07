import React, { useState } from 'react';

// Компоненты
import QueryForm from './components/QueryForm';
import ResponseDisplay from './components/ResponseDisplay';
import Settings from './components/Settings';

// Стили
import './styles/main.css';

// Константы
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/api/upload`
};

/**
 * Главный компонент приложения для обработки PDF документов
 */
function App() {
  // Состояния приложения
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /**
   * Обработчик загрузки файлов
   * @param {FileList} files - Список загружаемых файлов
   */
  const handleFileUpload = async (files) => {
    // Если нет файлов, не выполняем запрос
    if (!files || files.length === 0) return;
    
    try {
      // Устанавливаем состояние загрузки
      setIsLoading(true);
      setError(null);

      // Формируем данные для отправки
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      // Отправляем запрос на сервер
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      // Проверяем успешность запроса
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Ошибка сервера: ${response.status}`
        );
      }

      // Обрабатываем успешный ответ
      const result = await response.json();
      setResponse(`Успешно загружено ${result.files.length} файлов`);
      
    } catch (err) {
      // Обрабатываем ошибки
      setError('Ошибка при загрузке файлов: ' + err.message);
      console.error('Ошибка загрузки:', err);
    } finally {
      // Сбрасываем состояние загрузки
      setIsLoading(false);
    }
  };

  /**
   * Обработчик изменения input для загрузки файлов
   */
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      // Сбрасываем значение input, чтобы можно было загрузить те же файлы повторно
      e.target.value = '';
    }
  };

  return (
    <div className="App">
      {/* Шапка приложения */}
      <header className="App-header">
        <h1>Система обработки PDF документов</h1>
        <p className="App-subtitle">
          Загрузите PDF файлы для анализа или введите свой запрос
        </p>
        
        <div className="header-buttons">
          {/* Кнопка загрузки файлов */}
          <button 
            className="upload-pdf-button" 
            onClick={() => document.getElementById('pdf-upload').click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Загрузка...
              </>
            ) : (
              'Загрузить PDF файлы'
            )}
          </button>
          <br></br>
          <br></br>
          {/* Кнопка настроек */}
          <button 
            className="settings-button" 
            onClick={() => setIsSettingsOpen(true)}
          >
            Настройки
          </button>
        </div>
        
        {/* Скрытый input для выбора файлов */}
        <input 
          type="file" 
          id="pdf-upload" 
          accept=".pdf" 
          multiple
          style={{ display: 'none' }} 
          onChange={handleFileInputChange}
        />
      </header>
      
      {/* Основное содержимое */}
      <main className="App-main">
        {/* Форма запроса */}
        <QueryForm 
          setResponse={setResponse} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading}
          setError={setError}
        />
        
        {/* Блок с ошибками */}
        {error && (
          <div className="App-error">
            <strong>Ошибка:</strong> {error}
          </div>
        )}
        
        {/* Отображение результата */}
        <ResponseDisplay 
          response={response} 
          isLoading={isLoading} 
        />
      </main>
      
      {/* Подвал */}
      <footer className="App-footer">
        <p>&copy; 2025 Roman Kharkovskoy</p>
      </footer>

      {/* Компонент настроек */}
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

export default App;
