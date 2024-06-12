import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Navbar from './Navbar';

const Upload = ({ onUploadSuccess }) => {
  const [rawText, setRawText] = useState('');
  const [response, setResponse] = useState('');

  const handleTextChange = (event) => {
    setRawText(event.target.value);
  };

  const handleSubmitText = async () => {
    try {
      const formData = new FormData();
      formData.append('raw_text', rawText);
      formData.append('collection_id', localStorage.getItem('currentCollection'));
      formData.append('section_id', localStorage.getItem('currentSection'));

      const response = await axios.post('http://localhost:5000/process_text', formData);
      setResponse(response.data.response);
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading text:', error);
    }
  };

  return (
    <div style={styles.uploadContainer}>
      <textarea
        rows="4"
        cols="50"
        value={rawText}
        onChange={handleTextChange}
        placeholder="Enter your text here..."
        style={styles.textarea}
      />
      <button onClick={handleSubmitText} style={styles.button}>Upload Text</button>
      {response && <p style={styles.response}>{response}</p>}
    </div>
  );
};

const UploadVideo = ({ onUploadSuccess }) => {
  const [video, setVideo] = useState('');
  const [response, setResponse] = useState('');

  const handleTextChange = (event) => {
    setVideo(event.target.value);
  };

  const handleSubmitText = async () => {
    try {
      const formData = new FormData();
      formData.append('url', video);
      formData.append('collection_id', localStorage.getItem('currentCollection'));
      formData.append('section_id', localStorage.getItem('currentSection'));

      const response = await axios.post('http://localhost:5000/get_transcript', formData);
      setResponse(response.data.response);
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading text:', error);
    }
  };

  return (
    <div style={styles.uploadContainer}>
      <input
        type="text"
        value={video}
        onChange={handleTextChange}
        placeholder="Enter URL here..."
        style={styles.input}
      />
      <button onClick={handleSubmitText} style={styles.button}>Upload Url</button>
      {response && <p style={styles.response}>{response}</p>}
    </div>
  );
};

const UploadLink = ({ onUploadSuccess }) => {
  const [link, setLink] = useState('');
  const [response, setResponse] = useState('');

  const handleLinkChange = (event) => {
    setLink(event.target.value);
  };

  const handleUploadLink = async () => {
    try {
      const formData = new FormData();
      formData.append('link', link);
      formData.append('collection_id', localStorage.getItem('currentCollection'));
      formData.append('section_id', localStorage.getItem('currentSection'));

      const response = await axios.post('http://localhost:5000/process_link', formData);
      setResponse(response.data.response);
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading link:', error);
    }
  };

  return (
    <div style={styles.uploadContainer}>
      <input
        type="text"
        value={link}
        onChange={handleLinkChange}
        placeholder="Enter website link here..."
        style={styles.input}
      />
      <button onClick={handleUploadLink} style={styles.button}>Upload Link</button>
      {response && <p style={styles.response}>{response}</p>}
    </div>
  );
};
const UploadImage = ({ onUploadSuccess }) => {
  const [image, setImage] = useState('');
  const [response, setResponse] = useState('');

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleUploadImage = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('collection_id', localStorage.getItem('currentCollection'));
      formData.append('section_id', localStorage.getItem('currentSection'));

      const response = await axios.post('http://localhost:5000/recognize', formData);
      setResponse(response.data.response);
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div style={styles.uploadContainer}>
      <input type="file" onChange={handleImageChange} style={styles.input} />
      <button onClick={handleUploadImage} style={styles.button}>Upload Image</button>
      {response && <p style={styles.response}>{response}</p>}
    </div>
  );
};

