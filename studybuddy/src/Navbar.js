
import React, { useState, useEffect } from 'react';

import './styles/homepage.css';
import { useNavigate } from 'react-router-dom';
import Logo from './assets/logo (2).png';

const Navbar = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          localStorage.setItem('searchTerm', searchTerm);
          navigate(`/publicsections`);
        }
    };
    return(
        <div>
            <nav>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={Logo} alt="Logo" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center', borderRadius: '7px' }}>
                <input 
                    type="text" 
                    placeholder="Search public sets..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress} 
                />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => navigate('/mygallery')}>Your Collections</button>
                </div>
            </nav>
        </div>
    );

};
export default Navbar;