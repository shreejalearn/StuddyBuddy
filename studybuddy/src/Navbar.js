import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './styles/homepage.css';
import Logo from './assets/logo (2).png';

const Navbar = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const { logout } = useAuth();

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          localStorage.setItem('searchTerm', searchTerm);
          navigate(`/publicsections`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <nav>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/homepage">
                        <img src={Logo} alt="Logo" />
                    </Link>
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
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;