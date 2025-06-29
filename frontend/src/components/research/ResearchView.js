import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import ResearchAssistant from './ResearchAssistant';
import ResearchNotes from './ResearchNotes';
import ResearchReport from './ResearchReport';
import '../../styles/research-view.css';

const ResearchView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState('assistant');
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [reportContent, setReportContent] = useState('');
  const [reportSettings, setReportSettings] = useState({
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
    language: 'ru'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        setLoading(true);
        const data = await api.research.getResearch(id);
        setResearchData(data);
        setAnalysisData(data.analysis || null);
        setNotes(data.notes || '');
        setReportContent(data.report || '');
        setReportSettings(data.reportSettings || reportSettings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchData();
  }, [id]);

  const handleNotesUpdate = async (newNotes) => {
    setNotes(newNotes);
    try {
      await api.research.updateResearch(id, { notes: newNotes });
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  const handleReportContentUpdate = async (newContent) => {
    setReportContent(newContent);
    try {
      await api.research.updateResearch(id, { report: newContent });
    } catch (err) {
      console.error('Failed to update report:', err);
    }
  };

  const handleReportSettingsChange = async (newSettings) => {
    setReportSettings(newSettings);
    try {
      await api.research.updateResearch(id, { reportSettings: newSettings });
    } catch (err) {
      console.error('Failed to update report settings:', err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const report = await api.research.generateReport(id, reportSettings);
      setReportContent(report);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async (format) => {
    try {
      await api.research.exportReport(id, format);
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!researchData) {
    return <div className="error">Исследование не найдено</div>;
  }

  return (
    <div className="research-view">
      <div className="research-header">
        <h2>{researchData.topic}</h2>
        <div className="research-tabs">
          <button
            className={activeTab === 'assistant' ? 'active' : ''}
            onClick={() => setActiveTab('assistant')}
          >
            Ассистент
          </button>
          <button
            className={activeTab === 'notes' ? 'active' : ''}
            onClick={() => setActiveTab('notes')}
          >
            Заметки
          </button>
          <button
            className={activeTab === 'report' ? 'active' : ''}
            onClick={() => setActiveTab('report')}
          >
            Отчет
          </button>
        </div>
      </div>
      <div className="research-content">
        {activeTab === 'assistant' && (
          <ResearchAssistant
            researchId={id}
            analysisData={analysisData}
            onAnalysisUpdate={setAnalysisData}
          />
        )}
        {activeTab === 'notes' && (
          <ResearchNotes
            notes={notes}
            onNotesUpdate={handleNotesUpdate}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}
        {activeTab === 'report' && (
          <ResearchReport
            content={reportContent}
            onContentUpdate={handleReportContentUpdate}
            settings={reportSettings}
            onSettingsChange={handleReportSettingsChange}
            isGenerating={isGenerating}
            onGenerate={handleGenerateReport}
            onExport={handleExportReport}
          />
        )}
      </div>
    </div>
  );
};

export default ResearchView;