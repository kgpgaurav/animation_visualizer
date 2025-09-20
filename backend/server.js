require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const questions = [];
const answers = [];
const clients = [];

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Send SSE events to all connected clients
function sendEventToAll(event, data) {
  if (clients.length === 0) {
    return;
  }
  
  const dataString = JSON.stringify(data);
  const eventString = `event: ${event}\ndata: ${dataString}\n\n`;
  
  const failedClients = [];
  
  clients.forEach(client => {
    try {
      client.res.write(eventString);
      if (typeof client.res.flush === 'function') {
        client.res.flush();
      }
    } catch (error) {
      failedClients.push(client.id);
    }
  });
  
  // Remove failed clients
  if (failedClients.length > 0) {
    for (const failedId of failedClients) {
      const index = clients.findIndex(c => c.id === failedId);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    }
  }
}

// Connect to SSE stream
app.get('/api/stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Additional headers to prevent proxy buffering
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders(); // Flush the headers to establish SSE connection with client
  
  // Send initial connection confirmation
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({ message: 'Connected to SSE stream', timestamp: new Date().toISOString() })}\n\n`);
  
  // Add client to array
  const clientId = uuidv4();
  const userAgent = req.headers['user-agent'] || 'unknown';
  clients.push({ id: clientId, res, userAgent });
  
  // Handle client disconnect
  req.on('close', () => {
    const index = clients.findIndex(client => client.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
  
  // Keep connection alive with frequent pings
  const pingInterval = setInterval(() => {
    try {
      res.write(':ping\n\n');
      if (typeof res.flush === 'function') {
        res.flush();
      }
    } catch (error) {
      clearInterval(pingInterval);
      
      // Clean up client if ping fails
      const index = clients.findIndex(client => client.id === clientId);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    }
  }, 15000); // every 15 seconds
  
  req.on('close', () => {
    clearInterval(pingInterval);
  });
});

// Submit a question
app.post('/api/questions', async (req, res) => {
  try {
    const { userId, question } = req.body;
    
    if (!userId || !question) {
      return res.status(400).json({ error: 'User ID and question are required' });
    }
    
    // Create question record
    const questionId = `q_${uuidv4()}`;
    const newQuestion = {
      id: questionId,
      userId,
      question,
      timestamp: new Date(),
    };
    
    questions.push(newQuestion);
    
    // Broadcast the new question via SSE
    sendEventToAll('question_created', newQuestion);
    
    // Get answer from LLM
    const llmResponse = await getLLMResponse(question);
    
    // Create answer record
    const answerId = `a_${uuidv4()}`;
    const newAnswer = {
      id: answerId,
      questionId,
      text: llmResponse.text,
      animationDescription: llmResponse.animationDescription || null,
      visualization: (
        llmResponse && llmResponse.visualization && typeof llmResponse.visualization === 'object'
      ) ? { ...llmResponse.visualization, id: `vis_${uuidv4()}` } : null,
      timestamp: new Date()
    };
    
    answers.push(newAnswer);
    
    // Update question with answer ID
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      questions[questionIndex].answerId = answerId;
    }
    
    // Broadcast the new answer via SSE
    sendEventToAll('answer_created', newAnswer);
    
    res.status(201).json({
      questionId,
      answerId
    });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// Get all questions with their answers
app.get('/api/questions', (req, res) => {
  // Map questions and include their answers
  const questionsWithAnswers = questions.map(question => {
    // Find the associated answer
    const answer = answers.find(a => a.id === question.answerId);
    
    // Return the question with its answer included
    return {
      ...question,
      answer: answer || null
    };
  });
  
  res.json(questionsWithAnswers);
});

// Get specific answer
app.get('/api/answers/:id', (req, res) => {
  const answerId = req.params.id;
  const answer = answers.find(a => a.id === answerId);
  
  if (!answer) {
    return res.status(404).json({ error: 'Answer not found' });
  }
  
  res.json(answer);
});

// Function to get response from LLM
async function getLLMResponse(question) {
  try {
    const prompt = getEnhancedPrompt(question);

    // Generate content and handle errors
    let apiResponse = null;
    let startTime = Date.now();
    
    try {
      // Add extra instructions to ensure well-formatted JSON
      const enhancedPrompt = prompt + `\n\nIMPORTANT: Return only well-formatted JSON with no additional text. Make sure your response can be parsed directly by JSON.parse().`;
      
      // Dynamic token allocation based on question complexity
      const questionLength = question.length;
      const isComplexTopic = question.toLowerCase().includes('photosynthesis') || 
                           question.toLowerCase().includes('solar system') ||
                           question.toLowerCase().includes('water cycle');
      
      const baseTokens = 2048;
      const complexTokens = 2800;
      
      const generationConfig = {
        temperature: 0.15,
        maxOutputTokens: isComplexTopic ? complexTokens : baseTokens,
        topP: 0.9,
        topK: 40
      };
      
      console.log(`🎯 Using ${generationConfig.maxOutputTokens} tokens for ${isComplexTopic ? 'complex' : 'simple'} topic: "${question}"`);
      
      
      // Set up API request with timeout
      const requestPromise = model.generateContent({
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
        generationConfig
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("API request timed out after 30 seconds")), 30000);
      });
      
      // Race the API request against the timeout
      apiResponse = await Promise.race([requestPromise, timeoutPromise]);
      
    } catch (apiError) {
      // Return text-only response instead of mock
      return {
        text: `I encountered an error generating a visualization for "${question}". Please try rephrasing your question or try again later.`,
        visualization: null
      };
    }
    
    // Validate API response structure
    if (!apiResponse || !apiResponse.response) {
      return {
        text: `I couldn't generate a proper response for "${question}". Please try again.`,
        visualization: null
      };
    }
    
    // Check for content moderation blocks
    if (apiResponse.response.promptFeedback && 
        apiResponse.response.promptFeedback.blockReason) {
      return {
        text: `Content was blocked for safety reasons. Please try a different question about "${question}".`,
        visualization: null
      };
    }
    
    // Check for empty candidates array
    if (!apiResponse.response.candidates || 
        apiResponse.response.candidates.length === 0) {
      return {
        text: `No response generated for "${question}". Please try rephrasing your question.`,
        visualization: null
      };
    }
    
    // Check for finish reason indicating safety block
    const finishReason = apiResponse.response.candidates[0]?.finishReason || 'unknown';
    if (finishReason === 'SAFETY' || finishReason === 'RECITATION' || finishReason === 'BLOCKED') {
      return {
        text: `Response was blocked due to content restrictions. Please try a different approach to "${question}".`,
        visualization: null
      };
    }
    
    // Extract text content with robust error handling
    let responseText = '';
    try {
      // Check different possible response structures
      if (apiResponse.response.candidates && 
          apiResponse.response.candidates.length > 0 && 
          apiResponse.response.candidates[0].content &&
          apiResponse.response.candidates[0].content.parts) {
        
        // Get text from all parts
        const parts = apiResponse.response.candidates[0].content.parts;
        responseText = parts.map(part => part.text || '').join('');
        
        // Check if we got a valid response
        if (responseText.length === 0) {
          throw new Error("Empty response text from API");
        }
        
      } else if (typeof apiResponse.response.text === 'function') {
        // Traditional text() method
        responseText = apiResponse.response.text();
        
        if (responseText.length === 0 || responseText.trim() === '') {
          throw new Error("Empty response from text() method");
        }
        
      } else {
        throw new Error("No text content found in API response");
      }
    } catch (textError) {
      return getMockResponse(question);
    }
    
    // Process and validate the JSON response
    try {
      // First attempt: direct JSON parsing
      let parsedResponse = null;
      
      // Clean response text before parsing
      let cleanedText = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '}')
        .trim();
      
      try {
        parsedResponse = JSON.parse(cleanedText);
      } catch (directParseError) {
        // Attempt to extract JSON from original text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } catch (extractedParseError) {
            // Try to fix common JSON errors
            let fixedJson = jsonMatch[0]
              .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
              .replace(/:\s*'([^']*)'/g, ':"$1"')
              .replace(/,\s*}/g, '}')
              .replace(/,\s*,/g, ',')
              .replace(/:\s*(\d+)\s*\/\s*(\d+)/g, (match, num, denom) => {
                const result = parseFloat(num) / parseFloat(denom);
                return `: ${result.toFixed(3)}`;
              });
            
            // Handle incomplete JSON due to token limits
            const openBraces = (fixedJson.match(/\{/g) || []).length;
            const closeBraces = (fixedJson.match(/\}/g) || []).length;
            for (let i = 0; i < (openBraces - closeBraces); i++) {
              fixedJson += '}';
            }
            
            parsedResponse = JSON.parse(fixedJson);
          }
        } else {
          // Create basic JSON wrapper for text-only responses
          if (responseText.length > 20 && !responseText.includes('{')) {
            parsedResponse = {
              text: responseText.trim(),
              visualization: null
            };
          } else {
            throw new Error("No valid JSON object found in response text");
          }
        }
      }
      
      // Validate response structure
      if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
        // Try to fix if possible
        if (typeof parsedResponse.text === 'object') {
          parsedResponse.text = JSON.stringify(parsedResponse.text);
        } else if (parsedResponse.description) {
          parsedResponse.text = parsedResponse.description;
        } else if (parsedResponse.content) {
          parsedResponse.text = typeof parsedResponse.content === 'string' 
            ? parsedResponse.content 
            : JSON.stringify(parsedResponse.content);
        } else {
          parsedResponse.text = `Here is an explanation about "${question}". This visualization demonstrates key elements related to this topic with animated graphics and particles.`;
        }
      }
      
      // Check visualization field
      if (!parsedResponse.visualization || typeof parsedResponse.visualization !== 'object') {
        parsedResponse.visualization = null;
      } else {
        const vis = parsedResponse.visualization;
        
        // Check required fields
        let needsMockVisualization = false;
        
        if (!vis.duration || typeof vis.duration !== 'number') {
          needsMockVisualization = true;
        }
        
        if (!vis.fps || typeof vis.fps !== 'number') {
          needsMockVisualization = true;
        }
        
        if (!Array.isArray(vis.layers) || vis.layers.length === 0) {
          needsMockVisualization = true;
        }
        
        // Drop visualization if required fields missing
        if (needsMockVisualization) {
          parsedResponse.visualization = null;
        } else {
          // Ensure particleSystems is an array
          if (!Array.isArray(vis.particleSystems)) {
            vis.particleSystems = [];
          }
          
          // Check each layer for required properties
          for (let i = 0; i < vis.layers.length; i++) {
            const layer = vis.layers[i];
            
            if (!layer.id) {
              layer.id = `layer_${i}`;
            }
            
            if (!layer.type) {
              layer.type = 'circle';
            }
            
            if (!layer.props || typeof layer.props !== 'object') {
              layer.props = { x: 300, y: 300 };
            }
            
            if (!Array.isArray(layer.animations)) {
              layer.animations = [];
            }
          }
          
          if (!vis.id) {
            vis.id = `vis_${uuidv4()}`;
          }
        }
      }
      
      return parsedResponse;
      
    } catch (parseError) {
      return { text: `Here is an explanation about "${question}".`, visualization: null };
    }
  } catch (error) {
    return { text: `Here is an explanation about "${question}".`, visualization: null };
  }
}

