

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/stuff.css';
import { useNavigate } from 'react-router-dom';


const ChapterPage = () => {
  const navigate = useNavigate();
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
  const [isPublic, setIsPublic] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState(null); 
  const [responseSaved, setResponseSaved] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedSourceNotes, setSelectedSourceNotes] = useState('');

  useEffect(() => {
   
    const updateAccessTime = async () => {
      try {
        await axios.post('http://localhost:5000/update_access_time', {
          collection_id: collectionId,
          section_id: chapterId
        });
      } catch (error) {
        console.error('Error updating access time:', error);
      }
    };

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
        console.error('Error:', error);
      }
    };

    // fetchSources();
    fetchNotes();
    updateAccessTime()
  }, [chapterId, collectionId]);

  const handleSourceChange = (source) => {
    setSelectedSource(prevState =>
      prevState.includes(source)
        ? prevState.filter(s => s !== source)
        : [...prevState, source]
    );
  };
  const openUploadModal = () => {
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
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
      console.error('Error uploading image:', error);
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
      console.error('Error uploading video:', error);
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
      console.error('Error submitting question:', error);
    }
  };
  const handleSaveResponse = async () => {
    try {
        // Call the endpoint to save the response
        await axios.post('http://localhost:5000/save_response', {
            response: response, 
            collection_id: collectionId,
            section_id: chapterId
        });
        setResponseSaved(true);
    } catch (error) {
        console.error('Error saving response:', error);
    }
};

  const handleUpload = async (event) => {
    const formData = new FormData();
    if (uploadType === 'image') {
      formData.append('image', event.target.files[0]);
    } else if (uploadType === 'video') {
      formData.append('url', event.target.value);
    }
    formData.append('collection_id', collectionId);  
    formData.append('section_id', chapterId); 

    try {
      let response;
      if (uploadType === 'image') {
        response = await axios.post('http://localhost:5000/recognize', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else if (uploadType === 'video') {
        response = await axios.post('http://localhost:5000/get_transcript', formData);
      }
      const updatedNotesResponse = await axios.get(`http://localhost:5000/get_notes`, {
        params: {
          collection_id: collectionId,
          section_id: chapterId
        }
      });
      setNotes(updatedNotesResponse.data.notes);
      closeUploadModal();
    } catch (error) {
      console.error(`Error uploading ${uploadType}:`, error);
    }
  };
  const handleUploadType = (type) => {
    setUploadType(type);
  };

  const toggleVisibility = async () => {
    const newVisibility = isPublic ? 'private' : 'public';
    setIsPublic(!isPublic);

    try {
      const response = await axios.post('http://localhost:5000/section_visibility', {
        collection_id: collectionId,
        section_id: chapterId,
        visibility: newVisibility,
      });
      console.log('Visibility updated:', response.data);
    } catch (error) {
      console.error('Error updating visibility:', error);
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
        <div className="upload-source-btn">
        <button onClick={openUploadModal}>Upload Source</button>
        </div>
        <div className="notes">
          <h3>Notes</h3>
          {notes.map(note => (
            <div key={note.id} className="note">
              <p>{note.tldr}</p>
              <button onClick={() => setSelectedSourceNotes(note.notes)}>View Source</button>
              <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div className="tabs">
          <button className="category-btn" onClick={() => navigate('/savedresponses')}>Saved Responses</button>
          <button className="category-btn">Flashcards</button>
          <button className="category-btn" onClick={() => navigate('/videos')}>Video</button>          <button className="category-btn">Presentations</button>
          <button className="category-btn" onClick={() => navigate('/practicetest')}>Practice Test</button>
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
                  <button onClick={handleSaveResponse} disabled={responseSaved}>Save Response</button>

                </div>
              )}

            </div>
          </div>
          
          <div className="toggle-container">
            <span className={isPublic ? "toggle-active" : ""} onClick={toggleVisibility}>Public</span>
            <span className={!isPublic ? "toggle-active" : ""} onClick={toggleVisibility}>Private</span>
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
      {uploadModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeUploadModal}>&times;</span>
            <h2>Upload Source</h2>
            <div className="upload-options">
              <button onClick={() => handleUploadType('image')}>Upload Image</button>
              <button onClick={() => handleUploadType('video')}>Upload Video</button>
            </div>
            {uploadType && (
              <div className="upload-form">
                <input type={uploadType === 'image' ? 'file' : 'text'} onChange={handleUpload} />
                <button onClick={handleUpload}>Upload</button>
              </div>
            )}
            <div className="section source-uploading">
           
          </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
    
export default ChapterPage;