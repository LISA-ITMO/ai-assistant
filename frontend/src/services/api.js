const API_BASE_URL = 'http://localhost:8000';

const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  FILES: {
    UPLOAD: `${API_BASE_URL}/api/v1/files/upload`,
    LIST: `${API_BASE_URL}/api/v1/files`,
    DELETE: (filename) => `${API_BASE_URL}/api/v1/files/${filename}`,
    SAVE_DOCUMENTS: `${API_BASE_URL}/api/files/save-documents`,
  },
  LLM: {
    QUERY: `${API_BASE_URL}/api/query`,
    SETTINGS: `${API_BASE_URL}/api/settings/llm`,
    REFINE_TOPIC: `${API_BASE_URL}/api/refine-topic`
  }, 
  RESEARCH: {
    PLAN: `${API_BASE_URL}/api/v1/research/plan`,
    TOPIC: `${API_BASE_URL}/api/v1/research/topic`,
    CHAT: `${API_BASE_URL}/api/v1/research/chat`,
    FILES: `${API_BASE_URL}/api/v1/research/files`,
    UPLOAD_FILE: `${API_BASE_URL}/api/v1/research/upload-file`,
    GENERATE_REPORT: `${API_BASE_URL}/api/v1/research/generate-report`,
    GENERATE_ANNOTATION: `${API_BASE_URL}/api/v1/research/generate-annotation`,
    DELETE_FILE: `${API_BASE_URL}/api/v1/research/delete-file`,
    CLEAR_VECTOR_STORE: `${API_BASE_URL}/api/v1/research/clear-vector-store`,
    VECTORIZE_FILE: `${API_BASE_URL}/api/v1/research/vectorize-file`,
  },
  RAG: {
    CHUNK: `${API_BASE_URL}/api/v1/rag/chunk`,
    RETRIEVE: `${API_BASE_URL}/api/v1/rag/retrieve`,
    CLEAR: `${API_BASE_URL}/api/v1/rag/clear`,
  },
  ANNOTATIONS: {
    GENERATE: `${API_BASE_URL}/api/v1/annotations/generate`,
  }
};

const getApiKey = () => {
  const savedSettings = localStorage.getItem('llmSettings');
  if (!savedSettings) {
    throw new Error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
  }
  const settings = JSON.parse(savedSettings);
  if (!settings.apiKey) {
    throw new Error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
  }
  return settings.apiKey;
};

