import React, { useState } from 'react';
import Navbar from './Navbar';

const QuizComponent = () => {
    const [userAnswers, setUserAnswers] = useState({});
    const [correctAnswers, setCorrectAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const [questions, setQuestions] = useState([
        {
            "question": "What is recursion in programming?",
            "options": [
                { "option": "A", "text": "A method to iterate over data." },
                { "option": "B", "text": "A way to solve problems by breaking them down into smaller instances." },
                { "option": "C", "text": "A type of loop in programming." },
                { "option": "D", "text": "A sorting algorithm." }
            ],
            "answer": { "option": "B", "text": "A way to solve problems by breaking them down into smaller instances." }
        },
        {
            "question": "What is the base case in recursion?",
            "options": [
                { "option": "A", "text": "The case where the function stops calling itself." },
                { "option": "B", "text": "The smallest instance of the problem that can be solved directly." },
                { "option": "C", "text": "A recursive function." },
                { "option": "D", "text": "An iterative solution." }
            ],
            "answer": { "option": "B", "text": "The smallest instance of the problem that can be solved directly." }
        },
        {
            "question": "What happens if a recursive function does not have a base case?",
            "options": [
                { "option": "A", "text": "The function will cause a stack overflow." },
                { "option": "B", "text": "The function will run forever." },
                { "option": "C", "text": "The function will return incorrect results." },
                { "option": "D", "text": "All of the above." }
            ],
            "answer": { "option": "D", "text": "All of the above." }
        },
        {
            "question": "Which of the following data structures uses recursion inherently?",
            "options": [
                { "option": "A", "text": "Array" },
                { "option": "B", "text": "Linked List" },
                { "option": "C", "text": "Queue" },
                { "option": "D", "text": "Binary Tree" }
            ],
            "answer": { "option": "D", "text": "Binary Tree" }
        },
        {
            "question": "What is the time complexity of recursive Fibonacci function?",
            "options": [
                { "option": "A", "text": "O(1)" },
                { "option": "B", "text": "O(n)" },
                { "option": "C", "text": "O(2^n)" },
                { "option": "D", "text": "O(log n)" }
            ],
            "answer": { "option": "C", "text": "O(2^n)" }
        },
        {
            "question": "Which of the following problems can be solved using recursion?",
            "options": [
                { "option": "A", "text": "Finding factorial of a number" },
                { "option": "B", "text": "Finding shortest path in a graph" },
                { "option": "C", "text": "Sorting an array" },
                { "option": "D", "text": "All of the above" }
            ],
            "answer": { "option": "D", "text": "All of the above" }
        },
        {
            "question": "What is tail recursion?",
            "options": [
                { "option": "A", "text": "A type of recursion that uses an explicit stack." },
                { "option": "B", "text": "A type of recursion where the recursive call is the last thing executed by the function." },
                { "option": "C", "text": "A type of recursion that involves multiple recursive calls." },
                { "option": "D", "text": "A type of recursion that is slower than iterative solutions." }
            ],
            "answer": { "option": "B", "text": "A type of recursion where the recursive call is the last thing executed by the function." }
        },
        {
            "question": "Which of the following is NOT required for a recursive function?",
            "options": [
                { "option": "A", "text": "Base case" },
                { "option": "B", "text": "Recursive case" },
                { "option": "C", "text": "Initialization" },
                { "option": "D", "text": "Iteration" }
            ],
            "answer": { "option": "D", "text": "Iteration" }
        },
        {
            "question": "What is indirect recursion?",
            "options": [
                { "option": "A", "text": "A recursion that calls itself indirectly through another function." },
                { "option": "B", "text": "A recursion that does not have a base case." },
                { "option": "C", "text": "A recursion that is faster than direct recursion." },
                { "option": "D", "text": "A recursion that has only one recursive call." }
            ],
            "answer": { "option": "A", "text": "A recursion that calls itself indirectly through another function." }
        },
        {
            "question": "Which of the following algorithms uses recursion?",
            "options": [
                { "option": "A", "text": "Merge Sort" },
                { "option": "B", "text": "Bubble Sort" },
                { "option": "C", "text": "Insertion Sort" },
                { "option": "D", "text": "Selection Sort" }
            ],
            "answer": { "option": "A", "text": "Merge Sort" }
        }
    ]);

    const handleAnswerChange = (e, index) => {
        setUserAnswers({
            ...userAnswers,
            [index]: e.target.value
        });
    };

    const handleSubmit = () => {
        let correct = {};
        questions.forEach((q, index) => {
            correct[index] = q.answer.text;
        });
        setCorrectAnswers(correct);
        setShowResults(true);
    };

    return (
        <div>
            <Navbar />
            <h2 className="header" style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%' }}>Practice Test</h2>

            <div className="centered-container">
                <button onClick={() => setShowResults(false)}>Generate Questions</button>
            </div>

            {questions.length > 0 && (
                <div>
                    {questions.map((q, index) => (
                        <div key={index} style={{ backgroundColor: showResults ? (userAnswers[index] && userAnswers[index].toLowerCase() === q.answer.text.toLowerCase() ? '#78B38F' : '#B37879') : '#E8ECEF' }}>
                            <p>{q.question}</p>
                            {q.options && q.options.map((option, optionIndex) => (
                                <div key={optionIndex} style={{ backgroundColor: showResults && userAnswers[index] && userAnswers[index].toLowerCase() === option.text.toLowerCase() && option.text.toLowerCase() === q.answer.text.toLowerCase() ? '#78B38F' : (showResults && userAnswers[index] && userAnswers[index].toLowerCase() === option.text.toLowerCase() ? '#B37879' : '#E8ECEF') }}>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option.text}
                                            checked={userAnswers[index] === option.text}
                                            onChange={(e) => handleAnswerChange(e, index)}
                                        />
                                        {option.text}
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
