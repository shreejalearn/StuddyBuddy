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
                num_questions: numQuestions // Use selected number of questions
            });
            console.log(response);
            console.log(response.data.r);
            const qnaPairs = [];
            const regex = /- Question: (.*?)(?=\n\s*- Answer:|$)/gs;
            const answerRegex = /- Answer: (.*?)(?=\n\s*-|$)/gs;
            let match;
            let index = 1;

            while ((match = regex.exec(response.data.r)) !== null) {
                const question = match[0].trim();
                const answerMatch = answerRegex.exec(response.data.r);
                const answer = answerMatch ? answerMatch[1].trim() : 'No answer provided';
                qnaPairs.push({ question, answer });
                index++;
                console.log(question, answer);
                if (index > numQuestions) break; // Stop iterating when desired number of questions is reached
            }
            
            console.log(qnaPairs);

            setQuestions(qnaPairs);
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
            <label>
                Number of Questions:
                <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                />
            </label>
            <button onClick={fetchQuestions}>Generate Questions</button>
            {questions.length > 0 && (
                <div>
                    {questions.map((q, index) => (
                        <div key={index}>
                            <p>{q.question}</p>
                            <input
                                type="text"
                                value={userAnswers[index] || ''}
                                onChange={(e) => handleAnswerChange(e, index)}
                            />
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
                            <p>Correct answer: {correctAnswers[index]}</p>
                            <p>{userAnswers[index] && userAnswers[index].toLowerCase().includes(correctAnswers[index].toLowerCase()) ? 'Correct' : 'Incorrect'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizComponent;