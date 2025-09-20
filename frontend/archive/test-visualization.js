// Test script to validate visualization JSON
const testPrompt = `
You are an assistant that creates EDUCATIONAL ANIMATIONS. Return ONLY JSON for a concept explanation and animation spec. Answer: "How does gravity work?".

EDUCATIONAL GUIDELINES:
- Create step-by-step visual learning experiences
- Show processes, not just static diagrams
- Use animations to demonstrate cause and effect
- Include descriptive labels and visual elements
- For biology: show inputs, outputs, transformations (like photosynthesis: leaf + sun + CO2 + H2O → glucose + O2)
- For physics: show forces, motion, interactions (like gravity: objects attracting, falling)
- For chemistry: show molecular interactions and reactions

Output exactly one JSON object with these keys:
- "text": string. 1-3 educational sentences explaining the concept.
- "visualization": object with keys:
  - "duration": integer (10000..15000) - allow time for learning
  - "fps": integer (30)
  - "aspectRatio": number (1.333 for 800x600 canvas)
  - "layers": array of 4..12 objects showing the complete process. Each layer has:
      - "id": string
      - "type": one of ["circle","rect","text","polygon"] (focus on these for reliability)
      - "props": object with properties (x,y,width,height,r,fontSize,text,fill,stroke,strokeWidth,zIndex)
      - "animations": array (1..5) showing educational progression:
          - "property": one of ["x","y","opacity","orbit","scale","r"]
          - timing: "start" (ms), "end" (ms) within [0,duration]
          - For movement: "from", "to" (numbers)
          - For orbit: "centerX","centerY","radius"
  - "particleSystems": optional array for visual effects

CRITICAL RULES:
- Valid JSON only: double-quoted strings, numeric literals
- Canvas coordinates: 800x600 (aspectRatio: 1.333)
- Use meaningful animations that teach the concept
- Include multiple visual elements working together

EDUCATIONAL EXAMPLE:
{"text":"Photosynthesis converts sunlight, CO2, and water into glucose and oxygen in plant leaves.","visualization":{"duration":12000,"fps":30,"aspectRatio":1.333,"layers":[{"id":"leaf","type":"polygon","props":{"points":[{"x":350,"y":250},{"x":450,"y":200},{"x":500,"y":300},{"x":450,"y":400},{"x":350,"y":350}],"fill":"#4caf50","stroke":"#2e7d32","strokeWidth":3},"animations":[]},{"id":"sun","type":"circle","props":{"x":150,"y":100,"r":35,"fill":"#ffeb3b","stroke":"#fbc02d","strokeWidth":2},"animations":[{"property":"opacity","start":0,"end":2000,"from":0.3,"to":1}]},{"id":"co2_label","type":"text","props":{"x":300,"y":80,"text":"CO₂","fontSize":20,"fill":"#424242"},"animations":[{"property":"y","start":1000,"end":4000,"from":80,"to":220}]},{"id":"h2o_label","type":"text","props":{"x":600,"y":450,"text":"H₂O","fontSize":20,"fill":"#1976d2"},"animations":[{"property":"y","start":2000,"end":5000,"from":450,"to":320}]},{"id":"glucose_out","type":"text","props":{"x":520,"y":300,"text":"Glucose","fontSize":16,"fill":"#388e3c","opacity":0},"animations":[{"property":"opacity","start":6000,"end":8000,"from":0,"to":1}]},{"id":"o2_out","type":"text","props":{"x":350,"y":180,"text":"O₂","fontSize":18,"fill":"#2e7d32","opacity":0},"animations":[{"property":"opacity","start":7000,"end":9000,"from":0,"to":1},{"property":"y","start":8000,"end":11000,"from":180,"to":80}]}],"particleSystems":[]}}
`;

// Expected gravity response
const expectedGravityResponse = {
  "text": "Gravity is the force that attracts objects toward each other. Larger objects like Earth have stronger gravitational pull.",
  "visualization": {
    "duration": 12000,
    "fps": 30,
    "aspectRatio": 1.333,
    "layers": [
      {
        "id": "earth",
        "type": "circle",
        "props": {
          "x": 400,
          "y": 500,
          "r": 80,
          "fill": "#4caf50",
          "stroke": "#2e7d32",
          "strokeWidth": 3
        },
        "animations": []
      },
      {
        "id": "apple",
        "type": "circle",
        "props": {
          "x": 400,
          "y": 100,
          "r": 15,
          "fill": "#f44336"
        },
        "animations": [
          {
            "property": "y",
            "start": 1000,
            "end": 6000,
            "from": 100,
            "to": 400
          }
        ]
      },
      {
        "id": "gravity_label",
        "type": "text",
        "props": {
          "x": 500,
          "y": 300,
          "text": "Gravity Force",
          "fontSize": 18,
          "fill": "#424242"
        },
        "animations": [
          {
            "property": "opacity",
            "start": 2000,
            "end": 4000,
            "from": 0,
            "to": 1
          }
        ]
      }
    ],
    "particleSystems": []
  }
};

console.log("Test visualization for gravity:");
console.log(JSON.stringify(expectedGravityResponse, null, 2));

// Validate the structure
function validateVisualization(viz) {
  const required = ['text', 'visualization'];
  const vizRequired = ['duration', 'fps', 'aspectRatio', 'layers'];
  
  for (const field of required) {
    if (!viz[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  for (const field of vizRequired) {
    if (!viz.visualization[field]) {
      console.error(`Missing required visualization field: ${field}`);
      return false;
    }
  }
  
  // Check layers
  if (!Array.isArray(viz.visualization.layers)) {
    console.error('Layers must be an array');
    return false;
  }
  
  for (const layer of viz.visualization.layers) {
    if (!layer.id || !layer.type || !layer.props) {
      console.error('Layer missing required fields:', layer);
      return false;
    }
  }
  
  console.log('✅ Visualization structure is valid');
  return true;
}

validateVisualization(expectedGravityResponse);