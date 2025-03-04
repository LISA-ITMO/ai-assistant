export async function sendQuery(query) {
    try {
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      return await response.json();
    } catch (error) {
      console.error('Ошибка запроса:', error);
      return { error: 'Ошибка запроса' };
    }
  }
  