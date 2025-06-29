import React from 'react';
import '../../styles/research-notes.css';

const ResearchNotes = ({ notes, onNotesUpdate, activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'general', name: 'Общие заметки' },
    { id: 'sources', name: 'Источники' },
    { id: 'ideas', name: 'Идеи и мысли' }
  ];

  return (
    <div className="research-notes">
      <div className="notes-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="notes-editor">
        <textarea
          value={notes}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Введите ваши заметки..."
          className="notes-textarea"
        />
      </div>
    </div>
  );
};

export default ResearchNotes; 