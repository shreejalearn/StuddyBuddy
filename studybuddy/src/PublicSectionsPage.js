import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from './assets/logo (2).png';

const HomePage = () => {
  const navigate = useNavigate();
  const [publicSections, setPublicSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionNotes, setSectionNotes] = useState([]);
  const [existingCollections, setExistingCollections] = useState([]);
  const [addToExisting, setAddToExisting] = useState(true); // Default to adding to existing collection
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  
  const username = localStorage.getItem('userName');
  const st = localStorage.getItem('searchTerm');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      localStorage.setItem('searchTerm', searchTerm);
      navigate(`/publicsections`);
    }
  };

  useEffect(() => {
    const fetchPublicSections = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/search_public_sections?search_term=${st}&name=${username}`);
        setPublicSections(response.data.sections);
      } catch (error) {
        console.error('Error fetching public sections:', error);
      }
    };

    fetchPublicSections();
  }, [st, username]);

  useEffect(() => {
    const fetchExistingCollections = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/get_my_collections?username=${username}`);
        setExistingCollections(response.data.collections);
        console.log(response.data.collections);
      } catch (error) {
        console.error('Error fetching existing collections:', error);
      }
    };

    fetchExistingCollections();
  }, []);

  const handleSectionClick = async (sectionId, collectionId) => {
    setSelectedSection(sectionId);
    try {
      const response = await axios.get('http://localhost:5000/get_notes', {
        params: {
          collection_id: collectionId,
          section_id: sectionId
        }
      });
      const notes = response.data.notes;
      setSectionNotes(notes);
      setShowModal(true); // Open the modal
      console.log(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };
  const handleClone = async (sectionId) => {
    try {
      let payload;
      if (addToExisting) {
        payload = {
          sectionId: sectionId,
          addToExisting: true,
          collectionId: selectedCollectionId
        };
      } else {
        payload = {
          sectionId: sectionId,
          addToExisting: false,
          collectionName: newCollectionName,
          username: localStorage.getItem('userName')
        };
      }
      console.log(payload);
  
      const res = await axios.post('http://localhost:5000/clone_section', payload);
      console.log(res);
      console.log('Section cloned successfully');
      
      // After cloning, navigate to '/mygallery'
      navigate('/mygallery');
    } catch (error) {
      console.error('Error cloning section:', error);
    }
  };  

  return (
    <div>
      <nav style={{ backgroundColor: 'lightblue', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Logo" style={{ height: '100px', marginRight: '1rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
          <input 
            type="text" 
            placeholder="Search public sets..." 
            style={{ padding: '0.5rem', width: '400px', color: 'gray', border: '1px solid gray', borderColor: 'gray' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/mygallery')} style={{ padding: '0.5rem 1rem' }}>Your Collections</button>
        </div>
      </nav>
      <div className="landing-content">
        <p>Search Results</p>
        {publicSections.length === 0 ? (
          <p className='no-results' style={{ textAlign: 'center', color: '#EE4E4E' }}>No results found...</p>
        ) : 
        publicSections.map(section => (
          <div key={section.id}>
            <button className="category-btn" onClick={() => handleSectionClick(section.id, section.collectionId)}>
              {section.title || 'Untitled'}
            </button>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal" style={{ 
  display: 'block', 
  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  zIndex: 999 
}}>
  <div className="modal-content" style={{ 
    backgroundColor: '#fefefe', 
    margin: '15% auto', 
    padding: '4%', 
    border: '1px solid #888', 
    width: '80%', 
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)', 
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center-align content horizontally
    justifyContent: 'center', // Center-align content vertically
  }}>
    <span className="close" onClick={() => setShowModal(false)} style={{ 
      color: '#EE4E4E', 
      cursor: 'pointer', 
      position: 'absolute',
      top: '36%',
      right: '10%',
      fontSize: '30px', 
    }}>&times;</span>

    <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#a2acb0' }}>Source Summaries:</h2>
    {sectionNotes.map((note, index) => (
      <p style={{ color: '#a2acb0', textAlign: 'center'}} key={note.id}>{note.tldr}</p>
    ))}
    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <input
        type="checkbox"
        checked={addToExisting}
        onChange={(e) => setAddToExisting(e.target.checked)}
        style={{
          appearance: 'none',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid #ccc',
          outline: 'none',
          cursor: 'pointer',
          marginRight: '5px', // Adjust as needed for spacing
          verticalAlign: 'middle', // Align checkbox with adjacent text
          backgroundColor: addToExisting ? '#ccc' : 'transparent', // Change background color based on checkbox state
        }}
      />
      Add to existing collection
    </label>
    {addToExisting ? (
      <select 
  value={selectedCollectionId} 
  onChange={(e) => setSelectedCollectionId(e.target.value)} 
  style={{ 
    marginBottom: '2rem',
    padding: '0.5rem', 
    width: '100%', // Make the select element full width
    color: '#333', // Adjust text color for better contrast
    border: '1px solid #ccc', // Lighten border color
    borderRadius: '5px', // Adding border radius for rounded corners
    outline: 'none', // Remove the outline on focus
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Add a subtle shadow for depth
    transition: 'border-color 0.2s, box-shadow 0.2s', // Smooth transition for border and shadow changes
  }}
>
  <option value="">Select existing collection</option>
  {existingCollections.map(collection => (
    <option key={collection.id} value={collection.id}>
      {collection.title}
    </option>
  ))}
</select>
    ) : (
      <input
        type="text"
        placeholder="Enter new collection name"
        value={newCollectionName}
        onChange={(e) => setNewCollectionName(e.target.value)}
        style={{     
          padding: '0.5rem',
          width: '400px',
          color: '#333', // Adjust text color for better contrast
          border: '1px solid #ccc', // Lighten border color
          borderRadius: '5px', // Adding border radius for rounded corners
          outline: 'none', // Remove the outline on focus
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Add a subtle shadow for depth
          transition: 'border-color 0.2s, box-shadow 0.2s', // Smooth transition for border and shadow changes
          marginBottom: '2rem',
            }}
      />
    )}
<button 
  onClick={() => handleClone(selectedSection)} 
  style={{ 
    alignSelf: 'center', // Align the button to the center horizontally
    padding: '0.5rem 1rem', // Add padding for better visual appeal
    color: '#fff', // Set text color to white for better contrast
    border: 'none', // Remove border
    borderRadius: '5px', // Add border radius for rounded corners
    outline: 'none', // Remove outline on focus
    cursor: 'pointer', // Add pointer cursor on hover
    transition: 'background-color 0.3s', // Smooth transition for background color change
  }}
>
  Clone Section
</button>
  </div>
</div>
      )}
    </div>
  );
};

export default HomePage;
