// // import React, { useState, useEffect } from 'react';
// // import Navbar from './Navbar';

// // const FlashcardApp = () => {
// //   const [flashcards, setFlashcards] = useState([]);
// //   const [question, setQuestion] = useState('');
// //   const [answer, setAnswer] = useState('');
// //   const [suggestedFlashcards, setSuggestedFlashcards] = useState([]);
// //   const [showModal, setShowModal] = useState(false);
// //   const [flippedCards, setFlippedCards] = useState([]);

// //   useEffect(() => {
// //     async function fetchFlashcards() {
// //       try {
// //         const response = await fetch(`http://localhost:5000/get_flashcards?collection_id=${localStorage.getItem('currentCollection')}&section_id=${localStorage.getItem('currentSection')}`);
// //         if (!response.ok) {
// //           throw new Error('Failed to fetch flashcards');
// //         }
// //         const data = await response.json();
// //         setFlashcards(data.flashcards);
// //       } catch (error) {
// //         console.error('Error fetching flashcards:', error.message);
// //       }
// //     }

// //     const suggestFlashcards = async () => {
// //       try {
// //         const response = await fetch('http://localhost:5000/suggestflashcards', {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify({
// //             collectionId: localStorage.getItem('currentCollection'),
// //             sectionId: localStorage.getItem('currentSection'),
// //           }),
// //         });

// //         if (!response.ok) {
// //           throw new Error('Failed to suggest flashcards');
// //         }

// //         const data = await response.json();
// //         setSuggestedFlashcards(data.response);
// //       } catch (error) {
// //         console.error('Error suggesting flashcards:', error.message);
// //       }
// //     };

// //     fetchFlashcards();
// //     suggestFlashcards();
// //   }, []);

// //   const addFlashcard = async () => {
// //     if (question.trim() === '' || answer.trim() === '') {
// //       alert('Please enter both question and answer.');
// //       return;
// //     }

// //     setFlashcards([...flashcards, { question, answer }]);
// //     setQuestion('');
// //     setAnswer('');

// //     try {
// //       const response = await fetch('http://localhost:5000/addflashcard', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           collectionId: localStorage.getItem('currentCollection'),
// //           sectionId: localStorage.getItem('currentSection'),
// //           question: question,
// //           answer: answer,
// //         }),
// //       });

// //       if (!response.ok) {
// //         throw new Error('Failed to add flashcard');
// //       }

// //       setShowModal(false);
// //       console.log('Flashcard added successfully!');
// //     } catch (error) {
// //       console.error('Error adding flashcard:', error.message);
// //     }
// //   };

// //   const addSuggestedFlashcard = async (question, answer, index) => {
// //     try {
// //       const response = await fetch('http://localhost:5000/addflashcard', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           collectionId: localStorage.getItem('currentCollection'),
// //           sectionId: localStorage.getItem('currentSection'),
// //           question: question,
// //           answer: answer,
// //         }),
// //       });

// //       if (!response.ok) {
// //         throw new Error('Failed to add flashcard');
// //       }

// //       const updatedSuggestions = [...suggestedFlashcards];
// //       updatedSuggestions.splice(index, 1);
// //       setSuggestedFlashcards(updatedSuggestions);

// //       console.log('Flashcard added successfully!');
// //     } catch (error) {
// //       console.error('Error adding flashcard:', error.message);
// //     }
// //   };

// //   const toggleFlip = (index) => {
// //     setFlippedCards((prevFlippedCards) => {
// //       const newFlippedCards = [...prevFlippedCards];
// //       newFlippedCards[index] = !newFlippedCards[index];
// //       return newFlippedCards;
// //     });
// //   };

// //   return (
// //     <div>
// //       <Navbar />

// //       <div style={{ padding: '20px' }}>
// //         <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '3.5rem', color: 'gray' }}>Flashcards</h2>

