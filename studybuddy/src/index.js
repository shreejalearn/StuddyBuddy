import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import FillerAuth from './FillerAuth';
import AskQuestion from './AskQuestion';
import Home from './Home';
import CollectionsPage from './CollectionsPage';
import OpenedCollection from './OpenedCollection';
import UploadData from './uploadData';
import Sections from './Sections';
import Chapter from './Chapter';

import reportWebVitals from './reportWebVitals';


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<FillerAuth />} />
        <Route path="/upload" element={<App />} />
        <Route path="/question" element={<AskQuestion />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mygallery" element={<CollectionsPage />} />
        <Route path="/openedcollection" element={<OpenedCollection />} />
        <Route path="/uploaddata" element={<UploadData />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/chapter" element={<Chapter />} />

      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
