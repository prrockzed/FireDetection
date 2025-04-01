import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MQTTLogs = () => {
  const [node1Logs, setNode1Logs] = useState([]);
  const [node2Logs, setNode2Logs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all logs and distribute randomly between nodes
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        // Fetch all logs
        const response = await axios.get('http://localhost:8080/api/logs');
        const allLogs = response.data;
        
        // Randomly distribute logs between nodes
        const node1LogsArray = [];
        const node2LogsArray = [];
        
        allLogs.forEach(log => {
          // Format the log entry
          const formattedLog = `[${new Date(log.timestamp).toLocaleTimeString()}] Node ${log.nodeId}: Fire Status ${log.fireStatus}`;
          
          // If log already has a nodeId, respect it
          if (log.nodeId === 1) {
            node1LogsArray.push(formattedLog);
          } else if (log.nodeId === 2) {
            node2LogsArray.push(formattedLog);
          }
        });
        
        // Sort logs by timestamp (assuming the timestamp is part of the log string)
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
  }, []);

  return (
    <div style={styles.logsContainer}>
      <h2>📡 Fire Detection Logs</h2>
      <div style={styles.logsWrapper}>
        <div style={styles.logBox}>
          <h3>Node 1</h3>
          <div style={styles.logs}>
            {isLoading ? (
              <div style={styles.loading}>Loading logs...</div>
            ) : node1Logs.length > 0 ? (
              node1Logs.map((log, index) => (
                <div key={index} style={styles.logEntry}>
                  {log}
                </div>
              ))
            ) : (
              <div style={styles.noLogs}>No logs available for Node 1</div>
            )}
          </div>
        </div>
        
        <div style={styles.logBox}>
          <h3>Node 2</h3>
          <div style={styles.logs}>
            {isLoading ? (
              <div style={styles.loading}>Loading logs...</div>
            ) : node2Logs.length > 0 ? (
              node2Logs.map((log, index) => (
                <div key={index} style={styles.logEntry}>
                  {log}
                </div>
              ))
            ) : (
              <div style={styles.noLogs}>No logs available for Node 2</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  logsContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '20px auto',
    textAlign: 'center',
    padding: '20px',
  },
  logsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  logBox: {
    flex: 1,
    minWidth: '400px',
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
    textAlign: 'left',
  },
  loading: {
    color: '#33ff33',
    textAlign: 'center',
    padding: '20px',
  },
  noLogs: {
    color: '#33ff33',
    textAlign: 'center',
    padding: '20px',
  },
};

export default MQTTLogs;
