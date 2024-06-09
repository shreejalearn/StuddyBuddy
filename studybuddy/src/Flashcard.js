import React, { useState } from 'react';
import './styles/flashcard.css';

const FlashcardApp = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const addFlashcard = () => {
    if (question.trim() === '' || answer.trim() === '') {
      alert('Please enter both question and answer.');
      return;
    }

    setFlashcards([...flashcards, { question, answer }]);
    setQuestion('');
    setAnswer('');
  };

  const studyFlashcards = () => {
    alert('Studying Flashcards!');
    // Implement study logic here
  };

  return (
    <div className="container">
      <h1>Flashcard App</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addFlashcard();
        }}
      >
        <input
          type="text"
          placeholder="Enter question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button type="submit">Add Flashcard</button>
      </form>
      <div className="flashcards-container">
        {flashcards.map((flashcard, index) => (
          <div key={index} className="flashcard">
            <div className="card-inner">
              <div className="card-front">
                <div className="question">{flashcard.question}</div>
                <button className="flip-button">Show Answer</button>
              </div>
              <div className="card-back">
                <div className="answer">{flashcard.answer}</div>
                <button className="flip-button">Show Question</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={studyFlashcards}>Study Flashcards</button>
    </div>
  );
};

export default FlashcardApp;
