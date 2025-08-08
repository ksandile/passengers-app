import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Services.css';

// Import Leaflet & Geocoder JS and CSS
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder'; // <-- JS import for geocoder

// Your service components
import CarWash from './CarWash';
import HouseCleaning from './HouseCleaning';
import GardenMaintenance from './GardenMaintenance';
import Laundry from './Laundry';

// Firebase config
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

  // Declare the mapRef to fix "not defined"
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (showSearchBar && !mapRef.current) {
      const map = L.map('map').setView([-33.9249, 18.4241], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map;
    }
  }, [showSearchBar]);

 useEffect(() => {
    if (searchInput.length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
     
        const response = await fetch(
          `https://api.locationiq.com/v1/autocomplete.php?key=pk.f48f6bbd286696b61f51d672a5316610&q=${encodeURIComponent(
            searchInput
          )}&format=json&countrycodes=za`
        );
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error('Autocomplete response is not an array:', data);
          setSuggestions([]);
          return;
        }
        const filtered = data.filter(item =>
          item.display_name.toLowerCase().includes("cape town")
        );

        setSuggestions(filtered);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const handleSearchClick = async () => {
    if (searchInput.length < 3) return;

    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=pk.f48f6bbd286696b61f51d672a5316610&q=${encodeURIComponent(
          searchInput
        )}&format=json&countrycodes=za`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // Find first place that includes "Cape Town"
        const place = data.find(item =>
          item.display_name.toLowerCase().includes("cape town")
        );

        if (!place) {
          alert('Please search within Cape Town only.');
          return;
        }

        setSearchInput(place.display_name || place.label);

        const latNum = parseFloat(place.lat);
        const lonNum = parseFloat(place.lon);

        if (mapRef.current) {
          mapRef.current.setView([latNum, lonNum], 16);

          if (markerRef.current) {
            mapRef.current.removeLayer(markerRef.current);
          }

          const newMarker = L.marker([latNum, lonNum]).addTo(mapRef.current);
          newMarker.bindPopup(place.display_name || place.label).openPopup();
          markerRef.current = newMarker;
        }
      } else {
        alert('No location found. Please refine your search.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location. Please try again.');
    }
  };


  const handleSuggestionClick = (suggestion) => {
    if (!suggestion.display_name.toLowerCase().includes("cape town")) {
      alert("Please select a location within Cape Town.");
      return;
    }
    setSearchInput(suggestion.display_name);
    setSuggestions([]);
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
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      const requestData = {
        address: searchInput,
        serviceType: selectedServiceType,
        latitude,
        longitude,
      };

      try {
        const response = await fetch('https://your-backend.com/api/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          setRequestSubmitted(true);
        } else {
          alert('Failed to send request. Please try again later.');
        }
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    }, (error) => {
      alert('Unable to retrieve your location. Please allow location access.');
    });
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

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              ref={autocompleteRef}
              placeholder="Enter your address or use current location"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="search-btn"
              onClick={handleSearchClick}
              disabled={searchInput.length < 3}
              style={{ flex: 'none', backgroundColor: '#28a745', width: '100px' }}
            >
              Search
            </button>
          </div>
          {/* Add this below */}
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

          {/* Send Request button alone below input+search */}
          {searchInput && !requestSubmitted && (
            <button
              className="request-btn"
              onClick={handleRequestSubmit}
              disabled={!searchInput}
              style={{ width: '100%' }}
            >
              Send Request
            </button>
          )}

          {requestSubmitted && (
            <p className="waiting-message">Wait for the driver to accept your request.</p>
          )}

          <div id="map" style={{ height: '300px', marginTop: '10px' }}></div>
        </div>
        </div>
      )}
    </div>
  );
}

export default Services;
