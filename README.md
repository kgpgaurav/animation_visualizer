# Chat-to-Visualization App

A system that explains concepts with both text and visualization. Users ask questions, and an LLM generates explanations with accompanying visualizations.

## Features

- Text explanations paired with interactive visualizations
- Real-time streaming of responses via Server-Sent Events (SSE)
- Playable/pausable visualizations
- Chat history and visualization selection
- **NEW: Dark Mode UI** for reduced eye strain and better readability
- **NEW: JSX syntax** for React components

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with JSX
- **Realtime**: Server-Sent Events (SSE)
- **LLM**: Google Gemini 2.5 Flash
- **Styling**: CSS with dark mode variables

## Project Structure

```
task_anim/
├── backend/             # Express server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── .env             # Environment variables
│
└── frontend/            # React application
    ├── public/          # Static assets
    ├── src/             # Source code
    │   ├── components/  # React components
    │   ├── App.js       # Main application component
    │   └── index.js     # Entry point
    └── package.json     # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google API key with access to Gemini 2.5 Flash

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd task_anim
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   ```
   
   Create a `.env` file with your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   PORT=5000
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `POST /api/questions`: Submit a new question
- `GET /api/questions`: Retrieve all past questions
- `GET /api/answers/:id`: Get a specific answer with its visualization
- `GET /api/stream`: Connect to the SSE stream for real-time updates

## Visualization JSON Format

The LLM generates visualization specifications in JSON format:

```json
{
  "duration": 5000,
  "fps": 30,
  "layers": [
    {
      "id": "layer1",
      "type": "circle",
      "props": { "x": 100, "y": 200, "r": 20, "fill": "#3498db" },
      "animations": [
        { "property": "x", "from": 100, "to": 400, "start": 0, "end": 3000 }
      ]
    }
  ]
}
```

Supported shape types:
- circle
- rect
- text
- arrow

Animation properties can include:
- Standard properties (x, y, width, height, etc.)
- Special animations like "orbit" and "rotation"
