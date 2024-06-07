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

  const sample = `        Sydney: [1]: https://www.freecodecamp.org/news/functions-in-python-a-beginners-guide/ ""
        [2]: https://www.classes.cs.uchicago.edu/archive/2021/spring/11111-1/happycoding/p5js/creating-functions.html ""
        [3]: https://happycoding.io/tutorials/processing/creating-functions ""
        [4]: https://learn-javascript.dev/docs/functions/ ""
        [5]: https://en.wikipedia.org/wiki/Decomposition_%28computer_science%29 ""
        [6]: https://cs.stanford.edu/people/nick/compdocs/Decomposition_and_Style.pdf ""
        [7]: https://www.knowitallninja.com/lessons/decomposition/ ""
        [8]: https://jarednielsen.com/decomposition/ ""
        [9]: https://www.geeksforgeeks.org/while-loop-in-programming/ ""
        [10]: https://www.geeksforgeeks.org/loops-programming/ ""
        [11]: https://en.wikipedia.org/wiki/While_loop ""
        [12]: https://www.geeksforgeeks.org/while-loop-syntax/ ""
        [13]: https://www.geeksforgeeks.org/for-loop-in-programming/ ""
        [14]: https://en.wikipedia.org/wiki/For_loop ""
        [15]: https://press.rebus.community/programmingfundamentals/chapter/for-loop/ ""

        Certainly! Let's break down each concept and identify key search phrases for relevant static images:

        1. **Creating Functions**:
            - Search phrases: "defining functions in Python," "user-defined functions," "function parameters," "return statement."
            - Summary: Functions in programming allow you to encapsulate reusable code. They take input (parameters), perform specific tasks, and optionally return a result. The syntax for defining a function in Python is straightforward: "def function_name(parameters):". The body of the function contains the code to be executed when the function is called[^1^][1].

        2. **Decomposition**:
            - Search phrases: "Algorithmic decomposition," "structured analysis," "object-oriented decomposition," "functional decomposition."
            - Summary: Decomposition involves breaking down complex problems or systems into smaller, manageable parts. Different types of decomposition exist, including algorithmic decomposition (structured steps), structured analysis (system functions and data entities), and object-oriented decomposition (classes or objects). Functional decomposition replaces a system's functional model with subsystem models[^2^][5].

        3. **While Loops**:
            - Search phrases: "While loop in programming," "entry-controlled loops," "condition-based repetition."
            - Summary: While loops execute a block of code repeatedly as long as a specified condition remains true. They evaluate the condition before each iteration, execute the code block if the condition is true, and terminate when the condition becomes false. Useful for uncertain or dynamically changing situations[^3^][9].

        4. **For Loops**:
            - Search phrases: "For loop in programming," "iterating over a sequence," "fixed number of iterations."
            - Summary: For loops execute a set of statements repetitively based on a specified condition. They are commonly used when you know how many times you want to execute a block of code. The syntax includes initialization, condition, and increment (or decrement) components. Useful for iterating over sequences or performing a fixed number of tasks[^4^][13].

        Feel free to use these search phrases to find relevant static images that enhance student comprehension!
        `
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
      const response = await axios.post('http://localhost:5000/generate_video_from_notes', {
        collection_id: collectionId,
        section_id: sectionId,
        selected_notes: selectedNotes
        // selected_notes: sample
      });
      if (response.data.video_path) {
        setVideoPaths(prevPaths => [...prevPaths, { path: response.data.video_path }]);
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