// //         {showModal && (
// //           <div style={{
// //             position: 'fixed',
// //             top: '0',
// //             left: '0',
// //             width: '100%',
// //             height: '100%',
// //             backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //             display: 'flex',
// //             justifyContent: 'center',
// //             alignItems: 'center'
// //           }}>
// //             <div style={{
// //               backgroundColor: '#fff',
// //               padding: '20px',
// //               borderRadius: '5px',
// //               boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
// //               position: 'relative'
// //             }}>
// //               <span
// //                 style={{
// //                   position: 'absolute',
// //                   top: '10px',
// //                   right: '10px',
// //                   cursor: 'pointer',
// //                   fontSize: '20px',
// //                 }}
// //                 onClick={() => setShowModal(false)}
// //               >&times;</span>
// //               <form onSubmit={(e) => { e.preventDefault(); addFlashcard(); }}>
// //                 <input
// //                   type="text"
// //                   placeholder="Enter question"
// //                   value={question}
// //                   onChange={(e) => setQuestion(e.target.value)}
// //                   style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
// //                 />
// //                 <input
// //                   type="text"
// //                   placeholder="Enter answer"
// //                   value={answer}
// //                   onChange={(e) => setAnswer(e.target.value)}
// //                   style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
// //                 />
// //                 <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', backgroundColor: '#92C7CF', color: '#fff', cursor: 'pointer' }}>
// //                   Add Flashcard
// //                 </button>
// //               </form>
// //             </div>
// //           </div>
// //         )}

// //         <button
// //           style={{
// //             padding: '10px 20px',
// //             border: 'none',
// //             borderRadius: '5px',
// //             backgroundColor: '#007bff',
// //             color: '#fff',
// //             cursor: 'pointer',
// //             marginBottom: '20px'
// //           }}
// //           onClick={() => setShowModal(true)}
// //         >
// //           Add Flashcard
// //         </button>

// //         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
// //           {flashcards.map((flashcard, index) => (
// //             <div key={index} style={{
// //               width: '200px',
// //               height: '200px',
// //               perspective: '1000px'
// //             }} onClick={() => toggleFlip(index)}>
// //               <div style={{
// //                 width: '100%',
// //                 height: '100%',
// //                 position: 'relative',
// //                 transformStyle: 'preserve-3d',
// //                 transition: 'transform 0.6s',
// //                 transform: flippedCards[index] ? 'rotateY(180deg)' : 'none'
// //               }}>
// //                 <div style={{
// //                   position: 'absolute',
// //                   width: '100%',
// //                   height: '100%',
// //                   backfaceVisibility: 'hidden',
// //                   backgroundColor: '#fff',
// //                   border: '1px solid #ccc',
// //                   borderRadius: '5px',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   padding: '10px',
// //                   boxSizing: 'border-box'
// //                 }}>
// //                   <div style={{ fontWeight: 'bold' }}>{flashcard.question}</div>
// //                 </div>
// //                 <div style={{
// //                   position: 'absolute',
// //                   width: '100%',
// //                   height: '100%',
// //                   backfaceVisibility: 'hidden',
// //                   backgroundColor: '#fff',
// //                   border: '1px solid #ccc',
// //                   borderRadius: '5px',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   padding: '10px',
// //                   boxSizing: 'border-box',
// //                   transform: 'rotateY(180deg)'
// //                 }}>
// //                   <div>{flashcard.answer}</div>
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         <h2 style={{ textAlign: 'center', marginTop: '20px' }}>Suggested Flashcards</h2>
// //         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
// //           {suggestedFlashcards.map((flashcard, index) => (
// //             <div key={index} style={{
// //               width: '200px',
// //               height: '200px',
// //               perspective: '1000px'
// //             }} onClick={() => toggleFlip(flashcards.length + index)}>
// //               <div style={{
// //                 width: '100%',
// //                 height: '100%',
// //                 position: 'relative',
// //                 transformStyle: 'preserve-3d',
// //                 transition: 'transform 0.6s',
// //                 transform: flippedCards[flashcards.length + index] ? 'rotateY(180deg)' : 'none'
// //               }}>
// //                 <div style={{
// //                   position: 'absolute',
// //                   width: '100%',
// //                   height: '100%',
// //                   backfaceVisibility: 'hidden',
// //                   backgroundColor: '#fff',
// //                   border: '1px solid #ccc',
// //                   borderRadius: '5px',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   padding: '10px',
// //                   boxSizing: 'border-box'
// //                 }}>
// //                   <div style={{ fontWeight: 'bold' }}>{flashcard.question}</div>
// //                 </div>
// //                 <div style={{
// //                   position: 'absolute',
// //                   width: '100%',
// //                   height: '100%',
// //                   backfaceVisibility: 'hidden',
// //                   backgroundColor: '#fff',
// //                   border: '1px solid #ccc',
// //                   borderRadius: '5px',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   padding: '10px',
// //                   boxSizing: 'border-box',
// //                   transform: 'rotateY(180deg)'
// //                 }}>
// //                   <div>{flashcard.answer}</div>
// //                 </div>
// //               </div>
// //               <button
// //                 style={{
// //                   marginTop: '10px',
// //                   padding: '10px 20px',
// //                   border: 'none',
// //                   borderRadius: '5px',
// //                   backgroundColor: '#28a745',
// //                   color: '#fff',
// //                   cursor: 'pointer'
// //                 }}
// //                 onClick={() => addSuggestedFlashcard(flashcard.question, flashcard.answer, index)}
// //               >
// //                 Add
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default FlashcardApp;

