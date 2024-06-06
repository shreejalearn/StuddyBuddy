// import React, { useState } from 'react';
// import axios from 'axios';

// const AskQuestion = () => {
//   const [prompt, setPrompt] = useState('');
//   const [response, setResponse] = useState('');

//   const handleSubmit = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/ask_sydney', { prompt });
//       setResponse(res.data.response);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   return (
//     <div>
//       <h1>Sydney AI Prompter</h1>
//       <div>
//         <textarea
//           rows="4"
//           cols="50"
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Enter your prompt here..."
//         />
//       </div>
//       <div>
//         <button onClick={handleSubmit}>Submit</button>
//       </div>
//       {response && (
//         <div>
//           <h2>Response:</h2>
//           <p>{response}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AskQuestion;


import React, { useState } from 'react';
import axios from 'axios';
import './styles/AskQuestion.css';

const AskQuestion = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/ask_sydney', { prompt });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error processing your request.');
    }
  };

  return (
    <div className="chatbot-container">
      <h1 className="chatbot-title">Sydney AI Prompter</h1>
      <div className="input-container">
        <textarea
          className="prompt-input"
          rows="4"
          cols="50"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
        />
      </div>
      <div className="button-container">
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
      {response && (
        <div className="response-container">
          <h2 className="response-title">Response:</h2>
          <p className="response-text">{response}</p>
        </div>
      )}
    </div>
  );
};

export default AskQuestion;
