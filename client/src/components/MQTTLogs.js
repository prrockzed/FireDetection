import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const MQTTLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = io.connect('http://localhost:8000'); // Connect to your Flask server
    
    socket.on('mqtt_message', (data) => {
      console.log('Received MQTT message:', data); // Debug log
      setLogs((prevLogs) => [
        ...prevLogs,
        `[${new Date().toLocaleTimeString()}] ${data.topic}: ${data.message}`,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={styles.logsContainer}>
      <h2>📡 Live MQTT Logs</h2>
      <div style={styles.logs}>
        {logs.map((log, index) => (
          <div key={index} style={styles.logEntry}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  logsContainer: {
    width: '800px',   // Adjust this width to your preference
    margin: '20px auto',
    textAlign: 'center',
    padding: '20px',
  },
  logs: {
    height: '400px',
    overflowY: 'auto',
    border: '2px solid #33ff33',
    backgroundColor: '#000',
    color: '#33ff33',
    padding: '10px',
    fontFamily: "'Courier New', monospace",
    fontSize: '14px',
    whiteSpace: 'pre-wrap',
  },
  logEntry: {
    margin: '2px 0',
  },
};

export default MQTTLogs;
