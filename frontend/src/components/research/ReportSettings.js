import React from 'react';

const SettingsCheckbox = ({ label, checked, onChange }) => {
  return (
    <div className="setting-item">
      <label className="setting-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
};

const SettingsSelect = ({ label, value, onChange, options }) => {
  return (
    <div className="setting-item">
      <label className="setting-label">
        {label}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

const defaultSettings = {
  includeGoals: true,
  includeTasks: true,
  includeKeyTerms: true,
  includeApproaches: true,
  includeComparison: true,
  includeStrengthsWeaknesses: true,
  includeOwnPosition: true,
  includeNotes: true,
  includeRecommendations: true,
  style: 'academic',
  format: 'markdown',
  language: 'ru',
  useRAG: false
};

const ReportSettings = ({ settings = defaultSettings, onSettingsChange }) => {
  const handleSettingChange = (key, value) => {
    if (onSettingsChange) {
      onSettingsChange({
        ...defaultSettings,
        ...settings,
        [key]: value
      });
    }
  };

  const currentSettings = { ...defaultSettings, ...settings };

  return (
    <div className="report-settings">
      <h3>Настройки отчета</h3>
      
      <div className="settings-group">
        <h4>Содержание отчета</h4>
        <SettingsCheckbox
          label="Включить цели исследования"
          checked={currentSettings.includeGoals}
          onChange={(value) => handleSettingChange('includeGoals', value)}
        />
        <SettingsCheckbox
          label="Включить задачи"
          checked={currentSettings.includeTasks}
          onChange={(value) => handleSettingChange('includeTasks', value)}
        />
        <SettingsCheckbox
          label="Включить ключевые термины"
          checked={currentSettings.includeKeyTerms}
          onChange={(value) => handleSettingChange('includeKeyTerms', value)}
        />
        <SettingsCheckbox
          label="Включить подходы"
          checked={currentSettings.includeApproaches}
          onChange={(value) => handleSettingChange('includeApproaches', value)}
        />
        <SettingsCheckbox
          label="Включить сравнительный анализ"
          checked={currentSettings.includeComparison}
          onChange={(value) => handleSettingChange('includeComparison', value)}
        />
        <SettingsCheckbox
          label="Включить сильные и слабые стороны"
          checked={currentSettings.includeStrengthsWeaknesses}
          onChange={(value) => handleSettingChange('includeStrengthsWeaknesses', value)}
        />
        <SettingsCheckbox
          label="Включить собственную позицию"
          checked={currentSettings.includeOwnPosition}
          onChange={(value) => handleSettingChange('includeOwnPosition', value)}
        />
        <SettingsCheckbox
          label="Включить заметки"
          checked={currentSettings.includeNotes}
          onChange={(value) => handleSettingChange('includeNotes', value)}
        />
        <SettingsCheckbox
          label="Включить рекомендации"
          checked={currentSettings.includeRecommendations}
          onChange={(value) => handleSettingChange('includeRecommendations', value)}
        />
      </div>
      
      <div className="settings-group">
        <h4>Формат и стиль</h4>
        <SettingsSelect
          label="Стиль отчета"
          value={currentSettings.style}
          onChange={(value) => handleSettingChange('style', value)}
          options={[
            { value: 'academic', label: 'Академический' },
            { value: 'business', label: 'Деловой' },
            { value: 'informal', label: 'Неформальный' }
          ]}
        />
        <SettingsSelect
          label="Формат документа"
          value={currentSettings.format}
          onChange={(value) => handleSettingChange('format', value)}
          options={[
            { value: 'markdown', label: 'Markdown' },
            { value: 'html', label: 'HTML' },
            { value: 'plain', label: 'Простой текст' }
          ]}
        />
        <SettingsSelect
          label="Язык отчета"
          value={currentSettings.language}
          onChange={(value) => handleSettingChange('language', value)}
          options={[
            { value: 'ru', label: 'Русский' },
            { value: 'en', label: 'English' }
          ]}
        />
        <SettingsCheckbox
          label="Использовать RAG для генерации"
          checked={currentSettings.useRAG}
          onChange={(value) => handleSettingChange('useRAG', value)}
        />
      </div>
    </div>
  );
};

export default ReportSettings;