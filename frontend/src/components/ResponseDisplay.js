import React from 'react';

function ResponseDisplay({ response }) {
  return (
    <div>
      <h2>Ответ</h2>
      {response ? <p>{response}</p> : <p>Здесь будет отображаться ответ от сервера.</p>}
    </div>
  );
}

export default ResponseDisplay;
