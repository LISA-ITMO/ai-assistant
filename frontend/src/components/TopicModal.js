import React from 'react';
import '../styles/modal.css';

/**
 * Модальное окно для уточнения темы исследования
 */
function TopicModal({ isOpen, originalTopic, suggestedTopic, onKeepOriginal, onUseSuggested, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content topic-modal">
        <div className="modal-header">
          <h2>Уточнение темы исследования</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p className="modal-description">
            Мы проанализировали вашу тему исследования и подготовили уточненную формулировку, 
            которая может сделать ваше исследование более конкретным и глубоким.
          </p>
          
          <div className="topic-comparison">
            <div className="topic-original">
              <h3>Ваша тема</h3>
              <p>{originalTopic}</p>
            </div>
            
            <div className="topic-suggested">
              <h3>Предлагаемая формулировка</h3>
              <p>{suggestedTopic}</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="button secondary-button"
            onClick={onKeepOriginal}
          >
            Оставить мою тему
          </button>
          <button 
            className="button primary-button"
            onClick={onUseSuggested}
          >
            Использовать предложенную
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopicModal; 