import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../styles/research-assistant.css';

const ResearchAssistant = ({ researchId, analysisData, onAnalysisUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_history_${researchId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Здравствуйте! Я ваш исследовательский ассистент. Чем могу помочь?'
      };
      setMessages([welcomeMessage]);
    }
  }, [researchId]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${researchId}`, JSON.stringify(messages));
    }
  }, [messages, researchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const newMessage = { 
        id: Date.now(),
        role: 'user', 
        content: inputMessage 
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setError('');
      
      const response = await api.research.chat({
        prompt: inputMessage,
        provider: 'chatgpt',
        use_rag: true,
        top_k: 5
      });
      
      if (response && response.response) {
        setMessages(prev => [...prev, { 
          id: Date.now(),
          role: 'assistant', 
          content: response.response 
        }]);
      } else {
        throw new Error('Получен некорректный ответ от сервера');
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setError(`Произошла ошибка: ${error.message}`);
      toast.error(`Ошибка при отправке сообщения: ${error.message}`);
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
          {error && (
            <div className="message error">
              <div className="message-content">{error}</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form className="message-input-form" onSubmit={handleSendMessage}>
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