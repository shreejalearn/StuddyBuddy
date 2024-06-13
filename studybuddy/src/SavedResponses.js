// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Navbar from './Navbar';
// import './styles/SavedResponsesPage.css'; // Import the CSS file

// const SavedResponsesPage = () => {
//   const chapterId = localStorage.getItem('currentSection');
//   const collectionId = localStorage.getItem('currentCollection');
//   const [savedResponses, setSavedResponses] = useState([]);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [currentResponse, setCurrentResponse] = useState(null);

//   useEffect(() => {
//     const fetchSavedResponses = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/get_saved_responses?collection_id=${collectionId}&section_id=${chapterId}`);
//         setSavedResponses(response.data.notes); 
//       } catch (error) {
//         console.error('Error fetching saved responses:', error);
//         if (error.response) {
//           console.error('Response data:', error.response.data);
//           console.error('Response status:', error.response.status);
//           console.error('Response headers:', error.response.headers);
//         } else if (error.request) {
//           console.error('Request data:', error.request);
//         } else {
//           console.error('Error message:', error.message);
//         }
//       }
//     };

//     fetchSavedResponses();
//   }, [chapterId, collectionId]);

//   const openModal = (response) => {
//     setCurrentResponse(response);
//     setModalIsOpen(true);
//   };

//   const closeModal = () => {
//     setModalIsOpen(false);
//     setCurrentResponse(null);
//   };

//   const deleteResponse = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5000/delete_response`, {
//         params: {
//           collection_id: collectionId,
//           section_id: chapterId,
//           response_id: id
//         }
//       });
//       setSavedResponses(savedResponses.filter(response => response.id !== id));
//     } catch (error) {
//       console.error('Error deleting response:', error);
//       if (error.response) {
//         console.error('Response data:', error.response.data);
//         console.error('Response status:', error.response.status);
//         console.error('Response headers:', error.response.headers);
//       } else if (error.request) {
//         console.error('Request data:', error.request);
//       } else {
//         console.error('Error message:', error.message);
//       }
//     }
//   };

//   const addToNotesAndDelete = async (response) => {
//     try {
//       await axios.post('http://localhost:5000/add_response_to_notes', {
//         collection_id: collectionId,
//         section_id: chapterId,
//         response_id: response.id
//       });
//       setSavedResponses(savedResponses.filter(res => res.id !== response.id));
//     } catch (error) {
//       console.error('Error adding to notes and deleting response:', error);
//       if (error.response) {
//         console.error('Response data:', error.response.data);
//         console.error('Response status:', error.response.status);
//         console.error('Response headers:', error.response.headers);
//       } else if (error.request) {
//         console.error('Request data:', error.request);
//       } else {
//         console.error('Error message:', error.message);
//       }
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="container" style={{ display: 'flex', flexDirection: 'column', padding: '5%' }}>
//         <h2 className="header" style={{ textAlign: 'center', marginTop: '20px', fontSize: '3.5rem', color: 'gray' }}>Saved Responses</h2>
//         {modalIsOpen && (
//           <div className="modal" style={{
//             position: 'fixed',
//             zIndex: 1,
//             left: 0,
//             top: 0,
//             width: '100%',
//             height: '100%', // Adjust height to cover full screen
//             display: 'flex', // Use flexbox to center content
//             alignItems: 'center', // Vertically center the modal content
//             justifyContent: 'center', // Horizontally center the modal content
//             backgroundColor: 'rgba(0,0,0,0.4)',
//           }}>
//             <div className="modal-content" style={{
//               backgroundColor: '#fefefe',
//               padding: '5%',
//               border: '1px solid #888',
//               width: '80%', // Adjusted width to make the modal wider
//               maxWidth: '800px', // Optional: limit the maximum width
//               margin: 'auto', // Center the modal content horizontally
//               overflowX: 'hidden',

