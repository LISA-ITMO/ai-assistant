import React from 'react';
import '../../styles/research-files.css';

const ResearchFiles = ({ files }) => {
  return (
    <div className="research-files">
      <div className="files-header">
        <h3>Файлы исследования</h3>
      </div>

      <div className="files-list">
        {files.map(file => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <span className="file-name">{file.filename}</span>
              <span className="file-size">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div className="no-files">
            Нет загруженных файлов
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchFiles; 