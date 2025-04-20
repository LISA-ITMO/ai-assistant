import React from 'react';
import '../styles/topic-modal.css';


const TopicModal = ({ 
  isOpen, 
  onClose, 
  originalTopic, 
  suggestedTopic, 
  onKeepOriginal, 
  onUseSuggested,
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Уточнение темы исследования</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Мы предлагаем уточнить формулировку вашей темы исследования:</p>
          
          <div className="topic-option">
            <h3>Ваша формулировка:</h3>
            <p className="topic-text">{originalTopic}</p>
            <button 
              className="topic-button"
              onClick={onKeepOriginal}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Генерация целей и задач...
                </>
              ) : 'Оставить как есть'}
            </button>
          </div>
          
          <div className="topic-option">
            <h3>Предлагаемая формулировка:</h3>
            <p className="topic-text">{suggestedTopic}</p>
            <button 
              className="topic-button"
              onClick={onUseSuggested}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Генерация целей и задач...
                </>
              ) : 'Использовать предложенную'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicModal; 