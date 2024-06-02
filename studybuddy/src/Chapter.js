import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/stuff.css';

const ChapterPage = () => {
  const chapterId = localStorage.getItem('currentSection');
  const collName = localStorage.getItem('collectionName');
  const chapterName = localStorage.getItem('currentSectionName');
  const collectionId = localStorage.getItem('currentCollection');
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState([]);
  const [recognizedText, setRecognizedText] = useState('');
  const [recognizedVid, setRecognizedVid] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedSourceNotes, setSelectedSourceNotes] = useState('');

  useEffect(() => {
    // const fetchSources = async () => {
    //   try {
    //     const response = await axios.get(`http://localhost:5000/get_sources?chapter_id=${chapterId}`);
    //     setSources(response.data.sources);
    //   } catch (error) {
    //     console.error('Error:', error);
    //   }
    // };

    const fetchNotes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/get_notes`, {
          params: {
            collection_id: collectionId,
            section_id: chapterId
          }
        });
        setNotes(response.data.notes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    // fetchSources();
    fetchNotes();
  }, [chapterId, collectionId]);

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
    formData.append('collection_id', collectionId);  // Add collection ID
    formData.append('section_id', chapterId);  // Add section ID

    try {
      const response = await axios.post('http://localhost:5000/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRecognizedText(response.data.text);
      // Fetch the updated notes after uploading a new one
      const updatedNotesResponse = await axios.get(`http://localhost:5000/get_notes`, {
        params: {
          collection_id: collectionId,
          section_id: chapterId
        }
      });
      setNotes(updatedNotesResponse.data.notes);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewNotes = (notes) => {
    setSelectedSourceNotes(notes);
    // Open the modal here
  };
  const handleUploadVideo = async (event) => {
    const formData = new FormData();
    formData.append('url', event.target.value);
    formData.append('collection_id', collectionId);  
    formData.append('section_id', chapterId); 

    try {
      const response = await axios.post('http://localhost:5000/get_transcript', formData);
      setRecognizedVid(response.data.response);
      const updatedNotesResponse = await axios.get(`http://localhost:5000/get_notes`, {
        params: {
          collection_id: collectionId,
          section_id: chapterId
        }
      });
      setNotes(updatedNotesResponse.data.notes);
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

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`http://localhost:5000/delete_note`, {
        params: {
          collection_id: collectionId,
          section_id: chapterId,
          note_id: noteId
        }
      });
      // Fetch the updated notes after deleting a note
      const updatedNotesResponse = await axios.get(`http://localhost:5000/get_notes`, {
        params: {
          collection_id: collectionId,
          section_id: chapterId
        }
      });
      setNotes(updatedNotesResponse.data.notes);
      if (response.data.message === 'Note deleted successfully') {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
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
        <div className="notes">
          <h3>Notes</h3>
          {notes.map(note => (
            <div key={note.id} className="note">
              <p>{note.tldr}</p>
              <button onClick={() => handleViewNotes(note.notes)}>View Source</button>
              <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
            </div>
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
          <div className="section ai-communication">
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
          <div className="section source-uploading">
            <div className="upload">
              <h3>Upload Data</h3>
              <input type="file" accept="image/*" onChange={handleUploadImage} />
              {recognizedText && <p>Recognized Text: {recognizedText}</p>}
              <input type="text" placeholder="YouTube Video URL" onChange={handleUploadVideo} />
              {recognizedVid && <p>Recognized Video Transcript: {recognizedVid}</p>}
            </div>
          </div>
        </div>
      </div>
      {selectedSourceNotes && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedSourceNotes('')}>&times;</span>
            <h2>Full Source</h2>
            <p>{selectedSourceNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
};
    
export default ChapterPage;