//             }}>
//               <span className="close" onClick={closeModal} style={{
//                 color: '#aaa',
//                 float: 'right',
//                 fontSize: '28px',
//                 fontWeight: 'bold',
//                 cursor: 'pointer'
//               }}>&times;</span>
//               <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#a2acb0' }}>Full Response</h2>
//               <div className="modal-body" style={{ padding: '1rem', width: '100%' }}>
//                 {currentResponse && <p>{currentResponse.data}</p>}
//               </div>
//             </div>
//           </div>
//         )}
//         <div className="flashcards-container" style={{ marginTop: '20px' }}>
//           {savedResponses.length === 0 ? (
//             <p className="no-responses">No saved responses found.</p>
//           ) : (
//             savedResponses.map((savedResponse) => (
//               <div key={savedResponse.id} className="flashcard" style={{
//                 backgroundColor: '#EEEEEE',
//                 borderRadius: '8px',
//                 boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                 margin: '10px 0',
//                 transition: 'transform 0.2s',
//                 backdropFilter: 'blur(10px)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 width: '80%',
//                 maxWidth: '100%',
//                 marginLeft: 'auto',
//                 marginRight: 'auto',
//                 paddingLeft: '15%',
//                 paddingRight: '15%',
//               }}>
//                 <div className="card-front">
//                   <div className="question" style={{
//                     fontSize: '1.2rem',
//                     fontWeight: 'bold',
//                     textAlign: 'center',
//                     width: '100%',
//                     color: '#afb5bd',
//                   }}>{savedResponse.tldr}</div>
//                   <div className="button-group" style={{
//                     marginTop: '10px',
//                     display: 'flex',
//                     justifyContent: 'space-around',
//                     width: '100%'
//                   }}>
//                     <button onClick={() => openModal(savedResponse)} style={{
//                       backgroundColor: '#89CFF3',
//                       color: 'white',
//                       padding: '10px 24px',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}>Expand</button>
//                     <button onClick={() => deleteResponse(savedResponse.id)} style={{
//                       backgroundColor: '#FA7070',
//                       color: 'white',
//                       padding: '10px 24px',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}>Delete</button>
//                     <button onClick={() => addToNotesAndDelete(savedResponse)} style={{
//                       backgroundColor: '#89CFF3',
//                       color: 'white',
//                       padding: '10px 24px',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}>Add to Notes</button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SavedResponsesPage;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Navbar from './Navbar';
// import './styles/SavedResponsesPage.css'; // Import the CSS file

// const SavedResponsesPage = () => {
//   const chapterId = localStorage.getItem('currentSection');
//   const collectionId = localStorage.getItem('currentCollection');
//   const [savedResponses, setSavedResponses] = useState([]);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [currentResponse, setCurrentResponse] = useState(null);

//   useEffect(() => {
//     const fetchSavedResponses = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/get_saved_responses?collection_id=${collectionId}&section_id=${chapterId}`);
//         setSavedResponses(response.data.notes); 
//       } catch (error) {
//         console.error('Error fetching saved responses:', error);
//         if (error.response) {
//           console.error('Response data:', error.response.data);
//           console.error('Response status:', error.response.status);
//           console.error('Response headers:', error.response.headers);
//         } else if (error.request) {
//           console.error('Request data:', error.request);
//         } else {
//           console.error('Error message:', error.message);
//         }
//       }
//     };

//     fetchSavedResponses();
//   }, [chapterId, collectionId]);

//   const openModal = (response) => {
//     setCurrentResponse(response);
//     setModalIsOpen(true);
//   };

//   const closeModal = () => {
//     setModalIsOpen(false);
//     setCurrentResponse(null);
//   };

//   const deleteResponse = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5000/delete_response`, {
//         params: {
//           collection_id: collectionId,
//           section_id: chapterId,
//           response_id: id
//         }
//       });
//       setSavedResponses(savedResponses.filter(response => response.id !== id));
//     } catch (error) {
//       console.error('Error deleting response:', error);
//       if (error.response) {
//         console.error('Response data:', error.response.data);
//         console.error('Response status:', error.response.status);
//         console.error('Response headers:', error.response.headers);
//       } else if (error.request) {
//         console.error('Request data:', error.request);
//       } else {
//         console.error('Error message:', error.message);
//       }
//     }
//   };

//   const addToNotesAndDelete = async (response) => {
//     try {
//       await axios.post('http://localhost:5000/add_response_to_notes', {
//         collection_id: collectionId,
//         section_id: chapterId,
//         response_id: response.id
//       });
//       setSavedResponses(savedResponses.filter(res => res.id !== response.id));
//     } catch (error) {
//       console.error('Error adding to notes and deleting response:', error);
//       if (error.response) {
//         console.error('Response data:', error.response.data);
//         console.error('Response status:', error.response.status);
//         console.error('Response headers:', error.response.headers);
//       } else if (error.request) {
//         console.error('Request data:', error.request);
//       } else {
//         console.error('Error message:', error.message);
//       }
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="container" style={{ display: 'flex', flexDirection: 'column', padding: '5%' }}>
//         <h2 className="header" style={{ textAlign: 'center', marginTop: '20px', fontSize: '3.5rem', color: 'gray' }}>Saved Responses</h2>
//         {modalIsOpen && (
//           <div className="modal" style={{
//             position: 'fixed',
//             zIndex: 1,
//             left: 0,
//             top: 0,
//             width: '100%',
//             height: '100%', // Adjust height to cover full screen
//             display: 'flex', // Use flexbox to center content
//             alignItems: 'center', // Vertically center the modal content
//             justifyContent: 'center', // Horizontally center the modal content
//             backgroundColor: 'rgba(0,0,0,0.4)',
//           }}>
//             <div className="modal-content" style={{
//               backgroundColor: '#fefefe',
//               padding: '5%',
//               border: '1px solid #888',
//               width: '80%', // Adjusted width to make the modal wider
//               maxWidth: '800px', // Optional: limit the maximum width
//               margin: 'auto', // Center the modal content horizontally
//               overflowX: 'hidden',