// Enhanced few-shot prompt with PTCF framework
function getEnhancedPrompt(question) {
  return `
**PERSONA:** You are an educational animation designer specializing in scientific visualizations for students.

**TASK:** Create both a clear explanation and detailed SVG animation specification for: "${question}"

**CONTEXT:** 
- Target audience: Students learning science concepts
- Animation requirements: 4-8 visual elements, staggered timing, educational flow
- Technical constraints: SVG canvas 800x500, Anime.js compatibility
- Output must be valid JSON parseable by JSON.parse()

**FORMAT:** Return ONLY valid JSON with this exact structure:

{
  "text": "Clear 2-3 sentence explanation in simple language",
  "visualization": {
    "duration": [8000-15000],
    "fps": 30,
    "layers": [
      {
        "id": "unique_id",
        "type": "circle|rect|text|polygon",
        "props": { "x": 0-800, "y": 0-500, [other_properties] },
        "animations": [
          { "property": "x|y|opacity|scale|orbit", "start": 0, "end": 3000, "from": 0, "to": 100 }
        ]
      }
    ]
  }
}

**ANIMATION TYPES:**
- orbit: { "property": "orbit", "centerX": 400, "centerY": 250, "radius": 100, "start": 0, "end": 8000 }
- movement: { "property": "x", "from": 100, "to": 600, "start": 1000, "end": 4000 }
- fade: { "property": "opacity", "from": 0, "to": 1, "start": 500, "end": 1500 }
- scale: { "property": "scale", "from": 1, "to": 1.5, "start": 2000, "end": 3000 }

**EXAMPLES:**

${getContextualExamples(question)}

**REQUIREMENTS:**
✓ 4-8 layers minimum
✓ Staggered start times (0ms, 1000ms, 2000ms...)
✓ Educational sequence: setup → process → result
✓ All coordinates within 800x500 bounds
✓ Valid JSON syntax with closing brackets
✓ Educational arrows showing movement/forces
✓ Text labels for key concepts

Return complete JSON only. No markdown, no explanations.`;
}

