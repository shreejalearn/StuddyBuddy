import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './styles/stuff.css';
import Navbar from './Navbar';

Modal.setAppElement('#root');

const VideoPage = () => {
  const collectionId = localStorage.getItem('currentCollection');
  const sectionId = localStorage.getItem('currentSection');
  const [videoPaths, setVideoPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [askSpecificResponse, setAskSpecificResponse] = useState(null);

  useEffect(() => {
    const fetchVideoPaths = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_video_paths', {
          params: {
            collection_id: collectionId,
            section_id: sectionId,
          },
        });
        setVideoPaths(response.data.videoPaths);
      } catch (error) {
        console.error('Error fetching video paths:', error);
      }
    };

    const fetchNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_notes', {
          params: {
            collection_id: collectionId,
            section_id: sectionId,
          },
        });
        setNotes(response.data.notes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchVideoPaths();
    fetchNotes();
  }, [collectionId, sectionId]);

  const handleGenerateVideo = async () => {
    setLoading(true);
    try {
      // Call ask_specific endpoint
      const askSpecificResponse = await axios.post('http://localhost:5000/ask_specific', {
        collection_id: collectionId,
        section_id: sectionId,
        selected_notes: selectedNotes
      });

      // Set the response from ask_specific endpoint
      setAskSpecificResponse(askSpecificResponse.data.response);

      // Call generate_video_from_notes endpoint with the response from ask_specific
      const generateVideoResponse = await axios.post('http://localhost:5000/generate_video_from_notes', {
        notes: askSpecificResponse.data.response,
        collection_id: collectionId,
        section_id: sectionId,
      });
      
      if (generateVideoResponse.video_path) {
        setVideoPaths(prevPaths => [...prevPaths, { path: generateVideoResponse.video_path }]);
      }
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleNoteSelection = (noteId) => {
    setSelectedNotes(prevState =>
      prevState.includes(noteId)
        ? prevState.filter(id => id !== noteId)
        : [...prevState, noteId]
    );
  };

  return (
    <div className="video-page">
      <Navbar/>
      <h2 style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%' }}>Video Page</h2>
      <div className="generate-button-container"> {}
        <button onClick={() => setIsModalOpen(true)} disabled={loading} style={{ marginBottom: '3%', width: '20%' }}>
          {loading ? 'Generating...' : 'Generate New Video'}
        </button>
      </div>
      <div className="generate-button-container">
        {videoPaths.map((video, index) => (
          <div key={index} onClick={() => window.location.href = `http://localhost:3000/videoplayer/${video.video_path}`} className="video-item">
            <video preload="metadata" autoPlay={false}>
              <source src={`http://localhost:5000/videos/${video.video_path}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
      
     

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Select Notes"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h2 style={{ marginBottom: '20px', color: '#99aab0' }}>Select Notes</h2>
          <div className="notes-list" style={{ marginBottom: '20px' }}>
            {notes.map(note => (
              <div key={note.id} className="note-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedNotes.includes(note.notes)}
                    onChange={() => handleNoteSelection(note.notes)}
                  />
                  {note.tldr}
                </label>
              </div>
            ))}
          </div>
          <button onClick={handleGenerateVideo} disabled={loading} style={{ marginRight: '10px' }}>
            {loading ? 'Generating...' : 'Generate Video'}
          </button>
          <button onClick={() => setIsModalOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default VideoPage;