//             }}>
//               <span className="close" onClick={closeModal} style={{
//                 color: '#aaa',
//                 float: 'right',
//                 fontSize: '28px',
//                 fontWeight: 'bold',
//                 cursor: 'pointer'
//               }}>&times;</span>
//               <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#a2acb0' }}>Full Response</h2>
//               <div className="modal-body" style={{ padding: '1rem', width: '100%' }}>
//                 {currentResponse && <p>{currentResponse.data}</p>}
//               </div>
//             </div>
//           </div>
//         )}
//         <div className="flashcards-container" style={{ marginTop: '20px' }}>
//           {savedResponses.length === 0 ? (
//             <p className="no-responses">No saved responses found.</p>
//           ) : (
//             savedResponses.map((savedResponse) => (
//               <div key={savedResponse.id} className="flashcard" style={{
//                 backgroundColor: '#EEEEEE',
//                 borderRadius: '8px',
//                 boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                 margin: '10px 0',
//                 transition: 'transform 0.2s',
//                 backdropFilter: 'blur(10px)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 width: '80%',
//                 maxWidth: '100%',
//                 marginLeft: 'auto',
//                 marginRight: 'auto',
//                 paddingLeft: '15%',
//                 paddingRight: '15%',
//               }}>
//                 <div className="card-front">
//                   <div className="question" style={{
//                     fontSize: '1.2rem',
//                     fontWeight: 'bold',
//                     textAlign: 'center',
//                     width: '100%',
//                     color: '#afb5bd',
//                   }}>{savedResponse.tldr}</div>
//                   <div className="button-group" style={{
//                     marginTop: '10px',
//                     display: 'flex',
//                     justifyContent: 'space-around',
//                     width: '100%'
//                   }}>
//                     <button onClick={() => openModal(savedResponse)} style={{
//                       backgroundColor: '#89CFF3',
//                       color: 'white',
//                       padding: '10px 24px',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}>Expand</button>
//                     <button onClick={() => deleteResponse(savedResponse.id)} style={{
//                       backgroundColor: '#FA7070',
//                       color: 'white',
//                       padding: '10px 24px',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}>Delete</button>
//                     <button onClick={() => addToNotesAndDelete(savedResponse)} style={{
//                       backgroundColor: '#89CFF3',
//                       color: 'white',
//                       padding: '10px 24px',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}>Add to Notes</button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SavedResponsesPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './styles/SavedResponsesPage.css'; // Import the CSS file

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
    <div>
      <Navbar />
      <div className="container" style={{ display: 'flex', flexDirection: 'column', padding: '5%' }}>
        <h2 className="header" style={{ textAlign: 'center', marginTop: '20px', fontSize: '3.5rem', color: 'gray' }}>Saved Responses</h2>
        {modalIsOpen && (
          <div className="modal" style={{
            position: 'fixed',
            zIndex: 1,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%', // Adjust height to cover full screen
            display: 'flex', // Use flexbox to center content
            alignItems: 'center', // Vertically center the modal content
            justifyContent: 'center', // Horizontally center the modal content
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}>
            <div className="modal-content" style={{
              backgroundColor: '#fefefe',
              padding: '5%',
              border: '1px solid #888',
              width: '80%', // Adjusted width to make the modal wider
              maxWidth: '800px', // Optional: limit the maximum width
              margin: 'auto', // Center the modal content horizontally
              overflowX: 'hidden',

            }}>
              <span className="close" onClick={closeModal} style={{
                color: '#aaa',
                float: 'right',
                fontSize: '28px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>&times;</span>
              <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#a2acb0' }}>Full Response</h2>
              <div className="modal-body" style={{ padding: '1rem', width: '100%' }}>
                {currentResponse && <p>{currentResponse.data}</p>}
              </div>
            </div>
          </div>
        )}
        <div className="flashcards-container" style={{ marginTop: '20px' }}>
          {savedResponses.length === 0 ? (
            <p className="no-responses">No saved responses found.</p>
          ) : (
            savedResponses.map((savedResponse) => (
              <div key={savedResponse.id} className="flashcard" style={{
                backgroundColor: '#EEEEEE',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                margin: '10px 0',
                transition: 'transform 0.2s',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '60%',
                maxWidth: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                paddingLeft: '15%',
                paddingRight: '15%',
                paddingTop: '2%',
                paddingBottom: '2%',
              }}>
                <div className="card-front">
                  <div className="question" style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '100%',
                    color: '#afb5bd',
                  }}>{savedResponse.tldr}</div>
                  <div className="button-group" style={{
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    width: '100%'
                  }}>
                    <button onClick={() => openModal(savedResponse)} style={{
                      backgroundColor: '#89CFF3',
                      color: 'white',
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>Expand</button>
                    <button onClick={() => deleteResponse(savedResponse.id)} style={{
                      backgroundColor: '#FA7070',
                      color: 'white',
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>Delete</button>
                    <button onClick={() => addToNotesAndDelete(savedResponse)} style={{
                      backgroundColor: '#89CFF3',
                      color: 'white',
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>Add to Notes</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedResponsesPage;