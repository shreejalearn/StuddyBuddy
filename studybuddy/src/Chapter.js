import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/stuff.css';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <textarea
        rows="4"
        cols="50"
        value={rawText}
        onChange={handleTextChange}
        placeholder="Enter your text here..."
      />
      <button onClick={handleSubmitText}>Upload Text</button>
      {response && <p>{response}</p>}
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
    <div>
      <input
        type="text"
        value={link}
        onChange={handleLinkChange}
        placeholder="Enter website link here..."
      />
      <button onClick={handleUploadLink}>Upload Link</button>
      {response && <p>{response}</p>}
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
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleSubmitPDF}>Upload PDF</button>
      {response && <p>{response}</p>}
    </div>
  );
};

// const ChapterPage = () => {
//   const navigate = useNavigate();
//   const chapterId = localStorage.getItem('currentSection');
//   const collName = localStorage.getItem('collectionName');
//   const chapterName = localStorage.getItem('currentSectionName');
//   const collectionId = localStorage.getItem('currentCollection');
//   const [sources, setSources] = useState([]);
//   const [selectedSource, setSelectedSource] = useState([]);
//   const [recognizedText, setRecognizedText] = useState('');
//   const [recognizedVid, setRecognizedVid] = useState('');
//   const [prompt, setPrompt] = useState('');
//   const [response, setResponse] = useState('');
//   const [isPublic, setIsPublic] = useState(true);
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);
//   const [uploadType, setUploadType] = useState(null);
//   const [responseSaved, setResponseSaved] = useState(false);
//   const [notes, setNotes] = useState([]);
//   const [selectedSourceNotes, setSelectedSourceNotes] = useState('');

//   useEffect(() => {
//     const updateAccessTime = async () => {
//       try {
//         await axios.post('http://localhost:5000/update_access_time', {
//           collection_id: collectionId,
//           section_id: chapterId,
//         });
//       } catch (error) {
//         console.error('Error updating access time:', error);
//       }
//     };

//     const fetchNotes = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/get_notes', {
//           params: {
//             collection_id: collectionId,
//             section_id: chapterId,
//           },
//         });
//         setNotes(response.data.notes);
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     };

//     fetchNotes();
//     updateAccessTime();
//   }, [chapterId, collectionId]);

//   const handleSourceChange = (source) => {
//     setSelectedSource((prevState) =>
//       prevState.includes(source) ? prevState.filter((s) => s !== source) : [...prevState, source]
//     );
//   };

//   const openUploadModal = () => {
//     setUploadModalOpen(true);
//   };

//   const closeUploadModal = () => {
//     setUploadModalOpen(false);
//   };

//   const handleUpload = async (event) => {
//     const formData = new FormData();
//     if (uploadType === 'image') {
//       formData.append('image', event.target.files[0]);
//     } else if (uploadType === 'video') {
//       formData.append('url', event.target.value);
//     } else if (uploadType === 'text') {
//       formData.append('raw_text', event.target.value);
//     } else if (uploadType === 'link') {
//       formData.append('link', event.target.value);
//     }
//     formData.append('collection_id', collectionId);
//     formData.append('section_id', chapterId);

//     try {
//       let response;
//       if (uploadType === 'image') {
//         response = await axios.post('http://localhost:5000/recognize', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//       } else if (uploadType === 'video') {
//         response = await axios.post('http://localhost:5000/get_transcript', formData);
//       } else if (uploadType === 'text') {
//         response = await axios.post('http://localhost:5000/process_text', formData);
//       } else if (uploadType === 'link') {
//         response = await axios.post('http://localhost:5000/process_link', formData);
//       }
//       const updatedNotesResponse = await axios.get('http://localhost:5000/get_notes', {
//         params: {
//           collection_id: collectionId,
//           section_id: chapterId,
//         },
//       });
//       setNotes(updatedNotesResponse.data.notes);
//       closeUploadModal();
//     } catch (error) {
//       console.error(`Error uploading ${uploadType}:`, error);
//     }
//   };

//   const handleUploadType = (type) => {
//     setUploadType(type);
//   };

//   const handleSubmitQuestion = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/answer_question', {
//         username: localStorage.getItem('username'),
//         class: localStorage.getItem('currentCollection'),
//         data: prompt,
//       });
//       setResponse(res.data.response);
//     } catch (error) {
//       console.error('Error submitting question:', error);
//     }
//   };

//   const handleSaveResponse = async () => {
//     try {
//       await axios.post('http://localhost:5000/save_response', {
//         response: response,
//         collection_id: collectionId,
//         section_id: chapterId,
//       });
//       setResponseSaved(true);
//     } catch (error) {
//       console.error('Error saving response:', error);
//     }
//   };

//   const toggleVisibility = async () => {
//     const newVisibility = isPublic ? 'private' : 'public';
//     setIsPublic(!isPublic);

//     try {
//       const response = await axios.post('http://localhost:5000/section_visibility', {
//         collection_id: collectionId,
//         section_id: chapterId,
//         visibility: newVisibility,
//       });
//       console.log('Visibility updated:', response.data);
//     } catch (error) {
//       console.error('Error updating visibility:', error);
//     }
//   };

