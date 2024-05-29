import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/stuff.css';

const ChapterPage = () => {
  const chapterId = localStorage.getItem('currentSection');
  const collName = localStorage.getItem('collectionName');
  const chapterName = localStorage.getItem('currentSectionName');
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState([]);
  const [recognizedText, setRecognizedText] = useState('');
  const [recognizedVid, setRecognizedVid] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/get_sources?chapter_id=${chapterId}`);
        setSources(response.data.sources);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchSources();
  }, [chapterId]);

  const handleSourceChange = (source) => {
    setSelectedSource(prevState =>
      prevState.includes(source)
        ? prevState.filter(s => s !== source)
        : [...prevState, source]
    );
  };

  const handleUploadImage = async (event) => {
    const formData = new FormData();
    formData.append('image', event.target.files[0]);

    try {
      const response = await axios.post('http://localhost:5000/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRecognizedText(response.data.text);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUploadVideo = async (event) => {
    const formData = new FormData();
    formData.append('url', event.target.value);

    try {
      const response = await axios.post('http://localhost:5000/get_transcript', formData);
      setRecognizedVid(response.data.response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitQuestion = async () => {
    try {
      const res = await axios.post('http://localhost:5000/answer_question', {
        username: localStorage.getItem('username'),
        class: localStorage.getItem('currentCollection'),
        data: prompt
      });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>{collName} - {chapterName}</h2>
        <div className="sources">
          <h3>Sources</h3>
          {sources.map(source => (
            <label key={source.id}>
              <input
                type="checkbox"
                checked={selectedSource.includes(source)}
                onChange={() => handleSourceChange(source)}
              />
              {source.name}
            </label>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div className="tabs">
          <button className="category-btn">Saved Response</button>
          <button className="category-btn">Flashcards</button>
          <button className="category-btn">Video</button>
          <button className="category-btn">Presentations</button>
          <button className="category-btn">Practice Test</button>
          <button className="category-btn">Game</button>
        </div>
        <div className="content">
          <div className="upload">
            <h3>Upload Data</h3>
            <input type="file" accept="image/*" onChange={handleUploadImage} />
            {recognizedText && <p>Recognized Text: {recognizedText}</p>}
            <input type="text" placeholder="YouTube Video URL" onChange={handleUploadVideo} />
            {recognizedVid && <p>Recognized Video Transcript: {recognizedVid}</p>}
          </div>
          <div className="ask-question">
            <h3>Ask A Question</h3>
            <textarea
              rows="4"
              cols="50"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
            />
            <button onClick={handleSubmitQuestion}>Submit</button>
            {response && (
              <div>
                <h2>Response:</h2>
                <p>{response}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterPage;