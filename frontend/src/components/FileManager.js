import React, { useState, useEffect } from 'react';
import '../styles/fileManager.css';

/**
 * Компонент управления загруженными файлами
 */
const FileManager = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка списка файлов при открытии окна
  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  // Получение списка файлов с сервера
  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/files');
      if (!response.ok) {
        throw new Error('Ошибка при получении списка файлов');
      }
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError('Ошибка при загрузке списка файлов: ' + err.message);
      console.error('Ошибка загрузки файлов:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление файла
  const handleDeleteFile = async (filename) => {
    if (!window.confirm(`Вы уверены, что хотите удалить файл "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/files/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении файла');
      }

      // Обновляем список файлов
      setFiles(files.filter(file => file.name !== filename));
      // Убираем файл из выбранных, если он там был
      setSelectedFiles(selectedFiles.filter(name => name !== filename));
    } catch (err) {
      setError('Ошибка при удалении файла: ' + err.message);
      console.error('Ошибка удаления:', err);
    }
  };

  // Генерация обзора литературы
  const handleGenerateReview = async () => {
    if (selectedFiles.length === 0) {
      alert('Выберите хотя бы один файл для генерации обзора');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/generate-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: selectedFiles
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации обзора');
      }

      const result = await response.json();
      // Здесь можно добавить обработку результата, например:
      // - сохранить в состояние приложения
      // - показать в модальном окне
      // - перенаправить на страницу с результатом
      alert('Обзор литературы успешно сгенерирован!');
      onClose();
    } catch (err) {
      setError('Ошибка при генерации обзора: ' + err.message);
      console.error('Ошибка генерации:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка выбора файла
  const handleFileSelect = (filename) => {
    setSelectedFiles(prev => {
      if (prev.includes(filename)) {
        return prev.filter(name => name !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="file-manager-modal">
      <div className="file-manager-content">
        <div className="file-manager-header">
          <h2>Управление файлами</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="file-list">
          {isLoading ? (
            <div className="loading">Загрузка...</div>
          ) : files.length === 0 ? (
            <div className="no-files">Нет загруженных файлов</div>
          ) : (
            files.map(file => (
              <div key={file.name} className="file-item">
                <div className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.name)}
                    onChange={() => handleFileSelect(file.name)}
                  />
                </div>
                <div className="file-label">
                  <span className="file-name">{file.name}</span>
                </div>
                <div className="delete-cell">
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteFile(file.name)}
                    disabled={isLoading}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="file-manager-actions">
          <button
            className="generate-button"
            onClick={handleGenerateReview}
            disabled={isLoading || selectedFiles.length === 0}
          >
            {isLoading ? 'Генерация...' : 'Сгенерировать обзор'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileManager; 