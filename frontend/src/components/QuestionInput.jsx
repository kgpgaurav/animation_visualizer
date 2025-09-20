import React, { useState } from 'react';

const QuestionInput = ({ onSubmit }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (question.trim()) {
      onSubmit(question);
      setQuestion('');
    }
  };

  return (
    <div className="question-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          aria-label="Question input"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default QuestionInput;
