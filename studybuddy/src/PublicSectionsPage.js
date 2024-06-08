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
        const response = await axios.get(`http://localhost:5000/get_my_collections?username=${username}`);        setExistingCollections(response.data.collections);
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
          collectionName: newCollectionName
        };
      }
      const res= await axios.post('http://localhost:5000/clone_section', {
        payload
      });
      // await axios.post(`http://localhost:5000/clone_section`, payload);
      console.log('Section cloned successfully');
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
        {publicSections.map(section => (
          <div key={section.id}>
            <button className="category-btn" onClick={() => handleSectionClick(section.id, section.collectionId)}>
              {section.title || 'Untitled'}
            </button>
            {selectedSection === section.id && (
              <div className="modal">
                <div className="modal-content">
                  <span className="close" onClick={() => setSelectedSection(null)}>&times;</span>
                  <h2>Source Summaries:</h2>
                  {sectionNotes.map((note, index) => (
                    <p key={note.id}>{note.tldr}</p>
                  ))}
                  <label>
                    <input
                      type="checkbox"
                      checked={addToExisting}
                      onChange={(e) => setAddToExisting(e.target.checked)}
                    />
                    Add to existing collection
                  </label>
                  {addToExisting ? (
                    <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)}>
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
                    />
                  )}
                  <br />
                  <button onClick={() => handleClone(section.id)}>Clone Section</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
