import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

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
  const [messages, setMessages] = useState([]);

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
    try {
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

      if (!apiKey) {
        // Если API ключ не найден, используем стандартные цели
        setGoals(['Исследовать современные методы и подходы к решению поставленной задачи']);
        setTasks([
          'Проанализировать существующие решения и их эффективность',
          'Выявить основные проблемы и ограничения',
          'Предложить пути улучшения и оптимизации'
        ]);
        return;
      }

      const response = await api.research.generatePlan(topic);
      console.log('Generated goals and tasks:', response);

      if (response.goals && response.tasks) {
        setGoals(response.goals);
        setTasks(response.tasks);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Error generating research goals:', error);
      setError(error.message);
    }
  };

  const handleSubmit = async (originalTopic, refinedTopic) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Сохраняем обе версии темы
      setQuery(originalTopic);
      setSuggestedTopic(refinedTopic);
      
      // Показываем модальное окно для выбора темы
      setIsTopicModalOpen(true);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message);
      toast.error(`Ошибка: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeepOriginal = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFinalTopic(query);
      
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

      if (!apiKey) {
        setError('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
        setCurrentView('error');
        toast.error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
        return;
      }
      
      // Генерируем план исследования
      const response = await api.research.generatePlan(query);
      
      if (!response || !response.goals || !response.tasks) {
        throw new Error('Неверный формат ответа от сервера');
      }

      // Обновляем состояние
      setGoals([...response.goals]);
      setTasks([...response.tasks]);
      
      const newResearchId = `research_${Date.now()}`;
      setResearchId(newResearchId);
      
      // Сохраняем данные
      const researchData = {
        topic: query,
        goals: [...response.goals],
        tasks: [...response.tasks],
        id: newResearchId
      };
      
      localStorage.setItem('currentResearch', JSON.stringify(researchData));
      
      setIsTopicModalOpen(false);
      setHasSelectedTopic(true);
      setCurrentView('research');
      
    } catch (error) {
      console.error('Ошибка при обработке темы:', error);
      setError(error.message);
      toast.error(`Ошибка: ${error.message}`);
      setCurrentView('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggested = async (suggestedTopic) => {
    try {
      setCurrentView('loading');
      
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

      if (!apiKey) {
        setError('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
        setCurrentView('error');
        toast.error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
        return;
      }

      const response = await api.research.generatePlan(suggestedTopic);
      
      if (!response || !response.goals || !response.tasks) {
        throw new Error('Неверный формат ответа от сервера');
      }

      // Создаем новый объект без циклических ссылок
      const researchData = {
        topic: suggestedTopic,
        goals: [...response.goals],
        tasks: [...response.tasks]
      };

      // Сохраняем данные в localStorage
      localStorage.setItem('researchData', JSON.stringify(researchData));

      // Обновляем состояние
      setFinalTopic(suggestedTopic);
      setGoals([...response.goals]);
      setTasks([...response.tasks]);
      setHasSelectedTopic(true);
      setCurrentView('research');
    } catch (error) {
      console.error('Ошибка при обработке темы:', error);
      setError(error.message);
      setCurrentView('error');
      toast.error(`Ошибка: ${error.message}`);
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

  const handleSaveGoals = async (savedData) => {
    setGoals(savedData.goals);
    setTasks(savedData.tasks);
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
                researchId={researchId}
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
            initialGoals={goals}
            initialTasks={tasks}
            onSave={handleSaveGoals}
          />
        );
      
      case 'research':
        return (
          <ResearchView
            topic={finalTopic}
            goals={goals}
            tasks={tasks}
            onGoalsUpdate={setGoals}
            onTasksUpdate={setTasks}
            researchId={researchId}
            messages={messages}
            onMessagesUpdate={setMessages}
          />
        );
      
      default:
        return <div>Неизвестное представление</div>;
    }
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" />
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
    </Router>
  );
}

export default App;