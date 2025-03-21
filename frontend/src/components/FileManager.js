import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import '../styles/file-manager.css';

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
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

function FileManager({ apiEndpoints, onUpload, isLoading, topic }) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      setError(null);
      const data = await api.files.list();
      setFiles(data.files || []);
    } catch (error) {
      setError('Ошибка при получении списка файлов: ' + error.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleUploadFiles = async (fileList) => {
    try {
      setError(null);
      await api.files.upload(Array.from(fileList));
      await fetchFiles();
    } catch (error) {
      setError('Ошибка при загрузке файлов: ' + error.message);
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      setError(null);
      await api.files.delete(filename);
      await fetchFiles();
    } catch (error) {
      setError('Ошибка при удалении файла: ' + error.message);
    }
  };

  return (
    <div className="file-manager-container">
      {topic && (
        <div className="topic-header">
          <h3>Тема исследования</h3>
          <p>{topic}</p>
        </div>
      )}

      <div className="upload-section">
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleUploadFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <i className="upload-icon">📁</i>
            <p className="upload-text">Перетащите файлы сюда или кликните для выбора</p>
            <p className="upload-hint">Поддерживаются файлы PDF, DOC, DOCX</p>
          </div>
          <input
            type="file"
            multiple
            onChange={(e) => handleUploadFiles(e.target.files)}
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="files-section">
        <h3>Загруженные файлы</h3>
        {loadingFiles ? (
          <div className="loading-files">
            <span className="loading-spinner"></span>
            <p>Загрузка списка файлов...</p>
          </div>
        ) : files.length > 0 ? (
          <div className="file-table-container">
            <table className="file-table">
              <thead>
                <tr>
                  <th className="file-name-column">Имя файла</th>
                  <th className="file-size-column">Размер</th>
                  <th className="file-date-column">Дата загрузки</th>
                  <th className="actions-column">Действия</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.filename} className="file-row">
                    <td className="file-name-cell">
                      <span className="file-icon">📄</span>
                      {file.filename}
                    </td>
                    <td className="file-size-cell">{formatFileSize(file.size)}</td>
                    <td className="file-date-cell">{formatDate(file.upload_date || file.uploadDate)}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-button delete-button"
                        onClick={() => handleDeleteFile(file.filename)}
                        title="Удалить файл"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-files">
            <p>Нет загруженных файлов</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileManager;
