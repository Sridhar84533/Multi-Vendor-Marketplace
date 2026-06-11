import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Volume2 } from 'lucide-react';
import API from '../../services/api';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (query.trim().length > 1) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await API.get(`/products?search=${query}&limit=5`);
          setSuggestions(res.data.products || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      // Save query to popular/recent searches simulation
      const recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      if (!recents.includes(query)) {
        recents.unshift(query);
        localStorage.setItem('recentSearches', JSON.stringify(recents.slice(0, 5)));
      }
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  // Voice Search Trigger
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setQuery(speechToText);
      setIsListening(false);
      navigate(`/products?search=${encodeURIComponent(speechToText)}`);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div ref={wrapperRef} className="navbar-search-container" style={{ position: 'relative' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Search Products...'}
          className="navbar-search-input"
          onFocus={() => setShowSuggestions(true)}
        />
        
        {/* Voice Search Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          style={{
            backgroundColor: '#FFF',
            border: 'none',
            padding: '0 8px',
            color: isListening ? 'red' : 'gray',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Search with your voice"
        >
          <Mic size={18} className={isListening ? 'pulse' : ''} />
        </button>

        <button type="submit" className="navbar-search-btn">
          <Search size={20} />
        </button>
      </form>

      {/* Auto Suggestions Overlay */}
      {showSuggestions && (suggestions.length > 0 || localStorage.getItem('recentSearches')) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#FFF',
            color: '#000',
            boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            zIndex: 1002,
            maxHeight: '350px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                setQuery(item.title);
                setShowSuggestions(false);
                navigate(`/products/${item._id}`);
              }}
              style={{
                padding: '0.8rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid #EEE',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              className="suggestion-item"
            >
              <Search size={14} color="#888" />
              <span>{item.title}</span>
            </div>
          ))}
          {/* Recent searches display if input is empty */}
          {query.trim().length === 0 && localStorage.getItem('recentSearches') && (
            <div style={{ padding: '0.8rem' }}>
              <h5 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Recent Searches</h5>
              {JSON.parse(localStorage.getItem('recentSearches') || '[]').map((search, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQuery(search);
                    setShowSuggestions(false);
                    navigate(`/products?search=${encodeURIComponent(search)}`);
                  }}
                  style={{
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Search size={12} color="#AAA" />
                  {search}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
