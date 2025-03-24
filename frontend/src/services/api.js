const API_BASE_URL = 'http://localhost:8000';

const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  FILES: {
    UPLOAD: `${API_BASE_URL}/api/files/upload`,
    LIST: `${API_BASE_URL}/api/files`,
    DELETE: (filename) => `${API_BASE_URL}/api/files/${filename}`,
    SAVE_DOCUMENTS: `${API_BASE_URL}/api/files/save-documents`,
  },
  LLM: {
    QUERY: `${API_BASE_URL}/api/query`,
    SETTINGS: `${API_BASE_URL}/api/settings/llm`,
    REFINE_TOPIC: `${API_BASE_URL}/api/refine-topic`,
  },
  RESEARCH: {
    GENERATE_GOALS: `${API_BASE_URL}/api/research/goals`,
  }
};

export const api = {
  llm: {
    saveLLMSettings: async (provider, apiKey) => {
      const response = await fetch(API_ENDPOINTS.LLM.SETTINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider, api_key: apiKey })
      });
      if (!response.ok) throw new Error('Ошибка при сохранении API ключа');
      return response.json();
    },

    refineTopic: async (topic, apiKey) => {
      const response = await fetch(API_ENDPOINTS.LLM.REFINE_TOPIC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ research_topic: topic })
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Неверный API ключ. Пожалуйста, введите корректный ключ в настройках.');
        }
        throw new Error(`Ошибка: ${response.status}`);
      }
      return response.json();
    },

    sendQuery: async (query) => {
      const response = await fetch(API_ENDPOINTS.LLM.QUERY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      if (!response.ok) throw new Error('Ошибка при отправке запроса');
      return response.json();
    }
  },
  
  files: {
    list: async () => {
      const response = await fetch(API_ENDPOINTS.FILES.LIST);
      if (!response.ok) throw new Error('Ошибка при получении списка файлов');
      return response.json();
    },

    upload: async (files) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(API_ENDPOINTS.FILES.UPLOAD, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Ошибка при загрузке файлов');
      return response.json();
    },

    delete: async (filename) => {
      const response = await fetch(API_ENDPOINTS.FILES.DELETE(filename), {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Ошибка при удалении файла');
      return response.json();
    },

    saveDocuments: async () => {
      const response = await fetch(API_ENDPOINTS.FILES.SAVE_DOCUMENTS, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Ошибка при сохранении документов');
      return response.json();
    },
  },

  research: {
    generateGoals: async (topic) => {
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

      const response = await fetch(API_ENDPOINTS.RESEARCH.GENERATE_GOALS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ research_topic: topic })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при генерации целей и задач');
      }

      const data = await response.json();
      console.log("Received data:", data); // Для отладки

      if (!data.goals || !data.tasks) {
        console.error("Invalid response format:", data);
        throw new Error('Неверный формат ответа от сервера');
      }

      return data; // Возвращаем данные напрямую
    }
  }
};

export { API_ENDPOINTS };
  