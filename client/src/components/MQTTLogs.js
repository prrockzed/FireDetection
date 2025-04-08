import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const MQTTLogs = () => {
  const [node1Logs, setNode1Logs] = useState([]);
  const [node2Logs, setNode2Logs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate fire status based on sensor readings
  const determineFireStatus = (sensorData) => {
    // You can adjust this logic based on your specific thresholds
    if (sensorData.sensor1 > 500 || sensorData.sensor2 > 500 || sensorData.analog_sensor > 700) {
      return "ALERT";
    }
    return "Normal";
  };
  
  // Format a single log entry
  const formatLogEntry = (log) => {
    const fireStatus = determineFireStatus(log);
    return {
      id: log._id,
      text: `[${new Date(log.timestamp).toLocaleTimeString()}] Sensor1: ${log.sensor1}, Sensor2: ${log.sensor2}, Analog: ${log.analog_sensor}`,
      status: fireStatus
    };
  };
  
  // Fetch all logs and distribute between nodes
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        // Fetch all logs
        const response = await axios.get('http://firedetection-server.onrender.com/api/logs');
        const allLogs = response.data;
        
        // Distribute logs between nodes
        const node1LogsArray = [];
        const node2LogsArray = [];
        
        allLogs.forEach(log => {
          // Format the log entry
          const formattedLog = formatLogEntry(log);
          
          // Distribute by node_id (matches the Python structure)
          if (log.node_id === 1) {
            node1LogsArray.push(formattedLog);
          } else if (log.node_id === 2) {
            node2LogsArray.push(formattedLog);
          }
        });
        
        setNode1Logs(node1LogsArray);
        setNode2Logs(node2LogsArray);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
    
    // Set up Socket.IO for real-time updates
    const socket = io('http://firedetection-server.onrender.com');
    
    socket.on('sensor_data', (allLogs) => {
      console.log('Received real-time sensor data update');
      
      const node1LogsArray = [];
      const node2LogsArray = [];
      
      allLogs.forEach(log => {
        const formattedLog = formatLogEntry(log);
        
        if (log.node_id === 1) {
          node1LogsArray.push(formattedLog);
        } else if (log.node_id === 2) {
          node2LogsArray.push(formattedLog);
        }
      });
      
      setNode1Logs(node1LogsArray);
      setNode2Logs(node2LogsArray);
      setIsLoading(false);
    });
    
    socket.on('new_sensor_data', (newLog) => {
      console.log('Received new sensor data');
      const formattedLog = formatLogEntry(newLog);
      
      if (newLog.node_id === 1) {
        setNode1Logs(prevLogs => [formattedLog, ...prevLogs]);
      } else if (newLog.node_id === 2) {
        setNode2Logs(prevLogs => [formattedLog, ...prevLogs]);
      }
    });
    
    // Set up fallback periodic refresh
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30 seconds
    
    // Clean up on unmount
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);
  
  return (
    <div className="logsContainer">
      <h2>📡 Fire Detection Logs</h2>
      <div className="logsWrapper">
        <div className="logBox">
          <h3>Node 1</h3>
          <div className="logs">
            {isLoading ? (
              <div className="loading">Loading logs...</div>
            ) : node1Logs.length > 0 ? (
              node1Logs.map((log, index) => (
                <div 
                  key={log.id || index} 
                  className={`logEntry ${log.status === "ALERT" ? "alert" : ""}`}
                >
                  {log.text}
                  {log.status === "ALERT" && <span className="alertBadge">ALERT</span>}
                </div>
              ))
            ) : (
              <div className="noLogs">No logs available for Node 1</div>
            )}
          </div>
        </div>
        <div className="logBox">
          <h3>Node 2</h3>
          <div className="logs">
            {isLoading ? (
              <div className="loading">Loading logs...</div>
            ) : node2Logs.length > 0 ? (
              node2Logs.map((log, index) => (
                <div 
                  key={log.id || index} 
                  className={`logEntry ${log.status === "ALERT" ? "alert" : ""}`}
                >
                  {log.text}
                  {log.status === "ALERT" && <span className="alertBadge">ALERT</span>}
                </div>
              ))
            ) : (
              <div className="noLogs">No logs available for Node 2</div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .logsContainer {
          margin: 20px;
        }
        .logsWrapper {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .logBox {
          flex: 1;
          min-width: 300px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background-color: #f8f8f8;
        }
        .logs {
          height: 400px;
          overflow-y: auto;
          background-color: #fff;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;
        }
        .logEntry {
          padding: 8px;
          border-bottom: 1px solid #eee;
          font-family: monospace;
          font-size: 14px;
        }
        .logEntry.alert {
          background-color: #ffeaea;
          border-left: 3px solid #ff5252;
        }
        .alertBadge {
          display: inline-block;
          background-color: #ff5252;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 8px;
        }
        .loading, .noLogs {
          padding: 20px;
          text-align: center;
          color: #888;
        }
      `}</style>
    </div>
  );
};

export default MQTTLogs;
