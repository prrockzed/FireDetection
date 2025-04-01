import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import MQTTLogs from './components/MQTTLogs';
import Navbar from './components/Navbar';
import './components/style.css';

const App = () => {
  const [loggedInUser, setLoggerInUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('liveLogs'); // New state for active tab

  return (
    <div className="app-container">
      {loggedInUser ? (
        <>
          <Navbar loggedInUser={loggedInUser} setLoggedInUser={setLoggerInUser} />
          <div className="main-content">
            <div className="tabs-container">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'liveLogs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('liveLogs')}
                >
                  Live Logs
                </button>
                <button
                  className={`tab ${activeTab === 'download' ? 'active' : ''}`}
                  onClick={() => setActiveTab('download')}
                >
                  Download
                </button>
                <button
                  className={`tab ${activeTab === 'chatbot' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chatbot')}
                >
                  Chatbot
                </button>
              </div>
            </div>
            <div className="tab-content">
              {activeTab === 'liveLogs' && <MQTTLogs />}
              {activeTab === 'download' && <DownloadTab />}
              {activeTab === 'chatbot' && <ChatbotTab />}
            </div>
          </div>
        </>
      ) : (
        <div className="auth-container">
          {showRegister ? (
            <Register setShowRegister={setShowRegister} />
          ) : (
            <Login
              setLoggedInUser={setLoggerInUser}
              setShowRegister={setShowRegister}
            />
          )}
        </div>
      )}
    </div>
  );
};

// New component for Download tab
const DownloadTab = () => {
  const handleDownload = () => {
    // Implement download functionality here
    console.log("Downloading data as PDF...");
    // You would typically make an API call here to generate and download the PDF
  };

  return (
    <div className="download-container">
      <h2>Download Data</h2>
      <p>Click the button below to download the current node status data as a PDF.</p>
      <button className="download-button" onClick={handleDownload}>
        Download as PDF
      </button>
    </div>
  );
};

// New component for Chatbot tab
const ChatbotTab = () => {
  return (
    <div className="chatbot-container">
      <h2>Chatbot</h2>
      <p>Chatbot functionality will be implemented here.</p>
    </div>
  );
};

export default App;
