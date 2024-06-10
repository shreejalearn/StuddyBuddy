import React, { useState, useEffect } from 'react';
import './styles/flashcard.css';

const FlashcardApp = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [suggestedFlashcards, setSuggestedFlashcards] = useState([]);

  useEffect(() => {
    async function fetchFlashcards() {
      try {
        const response = await fetch(`http://localhost:5000/get_flashcards?collection_id=${localStorage.getItem('currentCollection')}&section_id=${localStorage.getItem('currentSection')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }
        const data = await response.json();
        setFlashcards(data.flashcards);
      } catch (error) {
        console.error('Error fetching flashcards:', error.message);
        // Optionally handle error here
      }
    }
    const suggestFlashcards = async () => {
      try {
        const response = await fetch('http://localhost:5000/suggestflashcards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionId: localStorage.getItem('currentCollection'),
            sectionId: localStorage.getItem('currentSection'),
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to suggest flashcards');
        }
  
        const data = await response.json();
        setSuggestedFlashcards(data.flashcards);

        console.log('Suggested flashcards:', data.response);
      } catch (error) {
        console.error('Error suggesting flashcards:', error.message);
      }
    };
    fetchFlashcards();
    suggestFlashcards();
  }, []);

  const addFlashcard = async () => {
    if (question.trim() === '' || answer.trim() === '') {
      alert('Please enter both question and answer.');
      return;
    }

    setFlashcards([...flashcards, { question, answer }]);
    setQuestion('');
    setAnswer('');

    try {
      console.log(localStorage.getItem('currentCollection'));
      console.log(localStorage.getItem('currentSection'));
      console.log(question);
      console.log(answer);


      const response = await fetch('http://localhost:5000/addflashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: localStorage.getItem('currentCollection'),
          sectionId: localStorage.getItem('currentSection'),
          question: question,
          answer: answer,
        }),
      });

      if (!response.ok) {
        console.error(response);
        throw new Error('Failed to add flashcard');

      }

      // Handle success
      console.log('Flashcard added successfully!');
    } catch (error) {
      console.error('Error adding flashcard:', error.message);
      // Optionally handle error here
    }
  };
  const addSuggestedFlashcard = async (question, answer) => {
    try {
      const response = await fetch('http://localhost:5000/addflashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: localStorage.getItem('currentCollection'),
          sectionId: localStorage.getItem('currentSection'),
          question: question,
          answer: answer,
        }),
      });
  
      if (!response.ok) {
        console.error(response);
        throw new Error('Failed to add flashcard');
      }
  
      // Handle success
      console.log('Flashcard added successfully!');
    } catch (error) {
      console.error('Error adding flashcard:', error.message);
      // Optionally handle error here
    }
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
      <h2>Suggested Flashcards</h2>
        <div className="flashcards-container">
          {suggestedFlashcards.map((flashcard, index) => (
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
              <button onClick={() => addSuggestedFlashcard(flashcard.question, flashcard.answer)}>
                +
              </button>
            </div>
          ))}
        </div>
    </div>
  );
};

export default FlashcardApp;