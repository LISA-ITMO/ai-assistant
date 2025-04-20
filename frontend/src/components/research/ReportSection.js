import React, { useState, useEffect } from 'react';
import ReportSettings from './ReportSettings';
import MarkdownRenderer from 'react-markdown-renderer';

const ReportSection = ({
  reportSection,
  onSectionChange,
  isGenerating,
  generatedReport,
  onGenerateReport,
  onExportReport,
  reportSettings,
  onSettingsChange,
  autoUpdateReport,
  onAutoUpdateChange
}) => {
  const [error, setError] = useState(null);
  const [filteredReport, setFilteredReport] = useState('');
  const [originalReport, setOriginalReport] = useState('');
  const [lastSettingsHash, setLastSettingsHash] = useState('');

  useEffect(() => {
    if (generatedReport) {
      setOriginalReport(generatedReport);
      setFilteredReport(generatedReport);
    }
  }, [generatedReport]);

  useEffect(() => {
    const settingsHash = JSON.stringify(reportSettings);
    setLastSettingsHash(settingsHash);
  }, [reportSettings]);

  useEffect(() => {
    if (!originalReport) {
      setFilteredReport('');
      return;
    }

    let result = originalReport;
    
    if (!reportSettings.includeGoals) {
      result = removeSection(result, '## Цели');
      result = removeSection(result, '### Цели');
    }
    
    if (!reportSettings.includeTasks) {
      result = removeSection(result, '## Задачи');
      result = removeSection(result, '### Задачи');
    }
    
    if (!reportSettings.includeKeyTerms) {
      result = removeSection(result, '## Ключевые термины');
      result = removeSection(result, '### Ключевые термины');
    }
    
    if (!reportSettings.includeApproaches) {
      result = removeSection(result, '## Подходы');
      result = removeSection(result, '### Подходы');
    }
    
    if (!reportSettings.includeComparison) {
      result = removeSection(result, '## Сравнительный анализ');
      result = removeSection(result, '### Сравнительный анализ');
    }
    
    if (!reportSettings.includeStrengthsWeaknesses) {
      result = removeSection(result, '## Сильные и слабые стороны');
      result = removeSection(result, '### Сильные и слабые стороны');
    }
    
    if (!reportSettings.includeOwnPosition) {
      result = removeSection(result, '## Собственная позиция');
      result = removeSection(result, '### Собственная позиция');
    }
    
    if (!reportSettings.includeNotes) {
      result = removeSection(result, '## Заметки');
      result = removeSection(result, '### Заметки');
    }
    
    if (!reportSettings.includeRecommendations) {
      result = removeSection(result, '## Рекомендации');
      result = removeSection(result, '### Рекомендации');
    }
    
    setFilteredReport(result);
  }, [originalReport, reportSettings]);

  const removeSection = (report, sectionTitle) => {
    const regex = new RegExp(`${sectionTitle}[\\s\\S]*?(?=## |### |$)`, 'g');
    return report.replace(regex, '');
  };

  const handleSettingChange = (newSettings) => {
    onSettingsChange(newSettings);
  };

  const handleGenerateClick = () => {
    onGenerateReport();
  };

  return (
    <div className="report-section">
      <div className="report-header">
        <div className="report-navigation">
          <button
            className={`nav-button ${reportSection === 'editor' ? 'active' : ''}`}
            onClick={() => onSectionChange('editor')}
          >
            Редактор
          </button>
          <button
            className={`nav-button ${reportSection === 'settings' ? 'active' : ''}`}
            onClick={() => onSectionChange('settings')}
          >
            Настройки
          </button>
          <button
            className={`nav-button ${reportSection === 'preview' ? 'active' : ''}`}
            onClick={() => onSectionChange('preview')}
          >
            Предпросмотр
          </button>
        </div>
        <div className="report-actions">
          <label className="auto-update-toggle">
            <input
              type="checkbox"
              checked={autoUpdateReport}
              onChange={(e) => onAutoUpdateChange(e.target.checked)}
            />
            <span>Автообновление</span>
          </label>
          <button
            className="generate-button"
            onClick={handleGenerateClick}
            disabled={isGenerating}
          >
            {isGenerating ? 'Генерация...' : 'Сгенерировать отчет'}
          </button>
          <div className="export-buttons">
            <button
              className="export-button"
              onClick={() => onExportReport('pdf')}
              disabled={!filteredReport}
            >
              PDF
            </button>
            <button
              className="export-button"
              onClick={() => onExportReport('docx')}
              disabled={!filteredReport}
            >
              DOCX
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {reportSection === 'editor' && (
        <div className="report-editor">
          <textarea
            value={filteredReport}
            onChange={(e) => setFilteredReport(e.target.value)}
            placeholder="Начните писать отчет здесь..."
          />
        </div>
      )}

      {reportSection === 'settings' && (
        <ReportSettings
          settings={reportSettings}
          onSettingsChange={handleSettingChange}
        />
      )}

      {reportSection === 'preview' && (
        <div className="report-preview">
          {filteredReport ? (
            <div className="markdown-content">
              <MarkdownRenderer markdown={filteredReport} />
            </div>
          ) : (
            <div className="empty-report">
              <p>Отчет еще не сгенерирован. Нажмите кнопку "Сгенерировать отчет" для создания.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportSection;