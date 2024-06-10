import React, { useState } from 'react';
import axios from 'axios';

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
            <h1>Practice Test</h1>
         
            <button onClick={fetchQuestions}>Generate Questions</button>
            {questions.length > 0 && (
                <div>
                    {questions.map((q, index) => (
                        <div key={index}>
                            <p>{q.question}</p>
                            {q.options && q.options.map((option, optionIndex) => (
                                <div key={optionIndex}>
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
            {showResults && (
                <div>
                    <h2>Results</h2>
                    {questions.map((q, index) => (
                        <div key={index}>
                            <p>{q.question}</p>
                            <p>Your answer: {userAnswers[index]}</p>
                            <p>Correct answer: {q.answer}</p>
                            <p>{userAnswers[index] && userAnswers[index].toLowerCase().includes(q.answer.toLowerCase()) ? 'Correct' : 'Incorrect'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizComponent;