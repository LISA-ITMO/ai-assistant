import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DocumentUploader from './DocumentUploader';
import '../styles/document-manager.css';

const DocumentManager = ({ researchId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [researchId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/documents/${researchId}`);
      setDocuments(response.data.documents || []);
      setError(null);
    } catch (err) {
      console.error('Ошибка при получении списка документов:', err);
      setError('Не удалось загрузить список документов');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = (uploadResults) => {
    fetchDocuments();
    setShowUploader(false);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
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
    <div className="document-manager">
      <div className="document-manager-header">
        <h2>Документы исследования</h2>
        <button 
          className="add-document-button"
          onClick={() => setShowUploader(!showUploader)}
        >
          {showUploader ? 'Скрыть форму' : 'Добавить документы'}
        </button>
      </div>
      
      {showUploader && (
        <DocumentUploader 
          researchId={researchId} 
          onDocumentUploaded={handleDocumentUploaded} 
        />
      )}
      
      {loading ? (
        <div className="loading-indicator">Загрузка списка документов...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет загруженных документов для этого исследования.</p>
          {!showUploader && (
            <button 
              className="add-document-button"
              onClick={() => setShowUploader(true)}
            >
              Добавить первый документ
            </button>
          )}
        </div>
      ) : (
        <div className="documents-list">
          <div className="documents-count">
            Всего документов: <strong>{documents.length}</strong>
          </div>
          
          <div className="documents-grid">
            {documents.map((doc, index) => (
              <div key={index} className="document-card">
                <div className="document-icon">
                  {getFileIcon(doc.original_filename)}
                </div>
                <div className="document-details">
                  <h4 className="document-title" title={doc.original_filename}>
                    {doc.original_filename}
                  </h4>
                  <div className="document-meta">
                    <span className="document-date">
                      Загружен: {formatDate(doc.upload_time)}
                    </span>
                    <span className="document-chunks">
                      Чанков: {doc.chunks_count}
                    </span>
                  </div>
                  {doc.metadata && (
                    <div className="document-metadata">
                      {doc.metadata.title && <p><strong>Название:</strong> {doc.metadata.title}</p>}
                      {doc.metadata.author && <p><strong>Автор:</strong> {doc.metadata.author}</p>}
                      {doc.metadata.pages && <p><strong>Страниц:</strong> {doc.metadata.pages}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager; 