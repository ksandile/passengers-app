import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Services.css';

// Import your service components
import CarWash from './CarWash';
import HouseCleaning from './HouseCleaning';
import GardenMaintenance from './GardenMaintenance';
import Laundry from './Laundry';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASb3wPvq4cksVCM3OzLE_s74gzpwdPC1E",
  authDomain: "gggg-2164a.firebaseapp.com",
  databaseURL: "https://gggg-2164a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gggg-2164a",
  storageBucket: "gggg-2164a.appspot.com",
  messagingSenderId: "383686120816",
  appId: "1:383686120816:web:70c4d29740d9cc95322bb5",
  measurementId: "G-QL58FC4WP5"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Example function to send request data to Firestore
const sendRequest = async (requestData) => {
  try {
    await addDoc(collection(firestore, 'requests'), {
      ...requestData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending request:', error);
  }
};

function Services() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const autocompleteRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);


  // useEffect(() => {
  //   if (showSearchBar) {
  //     const script = document.createElement('script');
  //     script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
  //     script.async = true;
  //     script.onload = () => {
  //       const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
  //         types: ['geocode'],
  //         componentRestrictions: { country: 'sa' }
  //       });
  //       autocomplete.addListener('place_changed', () => {
  //         const place = autocomplete.getPlace();
  //         setSearchInput(place.formatted_address);
  //       });
  //     };
  //     document.head.appendChild(script);
  //   }
  // }, [showSearchBar]);
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchInput.length > 2) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              searchInput
            )}&format=json&addressdetails=1&limit=5`
          );
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchInput]);

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion.display_name);
    setSuggestions([]); // hide dropdown
  };

  const handleRequestClick = (serviceType) => {
    setSelectedServiceType(serviceType);
    setShowSearchBar(true);
  };

  const handleCloseSearchBar = () => {
    setShowSearchBar(false);
    setSearchInput(''); 
    setRequestSubmitted(false); 
  };

  const handleRequestSubmit = async () => {
    const requestData = {
      address: searchInput,
      serviceType: selectedServiceType,
      timestamp: serverTimestamp(),
    };

    await sendRequest(requestData);
    setRequestSubmitted(true);
  };

  return (
    <div className="services-container">
      <div className="services-row">
        <CarWash onRequestClick={() => handleRequestClick('Car Wash')} />
        <HouseCleaning onRequestClick={() => handleRequestClick('House Cleaning')} />
      </div>
      <div className="services-row">
        <GardenMaintenance onRequestClick={() => handleRequestClick('Garden Maintenance')} />
        <Laundry onRequestClick={() => handleRequestClick('Laundry')} />
      </div>

      {showSearchBar && (
        <div className="search-bar-overlay">
          <div className="search-bar">
            <button className="close-btn" onClick={handleCloseSearchBar}>×</button>
           <input
              ref={autocompleteRef}
              placeholder="Enter your address or use current location"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-item"
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