const UploadPDF = ({ onUploadSuccess }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [response, setResponse] = useState('');

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmitPDF = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf_file', pdfFile);
      formData.append('collection_id', localStorage.getItem('currentCollection'));
      formData.append('section_id', localStorage.getItem('currentSection'));

      const response = await axios.post('http://localhost:5000/process_pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResponse(response.data.response);
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  return (
    <div style={styles.uploadContainer}>
      <input type="file" accept="application/pdf" onChange={handleFileChange} style={styles.input} />
      <button onClick={handleSubmitPDF} style={styles.button}>Upload PDF</button>
      {response && <p style={styles.response}>{response}</p>}
    </div>
  );
};

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
  const [flashcardSaved, setFlashcardSaved] = useState(false);

  useEffect(() => {
    const updateAccessTime = async () => {
      try {
        await axios.post('http://localhost:5000/update_access_time', {
          collection_id: collectionId,
          section_id: chapterId,
        });
      } catch (error) {
        console.error('Error updating access time:', error);
      }
    };

    const fetchNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_notes', {
          params: {
            collection_id: collectionId,
            section_id: chapterId,
          },
        });
        setNotes(response.data.notes);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchNotes();
    updateAccessTime();
  }, [chapterId, collectionId]);

  const handleSourceChange = (source) => {
    setSelectedSource((prevState) =>
      prevState.includes(source) ? prevState.filter((s) => s !== source) : [...prevState, source]
    );
  };

  const openUploadModal = () => {
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleUpload = async (event) => {
    const formData = new FormData();
    if (uploadType === 'image') {
      formData.append('image', event.target.files[0]);
    } else if (uploadType === 'video') {
      formData.append('url', event.target.value);
    } else if (uploadType === 'text') {
      formData.append('raw_text', event.target.value);
    } else if (uploadType === 'link') {
      formData.append('link', event.target.value);
    } else if (uploadType === 'pdf') {
      formData.append('pdf_file', event.target.files[0]);
    }
    formData.append('collection_id', collectionId);
    formData.append('section_id', chapterId);

    try {
      let response;
      if (uploadType === 'image') {
        response = await axios.post('http://localhost:5000/recognize', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else if (uploadType === 'video') {
        response = await axios.post('http://localhost:5000/get_transcript', formData);
      } else if (uploadType === 'text') {
        response = await axios.post('http://localhost:5000/process_text', formData);
      } else if (uploadType === 'link') {
        response = await axios.post('http://localhost:5000/process_link', formData);
      } else if (uploadType === 'pdf') {
        response = await axios.post('http://localhost:5000/process_pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      const updatedNotesResponse = await axios.get('http://localhost:5000/get_notes', {
        params: {
          collection_id: collectionId,
          section_id: chapterId,
        },
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

  const formatBingResponse = (response) => {
    const paragraphs = response.split('\n');
    
    const formattedParagraphs = paragraphs.map((paragraph, index) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      let formattedParagraph = paragraph.replace(boldRegex, '<strong>$1</strong>');
  
      formattedParagraph = formattedParagraph.replace(/\[(.*?)\]\((.*?)\)/g, '\n<a href="$2">$1</a>');
  
      return <p key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />;
    });
  
    return formattedParagraphs;
  };
  

  const handleSubmitQuestion = async () => {
    try {
      const res = await axios.post('http://localhost:5000/answer_question', {
        username: localStorage.getItem('username'),
        class: localStorage.getItem('currentCollection'),
        data: prompt,
      });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  const handleSaveResponse = async () => {
    try {
      await axios.post('http://localhost:5000/save_response', {
        response: response,
        collection_id: collectionId,
        section_id: chapterId,
      });
      setResponseSaved(true);
    } catch (error) {
      console.error('Error saving response:', error);
    }
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

  const addToFlashcards = async () => {
    try {
      const r = await axios.post('http://localhost:5000/add_res_to_flashcards', {
        question: prompt, // Use the user's question as the flashcard question
        answer: response, // Use the AI's response as the flashcard answer
        collection_id: collectionId,
        section_id: chapterId,
      });
      setFlashcardSaved(true);

      console.log('Flashcard added:', r.data);
    } catch (error) {
      console.error('Error adding to flashcards:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete('http://localhost:5000/delete_note', {
        params: {
          collection_id: collectionId,
          section_id: chapterId,
          note_id: noteId,
        },
      });
      const updatedNotesResponse = await axios.get('http://localhost:5000/get_notes', {
        params: {
          collection_id: collectionId,
          section_id: chapterId,
        },
      });
      setNotes(updatedNotesResponse.data.notes);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <Navbar/>
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.header}>
          {collName} - {chapterName}
        </h2>
        <div style={styles.uploadSourceBtn}>
          <button onClick={openUploadModal} style={styles.button}>Upload Source</button>
        </div>
        <div style={styles.notes}>
          <h3 style={styles.header}>Notes</h3>
          {notes.map((note) => (
            <div key={note.id} style={styles.note}>
              <p>{note.tldr}</p>
              <button onClick={() => setSelectedSourceNotes(note.notes)} style={styles.button}>View Source</button>
              <FontAwesomeIcon icon={faTrash} style={styles.deleteIcon} onClick={() => handleDeleteNote(note.id)} />
            </div>
          ))}
        </div>
      </div>
      <div style={styles.mainContent}>
        <div style={styles.tabs}>
          <button style={styles.categoryBtn} onClick={() => navigate('/savedresponses')}>Saved Responses</button>
          <button style={styles.categoryBtn} onClick={() => navigate('/flashcards')}>Flashcards</button>
          <button style={styles.categoryBtn} onClick={() => navigate('/videos')}>Video</button>
          <button style={styles.categoryBtn} onClick={() => navigate('/practicetest')}>Practice Test</button>
        </div>
        <div style={styles.content}>
          <div style={styles.aiCommunication}>
            <div style={styles.askQuestion}>
              <h3>Ask A Question</h3>
              <textarea
                rows="4"
                cols="50"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                style={styles.textarea}
              />
              <button onClick={handleSubmitQuestion} style={styles.button}>Submit</button>
              {response && (
                <div>
                  <h2>Response:</h2>
                  <p>{formatBingResponse(response)}</p>
                  <button
                    onClick={handleSaveResponse}
                    disabled={responseSaved}
                    style={{
                      ...styles.button,
                      ...(responseSaved && { backgroundColor: '#ccc', cursor: 'not-allowed' }),
                    }}
                  >
                    {responseSaved ? 'Saved!' : 'Save Response'}
                  </button>

                  <button
                    onClick={addToFlashcards}
                    disabled={flashcardSaved}
                    style={{
                      ...styles.button,
                      ...(flashcardSaved && { backgroundColor: '#ccc', cursor: 'not-allowed' }),
                    }}
                  >
                    {flashcardSaved ? 'Saved!' : 'Add to Flashcards'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={styles.toggleContainer}>
            <span  style={isPublic ? { ...styles.toggleActive, ...styles.button } : { ...styles.toggleInactive, ...styles.button }} onClick={toggleVisibility}>Public</span>
            <span style={!isPublic ? { ...styles.toggleActive, ...styles.button } : { ...styles.toggleInactive, ...styles.button }} onClick={toggleVisibility}>Private</span>
          </div>
        </div>
      </div>
      {selectedSourceNotes && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span style={styles.close} onClick={() => setSelectedSourceNotes('')}>&times;</span>
            <h2>Full Source</h2>
            <p>{selectedSourceNotes}</p>
          </div>
        </div>
      )}
      {uploadModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span style={styles.close} onClick={closeUploadModal}>&times;</span>
            <h2>Upload Source</h2>
            <div style={styles.uploadOptions}>
              <button onClick={() => handleUploadType('image')} style={styles.button}>Upload Image</button>
              <button onClick={() => handleUploadType('video')} style={styles.button}>Upload Video</button>
              <button onClick={() => handleUploadType('text')} style={styles.button}>Upload Text</button>
              <button onClick={() => handleUploadType('link')} style={styles.button}>Upload Link</button>
              <button onClick={() => handleUploadType('pdf')} style={styles.button}>Upload PDF</button>
            </div>
            {uploadType && (
              <div style={styles.uploadForm}>
                {uploadType === 'text' ? (
                  <Upload onUploadSuccess={closeUploadModal} />
                ) : uploadType === 'link' ? (
                  <UploadLink onUploadSuccess={closeUploadModal} />
                ) : uploadType === 'pdf' ? (
                  <UploadPDF onUploadSuccess={closeUploadModal} />
                ) :uploadType === 'image' ? (
                  <UploadImage onUploadSuccess={closeUploadModal} />
                ) : uploadType === 'video' ? (
                  <UploadVideo onUploadSuccess={closeUploadModal} />
                ) : null}
              </div>
            )}
            <div style={styles.sourceUploading}></div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
  },
  sidebar: {
    width: '250px',
    padding: '20px',
    backgroundColor: '#f4f4f4',
    borderRight: '1px solid #ccc',
  },
  header: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#909191',
  },
  uploadSourceBtn: {
    marginBottom: '20px',
  },
  notes: {
    marginTop: '20px',
  },
  note: {
    marginBottom: '10px',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#dadde0', // Changed to a more muted teal
    borderRadius: '4px',
    padding: '10px 0',
    marginBottom: '20px',
  },
  categoryBtn: {
    padding: '10px 20px',
    cursor: 'pointer',
    color: 'white', // Changed to white for better contrast
    textDecoration: 'none',
    backgroundColor: '#bacbd4', // Changed to a darker gray
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
    marginLeft: '20px',
  },
  content: {
    flex: 1,
  },
  aiCommunication: {
    marginBottom: '20px',
  },
  askQuestion: {
    marginBottom: '20px',
  },
  textarea: {
    width: '90%',
    height: '300px',
    padding: '10px',
    marginBottom: '10px',
  },
  button: {
    marginLeft: '3px',
    padding: '10px 20px',
    cursor: 'pointer',
  },
  response: {
    marginTop: '10px',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  toggleActive: {
    cursor: 'pointer',
    padding: '10px 20px',
    backgroundColor: '#92C7CF',
    color: '',
  },
  toggleInactive: {
    cursor: 'pointer',
    padding: '10px 20px',
    backgroundColor: '#cfcdca',
  },
  modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '5px',
    width: '500px',
    textAlign: 'center',
    overflow: 'auto',
  },
  close: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '24px',
    cursor: 'pointer',
  },
  uploadOptions: {
    marginBottom: '20px',
  },
  uploadForm: {
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    width: '80%',
  },
  sourceUploading: {
    marginTop: '20px',
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  deleteIcon: {
    cursor: 'pointer',
    marginLeft: '10px',
    color: '#EE4E4E',
  },
};

export default ChapterPage;
