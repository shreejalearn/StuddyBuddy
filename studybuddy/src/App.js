import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/predict', { input_data: input });
            setResult(response.data.result);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    return (
        <div>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={handleSubmit}>Submit</button>
            {result && <p>Result: {result}</p>}
        </div>
    );
};

export default App;
