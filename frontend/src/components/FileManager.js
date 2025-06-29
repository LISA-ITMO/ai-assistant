import React, { useState, useRef, useEffect } from 'react';
import '../styles/file-manager.css';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

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

const FileManager = ({ 
    onUpload, 
    isLoading: parentIsLoading,
    topic,
    researchId 
}) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingAnnotation, setGeneratingAnnotation] = useState({});
  const [annotations, setAnnotations] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [vectorizingFiles, setVectorizingFiles] = useState({});
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.files.list();
      setFiles(response || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Не удалось загрузить список файлов. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // Poll for file status updates every 30 seconds
    const interval = setInterval(fetchFiles, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (file) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setCurrentFile(file.name);
      
      const result = await api.files.upload(file);
      
      if (result && result.filename) {
        toast.success(`Файл ${file.name} успешно загружен`);
        await fetchFiles();
        
        // Автоматически запускаем векторизацию после загрузки
        await handleVectorizeFile(result.filename);
        
        if (onUpload) {
          onUpload(result.filename);
        }
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError(err.message);
      toast.error(`Ошибка при загрузке файла: ${err.message}`);
    } finally {
      setIsUploading(false);
      setCurrentFile(null);
    }
  };

  const handleVectorizeFile = async (filename) => {
    try {
      setVectorizingFiles(prev => ({ ...prev, [filename]: true }));
      
      const result = await api.rag.chunkFile(filename);
      
      if (result && result.chunk_count) {
        toast.success(`Файл ${filename} успешно векторизован`);
        await fetchFiles(); // Обновляем статус файла
      } else {
        throw new Error('Не удалось векторизовать файл');
      }
    } catch (err) {
      console.error('Error vectorizing file:', err);
      toast.error(`Ошибка при векторизации файла: ${err.message}`);
    } finally {
      setVectorizingFiles(prev => ({ ...prev, [filename]: false }));
    }
  };

  const handleFileDelete = async (filename) => {
    if (!window.confirm(`Вы уверены, что хотите удалить файл ${filename}?`)) {
      return;
    }

    try {
      await api.files.delete(filename);
      toast.success(`Файл ${filename} успешно удален`);
      await fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error(`Ошибка при удалении файла: ${err.message}`);
    }
  };

  const handleGenerateAnnotation = async (filename) => {
    try {
      setGeneratingAnnotation(prev => ({ ...prev, [filename]: true }));
      
      const result = await api.annotations.generate(filename, 'chatgpt', 200, 8000);
      
      if (result && result.annotation) {
        setAnnotations(prev => ({
          ...prev,
          [filename]: result.annotation
        }));
        toast.success(`Аннотация для ${filename} успешно сгенерирована`);
      }
    } catch (err) {
      console.error('Error generating annotation:', err);
      toast.error(`Ошибка при генерации аннотации: ${err.message}`);
    } finally {
      setGeneratingAnnotation(prev => ({ ...prev, [filename]: false }));
    }
  };

  const handleClearVectorDB = async () => {
    if (!window.confirm('Вы уверены, что хотите очистить векторную базу данных? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setIsClearing(true);
      await api.rag.clearVectorDB();
      toast.success('Векторная база данных успешно очищена');
      await fetchFiles(); // Обновляем статусы файлов
    } catch (err) {
      console.error('Error clearing vector DB:', err);
      toast.error(`Ошибка при очистке векторной базы данных: ${err.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => handleFileUpload(file));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📋';
      default:
        return '📁';
    }
  };

  const getFileName = (file) => {
    // Проверяем все возможные варианты имени файла
    return file.original_filename || file.filename || file.name || file.id || 'Unnamed file';
  };

  const getFileId = (file, index) => {
    if (!file) return `file-${index}`;
    // Используем filename как основной идентификатор
    return file.filename || file.id || file._id || file.fileId || file.name || `file-${index}`;
  };

  const getFileStatus = (status) => {
    if (!status) return 'Загружен';
    
    switch (status) {
      case 'uploaded':
        return 'Загружен';
      case 'vectorized':
        return 'Векторизован';
      case 'error':
        return 'Ошибка';
      default:
        return 'Загружен';
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
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleFileUpload(file);
            }}
            style={{ display: 'none' }}
            accept=".txt,.pdf,.docx"
          />
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Выбрать файл'}
          </button>
          <p className="upload-hint">
            или перетащите файл сюда
          </p>
        </div>
      </div>
      
      {uploadError && (
        <div className="error-message">
          {uploadError}
        </div>
      )}
      
      <div className="files-section">
        <div className="files-header">
          <h3>Загруженные файлы</h3>
          <div className="files-actions">
            <button 
              onClick={handleClearVectorDB}
              className="clear-vector-store-btn"
              disabled={isClearing}
              title="Очистить векторную базу данных"
            >
              {isClearing ? '⌛' : '🗑️'}
            </button>
            <button 
              onClick={fetchFiles} 
              className="refresh-btn"
              disabled={isLoading}
              title="Обновить список файлов"
            >
              {isLoading ? '⌛' : '🔄'}
            </button>
          </div>
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
                    <div className="file-info">
                      <div className="file-name">
                        <span className="file-icon">{getFileIcon(fileName)}</span>
                        <span className="file-name-text">{fileName}</span>
                      </div>
                      <div className="file-meta">
                        <span className="file-size">{formatBytes(file.size || 0)}</span>
                        <span className="file-date">{formatDate(file.uploaded_at)}</span>
                      </div>
                    </div>
                    <div className="file-status-container">
                      <span className={`file-status ${file.status || 'uploaded'}`}>
                        {vectorizingFiles[file.filename] ? 'Векторизация...' : getFileStatus(file.status)}
                      </span>
                    </div>
                    <div className="file-actions">
                      {file.status !== 'vectorized' && !vectorizingFiles[file.filename] && (
                        <button
                          onClick={() => handleVectorizeFile(file.filename)}
                          className="vectorize-btn"
                          title="Векторизовать файл"
                        >
                          Векторизовать
                        </button>
                      )}
                      {vectorizingFiles[file.filename] && (
                        <span className="vectorizing-status">Векторизация...</span>
                      )}
                      <button
                        onClick={() => handleGenerateAnnotation(file.filename)}
                        className="generate-annotation-btn"
                        disabled={generatingAnnotation[file.filename]}
                        title="Сгенерировать аннотацию"
                      >
                        {generatingAnnotation[file.filename]
                          ? 'Генерация...'
                          : 'Сгенерировать аннотацию'}
                      </button>
                      <button 
                        onClick={() => handleFileDelete(file.filename)}
                        title="Удалить файл"
                        className="delete-file-btn"
                      >
                        🗑️
                      </button>
                    </div>
                    {annotations[file.filename] && (
                      <div className="file-annotation">
                        <h4>Аннотация:</h4>
                        <p>{annotations[file.filename]}</p>
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
  onUpload: () => {}
};

export default FileManager;