//   const handleDeleteNote = async (noteId) => {
//     try {
//       await axios.delete('http://localhost:5000/delete_note', {
//         params: {
//           collection_id: collectionId,
//           section_id: chapterId,
//           note_id: noteId,
//         },
//       });
//       const updatedNotesResponse = await axios.get('http://localhost:5000/get_notes', {
//         params: {
//           collection_id: collectionId,
//           section_id: chapterId,
//         },
//       });
//       setNotes(updatedNotesResponse.data.notes);
//     } catch (error) {
//       console.error('Error deleting note:', error);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="sidebar">
//         <h2>{collName} - {chapterName}</h2>
//         <div className="upload-source-btn">
//           <button onClick={openUploadModal}>Upload Source</button>
//         </div>
//         <div className="notes">
//           <h3>Notes</h3>
//           {notes.map((note) => (
//             <div key={note.id} className="note">
//               <p>{note.tldr}</p>
//               <button onClick={() => setSelectedSourceNotes(note.notes)}>View Source</button>
//               <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="main-content">
//         <div className="tabs">
//           <button className="category-btn" onClick={() => navigate('/savedresponses')}>Saved Responses</button>
//           <button className="category-btn">Flashcards</button>
//           <button className="category-btn" onClick={() => navigate('/videos')}>Video</button>
//           <button className="category-btn">Presentations</button>
//           <button className="category-btn" onClick={() => navigate('/practicetest')}>Practice Test</button>
//           <button className="category-btn">Game</button>
//         </div>
//         <div className="content">
//           <div className="section ai-communication">
//             <div className="ask-question">
//               <h3>Ask A Question</h3>
//               <textarea
//                 rows="4"
//                 cols="50"
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 placeholder="Enter your prompt here..."
//               />
//               <button onClick={handleSubmitQuestion}>Submit</button>
//               {response && (
//                 <div>
//                   <h2>Response:</h2>
//                   <p>{response}</p>
//                   <button onClick={handleSaveResponse} disabled={responseSaved}>Save Response</button>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="toggle-container">
//             <span className={isPublic ? 'toggle-active' : ''} onClick={toggleVisibility}>Public</span>
//             <span className={!isPublic ? 'toggle-active' : ''} onClick={toggleVisibility}>Private</span>
//           </div>
//         </div>
//       </div>
//       {selectedSourceNotes && (
//         <div className="modal">
//           <div className="modal-content">
//             <span className="close" onClick={() => setSelectedSourceNotes('')}>&times;</span>
//             <h2>Full Source</h2>
//             <p>{selectedSourceNotes}</p>
//           </div>
//         </div>
//       )}
//       {uploadModalOpen && (
//         <div className="modal">
//           <div className="modal-content">
//             <span className="close" onClick={closeUploadModal}>&times;</span>
//             <h2>Upload Source</h2>
//             <div className="upload-options">
//               <button onClick={() => handleUploadType('image')}>Upload Image</button>
//               <button onClick={() => handleUploadType('video')}>Upload Video</button>
//               <button onClick={() => handleUploadType('text')}>Upload Text</button>
//               <button onClick={() => handleUploadType('link')}>Upload Link</button>
//             </div>
//             {uploadType && (
//               <div className="upload-form">
//                 {uploadType === 'text' ? (
//                   <Upload />
//                 ) : uploadType === 'link' ? (
//                   <UploadLink />
//                 ) : (
//                   <input type={uploadType === 'image' ? 'file' : 'text'} onChange={handleUpload} />
//                 )}
//               </div>
//             )}
//             <div className="section source-uploading"></div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChapterPage;


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
    <div className="container">
      <div className="sidebar">
        <h2>
          {collName} - {chapterName}
        </h2>
        <div className="upload-source-btn">
          <button onClick={openUploadModal}>Upload Source</button>
        </div>
        <div className="notes">
          <h3>Notes</h3>
          {notes.map((note) => (
            <div key={note.id} className="note">
              <p>{note.tldr}</p>
              <button onClick={() => setSelectedSourceNotes(note.notes)}>View Source</button>
              <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      <div className="content">
        <div className="tabs">
          <button className="category-btn" onClick={() => navigate('/savedresponses')}>
            Saved Responses
          </button>
          <button className="category-btn" onClick={() => navigate('/flashcards')}>Flashcards</button>
          <button className="category-btn" onClick={() => navigate('/videos')}>
            Video
          </button>
          <button className="category-btn">Presentations</button>
          <button className="category-btn" onClick={() => navigate('/practicetest')}>
            Practice Test
          </button>
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
                  <button onClick={handleSaveResponse} disabled={responseSaved}>
                    Save Response
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="toggle-container">
            <span className={isPublic ? 'toggle-active' : ''} onClick={toggleVisibility}>
              Public
            </span>
            <span className={!isPublic ? 'toggle-active' : ''} onClick={toggleVisibility}>
              Private
            </span>
          </div>
        </div>
      </div>
      {selectedSourceNotes && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedSourceNotes('')}>
              &times;
            </span>
            <h2>Full Source</h2>
            <p>{selectedSourceNotes}</p>
          </div>
        </div>
      )}
      {uploadModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeUploadModal}>
              &times;
            </span>
            <h2>Upload Source</h2>
            <div className="upload-options">
              <button onClick={() => handleUploadType('image')}>Upload Image</button>
              <button onClick={() => handleUploadType('video')}>Upload Video</button>
              <button onClick={() => handleUploadType('text')}>Upload Text</button>
              <button onClick={() => handleUploadType('link')}>Upload Link</button>
              <button onClick={() => handleUploadType('pdf')}>Upload PDF</button>
            </div>
            {uploadType && (
              <div className="upload-form">
                {uploadType === 'text' ? (
                  <Upload />
                ) : uploadType === 'link' ? (
                  <UploadLink />
                ) : uploadType === 'pdf' ? (
                  <UploadPDF />
                ) : (
                  <input type={uploadType === 'image' ? 'file' : 'text'} onChange={handleUpload} />
                )}
              </div>
            )}
            <div className="section source-uploading"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterPage;