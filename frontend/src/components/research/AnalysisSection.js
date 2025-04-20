import React from 'react';

const AnalysisSection = ({ topic, goals, tasks, analysisData, onAnalysisChange }) => {
  const handleKeyTermChange = (termId, field, value) => {
    const updatedKeyTerms = analysisData.keyTerms.map(term => 
      term.id === termId ? { ...term, [field]: value } : term
    );
    onAnalysisChange({ ...analysisData, keyTerms: updatedKeyTerms });
  };

  const handleApproachChange = (approachId, field, value) => {
    const updatedApproaches = analysisData.approaches.map(approach => 
      approach.id === approachId ? { ...approach, [field]: value } : approach
    );
    onAnalysisChange({ ...analysisData, approaches: updatedApproaches });
  };

  const handleAddKeyTerm = () => {
    const newTerm = {
      id: `term_${Date.now()}`,
      term: '',
      definition: ''
    };
    onAnalysisChange({
      ...analysisData,
      keyTerms: [...analysisData.keyTerms, newTerm]
    });
  };

  const handleAddApproach = () => {
    const newApproach = {
      id: `approach_${Date.now()}`,
      name: '',
      description: ''
    };
    onAnalysisChange({
      ...analysisData,
      approaches: [...analysisData.approaches, newApproach]
    });
  };

  const handleDeleteKeyTerm = (termId) => {
    onAnalysisChange({
      ...analysisData,
      keyTerms: analysisData.keyTerms.filter(term => term.id !== termId)
    });
  };

  const handleDeleteApproach = (approachId) => {
    onAnalysisChange({
      ...analysisData,
      approaches: analysisData.approaches.filter(approach => approach.id !== approachId)
    });
  };

  return (
    <div className="analysis-section">
      <div className="analysis-intro">
        <h3>Анализ исследования</h3>
        <p>Определите ключевые термины, подходы и сравните различные аспекты исследования.</p>
      </div>

      <div className="analysis-content">
        {/* Ключевые термины */}
        <div className="analysis-block">
          <div className="block-header">
            <h4>Ключевые термины</h4>
            <button className="add-button" onClick={handleAddKeyTerm}>
              + Добавить термин
            </button>
          </div>
          <div className="key-terms-list">
            {analysisData.keyTerms.map(term => (
              <div key={term.id} className="key-term-item">
                <div className="term-inputs">
                  <input
                    type="text"
                    className="term-name"
                    value={term.term}
                    onChange={(e) => handleKeyTermChange(term.id, 'term', e.target.value)}
                    placeholder="Введите термин"
                  />
                  <textarea
                    className="term-definition"
                    value={term.definition}
                    onChange={(e) => handleKeyTermChange(term.id, 'definition', e.target.value)}
                    placeholder="Введите определение"
                  />
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteKeyTerm(term.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Подходы */}
        <div className="analysis-block">
          <div className="block-header">
            <h4>Подходы к исследованию</h4>
            <button className="add-button" onClick={handleAddApproach}>
              + Добавить подход
            </button>
          </div>
          <div className="approaches-list">
            {analysisData.approaches.map(approach => (
              <div key={approach.id} className="approach-item">
                <div className="approach-inputs">
                  <input
                    type="text"
                    className="approach-name"
                    value={approach.name}
                    onChange={(e) => handleApproachChange(approach.id, 'name', e.target.value)}
                    placeholder="Название подхода"
                  />
                  <textarea
                    className="approach-description"
                    value={approach.description}
                    onChange={(e) => handleApproachChange(approach.id, 'description', e.target.value)}
                    placeholder="Описание подхода"
                  />
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteApproach(approach.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Сравнительный анализ */}
        <div className="analysis-block">
          <h4>Сравнительный анализ</h4>
          <textarea
            className="analysis-textarea"
            value={analysisData.comparison}
            onChange={(e) => onAnalysisChange({ ...analysisData, comparison: e.target.value })}
            placeholder="Сравните различные подходы и методы..."
          />
        </div>

        {/* Сильные и слабые стороны */}
        <div className="strengths-weaknesses">
          <div className="strengths-section">
            <h4>Сильные стороны</h4>
            <textarea
              className="analysis-textarea"
              value={analysisData.strengths}
              onChange={(e) => onAnalysisChange({ ...analysisData, strengths: e.target.value })}
              placeholder="Опишите сильные стороны..."
            />
          </div>
          <div className="weaknesses-section">
            <h4>Слабые стороны</h4>
            <textarea
              className="analysis-textarea"
              value={analysisData.weaknesses}
              onChange={(e) => onAnalysisChange({ ...analysisData, weaknesses: e.target.value })}
              placeholder="Опишите слабые стороны..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSection;