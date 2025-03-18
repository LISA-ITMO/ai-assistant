import React, { useState, useEffect, useRef } from 'react';
import '../styles/fileManager.css';

function FileManager({ apiEndpoints, onUpload, isLoading }) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Загрузка списка файлов при монтировании компонента
  useEffect(() => {
    fetchFiles();
  }, []);

  // Получение списка файлов с сервера
  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      setError(null);
      const response = await fetch(apiEndpoints.LIST);
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      setError('Ошибка при получении списка файлов: ' + error.message);
      console.error('Ошибка при получении списка файлов:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Обработчик выбора файла
  const handleFileSelect = (fileName) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  // Обработчик клика по области загрузки
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Обработчик изменения выбранных файлов
  const handleFileChange = async (e) => {
    if (e.target.files.length > 0) {
      await handleUploadFiles(e.target.files);
      e.target.value = null;
    }
  };

  // Обработчик загрузки файлов
  const handleUploadFiles = async (files) => {
    try {
      setError(null);
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(apiEndpoints.UPLOAD, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при загрузке файлов');
      }

      await fetchFiles();
    } catch (error) {
      setError('Ошибка при загрузке файлов: ' + error.message);
    }
  };

  // Обработчики drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files.length > 0) {
      await handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Обработчик удаления файла
  const handleDeleteFile = async (fileName) => {
    try {
      setError(null);
      const response = await fetch(apiEndpoints.DELETE(fileName), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка при удалении файла: ${response.status}`);
      }
      
      await fetchFiles();
      setSelectedFiles(prev => prev.filter(name => name !== fileName));
    } catch (error) {
      setError('Ошибка при удалении файла: ' + error.message);
    }
  };

  return (
    <div className="file-manager">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div 
        className={`drop-area ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <div className="drop-content">
          <div className="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="drop-text">
            Перетащите PDF файлы сюда или <span className="browse-text">выберите файлы</span>
          </p>
          <p className="drop-hint">Поддерживаются только PDF файлы</p>
        </div>
        <input 
          ref={fileInputRef}
          type="file"
          multiple 
          accept=".pdf"
          className="file-input"
          onChange={handleFileChange}
        />
      </div>

      <div className="file-list-section">
        <h3>Загруженные файлы</h3>
        
        {loadingFiles ? (
          <div className="loading-files">
            <span className="loading-spinner"></span>
            <p>Загрузка списка файлов...</p>
          </div>
        ) : (
          <>
            {files.length === 0 ? (
              <p className="no-files">Нет загруженных файлов</p>
            ) : (
              <div className="file-list">
                {files.map(file => (
                  <div key={file.filename} className="file-item">
                    <div className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.filename)}
                        onChange={() => handleFileSelect(file.filename)}
                      />
                    </div>
                    <div className="file-label">
                      <span className="file-name">{file.filename}</span>
                    </div>
                    <div className="delete-cell">
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteFile(file.filename)}
                        disabled={isLoading}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {files.length > 0 && (
              <div className="file-actions">
                <button
                  className="generate-button"
                  disabled={selectedFiles.length === 0 || isLoading}
                  onClick={() => {
                    console.log('Selected files:', selectedFiles);
                  }}
                >
                  Сгенерировать обзор на основе выбранных файлов
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FileManager;
