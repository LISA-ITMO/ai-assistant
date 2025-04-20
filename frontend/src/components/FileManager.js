import React, { useState, useRef, useEffect } from 'react';
import '../styles/file-manager.css';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../services/api';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

const FileManager = ({ researchId, topic, onDocumentsUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [annotations, setAnnotations] = useState({});
  const [generatingAnnotation, setGeneratingAnnotation] = useState({});

  const fetchFiles = async () => {
    if (!researchId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.research.getFiles(researchId);
      setFiles(response.files || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Не удалось загрузить список файлов. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [researchId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверяем размер файла (10 МБ)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      alert('Размер файла превышает 10 МБ. Пожалуйста, выберите файл меньшего размера.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.research.uploadFile(formData, researchId, (progress) => {
        setUploadProgress(progress);
      });

      if (response && response.file_id) {
        const newFile = {
          id: response.file_id,
          name: response.original_filename || file.name,
          status: 'vectorized'
        };

        setFiles(prev => [...prev, newFile]);

        if (typeof onDocumentsUploaded === 'function') {
          onDocumentsUploaded([{
            id: response.file_id,
            name: response.original_filename || file.name
          }]);
        }
      } else {
        throw new Error('Некорректный ответ от сервера');
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      alert(error.message || 'Не удалось загрузить файл. Попробуйте еще раз.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await api.files.delete(fileId);
      fetchFiles();
    } catch (err) {
      setError('Не удалось удалить файл. Пожалуйста, попробуйте позже.');
      console.error('Error deleting file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📁';
    
    try {
      const extension = fileName.split('.').pop().toLowerCase();
      
      switch (extension) {
        case 'pdf':
          return '📄';
        case 'doc':
        case 'docx':
          return '📝';
        case 'xls':
        case 'xlsx':
          return '📊';
        case 'ppt':
        case 'pptx':
          return '📑';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return '🖼️';
        case 'txt':
          return '📃';
        default:
          return '📁';
      }
    } catch (error) {
      console.error('Error getting file icon:', error);
      return '📁';
    }
  };

  // Функция для извлечения имени файла из разных возможных источников
  const getFileName = (file) => {
    if (!file) return 'Неизвестный файл';
    
    // Проверяем различные свойства, которые могут содержать имя файла
    return file.filename || file.name || file.fileName || 
           (file.path ? file.path.split('/').pop() : null) || 
           (file.url ? file.url.split('/').pop() : null) ||
           'Файл без имени';
  };

  // Функция для извлечения ID файла из разных возможных источников
  const getFileId = (file, index) => {
    if (!file) return `file-${index}`;
    
    return file.id || file._id || file.fileId || file.filename || file.name || `file-${index}`;
  };

  const handleGenerateAnnotation = async (fileId, fileName) => {
    if (generatingAnnotation[fileId]) return;
    
    setGeneratingAnnotation(prev => ({ ...prev, [fileId]: true }));
    setError(null);
    
    try {
      console.log('Generating annotation for:', { fileId, fileName, researchId });
      const response = await api.research.generateAnnotation(fileId, researchId);
      console.log('Annotation response:', response);
      
      if (response && response.annotation) {
        setAnnotations(prev => ({
          ...prev,
          [fileId]: response.annotation
        }));
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Некорректный ответ от сервера');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setError('Не удалось сгенерировать аннотацию. Попробуйте позже.');
    } finally {
      setGeneratingAnnotation(prev => ({ ...prev, [fileId]: false }));
    }
  };

  return (
    <div className="file-manager-container">
      <div className="topic-header">
        <h3>Тема исследования</h3>
        <p className="topic-text">{topic || 'Не указана'}</p>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <div className="upload-section">
        <div 
          className={`upload-area ${isDragging ? 'drag-active' : ''}`}
          onClick={openFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📤</div>
          <div className="upload-text">Перетащите файлы сюда или нажмите для выбора</div>
          <div className="upload-subtext">Поддерживаемые форматы: PDF, DOCX, TXT (до 10 МБ)</div>
          <input 
            type="file" 
            className="file-input" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={isUploading}
            accept=".txt,.doc,.docx,.pdf"
          />
        </div>
      </div>
      
      <div className="files-section">
        <div className="files-header">
          <h3>Загруженные файлы</h3>
          <button 
            onClick={fetchFiles} 
            className="refresh-btn"
            disabled={isLoading}
            title="Обновить список файлов"
          >
            {isLoading ? '⌛' : '🔄'}
          </button>
        </div>
        
        {isLoading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Загрузка...</span>
          </div>
        ) : (
          <div className="files-list">
            {files && files.length > 0 ? (
              files.map((file, index) => {
                const fileName = getFileName(file);
                const fileId = getFileId(file, index);
                
                return (
                  <div key={fileId} className="file-item">
                    <div className="file-name">
                      <span className="file-icon">{getFileIcon(fileName)}</span>
                      {fileName}
                    </div>
                    <div className="file-actions">
                      <button
                        onClick={() => handleGenerateAnnotation(fileId, fileName)}
                        className="generate-annotation-btn"
                        disabled={generatingAnnotation[fileId]}
                        title="Сгенерировать аннотацию"
                      >
                        {generatingAnnotation[fileId] ? '⌛' : '📝'}
                      </button>
                      <button 
                        onClick={() => handleDeleteFile(fileId)}
                        title="Удалить файл"
                        className="delete-file-btn"
                      >
                        🗑️
                      </button>
                    </div>
                    {annotations[fileId] && (
                      <div className="file-annotation">
                        <h4>Аннотация:</h4>
                        <p>{annotations[fileId]}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <div className="empty-state-text">Нет загруженных файлов</div>
                <div className="empty-state-subtext">
                  Загрузите файлы, чтобы использовать их в вашем исследовании
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

FileManager.defaultProps = {
  onDocumentsUploaded: () => {}
};

export default FileManager;
