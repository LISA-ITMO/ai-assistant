import React, { useState, useEffect } from 'react';
import '../styles/research-view.css';
import { api } from '../services/api';
import ResearchAssistant from './research/ResearchAssistant';
import { toast } from 'react-hot-toast';
import ResearchNotes from './research/ResearchNotes';
import ResearchReport from './research/ResearchReport';

const ResearchView = ({ 
  topic, 
  researchId,
  messages: initialMessages = []
}) => {
  const [activeTab, setActiveTab] = useState('notes');
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [researchNotes, setResearchNotes] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeNotesCategory, setActiveNotesCategory] = useState('general');
  const [analysisData, setAnalysisData] = useState({});
  
  const [reportSettings, setReportSettings] = useState(
    localStorage.getItem('reportSettings') 
      ? JSON.parse(localStorage.getItem('reportSettings')) 
      : {
          includeKeyTerms: true,
          includeApproaches: true,
          includeComparison: true,
          includeStrengthsWeaknesses: true,
          includeOwnPosition: true,
          includeNotes: true,
          style: 'academic', 
          format: 'markdown', 
          language: 'ru',
          useRAG: false
        }
  );

  const [generatedReport, setGeneratedReport] = useState(
    localStorage.getItem('generatedReport') || ''
  );
  const [reportSection, setReportSection] = useState('editor');
  const [notification, setNotification] = useState(null);
  const [autoUpdateReport, setAutoUpdateReport] = useState(
    localStorage.getItem('autoUpdateReport') === 'true'
  );

  useEffect(() => {
    if (autoUpdateReport && (researchNotes || Object.values(analysisData).some(value => value))) {
      const tempReport = generateTempReport();
      setGeneratedReport(tempReport);
    }
  }, [autoUpdateReport, researchNotes, analysisData]);

  const handleChat = async (message) => {
    try {
      setIsLoading(true);
      const result = await api.research.chat({
        prompt: message,
        provider: 'chatgpt',
        use_rag: true,
        top_k: 5
      });
      
      if (result && result.response) {
        return result.response;
      } else {
        throw new Error('Получен некорректный ответ от сервера');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(`Ошибка при отправке сообщения: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await handleChat(message);
      if (response) {
        setMessages(prev => [...prev, { 
          id: Date.now(),
          role: 'assistant', 
          content: response 
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Не удалось отправить сообщение');
    }
  };

  const handleNotesUpdate = (newNotes) => {
    setResearchNotes(newNotes);
    localStorage.setItem('researchNotes', newNotes);
  };

  const handleReportUpdate = (newContent) => {
    setReportContent(newContent);
    localStorage.setItem('reportContent', newContent);
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const reportData = {
        topic,
        notes: researchNotes,
        settings: reportSettings
      };

      const response = await api.research.generateReport(reportData);
      if (response && response.content) {
        setReportContent(response.content);
        localStorage.setItem('reportContent', response.content);
        toast.success('Отчет успешно сгенерирован');
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(`Ошибка при генерации отчета: ${error.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportReport = async (format) => {
    try {
      const response = await api.research.exportReport({
        content: reportContent,
        format,
        settings: reportSettings
      });

      if (response && response.file) {
        const link = document.createElement('a');
        link.href = response.file;
        link.download = `research_report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Отчет успешно экспортирован в формате ${format.toUpperCase()}`);
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(`Ошибка при экспорте отчета: ${error.message}`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <ResearchNotes
            notes={researchNotes}
            onNotesUpdate={handleNotesUpdate}
            activeCategory={activeNotesCategory}
            onCategoryChange={setActiveNotesCategory}
          />
        );
      case 'analysis':
        return (
          <div className="analysis-content">
            {/* Analysis component will be added here */}
            <h2>Анализ</h2>
          </div>
        );
      case 'assistant':
        return (
          <ResearchAssistant
            topic={topic}
            researchId={researchId}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        );
      case 'report':
        return (
          <ResearchReport
            content={reportContent}
            onContentUpdate={handleReportUpdate}
            settings={reportSettings}
            onSettingsChange={setReportSettings}
            isGenerating={isGeneratingReport}
            onGenerate={handleGenerateReport}
            onExport={handleExportReport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="research-view">
      <div className="research-tabs">
        <button
          className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Заметки
        </button>
        <button
          className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Анализ
        </button>
        <button
          className={`tab-button ${activeTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistant')}
        >
          Ассистент
        </button>
        <button
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Отчет
        </button>
      </div>
      <div className="research-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ResearchView;