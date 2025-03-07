import React, { useState } from 'react';
import { sendQuery } from '../services/api';

function QueryForm({ setResponse }) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await sendQuery(query);
    setResponse(res.response || "Ответ не получен");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        placeholder="Введите запрос"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">Отправить</button>
    </form>
  );
}

export default QueryForm;
