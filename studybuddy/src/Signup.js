import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config/firebaseSetup';
import './styles/signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');  // Clear any previous error messages

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
            navigate("/login");
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            if (errorCode === 'auth/weak-password') {
                setErrorMessage('Password should be at least 6 characters.');
            } else {
                setErrorMessage(errorMessage);
            }
        }
    };

    return (
        <main className="signup-main">
            <section className="signup-section">
                <div className="signup-container">
                    <div className="signup-content">
                        <h1>Sign Up</h1>
                        <form className="signup-form" onSubmit={onSubmit}>
                            <div className="input-group">
                                <label htmlFor="email-address">Email address</label>
                                <input
                                    type="email"
                                    id="email-address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Email address"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Password"
                                />
                            </div>
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            <button type="submit">Sign up</button>
                        </form>
                        <p>
                            Already have an account?{' '}
                            <NavLink to="/login">Sign in</NavLink>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Signup;