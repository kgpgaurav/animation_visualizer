import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import './DarkMode.css';
import QuestionInput from './components/QuestionInput.jsx';
import ChatPanel from './components/ChatPanel.jsx';
// USING SVG IMPLEMENTATION WITH ANIME.JS
import VisualizationCanvas from './components/VisualizationSVG.jsx';
import Controls from './components/Controls.jsx';
import AppTitle from './components/AppTitle.jsx';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [currentVisualization, setCurrentVisualization] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [userId] = useState('u1'); // In a real app, you'd manage user authentication
  const [isMockVisualization, setIsMockVisualization] = useState(false);

  // Fetch question history on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_URL}/questions?userId=${userId}`);
        const messagesData = [];
        
        // Process questions and answers into message format
        response.data.forEach(item => {
          // Add the question
          messagesData.push({
            id: `q_${item.id}`,
            text: item.question,
            isUser: true,
            timestamp: new Date(item.timestamp)
          });
          
          // Add the answer if it exists
          if (item.answer) {
            messagesData.push({
              id: item.answer.id,
              text: item.answer.text,
              animationDescription: item.answer.animationDescription,
              isUser: false,
              visualization: item.answer.visualization,
              timestamp: new Date(item.answer.timestamp)
            });
          }
        });
        
        // Sort messages by timestamp
        messagesData.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesData);
        
        // Set the most recent visualization as current
        const lastVisualization = messagesData
          .filter(msg => msg.visualization)
          .pop();
          
        if (lastVisualization) {
          setCurrentVisualization(lastVisualization.visualization);
        } else {
          // No default visualization needed - will be set when user asks questions
          setCurrentVisualization(null);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        // No fallback visualization needed on error
        setCurrentVisualization(null);
      }
    };
    
    fetchQuestions();
  }, [userId]);

  // Connect to SSE stream for real-time updates with robust reconnection logic
  useEffect(() => {
    let eventSource;
    let reconnectAttempt = 0;
    let reconnectTimeout;
    
    // Function to create and setup the EventSource
    const setupEventSource = () => {
      // Close existing connection if it exists
      if (eventSource) {
        eventSource.close();
      }
      
      eventSource = new EventSource(`${API_URL}/stream`);
      
      // Connected event handler
      eventSource.addEventListener('connected', (event) => {
        reconnectAttempt = 0; // Reset reconnection counter on successful connection
      });
      
      // Question created event handler
      eventSource.addEventListener('question_created', (event) => {
        try {
          JSON.parse(event.data);
          // Skip adding questions from SSE as we already add them on user input
        } catch (error) {
          // Handle error silently
        }
      });
      
      // Answer created event handler
      eventSource.addEventListener('answer_created', (event) => {
        try {
          const answer = JSON.parse(event.data);
          
          // Add answer to messages if it's not already there
          setMessages(prevMessages => {
            if (!prevMessages.some(msg => msg.id === answer.id)) {
              
              // Validate visualization data before setting
              if (answer.visualization && typeof answer.visualization === 'object') {
                setCurrentVisualization(answer.visualization);
                setIsMockVisualization(answer.visualization.isMock || answer.text.includes("mock visualization"));
              }
              
              return [...prevMessages, {
                id: answer.id,
                text: answer.text,
                animationDescription: answer.animationDescription,
                isUser: false,
                visualization: answer.visualization,
                timestamp: new Date(answer.timestamp)
              }];
            }
            return prevMessages;
          });
        } catch (error) {
          // Handle error silently
        }
      });
      
      // Handle ping events to keep connection alive
      eventSource.addEventListener('ping', () => {
        // Handle ping silently
      });
      
      // Connection open handler
      eventSource.onopen = () => {
        document.dispatchEvent(new CustomEvent('sse-connected'));
      };
      
      // Error handler with exponential backoff reconnection
      eventSource.onerror = (error) => {
        eventSource.close();
        
        // Clear any existing reconnection timeout
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        
        // Calculate backoff time with exponential increase and jitter
        const maxDelay = 30000; // max 30 seconds
        const baseDelay = Math.min(1000 * Math.pow(1.5, reconnectAttempt), maxDelay);
        const jitter = Math.random() * 1000; // Add up to 1s of jitter
        const delay = baseDelay + jitter;
        
        reconnectTimeout = setTimeout(() => {
          reconnectAttempt++;
          setupEventSource();
        }, delay);
      };
    };
    
    // Initial setup
    setupEventSource();
    
    // Clean up function
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [userId]);

  // Handle submitting a new question
  const handleQuestionSubmit = async (question) => {
    if (!question || question.trim() === "") {
      return;
    }
    
    // Create a unique ID for the user's question
    const tempId = `temp_${Date.now()}`;
    const loadingId = `loading_${Date.now()}`;
    
    // Add user's question directly to the messages
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: tempId,
        text: question,
        isUser: true,
        timestamp: new Date(),
        isLoading: false
      }
    ]);
    
    // Track request state
    let requestFailed = false;
    let requestTimeout;
    
    try {
      // Add a temporary loading message for the bot
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: loadingId,
          text: "Generating response and visualization...",
          isUser: false,
          timestamp: new Date(),
          isLoading: true
        }
      ]);
      
      // Set a timeout to show an extended message if the request takes too long
      requestTimeout = setTimeout(() => {
        if (!requestFailed) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === loadingId 
                ? { 
                    ...msg, 
                    text: "Still working on your visualization... This may take a moment for complex topics."
                  } 
                : msg
            )
          );
        }
      }, 10000); // Show extended message after 10 seconds
      
      // Send question to API with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
      
      try {
        await axios.post(`${API_URL}/questions`, {
          userId,
          question
        }, {
          signal: controller.signal,
          timeout: 60000 // 60 second timeout
        });
        
        clearTimeout(timeoutId);
        
        // Remove the loading message when we get confirmation from the server
        // The real answer will come through the SSE stream
        setTimeout(() => {
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== loadingId));
        }, 500);
      } catch (axiosError) {
        clearTimeout(timeoutId);
        throw axiosError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      requestFailed = true;
      console.error('❌ Error submitting question:', error);
      
      // Determine error type for better user feedback
      let errorMessage = "Sorry, there was an error processing your request.";
      
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. The server took too long to respond.";
      } else if (error.response) {
        // Server responded with an error status
        if (error.response.status === 429) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (error.response.status >= 500) {
          errorMessage = "The server encountered an error. Please try again later.";
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = "No response from server. Please check your connection.";
      }
      
      // Update the loading message to show the error
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === loadingId 
          ? { 
              ...msg, 
              text: errorMessage,
              isLoading: false, 
              error: true 
            } 
          : msg
      ));
    } finally {
      // Clear the timeout if it's still active
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
    }
  };

  // Handle selecting a visualization from the chat
  const handleSelectVisualization = (visualization, message) => {
    console.log("Selecting visualization");
    
    if (!visualization) {
      console.warn("Attempted to select null visualization");
      return;
    }
    
    try {
      // Validate basic visualization structure
      if (typeof visualization !== 'object') {
        console.error("Invalid visualization format:", visualization);
        // Display error message to user
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `error_${Date.now()}`,
            text: "Unable to display this visualization. The data format is invalid.",
            isUser: false,
            error: true,
            timestamp: new Date()
          }
        ]);
        return;
      }
      
      console.log("Setting visualization:", visualization);
      setCurrentVisualization(visualization);
      
      // Check if this is a mock visualization
      setIsMockVisualization(
        visualization.isMock || 
        (message && message.text && message.text.includes("mock visualization"))
      );
      setCurrentVisualization(visualization);
      setIsPlaying(true); // Auto-play when selecting
    } catch (error) {
      console.error("Error selecting visualization:", error);
      // Display error message to user
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `error_${Date.now()}`,
          text: "There was an error loading the visualization.",
          isUser: false,
          error: true,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Play/Pause controls
  const togglePlay = () => {
    console.log("Toggle play/pause from", isPlaying, "to", !isPlaying);
    
    if (!isPlaying) {
      // Starting animation - set start time
      setStartTime(performance.now());
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    console.log("Resetting animation");
    // First stop the animation
    setIsPlaying(false);
    setStartTime(null);
    
    // Force re-creation of the visualization by creating a new reference
    // This will trigger the visualization change effect in VisualizationCanvas
    setTimeout(() => {
      if (currentVisualization) {
        const resetVisualization = JSON.parse(JSON.stringify(currentVisualization));
        setCurrentVisualization(resetVisualization);
      }
    }, 50);
  };

  return (
    <>
      <AppTitle />
      <div className="app-container">
        <div className="visualization-section">
          <h2 className="section-header">Visualization</h2>
          <VisualizationCanvas 
            visualization={currentVisualization} 
            isPlaying={isPlaying}
            startTime={startTime}
            setIsPlaying={setIsPlaying}
            isMockVisualization={isMockVisualization}
          />
          <Controls 
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            onReset={handleReset}
            hasVisualization={!!currentVisualization}
          />
        </div>
        
        <div className="chat-section">
          <h2 className="section-header">Concept Explanation</h2>
          <ChatPanel 
            messages={messages} 
            onSelectVisualization={handleSelectVisualization}
          />
          <QuestionInput onSubmit={handleQuestionSubmit} />
        </div>
      </div>
    </>
  );
}

export default App;