// Contextual examples based on question topic
function getContextualExamples(question) {
  const q = question.toLowerCase();
  if (q.includes('photosynthesis') || q.includes('plant') || q.includes('chloroplast')) {
    return photosynthesisExample;
  }
  if (q.includes('solar') || q.includes('planet') || q.includes('orbit') || q.includes('sun')) {
    return solarSystemExample;
  }
  if (q.includes('newton') || q.includes('motion') || q.includes('force') || q.includes('gravity')) {
    return newtonExample;
  }
  return genericExample;
}

// Enhanced photosynthesis example with educational flow
const photosynthesisExample = `
EXAMPLE - Photosynthesis:
{
  "text": "Photosynthesis converts sunlight, water, and CO2 into glucose and oxygen through chloroplasts in plant leaves.",
  "visualization": {
    "duration": 12000,
    "fps": 30,
    "layers": [
      {
        "id": "sun",
        "type": "circle",
        "props": {"x": 120, "y": 80, "r": 35, "fill": "#FFD700"},
        "animations": [
          {"property": "opacity", "start": 0, "end": 1000, "from": 0, "to": 1},
          {"property": "scale", "start": 1000, "end": 2000, "from": 1, "to": 1.2}
        ]
      },
      {
        "id": "sunrays",
        "type": "polygon",
        "props": {"points": [{"x": 160, "y": 115}, {"x": 280, "y": 200}, {"x": 270, "y": 210}, {"x": 150, "y": 125}], "fill": "#FFFF99", "opacity": 0},
        "animations": [
          {"property": "opacity", "start": 1500, "end": 2500, "from": 0, "to": 0.6}
        ]
      },
      {
        "id": "leaf",
        "type": "polygon", 
        "props": {"points": [{"x": 300, "y": 200}, {"x": 380, "y": 180}, {"x": 400, "y": 240}, {"x": 350, "y": 260}, {"x": 280, "y": 240}], "fill": "#228B22"},
        "animations": [
          {"property": "opacity", "start": 500, "end": 1500, "from": 0, "to": 1}
        ]
      },
      {
        "id": "co2",
        "type": "circle",
        "props": {"x": 50, "y": 220, "r": 12, "fill": "#8B4513"},
        "animations": [
          {"property": "opacity", "start": 2000, "end": 3000, "from": 0, "to": 1},
          {"property": "x", "start": 3000, "end": 5500, "from": 50, "to": 320}
        ]
      },
      {
        "id": "water",
        "type": "circle", 
        "props": {"x": 340, "y": 400, "r": 10, "fill": "#4169E1"},
        "animations": [
          {"property": "opacity", "start": 2500, "end": 3500, "from": 0, "to": 1},
          {"property": "y", "start": 4000, "end": 6500, "from": 400, "to": 220}
        ]
      },
      {
        "id": "glucose",
        "type": "polygon",
        "props": {"points": [{"x": 450, "y": 210}, {"x": 470, "y": 200}, {"x": 480, "y": 220}, {"x": 470, "y": 240}, {"x": 450, "y": 230}], "fill": "#32CD32"},
        "animations": [
          {"property": "opacity", "start": 7000, "end": 8000, "from": 0, "to": 1},
          {"property": "x", "start": 8500, "end": 10500, "from": 460, "to": 600}
        ]
      },
      {
        "id": "oxygen",
        "type": "circle",
        "props": {"x": 380, "y": 160, "r": 8, "fill": "#87CEEB"},
        "animations": [
          {"property": "opacity", "start": 7500, "end": 8500, "from": 0, "to": 1},
          {"property": "y", "start": 9000, "end": 11000, "from": 160, "to": 50}
        ]
      }
    ]
  }
}`;

