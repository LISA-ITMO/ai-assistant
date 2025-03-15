const API_BASE_URL = 'http://localhost:8000';

const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  FILES: {
    UPLOAD: `${API_BASE_URL}/api/files/upload`,
    LIST: `${API_BASE_URL}/api/files`,
    DELETE: (filename) => `${API_BASE_URL}/api/files/${filename}`,
  },
  LLM: {
    QUERY: `${API_BASE_URL}/api/query`,
    SETTINGS: `${API_BASE_URL}/api/settings/llm`,
    REFINE_TOPIC: `${API_BASE_URL}/api/refine-topic`,
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
    }
  }
};

export { API_ENDPOINTS };
  