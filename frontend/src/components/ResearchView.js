import React, { useState, useEffect } from 'react';
import '../styles/research-view.css';
import { api } from '../services/api';
import DocumentManager from './DocumentManager';
import FileManager from './FileManager';
import ReportSettings from './research/ReportSettings';
import NavigationTabs from './research/NavigationTabs';
import NotesSection from './research/NotesSection';
import AnalysisSection from './research/AnalysisSection';
import ReportSection from './research/ReportSection';
import ResearchGoals from '../components/ResearchGoals';
import ResearchAssistant from './research/ResearchAssistant';


const ResearchView = ({ 
  topic, 
  goals = [], 
  tasks = [], 
  savedNotes, 
  onNotesChange,
  savedRecommendations = [],
  onSaveRecommendations,
  researchId,
  onDocumentsUploaded,
  initialGoals,
  initialTasks
}) => {
  const [activeTab, setActiveTab] = useState('research');
  const [activeSection, setActiveSection] = useState('notes');
  const [researchNotes, setResearchNotes] = useState(savedNotes || '');
  const [recommendations, setRecommendations] = useState(savedRecommendations);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  
  const [analysisData, setAnalysisData] = useState({
    keyTerms: localStorage.getItem('analysisKeyTerms') ? JSON.parse(localStorage.getItem('analysisKeyTerms')) : [],
    approaches: localStorage.getItem('analysisApproaches') ? JSON.parse(localStorage.getItem('analysisApproaches')) : [],
    comparison: localStorage.getItem('analysisComparison') || '',
    strengths: localStorage.getItem('analysisStrengths') || '',
    weaknesses: localStorage.getItem('analysisWeaknesses') || '',
    ownPosition: localStorage.getItem('analysisOwnPosition') || ''
  });
  
  const [notesCategories, setNotesCategories] = useState(
    localStorage.getItem('notesCategories') 
      ? JSON.parse(localStorage.getItem('notesCategories')) 
      : [
          { id: 'general', name: 'Общие заметки', notes: savedNotes || '' },
          { id: 'sources', name: 'Источники', notes: '' },
          { id: 'ideas', name: 'Идеи и мысли', notes: '' }
        ]
  );
  const [activeNotesCategory, setActiveNotesCategory] = useState('general');
  
  const [reportSettings, setReportSettings] = useState(
    localStorage.getItem('reportSettings') 
      ? JSON.parse(localStorage.getItem('reportSettings')) 
      : {
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
        }
  );
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
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
  }, [researchNotes, analysisData, autoUpdateReport]);

  const generateTempReport = () => {
    let report = `# Отчет по исследованию: ${topic}\n\n`;
    
    if (researchNotes) {
      report += `## Заметки\n\n${researchNotes}\n\n`;
    }
    
    if (analysisData.keyTerms.length > 0 || 
        analysisData.approaches.length > 0 || 
        analysisData.comparison || 
        analysisData.strengths || 
        analysisData.weaknesses || 
        analysisData.ownPosition) {
      
      report += `## Анализ\n\n`;
      
      if (analysisData.keyTerms.length > 0) {
        report += `### Ключевые термины\n\n`;
        analysisData.keyTerms.forEach(term => {
          report += `- **${term.term}**: ${term.definition}\n`;
        });
        report += `\n`;
      }
      
      if (analysisData.approaches.length > 0) {
        report += `### Подходы\n\n`;
        analysisData.approaches.forEach(approach => {
          report += `- **${approach.name}**: ${approach.description}\n`;
        });
        report += `\n`;
      }
      
      if (analysisData.comparison) {
        report += `### Сравнительный анализ\n\n${analysisData.comparison}\n\n`;
      }
      
      if (analysisData.strengths || analysisData.weaknesses) {
        report += `### Сильные и слабые стороны\n\n`;
        if (analysisData.strengths) {
          report += `**Сильные стороны**:\n${analysisData.strengths}\n\n`;
        }
        if (analysisData.weaknesses) {
          report += `**Слабые стороны**:\n${analysisData.weaknesses}\n\n`;
        }
      }
      
      if (analysisData.ownPosition) {
        report += `### Собственная позиция\n\n${analysisData.ownPosition}\n\n`;
      }
    }
    
    return report;
  };

  useEffect(() => {
    const generateNewGoalsAndTasks = async () => {
      try {
        if (goals.length > 0 && tasks.length > 0) {
          return; 
        }

        const newGoals = await api.research.generateGoals(topic);
        
        if (newGoals && newGoals.goals && newGoals.tasks) {
          if (initialGoals) {
            initialGoals(newGoals.goals);
          }
          if (initialTasks) {
            initialTasks(newGoals.tasks);
          }
          
          setAnalysisData({
            keyTerms: [],
            approaches: [],
            comparison: '',
            strengths: '',
            weaknesses: '',
            ownPosition: ''
          });
          
          setResearchNotes('');
          if (onNotesChange) {
            onNotesChange('');
          }
          
          setRecommendations([]);
          if (onSaveRecommendations) {
            onSaveRecommendations([]);
          }
          
          setGeneratedReport('');
          
          setActiveSection('notes');
          
        } else {
          console.error('Получены некорректные данные от API:', newGoals);
        }
      } catch (error) {
        console.error('Ошибка при генерации новых целей и задач:', error);
      }
    };

    if (topic && (!goals.length || !tasks.length)) {
      generateNewGoalsAndTasks();
    }
  }, [topic, goals, tasks]);

  useEffect(() => {
    if (researchNotes !== savedNotes && activeNotesCategory === 'general') {
      onNotesChange(researchNotes);
    }
    
    const updatedCategories = notesCategories.map(cat => 
      cat.id === activeNotesCategory ? { ...cat, notes: researchNotes } : cat
    );
    setNotesCategories(updatedCategories);
    localStorage.setItem('notesCategories', JSON.stringify(updatedCategories));
  }, [researchNotes]);

  useEffect(() => {
    localStorage.setItem('analysisKeyTerms', JSON.stringify(analysisData.keyTerms));
    localStorage.setItem('analysisApproaches', JSON.stringify(analysisData.approaches));
    localStorage.setItem('analysisComparison', analysisData.comparison);
    localStorage.setItem('analysisStrengths', analysisData.strengths);
    localStorage.setItem('analysisWeaknesses', analysisData.weaknesses);
    localStorage.setItem('analysisOwnPosition', analysisData.ownPosition);
  }, [analysisData]);

  useEffect(() => {
    localStorage.setItem('reportSettings', JSON.stringify(reportSettings));
  }, [reportSettings]);

  useEffect(() => {
    localStorage.setItem('generatedReport', generatedReport);
  }, [generatedReport]);

  useEffect(() => {
    if (recommendations !== savedRecommendations) {
      onSaveRecommendations(recommendations);
    }
  }, [recommendations, savedRecommendations, onSaveRecommendations]);

  const handleNotesChange = (categoryId, newText) => {
    const updatedCategories = notesCategories.map(cat => 
      cat.id === categoryId ? { ...cat, notes: newText } : cat
    );
    
    setNotesCategories(updatedCategories);
    
    if (categoryId === 'general') {
      setResearchNotes(newText);
      if (onNotesChange) {
        onNotesChange(newText);
      }
    }
    
    localStorage.setItem('notesCategories', JSON.stringify(updatedCategories));
  };

  const handleNotesCategoryChange = (categoryId) => {
    setActiveNotesCategory(categoryId);
    
    const selectedCategory = notesCategories.find(cat => cat.id === categoryId);
    if (selectedCategory) {
      setResearchNotes(selectedCategory.notes);
    }
  };

  const handleAddNotesCategory = () => {
    const newCategory = {
      id: `category-${Date.now()}`,
      name: 'Новая категория',
      notes: ''
    };
    
    const updatedCategories = [...notesCategories, newCategory];
    setNotesCategories(updatedCategories);
    setActiveNotesCategory(newCategory.id);
    
    localStorage.setItem('notesCategories', JSON.stringify(updatedCategories));
  };

  const handleDeleteNotesCategory = (categoryId) => {
    if (categoryId === 'general') return;
    
    const updatedCategories = notesCategories.filter(cat => cat.id !== categoryId);
    setNotesCategories(updatedCategories);
    
    if (activeNotesCategory === categoryId) {
      setActiveNotesCategory('general');
    }
    
    localStorage.setItem('notesCategories', JSON.stringify(updatedCategories));
  };

  const handleRenameCategoryClick = (categoryId) => {
    if (categoryId === 'general') return;
    
    const categoryName = prompt('Введите новое название категории:');
    if (categoryName && categoryName.trim()) {
      const updatedCategories = notesCategories.map(cat => 
        cat.id === categoryId ? { ...cat, name: categoryName.trim() } : cat
      );
      
      setNotesCategories(updatedCategories);
      
      localStorage.setItem('notesCategories', JSON.stringify(updatedCategories));
    }
  };

  const handleAddKeyTerm = () => {
    const newTerm = prompt('Введите новый ключевой термин:');
    if (newTerm && newTerm.trim()) {
      const newKeyTerms = [...analysisData.keyTerms, { 
        id: `term_${Date.now()}`, 
        term: newTerm.trim(), 
        definition: '' 
      }];
      
      setAnalysisData({
        ...analysisData,
        keyTerms: newKeyTerms
      });
    }
  };

  const handleDeleteKeyTerm = (termId) => {
    const updatedKeyTerms = analysisData.keyTerms.filter(term => term.id !== termId);
    setAnalysisData({
      ...analysisData,
      keyTerms: updatedKeyTerms
    });
  };

  const handleKeyTermChange = (termId, field, value) => {
    const updatedKeyTerms = analysisData.keyTerms.map(term => 
      term.id === termId ? { ...term, [field]: value } : term
    );
    
    setAnalysisData({
      ...analysisData,
      keyTerms: updatedKeyTerms
    });
  };

  const handleAddApproach = () => {
    const newApproach = prompt('Введите название нового подхода:');
    if (newApproach && newApproach.trim()) {
      const newApproaches = [...analysisData.approaches, { 
        id: `approach_${Date.now()}`, 
        name: newApproach.trim(), 
        description: '' 
      }];
      
      setAnalysisData({
        ...analysisData,
        approaches: newApproaches
      });
    }
  };

  const handleDeleteApproach = (approachId) => {
    const updatedApproaches = analysisData.approaches.filter(approach => approach.id !== approachId);
    setAnalysisData({
      ...analysisData,
      approaches: updatedApproaches
    });
  };

  const handleApproachChange = (approachId, field, value) => {
    const updatedApproaches = analysisData.approaches.map(approach => 
      approach.id === approachId ? { ...approach, [field]: value } : approach
    );
    
    setAnalysisData({
      ...analysisData,
      approaches: updatedApproaches
    });
  };

  const handleAnalysisTextChange = (field, value) => {
    setAnalysisData({
      ...analysisData,
      [field]: value
    });
  };

  const handleGenerateRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);
    
    try {
      const response = await api.post('/api/research/generate-recommendations', {
        topic,
        researchId,
        goals,
        tasks,
        notes: researchNotes,
        keyTerms: analysisData.keyTerms,
        approaches: analysisData.approaches
      });
      
      if (response && response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        onSaveRecommendations(response.data.recommendations);
      } else {
        setRecommendationsError('Не удалось получить рекомендации. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendationsError('Произошла ошибка при генерации рекомендаций. Попробуйте позже.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleAddRecommendation = () => {
    const newRecommendation = {
      id: `rec_${Date.now()}`,
      title: 'Новая рекомендация',
      description: '',
      priority: 'medium'
    };
    
    setRecommendations([...recommendations, newRecommendation]);
  };

  const handleDeleteRecommendation = (recId) => {
    const updatedRecommendations = recommendations.filter(rec => rec.id !== recId);
    setRecommendations(updatedRecommendations);
  };

  const handleRecommendationChange = (recId, field, value) => {
    const updatedRecommendations = recommendations.map(rec => 
      rec.id === recId ? { ...rec, [field]: value } : rec
    );
    
    setRecommendations(updatedRecommendations);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setNotification(null);
    
    try {
      const reportData = {
        topic: topic || "",
        goals: goals || [],
        tasks: tasks || [],
        notes: researchNotes || "",
        recommendations: recommendations.map(rec => rec.title || rec) || [],
        analysis: {
          keyTerms: (analysisData.keyTerms || []).map(term => ({
            term: term.term || "",
            definition: term.definition || ""
          })),
          approaches: (analysisData.approaches || []).map(approach => ({
            name: approach.name || "",
            description: approach.description || ""
          })),
          comparison: analysisData.comparison || "",
          strengths: analysisData.strengths || "",
          weaknesses: analysisData.weaknesses || "",
          ownPosition: analysisData.ownPosition || ""
        },
        settings: {
          includeGoals: reportSettings.includeGoals || false,
          includeTasks: reportSettings.includeTasks || false,
          includeKeyTerms: reportSettings.includeKeyTerms || false,
          includeApproaches: reportSettings.includeApproaches || false,
          includeComparison: reportSettings.includeComparison || false,
          includeStrengthsWeaknesses: reportSettings.includeStrengthsWeaknesses || false,
          includeOwnPosition: reportSettings.includeOwnPosition || false,
          includeNotes: reportSettings.includeNotes || false,
          includeRecommendations: reportSettings.includeRecommendations || false,
          style: reportSettings.style || "academic",
          format: reportSettings.format || "markdown",
          language: reportSettings.language || "ru",
          useRAG: reportSettings.useRAG || false
        }
      };

      console.log("Sending report data:", JSON.stringify(reportData, null, 2));

      const response = await api.research.generateReport(reportData);
      console.log("Received response:", response);

      if (response && response.report) {
        setGeneratedReport(response.report);
        setNotification({
          type: 'success',
          message: 'Отчет успешно сгенерирован'
        });
      } else {
        throw new Error('Не удалось сгенерировать отчет: неверный формат ответа');
      }
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Ошибка при генерации отчета. Пожалуйста, попробуйте еще раз.'
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportReport = (format) => {
    // Логика экспорта отчета
  };

  useEffect(() => {
    if (activeSection === 'recommendations' && recommendations.length === 0 && !isLoadingRecommendations && !recommendationsError) {
      handleGenerateRecommendations();
    }
  }, [activeSection]);

  const handleReportSectionChange = (section) => {
    setReportSection(section);
  };

  useEffect(() => {
    if (autoUpdateReport && !isGeneratingReport) {
      if (researchNotes || Object.values(analysisData).some(value => value)) {
        handleGenerateReport();
      }
    }
  }, [reportSettings, autoUpdateReport, researchNotes, analysisData]);

  const handleSettingsChange = (newSettings) => {
    setReportSettings(newSettings);
    localStorage.setItem('reportSettings', JSON.stringify(newSettings));
  };

  const handleAutoUpdateChange = (enabled) => {
    setAutoUpdateReport(enabled);
    localStorage.setItem('autoUpdateReport', enabled);
  };

  return (
    <div className="research-view">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="research-container">
        <div className="research-header">
          <h2>Исследование: {topic}</h2>
        </div>
        
        <div className="research-navigation">
        <NavigationTabs
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        </div>
        
        <div className="research-content">
          {activeSection === 'notes' && (
          <NotesSection
            notes={researchNotes}
            onNotesChange={setResearchNotes}
          />
        )}
        
          {activeSection === 'analysis' && (
          <AnalysisSection
            topic={topic}
            goals={goals}
            tasks={tasks}
            analysisData={analysisData}
            onAnalysisChange={setAnalysisData}
          />
        )}
        
          {activeSection === 'report' && (
          <ReportSection
            reportSection={reportSection}
            onSectionChange={handleReportSectionChange}
            isGenerating={isGeneratingReport}
            generatedReport={generatedReport}
            onGenerateReport={handleGenerateReport}
            onExportReport={handleExportReport}
            reportSettings={reportSettings}
            onSettingsChange={handleSettingsChange}
            autoUpdateReport={autoUpdateReport}
            onAutoUpdateChange={handleAutoUpdateChange}
          />
        )}
        
        {activeSection === 'assistant' && (
          <ResearchAssistant
            topic={topic}
            researchId={researchId}
          />
          )}
        </div>
      </div>
    {activeTab === 'files' && (
      <FileManager 
        researchId={researchId}
        topic={topic}
        onDocumentsUploaded={onDocumentsUploaded}
      />
    )}
  </div>
);
};

export default ResearchView;