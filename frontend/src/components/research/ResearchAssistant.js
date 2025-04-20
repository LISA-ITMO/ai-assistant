import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import '../../styles/research-assistant.css';

const ResearchAssistant = ({ topic, researchId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_history_${researchId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Здравствуйте! Я ваш исследовательский ассистент. Я помогу вам с исследованием на тему "${topic}". Что бы вы хотели узнать?`
      };
      setMessages([welcomeMessage]);
    }
  }, [researchId, topic]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${researchId}`, JSON.stringify(messages));
    }
  }, [messages, researchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message) => {
    try {
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;
      
      if (!apiKey) {
        throw new Error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
      }

      if (!researchId) {
        throw new Error('ID исследования не найден');
      }

      const newMessage = { role: 'user', content: message };
      setMessages(prev => [...prev, newMessage]);
      
      setIsLoading(true);

      console.log('Отправляем запрос с данными:', {
        message,
        research_id: researchId,
        research_topic: topic,
        chat_history: messages
      });

      const response = await api.research.chat({
        message,
        research_id: researchId,
        research_topic: topic,
        chat_history: messages.map(({ role, content }) => ({ role, content }))
      }, apiKey);

      if (response && response.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
      } else {
        throw new Error('Получен некорректный ответ от сервера');
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setError(`Произошла ошибка: ${error.message}`);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="research-assistant">
      <div className="chat-container">
        <div className="messages-container">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.role} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form className="message-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Задайте вопрос ассистенту..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputMessage.trim()}>
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResearchAssistant; 