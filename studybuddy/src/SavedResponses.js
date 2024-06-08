import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/stuff.css';

const SavedResponsesPage = () => {
  const chapterId = localStorage.getItem('currentSection');
  const collectionId = localStorage.getItem('currentCollection');
  const [savedResponses, setSavedResponses] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);

  useEffect(() => {
    const fetchSavedResponses = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/get_saved_responses?collection_id=${collectionId}&section_id=${chapterId}`);
        setSavedResponses(response.data.notes); 
      } catch (error) {
        console.error('Error fetching saved responses:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('Request data:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      }
    };

    fetchSavedResponses();
  }, [chapterId, collectionId]);

  const openModal = (response) => {
    setCurrentResponse(response);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentResponse(null);
  };

  const deleteResponse = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete_response`, {
        params: {
          collection_id: collectionId,
          section_id: chapterId,
          response_id: id
        }
      });
      setSavedResponses(savedResponses.filter(response => response.id !== id));
    } catch (error) {
      console.error('Error deleting response:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const addToNotesAndDelete = async (response) => {
    try {
      await axios.post('http://localhost:5000/add_response_to_notes', {
        collection_id: collectionId,
        section_id: chapterId,
        response_id: response.id
      });
      setSavedResponses(savedResponses.filter(res => res.id !== response.id));
    } catch (error) {
      console.error('Error adding to notes and deleting response:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <div className="container">
      <h1>Saved Responses</h1>
      {savedResponses.map((savedResponse) => (
        <div key={savedResponse.id} className="response">
          <p>{savedResponse.tldr}</p>
          <button onClick={() => openModal(savedResponse)}>Expand</button>
          <button onClick={() => deleteResponse(savedResponse.id)}>Delete</button>
          <button onClick={() => addToNotesAndDelete(savedResponse)}>Add to Notes</button>
        </div>
      ))}
      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Full Response</h2>
            <div className="modal-body">
              {currentResponse && <p>{currentResponse.data}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedResponsesPage;
