import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/document-uploader.css';

const DocumentUploader = ({ researchId, onDocumentUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('research_id', researchId);

    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
        }
      });

      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      return response.data;
    } catch (err) {
      console.error(`Ошибка при загрузке файла ${file.name}:`, err);
      setError(`Ошибка при загрузке файла ${file.name}: ${err.message}`);
      setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); // -1 означает ошибку
      throw err;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    const uploadResults = [];
    
    for (const file of files) {
      try {
        const result = await uploadFile(file);
        uploadResults.push(result);
      } catch (err) {
        console.error(`Ошибка при загрузке ${file.name}:`, err);
      }
    }
    
    setUploading(false);
    
    if (uploadResults.length > 0 && onDocumentUploaded) {
      onDocumentUploaded(uploadResults);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  return (
    <div className="document-uploader">
      <div className="uploader-header">
        <h3>Загрузка документов для анализа</h3>
        <p>Загрузите PDF, DOCX или TXT файлы для векторизации и использования в генерации отчета</p>
      </div>
      
      <div className="upload-area">
        <div 
          className="drop-zone"
          onDrop={(e) => {
            e.preventDefault();
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="drop-icon">📥</div>
          <p>Перетащите файлы сюда или</p>
          <label className="file-input-label">
            <span>Выберите файлы</span>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              accept=".pdf,.docx,.doc,.txt"
              style={{ display: 'none' }}
            />
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="file-list">
            <h4>Выбранные файлы:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(file.name)}</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} МБ)</span>
                  </div>
                  
                  {uploading && uploadProgress[file.name] !== undefined && (
                    <div className="progress-container">
                      <div 
                        className={`progress-bar ${uploadProgress[file.name] === -1 ? 'error' : ''}`}
                        style={{ width: `${uploadProgress[file.name] === -1 ? 100 : uploadProgress[file.name]}%` }}
                      ></div>
                      <span className="progress-text">
                        {uploadProgress[file.name] === -1 ? 'Ошибка' : 
                         uploadProgress[file.name] === 100 ? 'Завершено' : 
                         `${uploadProgress[file.name]}%`}
                      </span>
                    </div>
                  )}
                  
                  {!uploading && (
                    <button 
                      className="remove-button"
                      onClick={() => removeFile(index)}
                      aria-label="Удалить файл"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="upload-actions">
          <button 
            className="upload-button"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Загрузка...' : 'Загрузить документы'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader; 