// Enhanced solar system example with orbital mechanics
const solarSystemExample = `
EXAMPLE - Solar System:
{
  "text": "Planets orbit the Sun at different speeds based on their distance. Closer planets move faster due to stronger gravitational forces.",
  "visualization": {
    "duration": 15000,
    "fps": 30,
    "layers": [
      {
        "id": "sun",
        "type": "circle",
        "props": {"x": 400, "y": 250, "r": 40, "fill": "#FFD700"},
        "animations": [
          {"property": "opacity", "start": 0, "end": 1000, "from": 0, "to": 1},
          {"property": "scale", "start": 5000, "end": 6000, "from": 1, "to": 1.1},
          {"property": "scale", "start": 6000, "end": 7000, "from": 1.1, "to": 1}
        ]
      },
      {
        "id": "earth_orbit",
        "type": "circle",
        "props": {"x": 400, "y": 250, "r": 100, "fill": "none", "stroke": "#4169E1", "strokeWidth": 2, "strokeDasharray": "5,5"},
        "animations": [
          {"property": "opacity", "start": 1000, "end": 2000, "from": 0, "to": 0.5}
        ]
      },
      {
        "id": "mars_orbit",
        "type": "circle",
        "props": {"x": 400, "y": 250, "r": 150, "fill": "none", "stroke": "#CD853F", "strokeWidth": 2, "strokeDasharray": "8,8"},
        "animations": [
          {"property": "opacity", "start": 1500, "end": 2500, "from": 0, "to": 0.5}
        ]
      },
      {
        "id": "earth",
        "type": "circle",
        "props": {"x": 500, "y": 250, "r": 15, "fill": "#4169E1"},
        "animations": [
          {"property": "opacity", "start": 2000, "end": 3000, "from": 0, "to": 1},
          {"property": "orbit", "centerX": 400, "centerY": 250, "radius": 100, "start": 3000, "end": 12000}
        ]
      },
      {
        "id": "mars",
        "type": "circle", 
        "props": {"x": 550, "y": 250, "r": 12, "fill": "#CD853F"},
        "animations": [
          {"property": "opacity", "start": 2500, "end": 3500, "from": 0, "to": 1},
          {"property": "orbit", "centerX": 400, "centerY": 250, "radius": 150, "start": 3500, "end": 15000}
        ]
      },
      {
        "id": "earth_label",
        "type": "text",
        "props": {"x": 320, "y": 250, "text": "Earth", "fill": "#4169E1", "fontSize": 14},
        "animations": [
          {"property": "opacity", "start": 4000, "end": 5000, "from": 0, "to": 1}
        ]
      },
      {
        "id": "mars_label",
        "type": "text",
        "props": {"x": 250, "y": 250, "text": "Mars (slower)", "fill": "#CD853F", "fontSize": 14},
        "animations": [
          {"property": "opacity", "start": 4500, "end": 5500, "from": 0, "to": 1}
        ]
      }
    ]
  }
}`;

