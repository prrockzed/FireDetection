import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import MQTTLogs from './components/MQTTLogs';
import Navbar from './components/Navbar';
import './components/style.css';
import ExcelJS from 'exceljs';
import axios from 'axios';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Fetch logs from the backend with authentication
      const response = await axios.get('http://localhost:8080/api/logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const allLogs = response.data;

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Fire Detection System';
      workbook.created = new Date();

      // Function to determine fire status from sensor values
      const getFireStatus = (sensor1, sensor2, analogSensor) => {
        // Adjust these thresholds based on your actual requirements
        if (analogSensor > 500 || sensor1 > 200 || sensor2 > 200) {
          return 'DANGER';
        } else if (analogSensor > 300 || sensor1 > 100 || sensor2 > 100) {
          return 'WARNING';
        }
        return 'NORMAL';
      };

      // Process data for each node (assuming node_id is 1 or 2)
      [1, 2].forEach(nodeId => {
        const nodeLogs = allLogs.filter(log => log.node_id === nodeId);
        const sheet = workbook.addWorksheet(`Node ${nodeId}`);

        // Define columns
        sheet.columns = [
          { header: 'Timestamp', key: 'timestamp', width: 25 },
          { header: 'Node ID', key: 'node_id', width: 10 },
          { header: 'Sensor 1', key: 'sensor1', width: 12 },
          { header: 'Sensor 2', key: 'sensor2', width: 12 },
          { header: 'Analog Sensor', key: 'analog_sensor', width: 15 },
          { header: 'Fire Status', key: 'fireStatus', width: 15 }
        ];

        // Add data rows
        nodeLogs.forEach(log => {
          sheet.addRow({
            timestamp: new Date(log.timestamp).toLocaleString(),
            node_id: log.node_id,
            sensor1: log.sensor1,
            sensor2: log.sensor2,
            analog_sensor: log.analog_sensor,
            fireStatus: getFireStatus(log.sensor1, log.sensor2, log.analog_sensor)
          });
        });

        // Style the header row
        sheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          };
        });

        // Auto-filter for the columns
        sheet.autoFilter = {
          from: 'A1',
          to: `${String.fromCharCode(64 + sheet.columns.length)}1`
        };
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create download link
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fire_sensor_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(error.response?.data?.message || 'Failed to download logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="download-container">
      <h2>Download Sensor Data</h2>
      <p>Click the button below to download the latest sensor readings as an Excel file.</p>
      <button 
        className="download-button" 
        onClick={handleDownload}
        disabled={isLoading}
      >  
        {isLoading ? 'Generating Report...' : 'Download Excel Report'}  
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
