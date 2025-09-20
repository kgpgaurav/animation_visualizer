import React from 'react';

const Controls = ({ isPlaying, onPlayPause, onReset, hasVisualization }) => {
  return (
    <div className="controls" style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '10px 0',
      gap: '10px'
    }}>
      <button 
        onClick={onPlayPause}
        disabled={!hasVisualization}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: hasVisualization ? 'pointer' : 'not-allowed',
          backgroundColor: isPlaying ? '#e74c3c' : '#2ecc71',
          color: 'white',
          border: 'none',
          fontWeight: 'bold'
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button 
        onClick={onReset}
        disabled={!hasVisualization}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: hasVisualization ? 'pointer' : 'not-allowed',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          fontWeight: 'bold'
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default Controls;