// Enhanced Newton's laws example with force demonstrations
const newtonExample = `
EXAMPLE - Newton's Laws:
{
  "text": "Newton's laws describe how forces affect motion. Objects resist changes in motion unless acted upon by external forces.",
  "visualization": {
    "duration": 12000,
    "fps": 30,
    "layers": [
      {
        "id": "ground",
        "type": "rect",
        "props": {"x": 100, "y": 400, "width": 600, "height": 50, "fill": "#8B4513"},
        "animations": [
          {"property": "opacity", "start": 0, "end": 500, "from": 0, "to": 1}
        ]
      },
      {
        "id": "ball_at_rest",
        "type": "circle",
        "props": {"x": 200, "y": 375, "r": 20, "fill": "#FF6B6B"},
        "animations": [
          {"property": "opacity", "start": 500, "end": 1500, "from": 0, "to": 1},
          {"property": "x", "start": 4000, "end": 7000, "from": 200, "to": 500}
        ]
      },
      {
        "id": "force_arrow",
        "type": "polygon",
        "props": {"points": [{"x": 150, "y": 370}, {"x": 180, "y": 375}, {"x": 150, "y": 380}], "fill": "#E74C3C"},
        "animations": [
          {"property": "opacity", "start": 3000, "end": 4000, "from": 0, "to": 1},
          {"property": "opacity", "start": 5000, "end": 6000, "from": 1, "to": 0}
        ]
      },
      {
        "id": "falling_apple",
        "type": "circle",
        "props": {"x": 600, "y": 80, "r": 15, "fill": "#32CD32"},
        "animations": [
          {"property": "opacity", "start": 7000, "end": 8000, "from": 0, "to": 1},
          {"property": "y", "start": 8000, "end": 10000, "from": 80, "to": 375}
        ]
      },
      {
        "id": "gravity_arrow",
        "type": "polygon",
        "props": {"points": [{"x": 595, "y": 120}, {"x": 600, "y": 150}, {"x": 605, "y": 120}], "fill": "#9B59B6"},
        "animations": [
          {"property": "opacity", "start": 7500, "end": 8500, "from": 0, "to": 1}
        ]
      },
      {
        "id": "law1_text",
        "type": "text",
        "props": {"x": 200, "y": 320, "text": "1st Law: Inertia", "fill": "#333", "fontSize": 16},
        "animations": [
          {"property": "opacity", "start": 1500, "end": 2500, "from": 0, "to": 1}
        ]
      },
      {
        "id": "law2_text",
        "type": "text",
        "props": {"x": 600, "y": 50, "text": "2nd Law: F=ma", "fill": "#333", "fontSize": 16},
        "animations": [
          {"property": "opacity", "start": 7000, "end": 8000, "from": 0, "to": 1}
        ]
      }
    ]
  }
}`;

// Generic example for other topics
const genericExample = `
EXAMPLE - Generic Educational Animation:
{
  "text": "This animation demonstrates key concepts through visual elements and their interactions.",
  "visualization": {
    "duration": 10000,
    "fps": 30,
    "layers": [
      {
        "id": "element1",
        "type": "circle",
        "props": {"x": 150, "y": 200, "r": 30, "fill": "#3498DB"},
        "animations": [
          {"property": "opacity", "start": 0, "end": 1000, "from": 0, "to": 1},
          {"property": "x", "start": 1000, "end": 4000, "from": 150, "to": 400}
        ]
      },
      {
        "id": "element2", 
        "type": "rect",
        "props": {"x": 500, "y": 180, "width": 80, "height": 80, "fill": "#E74C3C"},
        "animations": [
          {"property": "opacity", "start": 1500, "end": 2500, "from": 0, "to": 1},
          {"property": "y", "start": 3000, "end": 6000, "from": 180, "to": 300}
        ]
      },
      {
        "id": "connection",
        "type": "polygon",
        "props": {"points": [{"x": 430, "y": 195}, {"x": 480, "y": 200}, {"x": 430, "y": 205}], "fill": "#95A5A6"},
        "animations": [
          {"property": "opacity", "start": 4000, "end": 5000, "from": 0, "to": 1}
        ]
      },
      {
        "id": "label",
        "type": "text",
        "props": {"x": 300, "y": 350, "text": "Key Concept", "fill": "#2C3E50", "fontSize": 18},
        "animations": [
          {"property": "opacity", "start": 5000, "end": 6000, "from": 0, "to": 1}
        ]
      }
    ]
  }
}`;

