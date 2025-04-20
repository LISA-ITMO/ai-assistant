import React, { useState, useEffect, useCallback } from 'react';

import ResponseDisplay from './components/ResponseDisplay';
import Settings from './components/Settings';
import TopicModal from './components/TopicModal';
import FileManager from './components/FileManager';
import Navigation from './components/Navigation';
import ResearchGoals from './components/ResearchGoals';
import ResearchView from './components/ResearchView';
import SearchForm from './components/SearchForm';

import './styles/main.css';
import './styles/modal.css';

import { api } from './services/api';

function App() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  const [currentView, setCurrentView] = useState('search');
  
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [suggestedTopic, setSuggestedTopic] = useState('');
  const [finalTopic, setFinalTopic] = useState('');
  const [hasSelectedTopic, setHasSelectedTopic] = useState(false);

  const [researchGoals, setResearchGoals] = useState(null);
  
  const [researchNotes, setResearchNotes] = useState('');
  const [researchRecommendations, setResearchRecommendations] = useState([]);
  
  const [researchId, setResearchId] = useState('');

  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);

  const handleDocumentsUploaded = useCallback((documents) => {
    setResearchDocuments(prev => [...prev, ...documents]);
  }, []);

  useEffect(() => {
    const newUrl = `${window.location.origin}${window.location.pathname}#/${currentView}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }, [currentView]);
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash && ['search', 'files', 'goals', 'research', 'results'].includes(hash)) {
        setCurrentView(hash);
      } else if (!hash || hash === '') {
        setCurrentView('search');
        const newUrl = `${window.location.origin}${window.location.pathname}#/search`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    };
    
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  useEffect(() => {
    const savedState = localStorage.getItem('researchAppState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setFinalTopic(parsedState.topic || '');
      setResearchGoals(parsedState.goals || null);
      setResearchNotes(parsedState.notes || '');
      setResearchRecommendations(parsedState.recommendations || []);
      
      if (parsedState.topic) {
        setHasSelectedTopic(true);
      }
    }
  }, []);
  
  useEffect(() => {
    if (hasSelectedTopic) {
      localStorage.setItem('researchAppState', JSON.stringify({
        topic: finalTopic,
        goals: researchGoals,
        notes: researchNotes,
        recommendations: researchRecommendations
      }));
    }
  }, [finalTopic, researchGoals, researchNotes, researchRecommendations, hasSelectedTopic]);

  useEffect(() => {
    const savedResearch = localStorage.getItem('currentResearch');
    if (savedResearch) {
      const research = JSON.parse(savedResearch);
      setFinalTopic(research.topic);
      setResearchGoals(research.goals);
      setHasSelectedTopic(true);
      setCurrentView('research');
      
      if (research.id) {
        setResearchId(research.id);
      } else {
        const newId = `research_${Date.now()}`;
        setResearchId(newId);
        saveResearchData(research.topic, research.goals, newId);
      }
    }
  }, []);

  const saveResearchData = (topic, goals, id) => {
    const researchData = {
      topic,
      goals,
      id: id || researchId || `research_${Date.now()}`
    };
    localStorage.setItem('currentResearch', JSON.stringify(researchData));
    
    if (id && id !== researchId) {
      setResearchId(id);
    }
  };

  const generateResearchGoals = async (topic) => {
    const savedSettings = localStorage.getItem('llmSettings');
    const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;
    
    if (!apiKey) {
      console.warn('API ключ не найден, используем стандартные цели и задачи');
      return defaultGoals(topic);
    }
    
    try {
      const response = await api.research.generateGoals(topic);
      
      if (response && response.goals && response.tasks) {
        return {
          goals: response.goals,
          tasks: response.tasks
        };
      } else {
        console.error('Некорректный формат ответа от API:', response);
        return defaultGoals(topic);
      }
    } catch (error) {
      console.error('Ошибка при генерации целей и задач:', error);
      return defaultGoals(topic);
    }
  };

  const defaultGoals = (topic) => ({
    goals: [
      `Изучить основные концепции по теме "${topic}"`,
      'Проанализировать существующие подходы и методологии',
      'Сформулировать собственную позицию на основе исследования'
    ],
    tasks: [
      'Собрать и систематизировать информацию из различных источников',
      'Выделить ключевые аспекты и проблемы темы',
      'Сравнить различные точки зрения экспертов',
      'Подготовить аргументированные выводы и рекомендации'
    ]
  });

  const handleSubmit = async (inputQuery) => {
    const queryText = typeof inputQuery === 'string' ? inputQuery : (inputQuery.preventDefault(), query);
    
    if (queryText.trim() === '') return;

    const savedSettings = localStorage.getItem('llmSettings');
    const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

    if (!apiKey) {
      setError('Пожалуйста, введите ваш OpenAI API ключ в настройках.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuery(queryText);
    
    try {
      const data = await api.llm.refineTopic(queryText, apiKey);

      let improvedTopic;
      if (typeof data === 'string') {
        try {
          const parsedData = JSON.parse(data);
          improvedTopic = parsedData.improved_topic || parsedData.refined_topic;
        } catch {
          improvedTopic = data;
        }
      } else if (typeof data === 'object') {
        improvedTopic = data.improved_topic || data.refined_topic;
      } else {
        improvedTopic = data;
      }
      
      improvedTopic = improvedTopic.replace(/^["']|["']$/g, '');
      
      setSuggestedTopic(improvedTopic);
      setIsTopicModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeepOriginal = async () => {
    try {
      setIsLoading(true);
      setFinalTopic(query);
    
      const newGoals = await generateResearchGoals(query);
      setResearchGoals(newGoals);
      
      const newResearchId = `research_${Date.now()}`;
      setResearchId(newResearchId);

      saveResearchData(query, newGoals, newResearchId);
      
      setIsTopicModalOpen(false);
      setHasSelectedTopic(true);
      setCurrentView('research');
    } catch (error) {
      console.error('Ошибка при обработке темы:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggested = async () => {
    try {
      setIsLoading(true);
      setFinalTopic(suggestedTopic);
      
      const newGoals = await generateResearchGoals(suggestedTopic);
      setResearchGoals(newGoals);
      setGoals(newGoals.goals);
      setTasks(newGoals.tasks);
      
      const newResearchId = `research_${Date.now()}`;
      setResearchId(newResearchId);
      
      saveResearchData(suggestedTopic, newGoals, newResearchId);
      
      setIsTopicModalOpen(false);
      setHasSelectedTopic(true);
      setCurrentView('research');
    } catch (error) {
      console.error('Ошибка при обработке темы:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (filename) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;
      
      if (!apiKey) {
        setError('Пожалуйста, введите ваш OpenAI API ключ в настройках.');
        return;
      }
      
      const result = await api.llm.processFile(filename, finalTopic, apiKey);
      setResponse(result.response);
      setCurrentView('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetResearch = () => {
    if (window.confirm('Вы уверены, что хотите начать новое исследование? Все текущие данные будут удалены.')) {
      setQuery('');
      setFinalTopic('');
      setSuggestedTopic('');
      setResearchGoals(null);
      setResearchNotes('');
      setResearchRecommendations([]);
      setHasSelectedTopic(false);
      setCurrentView('search');
      localStorage.removeItem('researchAppState');
    }
  };

  const handleLogoClick = () => {
    if (hasSelectedTopic) {
      if (window.confirm('Вернуться к выбору темы исследования? Текущий прогресс сохранится.')) {
        setCurrentView('search');
        setHasSelectedTopic(false);
      }
    } else {
      setCurrentView('search');
    }
  };

  const handleSaveGoals = async (goals) => {
    setResearchGoals(goals);
    setCurrentView('research');
  };

  const handleSaveRecommendations = (recommendations) => {
    setResearchRecommendations(recommendations);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return (
          <SearchForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            initialQuery={query}
            error={error}
            hasExistingResearch={hasSelectedTopic}
            existingTopic={finalTopic}
            onContinueResearch={() => setCurrentView('research')}
            onResetResearch={handleResetResearch}
          />
        );
      
      case 'files':
        return (
          <div className="main-container files-page">
            <div className="files-page-header">
              <h2>Загрузка материалов для исследования</h2>
              <button className="action-button" onClick={() => setCurrentView('research')}>
                Вернуться к исследованию
              </button>
            </div>
            <div className="files-page-content">
              <FileManager 
                apiEndpoints={{
                  LIST: '/api/files',
                  UPLOAD: '/api/files/upload',
                  DELETE: (filename) => `/api/files/${filename}`
                }}
                onUpload={handleFileUpload}
                isLoading={isLoading}
                topic={finalTopic}
              />
            </div>
          </div>
        );
      
      case 'results':
        return (
          <ResponseDisplay 
            response={response} 
            isLoading={isLoading}
            query={finalTopic}
            onReset={() => {
              setCurrentView('search');
              setQuery('');
              setFinalTopic('');
              setResponse('');
            }}
          />
        );
      
      case 'goals':
        return (
          <ResearchGoals
            topic={finalTopic}
            initialGoals={researchGoals?.goals}
            initialTasks={researchGoals?.tasks}
            onSave={handleSaveGoals}
          />
        );
      
      case 'research':
        return (
          <ResearchView
            topic={finalTopic}
            goals={researchGoals?.goals || []}
            tasks={researchGoals?.tasks || []}
            initialGoals={setGoals}
            initialTasks={setTasks}
            savedNotes={researchNotes}
            onNotesChange={setResearchNotes}
            savedRecommendations={researchRecommendations}
            onSaveRecommendations={handleSaveRecommendations}
            researchId={researchId}
            onDocumentsUploaded={handleDocumentsUploaded}
          />
        );
      
      default:
        return <div>Неизвестное представление</div>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <h1>A.R.T.H.U.R.</h1>
          <p>Academic Research Tool for Helpful Understanding and Retrieval</p>
        </div>
        <div className="header-actions">
        <button 
            className="settings-button"
            onClick={() => setIsSettingsOpen(true)}
        >
            <span className="settings-icon">⚙️</span>
            <span>Настройки</span>
        </button>
        </div>
      </header>

      {hasSelectedTopic && (
        <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      )}

      <main className={`App-main ${currentView === 'search' ? 'centered-content' : ''}`}>
        {renderContent()}
      </main>

      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        originalTopic={query}
        suggestedTopic={suggestedTopic}
        onKeepOriginal={handleKeepOriginal}
        onUseSuggested={handleUseSuggested}
        isLoading={isLoading}
      />

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      
    </div>
  );
}

export default App;