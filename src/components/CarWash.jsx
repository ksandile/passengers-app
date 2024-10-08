import React from 'react';
import './Services.css';
import carWashImage from '../assets/car-wash.jpg';

function CarWash({ onRequestClick }) {
  return (
    <div className="service-container">
      <img src={carWashImage} alt="Car Wash" />
      <h2>Car Wash</h2>
      <p>Request a car wash service.</p>
      <button onClick={onRequestClick}>Request Car Wash</button>
    </div>
  );
}

export default CarWash;
