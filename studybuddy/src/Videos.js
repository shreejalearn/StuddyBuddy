import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './styles/stuff.css';

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
      console.log(askSpecificResponse.data.response)
      // Call generate_video_from_notes endpoint with the response from ask_specific
      const generateVideoResponse = await axios.post('http://localhost:5000/generate_video_from_notes', {
        notes: askSpecificResponse.data.response
      });
      
      if (generateVideoResponse.data.video_path) {
        setVideoPaths(prevPaths => [...prevPaths, { path: generateVideoResponse.data.video_path }]);
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
      <h2>Video Page</h2>
      <div className="video-list">
        {videoPaths.map((video, index) => (
          <div key={index} className="video-item">
            <a href={video.path} target="_blank" rel="noopener noreferrer">Video {index + 1}</a>
          </div>
        ))}
      </div>
      <button onClick={() => setIsModalOpen(true)} disabled={loading}>
        {loading ? 'Generating...' : 'Generate New Video'}
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Select Notes"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h2>Select Notes</h2>
          <div className="notes-list">
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
          <button onClick={handleGenerateVideo} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Video'}
          </button>
          <button onClick={() => setIsModalOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default VideoPage;
