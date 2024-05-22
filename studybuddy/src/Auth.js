// Auth.js

import React, { useState, useEffect } from 'react';
import firebaseApp from './firebaseSetup';

const Auth = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = firebaseApp.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await firebaseApp.auth().createUserWithEmailAndPassword(email, password);
      setEmail('');
      setPassword('');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await firebaseApp.auth().signInWithEmailAndPassword(email, password);
      setEmail('');
      setPassword('');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      {error && <p>{error}</p>}
      <form>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={handleSignUp}>
          Sign Up
        </button>
        <button type="button" onClick={handleSignIn}>
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Auth;