// import React, { useState, useEffect } from 'react';
// import Navbar from './Navbar';

// const FlashcardApp = () => {
//   const [flashcards, setFlashcards] = useState([]);
//   const [question, setQuestion] = useState('');
//   const [answer, setAnswer] = useState('');
//   const [suggestedFlashcards, setSuggestedFlashcards] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [flippedCards, setFlippedCards] = useState([]);

//   useEffect(() => {
//     async function fetchFlashcards() {
//       try {
//         const response = await fetch(`http://localhost:5000/get_flashcards?collection_id=${localStorage.getItem('currentCollection')}&section_id=${localStorage.getItem('currentSection')}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch flashcards');
//         }
//         const data = await response.json();
//         setFlashcards(data.flashcards);
//       } catch (error) {
//         console.error('Error fetching flashcards:', error.message);
//       }
//     }

//     const suggestFlashcards = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/suggestflashcards', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             collectionId: localStorage.getItem('currentCollection'),
//             sectionId: localStorage.getItem('currentSection'),
//           }),
//         });
    
//         if (!response.ok) {
//           throw new Error('Failed to suggest flashcards');
//         }
    
//         const data = await response.json();
//         // Take only the first three elements of the array
//         setSuggestedFlashcards(data.response.slice(0, 3));
//       } catch (error) {
//         console.error('Error suggesting flashcards:', error.message);
//       }
//     };
    
//     fetchFlashcards();
//     suggestFlashcards();
//   }, []);

//   const addFlashcard = async () => {
//     if (question.trim() === '' || answer.trim() === '') {
//       alert('Please enter both question and answer.');
//       return;
//     }

//     setFlashcards([...flashcards, { question, answer }]);
//     setQuestion('');
//     setAnswer('');

//     try {
//       const response = await fetch('http://localhost:5000/addflashcard', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           collectionId: localStorage.getItem('currentCollection'),
//           sectionId: localStorage.getItem('currentSection'),
//           question: question,
//           answer: answer,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to add flashcard');
//       }

//       setShowModal(false);
//       console.log('Flashcard added successfully!');
//     } catch (error) {
//       console.error('Error adding flashcard:', error.message);
//     }
//   };

//   const addSuggestedFlashcard = async (question, answer, index) => {
//     try {
//       const response = await fetch('http://localhost:5000/addflashcard', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           collectionId: localStorage.getItem('currentCollection'),
//           sectionId: localStorage.getItem('currentSection'),
//           question: question,
//           answer: answer,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to add flashcard');
//       }

//       const updatedSuggestions = [...suggestedFlashcards];
//       updatedSuggestions.splice(index, 1);
//       setSuggestedFlashcards(updatedSuggestions);

//       console.log('Flashcard added successfully!');
//     } catch (error) {
//       console.error('Error adding flashcard:', error.message);
//     }
//   };

//   const toggleFlip = (index) => {
//     setFlippedCards((prevFlippedCards) => {
//       const newFlippedCards = [...prevFlippedCards];
//       newFlippedCards[index] = !newFlippedCards[index];
//       return newFlippedCards;
//     });
//   };

//   return (
//     <div>
//       <Navbar />

//       <div style={{ padding: '20px' }}>
//         <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '3.5rem', color: 'gray' }}>Flashcards</h2>