// Helper function for mock responses
function getMockResponse(question) {
  console.log("🎨 Generating mock visualization for:", question);
  
  // Generate dynamic variations for each topic
  const randomVariation = Math.floor(Math.random() * 3) + 1;
  
  // Create different mock animations based on question type
  if (question.toLowerCase().includes('photosynthesis')) {
    const variations = [
      "Photosynthesis converts sunlight, water, and CO2 into glucose and oxygen through chloroplasts in plant leaves.",
      "Plants use sunlight energy to combine water and carbon dioxide, producing glucose for energy and releasing oxygen as a byproduct.",
      "In the chloroplasts of leaves, solar energy powers the conversion of CO2 and H2O into glucose sugar, releasing O2 into the atmosphere."
    ];
    
    return {
      text: variations[randomVariation - 1],
      animationDescription: "Sun provides energy, CO2 enters leaf, water moves up from roots, glucose and oxygen are produced with directional arrows.",
      visualization: {
        duration: 12000,
        fps: 30,
        aspectRatio: 1.6,
        layers: [
          {
            id: "sun",
            type: "circle",
            props: { x: 120, y: 80, r: 40, fill: "#FFD700" },
            animations: [
              { property: "opacity", start: 0, end: 1500, from: 0, to: 1 },
              { property: "scale", start: 1500, end: 3000, from: 1, to: 1.3 }
            ]
          },
          {
            id: "sun_rays",
            type: "line",
            props: { x1: 160, y1: 120, x2: 280, y2: 180, stroke: "#FFD700", strokeWidth: 3 },
            animations: [
              { property: "opacity", start: 1000, end: 2000, from: 0, to: 1 }
            ]
          },
          {
            id: "leaf",
            type: "rect",
            props: { x: 280, y: 180, width: 100, height: 80, fill: "#228B22", rx: 15 },
            animations: [
              { property: "opacity", start: 500, end: 1500, from: 0, to: 1 }
            ]
          },
          {
            id: "co2_molecule",
            type: "circle",
            props: { x: 80, y: 220, r: 12, fill: "#FF6B6B" },
            animations: [
              { property: "opacity", start: 2000, end: 3000, from: 0, to: 1 },
              { property: "x", start: 3000, end: 6000, from: 80, to: 280 }
            ]
          },
          {
            id: "co2_arrow",
            type: "arrow",
            props: { x1: 120, y1: 220, x2: 240, y2: 220, stroke: "#FF6B6B", strokeWidth: 3 },
            animations: [
              { property: "opacity", start: 2500, end: 3500, from: 0, to: 1 }
            ]
          },
          {
            id: "water_molecule",
            type: "circle",
            props: { x: 330, y: 380, r: 10, fill: "#4ECDC4" },
            animations: [
              { property: "opacity", start: 2500, end: 3500, from: 0, to: 1 },
              { property: "y", start: 4000, end: 7000, from: 380, to: 260 }
            ]
          },
          {
            id: "water_arrow",
            type: "arrow",
            props: { x1: 330, y1: 340, x2: 330, y2: 280, stroke: "#4ECDC4", strokeWidth: 3 },
            animations: [
              { property: "opacity", start: 3500, end: 4500, from: 0, to: 1 }
            ]
          },
          {
            id: "glucose",
            type: "circle",
            props: { x: 450, y: 220, r: 15, fill: "#FFA500" },
            animations: [
              { property: "opacity", start: 7000, end: 8500, from: 0, to: 1 },
              { property: "x", start: 8500, end: 11000, from: 450, to: 600 }
            ]
          },
          {
            id: "glucose_arrow",
            type: "arrow",
            props: { x1: 480, y1: 220, x2: 560, y2: 220, stroke: "#FFA500", strokeWidth: 3 },
            animations: [
              { property: "opacity", start: 8000, end: 9000, from: 0, to: 1 }
            ]
          },
          {
            id: "oxygen",
            type: "circle",
            props: { x: 400, y: 140, r: 8, fill: "#87CEEB" },
            animations: [
              { property: "opacity", start: 7500, end: 9000, from: 0, to: 1 },
              { property: "y", start: 9000, end: 11500, from: 140, to: 60 }
            ]
          },
          {
            id: "oxygen_arrow",
            type: "arrow",
            props: { x1: 400, y1: 120, x2: 400, y2: 80, stroke: "#87CEEB", strokeWidth: 3 },
            animations: [
              { property: "opacity", start: 8500, end: 9500, from: 0, to: 1 }
            ]
          },
          {
            id: "co2_label",
            type: "text",
            props: { x: 80, y: 190, text: "CO2", fill: "#FF6B6B", fontSize: 14 },
            animations: [
              { property: "opacity", start: 2000, end: 3000, from: 0, to: 1 }
            ]
          },
          {
            id: "oxygen_label",
            type: "text",
            props: { x: 400, y: 120, text: "O2", fill: "#87CEEB", fontSize: 14 },
            animations: [
              { property: "opacity", start: 7500, end: 8500, from: 0, to: 1 }
            ]
          }
        ]
      }
    };
  } else if (question.toLowerCase().includes('solar system')) {
    const variations = [
      "The solar system consists of the Sun at the center with planets orbiting around it. Inner planets orbit faster than outer planets due to gravitational physics.",
      "Our solar system showcases planetary motion where celestial bodies follow elliptical orbits determined by gravitational forces and Newton's laws.",
      "Planets in our solar system demonstrate Kepler's laws of motion, with orbital speed inversely related to distance from the Sun."
    ];
    
    return {
      text: variations[randomVariation - 1],
      animationDescription: "Animation showing the Sun with Earth and Mars orbiting at different speeds with orbital paths visible.",
      visualization: {
        duration: 15000,
        fps: 30,
        aspectRatio: 1.6,
        layers: [
          {
            id: "sun",
            type: "circle",
            props: { x: 400, y: 250, r: 45, fill: "#FFD700" },
            animations: [
              { property: "opacity", start: 0, end: 1000, from: 0, to: 1 },
              { property: "scale", start: 5000, end: 6000, from: 1, to: 1.1 },
              { property: "scale", start: 6000, end: 7000, from: 1.1, to: 1 }
            ]
          },
          {
            id: "earth_orbit",
            type: "orbit",
            props: { centerX: 400, centerY: 250, radius: 90, stroke: "#4169E1", strokeWidth: 2, strokeDasharray: "5,5", fill: "none" },
            animations: [
              { property: "opacity", start: 1000, end: 2000, from: 0, to: 0.5 }
            ]
          },
          {
            id: "mars_orbit",
            type: "orbit",
            props: { centerX: 400, centerY: 250, radius: 140, stroke: "#CD853F", strokeWidth: 2, strokeDasharray: "8,8", fill: "none" },
            animations: [
              { property: "opacity", start: 1500, end: 2500, from: 0, to: 0.5 }
            ]
          },
          {
            id: "earth",
            type: "circle",
            props: { x: 0, y: 0, r: 15, fill: "#4169E1" },
            animations: [
              { property: "opacity", start: 2000, end: 3000, from: 0, to: 1 },
              { 
                property: "orbit", 
                centerX: 400, 
                centerY: 250, 
                radius: 90, 
                start: 3000, 
                end: 12000
              }
            ]
          },
          {
            id: "mars",
            type: "circle", 
            props: { x: 0, y: 0, r: 12, fill: "#CD853F" },
            animations: [
              { property: "opacity", start: 2500, end: 3500, from: 0, to: 1 },
              { 
                property: "orbit", 
                centerX: 400, 
                centerY: 250, 
                radius: 140, 
                start: 3500, 
                end: 15000
              }
            ]
          },
          {
            id: "earth_label",
            type: "text",
            props: { x: 320, y: 250, text: "Earth", fill: "#4169E1", fontSize: 12 },
            animations: [
              { property: "opacity", start: 4000, end: 5000, from: 0, to: 1 }
            ]
          },
          {
            id: "mars_label",
            type: "text",
            props: { x: 260, y: 250, text: "Mars", fill: "#CD853F", fontSize: 12 },
            animations: [
              { property: "opacity", start: 4500, end: 5500, from: 0, to: 1 }
            ]
          },
          {
            id: "sun_label",
            type: "text",
            props: { x: 400, y: 320, text: "Sun", fill: "#FFD700", fontSize: 16, textAnchor: "middle" },
            animations: [
              { property: "opacity", start: 1000, end: 2000, from: 0, to: 1 }
            ]
          }
        ]
      }
    };
  } else if (question.toLowerCase().includes('newton')) {
    const variations = [
      "Newton's laws describe how objects move. Inertia, F=ma, and action-reaction forces govern all motion in the universe.",
      "Sir Isaac Newton's three laws of motion explain the relationship between forces and movement in our physical world.",
      "Newton's fundamental laws demonstrate that objects resist changes in motion unless acted upon by external forces."
    ];
    
    return {
      text: variations[randomVariation - 1],
      animationDescription: "Animation demonstrating Newton's Laws with orbiting planets, falling objects, and interacting forces with arrows.",
      visualization: {
        duration: 12000,
        fps: 30,
        aspectRatio: 1.6,
        layers: [
          {
            id: "ground",
            type: "rect",
            props: { x: 100, y: 400, width: 600, height: 50, fill: "#8B4513" },
            animations: [
              { property: "opacity", start: 0, end: 500, from: 0, to: 1 }
            ]
          },
          {
            id: "planet1",
            type: "circle",
            props: { x: 0, y: 0, r: 20, fill: "#4169E1" },
            animations: [
              { property: "opacity", start: 500, end: 1500, from: 0, to: 1 },
              { 
                property: "orbit", 
                centerX: 200, 
                centerY: 150, 
                radius: 60, 
                start: 1500, 
                end: 8000
              }
            ]
          },
          {
            id: "orbit_path",
            type: "orbit",
            props: { centerX: 200, centerY: 150, radius: 60, stroke: "#4169E1", strokeWidth: 2, strokeDasharray: "3,3", fill: "none" },
            animations: [
              { property: "opacity", start: 1000, end: 2000, from: 0, to: 0.4 }
            ]
          },
          {
            id: "falling_ball",
            type: "circle",
            props: { x: 500, y: 80, r: 15, fill: "#FF6B6B" },
            animations: [
              { property: "opacity", start: 2000, end: 3000, from: 0, to: 1 },
              { property: "y", start: 3000, end: 6000, from: 80, to: 350 }
            ]
          },
          {
            id: "gravity_arrow",
            type: "arrow",
            props: { x1: 500, y1: 120, x2: 500, y2: 180, stroke: "#FF6B6B", strokeWidth: 4 },
            animations: [
              { property: "opacity", start: 2500, end: 3500, from: 0, to: 1 }
            ]
          },
          {
            id: "force_arrow",
            type: "arrow",
            props: { x1: 190, y1: 300, x2: 250, y2: 300, stroke: "#E74C3C", strokeWidth: 4 },
            animations: [
              { property: "opacity", start: 6000, end: 7000, from: 0, to: 1 }
            ]
          },
          {
            id: "reaction_arrow",
            type: "arrow",
            props: { x1: 250, y1: 320, x2: 190, y2: 320, stroke: "#9B59B6", strokeWidth: 4 },
            animations: [
              { property: "opacity", start: 6500, end: 7500, from: 0, to: 1 }
            ]
          },
          {
            id: "block",
            type: "rect",
            props: { x: 180, y: 280, width: 40, height: 40, fill: "#34495E" },
            animations: [
              { property: "opacity", start: 5500, end: 6500, from: 0, to: 1 },
              { property: "x", start: 7000, end: 9000, from: 180, to: 280 }
            ]
          },
          {
            id: "law1_label",
            type: "text",
            props: { x: 120, y: 120, text: "1st Law: Inertia", fill: "#4169E1", fontSize: 14 },
            animations: [
              { property: "opacity", start: 1500, end: 2500, from: 0, to: 1 }
            ]
          },
          {
            id: "law2_label",
            type: "text",
            props: { x: 450, y: 50, text: "2nd Law: F=ma", fill: "#FF6B6B", fontSize: 14 },
            animations: [
              { property: "opacity", start: 3000, end: 4000, from: 0, to: 1 }
            ]
          },
          {
            id: "law3_label",
            type: "text",
            props: { x: 200, y: 350, text: "3rd Law: Action-Reaction", fill: "#E74C3C", fontSize: 14 },
            animations: [
              { property: "opacity", start: 6000, end: 7000, from: 0, to: 1 }
            ]
          }
        ]
      }
    };
  } else {
    // Generic animation for other topics with dynamic variations
    const genericVariations = [
      `Here is an explanation about "${question}". This demonstrates the key concepts with interactive visual elements.`,
      `Understanding "${question}" becomes clearer with this animated demonstration of the core principles.`,
      `Let's explore "${question}" through this step-by-step visual animation showing the fundamental concepts.`
    ];
    
    const colors = [
      { primary: "#FF6B6B", secondary: "#4ECDC4" },
      { primary: "#6C5CE7", secondary: "#FDCB6E" },
      { primary: "#00B894", secondary: "#E17055" }
    ];
    
    const selectedColors = colors[randomVariation - 1];
    
    return {
      text: genericVariations[randomVariation - 1],
      animationDescription: "Interactive animation showing key elements with movement, transitions, and visual relationships.",
      visualization: {
        duration: 10000,
        fps: 30,
        aspectRatio: 1.6,
        layers: [
          {
            id: "element1",
            type: "circle",
            props: { x: 150, y: 200, r: 30, fill: selectedColors.primary },
            animations: [
              { property: "opacity", start: 0, end: 1000, from: 0, to: 1 },
              { property: "x", start: 1000, end: 4000, from: 150, to: 400 },
              { property: "scale", start: 2000, end: 3000, from: 1, to: 1.2 },
              { property: "scale", start: 3000, end: 4000, from: 1.2, to: 1 }
            ]
          },
          {
            id: "element2", 
            type: "rect",
            props: { x: 500, y: 180, width: 80, height: 80, fill: selectedColors.secondary },
            animations: [
              { property: "opacity", start: 1500, end: 2500, from: 0, to: 1 },
              { property: "y", start: 3000, end: 6000, from: 180, to: 300 }
            ]
          },
          {
            id: "connection_arrow",
            type: "arrow",
            props: { x1: 430, y1: 200, x2: 480, y2: 200, stroke: "#666", strokeWidth: 3 },
            animations: [
              { property: "opacity", start: 4000, end: 5000, from: 0, to: 1 }
            ]
          },
          {
            id: "motion_path",
            type: "line",
            props: { x1: 150, y1: 200, x2: 400, y2: 200, stroke: selectedColors.primary, strokeWidth: 2, strokeDasharray: "5,5" },
            animations: [
              { property: "opacity", start: 1000, end: 2000, from: 0, to: 0.5 }
            ]
          },
          {
            id: "concept_label",
            type: "text",
            props: { x: 300, y: 350, text: "Key Concept", fill: "#333", fontSize: 16, textAnchor: "middle" },
            animations: [
              { property: "opacity", start: 5000, end: 6000, from: 0, to: 1 }
            ]
          }
        ]
      }
    };
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});