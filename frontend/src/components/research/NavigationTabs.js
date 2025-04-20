import React from 'react';

const NavigationTabs = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'notes', label: 'Заметки' },
    { id: 'analysis', label: 'Анализ' },
    { id: 'assistant', label: 'Ассистент' },
    { id: 'report', label: 'Отчет' }
  ];

  return (
    <div className="research-nav">
      {sections.map(section => (
        <button
          key={section.id}
          className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => onSectionChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
};

export default NavigationTabs; 