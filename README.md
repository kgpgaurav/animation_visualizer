# Animation Visualizer

A modern web application that transforms text-based questions into interactive animated visualizations using AI-powered explanations and SVG animations.

## 🎯 Overview

The Animation Visualizer is a full-stack application that leverages AI to create educational animations and visual explanations for complex concepts. Users can ask questions in natural language and receive both textual explanations and corresponding animated visualizations.

## 🚀 Features

- **AI-Powered Explanations**: Uses Google's Generative AI to provide detailed explanations
- **Interactive Animations**: SVG-based animations powered by Anime.js
- **Real-time Chat Interface**: Seamless conversation flow with the AI
- **Dark/Light Mode**: User-friendly interface with theme switching
- **Responsive Design**: Works across different screen sizes
- **Advanced Animation Controls**: Play, pause, and control animation playback
- **Particle Systems**: Support for complex particle-based animations
- **Physics Simulations**: Spring physics and bezier path animations

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - Modern React with hooks
- **Anime.js 3.2.2** - Powerful animation library
- **Axios 1.4.0** - HTTP client for API communication
- **CSS3** - Custom styling with dark mode support

### Backend
- **Node.js** - Runtime environment
- **Express 4.18.2** - Web application framework
- **Google Generative AI 0.2.1** - AI integration
- **CORS 2.8.5** - Cross-origin resource sharing
- **UUID 9.0.0** - Unique identifier generation

## 📁 Project Structure

```
animation_visualizer/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppTitle.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── QuestionInput.jsx
│   │   │   ├── VisualizationSVG.jsx
│   │   │   └── VisualizationSVG.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── DarkMode.css
│   │   └── index.js
│   ├── archive/
│   │   ├── examples/
│   │   └── canvas-variations/
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/animation_visualizer.git
   cd animation_visualizer
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   PORT=5000
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   # or for development with auto-reload
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎮 Usage

1. **Ask a Question**: Type any concept or question you'd like to understand visually
2. **Get AI Response**: Receive a detailed explanation from the AI
3. **Watch Animation**: View the corresponding animated visualization
4. **Control Playback**: Use the controls to play, pause, or restart animations
5. **Toggle Theme**: Switch between light and dark modes for better viewing

### Example Questions

- "How does a spring work?"
- "Explain the water cycle"
- "What is gravitational force?"
- "How do particles move in a gas?"
- "Demonstrate wave interference"

## 🎨 Animation Features

### Supported Animation Types
- **Particle Systems**: Complex particle behaviors and interactions
- **Physics Simulations**: Spring physics, gravity, and forces
- **Path Animations**: Bezier curves and spline paths
- **Timeline Animations**: Synchronized multi-element animations
- **SVG Transformations**: Scalable vector graphics animations

### Animation Controls
- Play/Pause functionality
- Animation speed control
- Reset and replay options
- Real-time parameter adjustment

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run build    # Build for production
npm test        # Run tests
```

### Backend Development
```bash
cd backend
npm run dev     # Development mode with nodemon
```

### Available Scripts

#### Frontend
- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App

#### Backend
- `npm start` - Starts the production server
- `npm run dev` - Starts development server with auto-reload

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Endpoints

#### POST `/api/chat`
Send a question and receive AI-generated explanation with visualization data.

**Request Body:**
```json
{
  "question": "How does a pendulum work?",
  "userId": "user123"
}
```

**Response:**
```json
{
  "response": "A pendulum works by...",
  "visualization": {
    "type": "pendulum",
    "elements": [...],
    "animations": [...]
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your Google AI API key is correctly set in the `.env` file
2. **Port Conflicts**: Change the port in the backend if 5000 is already in use
3. **CORS Errors**: Make sure the backend CORS configuration includes your frontend URL
4. **Animation Performance**: For complex animations, consider reducing particle count

## 🚀 Deployment on Render

### Backend Deployment (Web Service)

1. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Backend Service**
   ```
   Name: animation-visualizer-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - `GOOGLE_API_KEY`: Your Google Generative AI API key
   - `NODE_ENV`: production
   - `PORT`: (leave empty, Render sets this automatically)

4. **Deploy Settings**
   - Root Directory: `backend`
   - Node Version: 18 or higher
   - Auto-Deploy: Yes

### Frontend Deployment (Static Site)

1. **Create a new Static Site on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure the Frontend Service**
   ```
   Name: animation-visualizer-frontend
   Build Command: npm run build
   Publish Directory: build
   ```

3. **Set Environment Variables**
   - `REACT_APP_API_URL`: https://your-backend-url.onrender.com/api

4. **Deploy Settings**
   - Root Directory: `frontend`
   - Node Version: 18 or higher
   - Auto-Deploy: Yes

### Quick Deployment Commands

**Prepare for deployment:**
```bash
# Commit your changes
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

**Environment Variables Needed:**
- Backend: `GOOGLE_API_KEY`
- Frontend: `REACT_APP_API_URL`

### Post-Deployment Steps

1. **Update CORS Configuration**
   - Add your frontend URL to the CORS configuration in the backend
   - Update any hardcoded localhost URLs

2. **Test the Deployment**
   - Visit your frontend URL
   - Test the chat functionality
   - Verify animations are working

3. **Monitor Logs**
   - Check Render logs for any deployment issues
   - Monitor API response times and errors

### Deployment URLs
- Frontend: `https://your-frontend-name.onrender.com`
- Backend API: `https://your-backend-name.onrender.com/api`

## 🙏 Acknowledgments

- Google Generative AI for powerful language processing
- Anime.js for smooth and performant animations
- React community for excellent documentation and resources