import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import FillerAuth from './FillerAuth';
import AskQuestion from './AskQuestion';
import CollectionGallery from './CollectionGallery';
import CollectionsPage from './CollectionsPage';


import reportWebVitals from './reportWebVitals';


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<FillerAuth />} />
        <Route path="/upload" element={<App />} />
        <Route path="/question" element={<AskQuestion />} />
        <Route path="/gallery" element={<CollectionGallery />} />
        <Route path="/mygallery" element={<CollectionsPage />} />

      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
