import React, { useState, useEffect } from 'react';
import './styles/flashcard.css';
import Navbar from './Navbar';

const FlashcardApp = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [suggestedFlashcards, setSuggestedFlashcards] = useState([]);
  const [showModal, setShowModal] = useState(false);

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
        setSuggestedFlashcards(data.response);
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
        throw new Error('Failed to add flashcard');
      }

      setShowModal(false);
      console.log('Flashcard added successfully!');
    } catch (error) {
      console.error('Error adding flashcard:', error.message);
      // Optionally handle error here
    }
  };

  const addSuggestedFlashcard = async (question, answer, index) => {
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
        throw new Error('Failed to add flashcard');
      }

      // Remove the suggested flashcard from the array
      const updatedSuggestions = [...suggestedFlashcards];
      updatedSuggestions.splice(index, 1);
      setSuggestedFlashcards(updatedSuggestions);

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
    <div>
      <Navbar />

      <div className="container">
        <h2 className="header">Flashcards</h2>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              <form onSubmit={(e) => { e.preventDefault(); addFlashcard(); }}>
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
            </div>
          </div>
        )}

        <button className="add-button" onClick={() => setShowModal(true)}>
          Add Flashcard
        </button>

        <div className="flashcards-container">
          {flashcards.map((flashcard, index) => (
            <div key={index} className="flashcard">
              <div className="card-inner">
                <div className="card-front">
                  <div className="question">{flashcard.question}</div>
                </div>
                <div className="card-back">
                  <div className="answer">{flashcard.answer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2>Suggested Flashcards</h2>
        <div className="suggested-flashcards-container">
          {suggestedFlashcards.map((flashcard, index) => (
            <div key={index} className="flashcard">
              <div className="card-inner">
                <div className="card-front">
                  <div className="question">{flashcard.question}</div>
                </div>
                <div className="card-back">
                  <div className="answer">{flashcard.answer}</div>
                </div>
              </div>
              <button className="add-suggested-button" onClick={() => addSuggestedFlashcard(flashcard.question, flashcard.answer, index)}>
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardApp;
