import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const QuizComponent = () => {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [correctAnswers, setCorrectAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [numQuestions, setNumQuestions] = useState(10); // Default number of questions
    const chapterId = localStorage.getItem('currentSection');
    const collName = localStorage.getItem('collectionName');
    const chapterName = localStorage.getItem('currentSectionName');
    const collectionId = localStorage.getItem('currentCollection');

    const fetchQuestions = async () => {
        try {
            const response = await axios.post('http://localhost:5000/generate_qna', {
                collection_id: collectionId,
                section_id: chapterId,
                num_questions: 10 
            });
            console.log(response);
            console.log(response.data.r);

            setQuestions(response.data.r);
            setShowResults(false);
            setUserAnswers({});
            setCorrectAnswers({});

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
            correct[index] = q.answer;
        });
        setCorrectAnswers(correct);
        setShowResults(true);
    };

    return (
        <div>
            <Navbar/>
            <h2 className="header" style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%' }}>Practice Test</h2>
         
            <div className="centered-container">
                <button onClick={fetchQuestions}>Generate Questions</button>
            </div>
                {questions.length > 0 && (
                <div>
                    {questions.map((q, index) => (
                        <div key={index} style={{backgroundColor: showResults ? (userAnswers[index] && userAnswers[index].toLowerCase().includes(q.answer.toLowerCase()) ? '#78B38F' : '#B37879') : '#E8ECEF'}}>
                            <p>{q.question}</p>
                            {q.options && q.options.map((option, optionIndex) => (
                                <div key={optionIndex} style={{backgroundColor: showResults && userAnswers[index] && userAnswers[index].toLowerCase() === option.toLowerCase() && option.toLowerCase().includes(q.answer.toLowerCase()) ? '#78B38F' : (showResults && userAnswers[index] && userAnswers[index].toLowerCase() === option.toLowerCase() ? '#B37879' : '#E8ECEF')}}>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option}
                                            checked={userAnswers[index] === option}
                                            onChange={(e) => handleAnswerChange(e, index)}
                                        />
                                        {option}
                                    </label>
                                </div>
                            ))}
                            
                        </div>
                    ))}
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default QuizComponent;