//         {showModal && (
//           <div style={{
//             position: 'fixed',
//             top: '0',
//             left: '0',
//             width: '100%',
//             height: '100%',
//             backgroundColor: 'rgba(0, 0, 0, 0.5)',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center'
//           }}>
//             <div style={{
//               backgroundColor: '#fff',
//               padding: '20px',
//               borderRadius: '5px',
//               boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
//               position: 'relative'
//             }}>
//               <span
//                 style={{
//                   position: 'absolute',
//                   top: '10px',
//                   right: '10px',
//                   cursor: 'pointer',
//                   fontSize: '20px',
//                 }}
//                 onClick={() => setShowModal(false)}
//               >&times;</span>
//               <form onSubmit={(e) => { e.preventDefault(); addFlashcard(); }}>
//                 <input
//                   type="text"
//                   placeholder="Enter question"
//                   value={question}
//                   onChange={(e) => setQuestion(e.target.value)}
//                   style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Enter answer"
//                   value={answer}
//                   onChange={(e) => setAnswer(e.target.value)}
//                   style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
//                 />
//                 <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', backgroundColor: '#92C7CF', color: '#fff', cursor: 'pointer' }}>
//                   Add Flashcard
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}

//         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
//           <button
//             style={{
//               padding: '10px 20px',
//               border: 'none',
//               borderRadius: '5px',
//               backgroundColor: '#007bff',
//               color: '#fff',
//               cursor: 'pointer'
//             }}
//             onClick={() => setShowModal(true)}
//           >
//             Add Flashcard
//           </button>
//         </div>

//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
//           {flashcards.map((flashcard, index) => (
//             <div key={index} style={{
//               width: '200px',
//               height: '200px',
//               perspective: '1000px'
//             }} onClick={() => toggleFlip(index)}>
//               <div style={{
//                 width: '100%',
//                 height: '100%',
//                 position: 'relative',
//                 transformStyle: 'preserve-3d',
//                 transition: 'transform 0.6s',
//                 transform: flippedCards[index] ? 'rotateY(180deg)' : 'none'
//               }}>
//                 <div style={{
//                   position: 'absolute',
//                   width: '100%',
//                   height: '100%',
//                   backfaceVisibility: 'hidden',
//                   backgroundColor: '#fff',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   padding: '10px',
//                   boxSizing: 'border-box'
//                 }}>
//                   <div style={{ fontWeight: 'bold' }}>{flashcard.question}</div>
//                 </div>
//                 <div style={{
//                   position: 'absolute',
//                   width: '100%',
//                   height: '100%',
//                   backfaceVisibility: 'hidden',
//                   backgroundColor: '#fff',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   padding: '10px',
//                   boxSizing: 'border-box',
//                   transform: 'rotateY(180deg)'
//                 }}>
//                   <div>{flashcard.answer}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <h2 style={{ textAlign: 'center', marginTop: '20px' }}>Suggested Flashcards</h2>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
//           {suggestedFlashcards.map((flashcard, index) => (
//             <div key={index} style={{
//               width: '200px',
//               height: '200px',
//               perspective: '1000px'
//             }} onClick={() => toggleFlip(flashcards.length + index)}>
             
//              <div style={{
//                 width: '100%',
//                 height: '100%',
//                 position: 'relative',
//                 transformStyle: 'preserve-3d',
//                 transition: 'transform 0.6s',
//                 transform: flippedCards[flashcards.length + index] ? 'rotateY(180deg)' : 'none'
//               }}>
//                 <div style={{
//                   position: 'absolute',
//                   width: '100%',
//                   height: '100%',
//                   backfaceVisibility: 'hidden',
//                   backgroundColor: '#fff',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   padding: '10px',
//                   boxSizing: 'border-box'
//                 }}>
//                   <div style={{ fontWeight: 'bold' }}>{flashcard.question}</div>
//                 </div>
//                 <div style={{
//                   position: 'absolute',
//                   width: '100%',
//                   height: '100%',
//                   backfaceVisibility: 'hidden',
//                   backgroundColor: '#fff',
//                   border: '1px solid #ccc',
//                   borderRadius: '5px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   padding: '10px',
//                   boxSizing: 'border-box',
//                   transform: 'rotateY(180deg)'
//                 }}>
//                   <div>{flashcard.answer}</div>
//                 </div>
//               </div>
//               <button
//                 style={{
//                   marginTop: '10px',
//                   padding: '10px 20px',
//                   border: 'none',
//                   borderRadius: '5px',
//                   backgroundColor: '#92C7CF',
//                   color: '#fff',
//                   cursor: 'pointer',
//                   float: 'left',
//                 }}
//                 onClick={() => addSuggestedFlashcard(flashcard.question, flashcard.answer, index)}
//               >
//                 Add
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FlashcardApp;


