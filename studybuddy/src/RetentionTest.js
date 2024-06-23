import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './styles/speechtotext.css'
const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState('');
  const [recognition, setRecognition] = useState(null); // Store recognition in state

  useEffect(() => {
    let recognitionObj = new window.webkitSpeechRecognition();
    recognitionObj.continuous = true;
    recognitionObj.interimResults = true;
    recognitionObj.lang = 'en-US';

    recognitionObj.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognitionObj.onresult = event => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setResult(prevResult => prevResult + transcript + '. ');
        } else {
          interimTranscript += transcript;
        }
      }
      console.log('interimTranscript:', interimTranscript);
    };

    recognitionObj.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognitionObj.onerror = event => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    setRecognition(recognitionObj); // Set recognition object in state

    return () => {
      if (recognitionObj) {
        recognitionObj.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (!isListening && recognition) {
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div>
      <Navbar />
            
      <h2 className="header" style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%' }}>Retention Test</h2>
      <div className="centered-container">
        <div className="button-container">
          <button onClick={startRecording} disabled={isListening}>
            Start Record
          </button>
          <button onClick={stopRecording} disabled={!isListening}>
            Stop Record
          </button>
        </div>
        <div className="result-container">
          <p>{result}</p>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;