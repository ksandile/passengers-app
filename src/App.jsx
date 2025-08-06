// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Subscription from './pages/Subscription';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import useAuth from './hooks/useAuth'; 
import 'leaflet/dist/leaflet.css';

function App() {
  const user = useAuth(); // Get the current user

  return (
    <Router>
      <Header />
      <Routes>
        {/* If user is not signed in, redirect to Sign In */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/sign-in" />} />
        <Route path="/about" element={user ? <About /> : <Navigate to="/sign-in" />} />
        <Route path="/contact" element={user ? <Contact /> : <Navigate to="/sign-in" />} />
        <Route path="/subscription" element={user ? <Subscription /> : <Navigate to="/sign-in" />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
