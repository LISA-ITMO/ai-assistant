import React from 'react';
import '../../styles/research-report.css';

const ResearchReport = ({
  content,
  onContentUpdate,
  settings,
  onSettingsChange,
  isGenerating,
  onGenerate,
  onExport
}) => {
  const handleSettingsChange = (field, value) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="research-report">
      <div className="report-header">
        <h3>Отчет по исследованию</h3>
        <div className="report-actions">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="generate-button"
          >
            {isGenerating ? 'Генерация...' : 'Сгенерировать отчет'}
          </button>
          <div className="export-buttons">
            <button onClick={() => onExport('docx')} className="export-button">
              DOCX
            </button>
            <button onClick={() => onExport('pdf')} className="export-button">
              PDF
            </button>
          </div>
        </div>
      </div>
      <div className="report-settings">
        <h4>Настройки отчета</h4>
        <div className="settings-grid">
          <label>
            <input
              type="checkbox"
              checked={settings.includeGoals}
              onChange={(e) => handleSettingsChange('includeGoals', e.target.checked)}
            />
            Включить цели
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeTasks}
              onChange={(e) => handleSettingsChange('includeTasks', e.target.checked)}
            />
            Включить задачи
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeKeyTerms}
              onChange={(e) => handleSettingsChange('includeKeyTerms', e.target.checked)}
            />
            Включить ключевые термины
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeApproaches}
              onChange={(e) => handleSettingsChange('includeApproaches', e.target.checked)}
            />
            Включить подходы
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeComparison}
              onChange={(e) => handleSettingsChange('includeComparison', e.target.checked)}
            />
            Включить сравнение
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeStrengthsWeaknesses}
              onChange={(e) => handleSettingsChange('includeStrengthsWeaknesses', e.target.checked)}
            />
            Включить сильные и слабые стороны
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeOwnPosition}
              onChange={(e) => handleSettingsChange('includeOwnPosition', e.target.checked)}
            />
            Включить собственную позицию
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeNotes}
              onChange={(e) => handleSettingsChange('includeNotes', e.target.checked)}
            />
            Включить заметки
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.includeRecommendations}
              onChange={(e) => handleSettingsChange('includeRecommendations', e.target.checked)}
            />
            Включить рекомендации
          </label>
        </div>
        <div className="format-settings">
          <select
            value={settings.style}
            onChange={(e) => handleSettingsChange('style', e.target.value)}
            className="style-select"
          >
            <option value="academic">Академический</option>
            <option value="business">Деловой</option>
            <option value="casual">Повседневный</option>
          </select>
          <select
            value={settings.format}
            onChange={(e) => handleSettingsChange('format', e.target.value)}
            className="format-select"
          >
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
            <option value="plain">Текст</option>
          </select>
          <select
            value={settings.language}
            onChange={(e) => handleSettingsChange('language', e.target.value)}
            className="language-select"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <div className="report-content">
        <textarea
          value={content}
          onChange={(e) => onContentUpdate(e.target.value)}
          placeholder="Содержание отчета..."
          className="report-textarea"
        />
      </div>
    </div>
  );
};

export default ResearchReport; 