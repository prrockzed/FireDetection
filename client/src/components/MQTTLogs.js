import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MQTTLogs = () => {
  const [node1Logs, setNode1Logs] = useState([]);
  const [node2Logs, setNode2Logs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all logs and distribute between nodes
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        // Fetch all logs
        const response = await axios.get('http://localhost:8080/api/logs');
        const allLogs = response.data;
        
        // Distribute logs between nodes
        const node1LogsArray = [];
        const node2LogsArray = [];
        
        allLogs.forEach(log => {
          // Format the log entry
          const formattedLog = `[${new Date(log.timestamp).toLocaleTimeString()}] Node ${log.nodeId}: Fire Status ${log.fireStatus}`;
          
          // Distribute by nodeId
          if (log.nodeId === 1) {
            node1LogsArray.push(formattedLog);
          } else if (log.nodeId === 2) {
            node2LogsArray.push(formattedLog);
          }
        });
        
        // Sort logs by timestamp
        node1LogsArray.sort();
        node2LogsArray.sort();
        
        setNode1Logs(node1LogsArray);
        setNode2Logs(node2LogsArray);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
    
    // Set up periodic refresh (optional)
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30 seconds
    
    // Clean up on unmount
    return () => clearInterval(interval);
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
                <div key={index} className="logEntry">
                  {log}
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
                <div key={index} className="logEntry">
                  {log}
                </div>
              ))
            ) : (
              <div className="noLogs">No logs available for Node 2</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MQTTLogs;
