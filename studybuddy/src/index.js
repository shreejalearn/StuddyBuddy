// import React from 'react';
// import ReactDOM from 'react-dom';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import './index.css';
// import App from './App';
// import FillerAuth from './FillerAuth';
// import Fill from './Fill';

// import AskQuestion from './AskQuestion';
// import Home from './Home';
// import CollectionsPage from './CollectionsPage';
// import OpenedCollection from './OpenedCollection';
// import UploadData from './uploadData';
// import Sections from './Sections';
// import Chapter from './Chapter';

// // import Auth from './Signup';
// import Login from './Login';
// import Signup from './Signup';

// import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <Router>
//       <Routes>
//         <Route path="/" element={<FillerAuth />} />
//         <Route path="/fill" element={<Fill />} />

//         <Route path="/upload" element={<App />} />
//         {/* <Route path="/auth" element={<Auth />} /> */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/mygallery" element={<CollectionsPage />} />
//         <Route path="/sections" element={<Sections />} />
//         <Route path="/chapter" element={<Chapter />} />

//         <Route path="/question" element={<AskQuestion />} />
//         <Route path="/home" element={<Home />} />
//       </Routes>
//     </Router>
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// reportWebVitals();




import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import FillerAuth from './FillerAuth';
import Fill from './Fill';

import AskQuestion from './AskQuestion';
import Home from './Home';
import CollectionsPage from './CollectionsPage';
import OpenedCollection from './OpenedCollection';
import Sections from './Sections';
import Chapter from './Chapter';

import Login from './Login';
import Signup from './Signup';
import PrivateRoutes from './PrivateRoutes';
import { AuthProvider } from './AuthContext'; // Import AuthProvider

import reportWebVitals from './reportWebVitals';

function MainApp() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/fill" element={<Fill />} />
            <Route path="/upload" element={<App />} />
            <Route path="/mygallery" element={<CollectionsPage />} />
            <Route path="/sections" element={<Sections />} />
            <Route path="/chapter" element={<Chapter />} />
            <Route path="/question" element={<AskQuestion />} />
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="/" element={<FillerAuth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
