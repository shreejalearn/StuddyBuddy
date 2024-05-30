// import React, { useState } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from './config/firebaseSetup';
// import './styles/login.css';

// const Login = () => {
//     const navigate = useNavigate();

//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const onSubmit = async (e) => {
//         e.preventDefault();

//         await signInWithEmailAndPassword(auth, email, password)
//             .then((userCredential) => {
//                 const user = userCredential.user;
//                 console.log(user);
//                 localStorage.setItem('userName', email);
//                 navigate("/mygallery");
//             })
//             .catch((error) => {
//                 const errorCode = error.code;
//                 const errorMessage = error.message;
//                 console.log(errorCode, errorMessage);
//             });
//     };

//     return (
//         <main className="login-main">
//             <section className="login-section">
//                 <div className="login-container">
//                     <div className="login-content">
//                         <h1>Log In</h1>
//                         <form className="login-form">
//                             <div className="input-group">
//                                 <label htmlFor="email-address">Email address</label>
//                                 <input
//                                     type="email"
//                                     id="email-address"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     required
//                                     placeholder="Email address"
//                                 />
//                             </div>
//                             <div className="input-group">
//                                 <label htmlFor="password">Password</label>
//                                 <input
//                                     type="password"
//                                     id="password"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     required
//                                     placeholder="Password"
//                                 />
//                             </div>
//                             <button type="submit" onClick={onSubmit}>Log in</button>
//                         </form>
//                         <p>
//                             Don't have an account?{' '}
//                             <NavLink to="/auth">Sign up</NavLink>
//                         </p>
//                     </div>
//                 </div>
//             </section>
//         </main>
//     );
// };

// export default Login;


// Login.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config/firebaseSetup';
import { useAuth } from './AuthContext'; // Import useAuth
import './styles/login.css';
// import { CookiesProvider, useCookies } from 'react-cookie'


const Login = () => {
    // const [cookies, setCookie] = useCookies(['user'])

    const navigate = useNavigate();
    const { login } = useAuth(); // Use the login function from the context

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
            login(user.accessToken); // Update the context with the token
            // setCookie('user', user, { path: '/' })
            localStorage.setItem('userName', email);
            navigate("/mygallery");
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        }
    };

    return (
        <main className="login-main">
            <section className="login-section">
                <div className="login-container">
                    <div className="login-content">
                        <h1>Log In</h1>
                        <form className="login-form" onSubmit={onSubmit}>
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
                            <button type="submit">Log in</button>
                        </form>
                        <p>
                            Don't have an account?{' '}
                            <NavLink to="/auth">Sign up</NavLink>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;
