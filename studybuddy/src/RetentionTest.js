import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './styles/speechtotext.css';
import axios from 'axios';
import './styles/modal.css'
const Modal = ({ isOpen, onClose, note }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{note.tldr}</h2>
        <p>{note.notes}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const chapterId = localStorage.getItem('currentSection');
  const collName = localStorage.getItem('collectionName');
  const chapterName = localStorage.getItem('currentSectionName');
  const collectionId = localStorage.getItem('currentCollection');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    let endTime = null;
    const handleBeforeUnload = () => {
      endTime = new Date().getTime();
      if (startTime && endTime) {
        const timeSpent = endTime - startTime;
        setTotalTimeSpent(timeSpent); // Update state for display or debugging purposes
        try {
          axios.post('http://localhost:5000/time_spent', {
            collection_id: collectionId,
            section_id: chapterId,
            total_time_spent: timeSpent,
          });
        } catch (error) {
          console.error('Error updating time spent:', error);
        }
      }
    };
  
    const handleUnload = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      endTime = new Date().getTime();
      if (startTime && endTime) {
        const timeSpent = endTime - startTime;
        try {
          axios.post('http://localhost:5000/time_spent', {
            collection_id: collectionId,
            section_id: chapterId,
            total_time_spent: timeSpent,
          });
        } catch (error) {
          console.error('Error updating time spent:', error);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
  
    startTime = new Date().getTime();
    
  
    fetchNotes();
    setupRecognition();
  }, [chapterId, collectionId]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/get_notes?section_id=${localStorage.getItem("currentSection")}`);
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch notes');
      }
      
      const notesData = response.data.notes;
      console.log(notesData);
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };
  

  const setupRecognition = () => {
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

    setRecognition(recognitionObj);
  };

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

  const handleCheckboxChange = noteId => {
    const updatedSelectedNotes = selectedNotes.includes(noteId)
      ? selectedNotes.filter(id => id !== noteId)
      : [...selectedNotes, noteId];
    setSelectedNotes(updatedSelectedNotes);
  };
  const openModal = note => {
    setCurrentNote(note);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentNote(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/compare_and_fetch_concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: selectedNotes,
          userInput: result,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compare and fetch concepts');
      }

      const conceptsData = await response.json();
      console.log('Concepts missed:', conceptsData);
      // Handle displaying concepts missed to the user as needed
    } catch (error) {
      console.error('Error comparing and fetching concepts:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '3.5rem', color: 'gray' }}>Retention Test</h2>
      <div className="centered-container">
        <div className="button-container">
          <button onClick={startRecording} disabled={isListening}>
            Start Record
          </button>
          <button onClick={stopRecording} disabled={!isListening}>
            Stop Record
          </button>
          <button onClick={handleSubmit} disabled={!result.trim() || selectedNotes.length === 0}>
            Submit
          </button>
        </div>
        <div className="result-container">
          <p>{result}</p>
        </div>
        <div className="notes-container">
          <h3>Notes</h3>
          <ul>
            {notes.map(note => (
              <li key={note.id}>
                <input
                  type="checkbox"
                  id={note.id}
                  checked={selectedNotes.includes(note.id)}
                  onChange={() => handleCheckboxChange(note.id)}
                />
                <label htmlFor={note.id}>{note.tldr}</label>
                <button onClick={() => openModal(note)}>View</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} note={currentNote} />

    </div>
  );
};

export default SpeechToText;