import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const FlashcardApp = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [suggestedFlashcards, setSuggestedFlashcards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);

  useEffect(() => {
    async function fetchFlashcards() {
      try {
        const response = await fetch(`http://localhost:5000/get_flashcards?collection_id=${localStorage.getItem('currentCollection')}&section_id=${localStorage.getItem('currentSection')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }
        const data = await response.json();
        setFlashcards(data.flashcards);
      } catch (error) {
        console.error('Error fetching flashcards:', error.message);
      }
    }

    const suggestFlashcards = async () => {
      try {
        const response = await fetch('http://localhost:5000/suggestflashcards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionId: localStorage.getItem('currentCollection'),
            sectionId: localStorage.getItem('currentSection'),
          }),
        });
    
        if (!response.ok) {
          throw new Error('Failed to suggest flashcards');
        }
    
        const data = await response.json();
        // Take only the first three elements of the array
        setSuggestedFlashcards(data.response.slice(0, 3));
      } catch (error) {
        console.error('Error suggesting flashcards:', error.message);
      }
    };
    
    fetchFlashcards();
    suggestFlashcards();
  }, []);

  const addFlashcard = async () => {
    if (question.trim() === '' || answer.trim() === '') {
      alert('Please enter both question and answer.');
      return;
    }

    setFlashcards([...flashcards, { question, answer }]);
    setQuestion('');
    setAnswer('');

    try {
      const response = await fetch('http://localhost:5000/addflashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: localStorage.getItem('currentCollection'),
          sectionId: localStorage.getItem('currentSection'),
          question: question,
          answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add flashcard');
      }

      setShowModal(false);
      console.log('Flashcard added successfully!');
    } catch (error) {
      console.error('Error adding flashcard:', error.message);
    }
  };

  const addSuggestedFlashcard = async (question, answer, index) => {
    try {
      const response = await fetch('http://localhost:5000/addflashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: localStorage.getItem('currentCollection'),
          sectionId: localStorage.getItem('currentSection'),
          question: question,
          answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add flashcard');
      }

      const updatedSuggestions = [...suggestedFlashcards];
      updatedSuggestions.splice(index, 1);
      setSuggestedFlashcards(updatedSuggestions);

      console.log('Flashcard added successfully!');
    } catch (error) {
      console.error('Error adding flashcard:', error.message);
    }
  };

  const toggleFlip = (index) => {
    setFlippedCards((prevFlippedCards) => {
      const newFlippedCards = [...prevFlippedCards];
      newFlippedCards[index] = !newFlippedCards[index];
      return newFlippedCards;
    });
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '3.5rem', color: 'gray' }}>Flashcards</h2>

        {showModal && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000' // Ensuring modal is on top layer
          }}>
<div style={{
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  width: '600px' // Adjust the width as needed
}}>
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
                onClick={() => setShowModal(false)}
              >&times;</span>
              <form onSubmit={(e) => { e.preventDefault(); addFlashcard(); }}>
                <input
                  type="text"
                  placeholder="Enter question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  style={{ width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '30px' }}
                />
                <input
                  type="text"
                  placeholder="Enter answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  style={{ width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <button
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#92C7CF',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowModal(true)}
                  >
                    Add Flashcard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#92C7CF',
              color: '#fff',
              cursor: 'pointer'
            }}
            onClick={() => setShowModal(true)}
          >
            Add Flashcard
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {flashcards.map((flashcard, index) => (
            <div key={index} style={{
              width: '200px',
              height: '200px',
              perspective: '1000px'
            }} onClick={() => toggleFlip(index)}>
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: flippedCards[index] ? 'rotateY(180deg)' : 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ fontWeight: 'bold' }}>{flashcard.question}</div>
                </div>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  boxSizing: 'border-box',
                  transform: 'rotateY(180deg)'
                }}>
                  <div>{flashcard.answer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ textAlign: 'center', marginTop: '20px'}}>Suggested Flashcards</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '5%' }}>
          {suggestedFlashcards.map((flashcard, index) => (
            <div key={index} style={{
              width: '200px',
              height: '200px',
              perspective: '1000px'
            }} onClick={() => toggleFlip(flashcards.length + index)}>
             
             <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: flippedCards[flashcards.length + index] ? 'rotateY(180deg)' : 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ fontWeight: 'bold' }}>{flashcard.question}</div>
                </div>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  boxSizing: 'border-box',
                  transform: 'rotateY(180deg)'
                }}>
                  <div>{flashcard.answer}</div>
                </div>
              </div>
              <button
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: '#92C7CF',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                onClick={() => addSuggestedFlashcard(flashcard.question, flashcard.answer, index)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardApp;
