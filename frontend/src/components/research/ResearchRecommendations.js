import React from 'react';
import '../../styles/research-recommendations.css';

const ResearchRecommendations = ({ recommendations, onRecommendationsUpdate }) => {
  const handleAddRecommendation = () => {
    const newRecommendation = {
      id: Date.now(),
      text: '',
      priority: 'medium'
    };
    onRecommendationsUpdate([...recommendations, newRecommendation]);
  };

  const handleUpdateRecommendation = (id, field, value) => {
    const updatedRecommendations = recommendations.map(rec => 
      rec.id === id ? { ...rec, [field]: value } : rec
    );
    onRecommendationsUpdate(updatedRecommendations);
  };

  const handleDeleteRecommendation = (id) => {
    const filteredRecommendations = recommendations.filter(rec => rec.id !== id);
    onRecommendationsUpdate(filteredRecommendations);
  };

  return (
    <div className="research-recommendations">
      <div className="recommendations-header">
        <h3>Рекомендации</h3>
        <button onClick={handleAddRecommendation} className="add-button">
          Добавить рекомендацию
        </button>
      </div>
      <div className="recommendations-list">
        {recommendations.map(recommendation => (
          <div key={recommendation.id} className="recommendation-item">
            <textarea
              value={recommendation.text}
              onChange={(e) => handleUpdateRecommendation(recommendation.id, 'text', e.target.value)}
              placeholder="Введите рекомендацию..."
              className="recommendation-text"
            />
            <select
              value={recommendation.priority}
              onChange={(e) => handleUpdateRecommendation(recommendation.id, 'priority', e.target.value)}
              className="priority-select"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
            <button
              onClick={() => handleDeleteRecommendation(recommendation.id)}
              className="delete-button"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchRecommendations; 