const getHeaders = () => {
  const apiKey = getApiKey();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
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
      const response = await fetch(API_ENDPOINTS.LLM. REFINE_TOPIC, {
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
    },

    generateWithRAG: async (query, context, topic, apiKey) => {
      try {
        const response = await fetch('/api/report/generate-with-rag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            query,
            context,
            topic
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при генерации контента');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Ошибка API при генерации с RAG:', error);
        throw error;
      }
    }
  },
  
  files: {
    list: async () => {
      const response = await fetch(API_ENDPOINTS.FILES.LIST);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при получении списка файлов');
      }
      return response.json();
    },

    upload: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_ENDPOINTS.FILES.UPLOAD, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при загрузке файла');
      }
      return response.json();
    },

    delete: async (filename) => {
      const response = await fetch(API_ENDPOINTS.FILES.DELETE(filename), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при удалении файла');
      }
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
    generatePlan: async (topic, provider = 'chatgpt') => {
      try {
        const savedSettings = localStorage.getItem('llmSettings');
        const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

        if (!apiKey) {
          throw new Error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
        }

        const response = await fetch(API_ENDPOINTS.RESEARCH.PLAN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            topic,
            provider
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ошибка при генерации плана исследования');
        }

        const data = await response.json();
        
        if (!data || !data.goal) {
          throw new Error('Неверный формат ответа от сервера');
        }

        const result = {
          goals: [data.goal],
          tasks: Array.isArray(data.tasks) ? [...data.tasks] : []
        };

        return result;
      } catch (error) {
        console.error('Error in generatePlan:', error);
        throw error;
      }
    },
    
    generateRecommendations: async (topic) => {
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

      if (!apiKey) {
        throw new Error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
      }

      const response = await fetch(API_ENDPOINTS.RESEARCH.GENERATE_RECOMMENDATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ research_topic: topic })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ошибка при генерации рекомендаций');
        } else {
          const errorText = await response.text();
          throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error("Получен не JSON ответ:", responseText);
        throw new Error('Сервер вернул неверный формат данных');
      }

      try {
        const data = await response.json();
        console.log("Received recommendations:", data);

        if (!data.recommendations) {
          console.error("Invalid response format:", data);
          throw new Error('Неверный формат ответа от сервера');
        }

        return data.recommendations;
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
        throw new Error('Ошибка при обработке ответа сервера');
      }
    },

    generateReport: async (data) => {
      const savedSettings = localStorage.getItem('llmSettings');
      const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;
      
      if (!apiKey) {
        throw new Error('API ключ не найден. Пожалуйста, добавьте API ключ в настройках.');
      }

      try {
        console.log("API Key:", apiKey);
        console.log("Request URL:", API_ENDPOINTS.RESEARCH.GENERATE_REPORT);
        console.log("Request Headers:", {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        });
        console.log("Request Body:", JSON.stringify(data, null, 2));

        const response = await fetch(API_ENDPOINTS.RESEARCH.GENERATE_REPORT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(data)
        });

        console.log("Response Status:", response.status);
        console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error("Error Response:", errorData);
            throw new Error(errorData.detail || 'Ошибка при генерации отчета');
          } else {
            const errorText = await response.text();
            console.error("Error Text:", errorText);
            throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
          }
        }

        const responseData = await response.json();
        console.log("Success Response:", responseData);
        
        if (!responseData) {
          throw new Error('Пустой ответ от сервера');
        }

        return responseData;
      } catch (error) {
        console.error('Ошибка при генерации отчета:', error);
        throw error;
      }
    },

    chat: async ({ prompt, provider, use_rag, top_k }) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RESEARCH.CHAT}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            prompt,
            provider,
            use_rag,
            top_k
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Ошибка при отправке сообщения');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error in chat:', error);
        throw error;
      }
    },

    uploadFile: async (formData) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RESEARCH.UPLOAD_FILE}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${getApiKey()}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Ошибка при загрузке файла');
        }

        return await response.json();
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    },

    vectorizeFile: async (fileId, researchId) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RESEARCH.VECTORIZE_FILE}/${fileId}/vectorize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getApiKey()}`
          },
          body: JSON.stringify({ research_id: researchId })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Ошибка при векторизации файла');
        }

        return await response.json();
      } catch (error) {
        console.error('Error vectorizing file:', error);
        throw error;
      }
    },

    getFiles: async (researchId) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RESEARCH.FILES}/${researchId}/files`, {
          headers: {
            'Authorization': `Bearer ${getApiKey()}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Ошибка при получении списка файлов');
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting files:', error);
        throw error;
      }
    },

    generateAnnotation: async (fileId, researchId) => {
      try {
        const savedSettings = localStorage.getItem('llmSettings');
        const apiKey = savedSettings ? JSON.parse(savedSettings).apiKey : null;

        if (!apiKey) {
          throw new Error('API ключ не найден');
        }

        const response = await fetch(API_ENDPOINTS.RESEARCH.GENERATE_ANNOTATION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({ file_id: fileId, research_id: researchId })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Ошибка при генерации аннотации');
        }

        return await response.json();
      } catch (error) {
        console.error('Error in generateAnnotation:', error);
        throw error;
      }
    },

    deleteFile: async (fileId, researchId) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RESEARCH.DELETE_FILE}/${fileId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getApiKey()}`
          },
          body: JSON.stringify({ research_id: researchId })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Ошибка при удалении файла');
        }

        return await response.json();
      } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    },

    clearVectorStore: async (researchId) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RESEARCH.CLEAR_VECTOR_STORE}/${researchId}/vector-store/clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getApiKey()}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Ошибка при очистке векторной базы данных');
        }

        return await response.json();
      } catch (error) {
        console.error('Error clearing vector store:', error);
        throw error;
      }
    },

    refineTopic: async (topic, provider) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RESEARCH.TOPIC}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ topic, provider })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Ошибка при уточнении темы');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error in refineTopic:', error);
        throw error;
      }
    }
  },

  rag: {
    chunkFile: async (filename) => {
      const response = await fetch(API_ENDPOINTS.RAG.CHUNK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при разбиении файла на чанки');
      }
      return response.json();
    },

    retrieveChunks: async (query, topK = 3, provider) => {
      const response = await fetch(API_ENDPOINTS.RAG.RETRIEVE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, top_k: topK, provider })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при получении релевантных чанков');
      }
      return response.json();
    },

    clearVectorDB: async () => {
      const response = await fetch(API_ENDPOINTS.RAG.CLEAR, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при очистке векторной базы данных');
      }
      return response.json();
    }
  },

  annotations: {
    generate: async (filename, provider, maxLength = 500, chunkSize = 1000) => {
      const response = await fetch(API_ENDPOINTS.ANNOTATIONS.GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          filename, 
          provider, 
          max_length: maxLength, 
          chunk_size: chunkSize 
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при генерации аннотации');
      }
      return response.json();
    }
  }
};