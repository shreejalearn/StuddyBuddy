import React, { useState } from 'react';
import Navbar from './Navbar';
import axios from 'axios';

const QuizComponent = () => {
    const [userAnswers, setUserAnswers] = useState({});
    const [correctAnswers, setCorrectAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [numTFQuestions, setNumTFQuestions] = useState(5);
    const [numFRQQuestions, setNumFRQQuestions] = useState(5);
    const [questionSource, setQuestionSource] = useState(''); // 'ai' or 'flashcards'
    const [numFlashcardQuestions, setNumFlashcardQuestions] = useState(5);

    const fetchQuestions = async () => {
        try {
            const sectionId = localStorage.getItem('currentSection');
            if (questionSource === 'ai') {
                const tfResponse = await axios.post(
                    `http://localhost:5000/generate_tf_questions`, 
                    {
                        section_id: sectionId,
                        num_questions: numTFQuestions
                    }, 
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const frqResponse = await axios.post(
                    `http://localhost:5000/generate_frq`, 
                    {
                        section_id: sectionId,
                        num_questions: numFRQQuestions
                    }, 
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setQuestions([
                    ...tfResponse.data.map(q => ({ ...q, type: 'tf' })),
                    ...frqResponse.data.map(q => ({ ...q, type: 'frq' }))
                ]);
            } else {
                const flashcardResponse = await axios.post(
                    `http://localhost:5000/get_flashcards_frq`, 
                    {
                        section_id: sectionId,
                        num_questions: numFlashcardQuestions
                    }, 
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setQuestions(flashcardResponse.data.map(q => ({ ...q, type: 'frq' })));
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const handleAnswerChange = (e, index) => {
        setUserAnswers({
            ...userAnswers,
            [index]: e.target.value
        });
    };

    const handleSubmit = () => {
        let correct = {};
        questions.forEach((q, index) => {
            if (q.type === 'tf') {
                correct[index] = q.answer.toLowerCase() === 'true';
            } else {
                correct[index] = q.answer.toLowerCase();
            }
        });
        setCorrectAnswers(correct);
        setShowResults(true);
    };

    const resetQuiz = () => {
        setUserAnswers({});
        setCorrectAnswers({});
        setShowResults(false);
    };

    const checkAnswer = (userAnswer, correctAnswer, type) => {
        if (type === 'tf') {
            return userAnswer.toLowerCase() === correctAnswer.toString().toLowerCase();
        } else {
            // For FRQ, check if the correct answer is contained within the user's response
            return userAnswer.toLowerCase().includes(correctAnswer.toLowerCase());
        }
    };
    return (
        <div>
            <Navbar />
            
            <h2 className="header" style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%' }}>Practice Test</h2>
    
            <div className="centered-container">
                <div style={{ marginBottom: '3%' }}>
                    <label>
                        <input
                            type="radio"
                            name="questionSource"
                            value="ai"
                            checked={questionSource === 'ai'}
                            onChange={() => setQuestionSource('ai')}
                        /> AI Generated Questions
                    </label>
                    <label style={{ marginLeft: '10px' }}>
                        <input
                            type="radio"
                            name="questionSource"
                            value="flashcards"
                            checked={questionSource === 'flashcards'}
                            onChange={() => setQuestionSource('flashcards')}
                        /> Flashcards
                    </label>
                </div>
                
                {questionSource && (
                    <>
                        {questionSource === 'ai' ? (
                            <>
                                <div style={{ marginBottom: '3%' }}>
                                    <label>Number of True/False Questions:
                                        <input
                                            type="number"
                                            value={numTFQuestions}
                                            onChange={(e) => setNumTFQuestions(Number(e.target.value))}
                                            style={{ marginLeft: '10px' }}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginBottom: '3%' }}>
                                    <label>Number of Free Response Questions:
                                        <input
                                            type="number"
                                            value={numFRQQuestions}
                                            onChange={(e) => setNumFRQQuestions(Number(e.target.value))}
                                            style={{ marginLeft: '10px' }}
                                        />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div style={{ marginBottom: '3%' }}>
                                <label>Number of Flashcard Questions:
                                    <input
                                        type="number"
                                        value={numFlashcardQuestions}
                                        onChange={(e) => setNumFlashcardQuestions(Number(e.target.value))}
                                        style={{ marginLeft: '10px' }}
                                    />
                                </label>
                            </div>
                        )}
                        <button onClick={fetchQuestions} style={{ width: '15%', marginBottom: '3%' }}>Generate Questions</button>
                    </>
                )}
            </div>
            <div style={{ width: '90%', padding: '20px', margin: 'auto', maxWidth: '800px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '3%' }}>
                {questions.length > 0 && (
                    <div>
                        {questions.map((q, index) => (
                            <div key={index} style={{ 
                                backgroundColor: showResults 
                                    ? (checkAnswer(userAnswers[index] || '', correctAnswers[index], q.type) ? '#AFC8AD' : '#d4b8b8') 
                                    : '#F6F5F5', 
                                padding: '10px', 
                                margin: '10px 0', 
                                borderRadius: '5px' 
                            }}>
                                <p>{q.question}</p>
                                {q.type === 'tf' ? (
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value="true"
                                                checked={userAnswers[index] === 'true'}
                                                onChange={(e) => handleAnswerChange(e, index)}
                                            /> True
                                        </label>
                                        <label style={{ marginLeft: '10px' }}>
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value="false"
                                                checked={userAnswers[index] === 'false'}
                                                onChange={(e) => handleAnswerChange(e, index)}
                                            /> False
                                        </label>
                                    </div>
                                ) : (
                                    <textarea
                                        value={userAnswers[index] || ''}
                                        onChange={(e) => handleAnswerChange(e, index)}
                                        style={{ width: '100%', minHeight: '100px' }}
                                    />
                                )}
                                {showResults && (
                                    <div style={{ marginTop: '10px' }}>
                                        <strong>Correct Answer:</strong> {correctAnswers[index].toString()}
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={handleSubmit} style={{ marginTop: '10px', width: '15%' }}>Submit</button>
                        {showResults && (
                            <button onClick={resetQuiz} style={{ marginTop: '10px', marginLeft: '10px', width: '15%' }}>Reset</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizComponent;