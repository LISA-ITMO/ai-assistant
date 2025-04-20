import React, { useState } from 'react';

const NotesSection = ({ notes, onNotesChange }) => {
  const [notesList, setNotesList] = useState(
    localStorage.getItem('notesList') 
      ? JSON.parse(localStorage.getItem('notesList')) 
      : [{ id: Date.now(), content: notes || '', category: 'general' }]
  );

  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      content: '',
      category: 'general'
    };
    const updatedNotes = [...notesList, newNote];
    setNotesList(updatedNotes);
    localStorage.setItem('notesList', JSON.stringify(updatedNotes));
    onNotesChange(updatedNotes.map(note => note.content).join('\n\n'));
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notesList.filter(note => note.id !== noteId);
    setNotesList(updatedNotes);
    localStorage.setItem('notesList', JSON.stringify(updatedNotes));
    onNotesChange(updatedNotes.map(note => note.content).join('\n\n'));
  };

  const handleNoteChange = (noteId, newContent) => {
    const updatedNotes = notesList.map(note => 
      note.id === noteId ? { ...note, content: newContent } : note
    );
    setNotesList(updatedNotes);
    localStorage.setItem('notesList', JSON.stringify(updatedNotes));
    onNotesChange(updatedNotes.map(note => note.content).join('\n\n'));
  };

  return (
    <div className="research-notes">
      <div className="notes-header">
        <h3>Заметки исследования</h3>
        <button 
          className="add-note-button"
          onClick={handleAddNote}
        >
          + Добавить заметку
        </button>
      </div>
      <div className="notes-content">
        <div className="notes-list">
          {notesList.map(note => (
            <div key={note.id} className="note-item">
              <textarea
                className="note-textarea"
                value={note.content}
                onChange={(e) => handleNoteChange(note.id, e.target.value)}
                placeholder="Введите текст заметки..."
              />
              <button 
                className="delete-note-button"
                onClick={() => handleDeleteNote(note.id)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
