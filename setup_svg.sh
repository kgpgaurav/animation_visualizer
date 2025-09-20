# SVG Visualization Setup Script

echo "🎬 Setting up SVG + Anime.js visualization..."

# Navigate to frontend directory
cd frontend

# Install anime.js
echo "📦 Installing Anime.js..."
npm install animejs

echo "✅ Installation complete!"
echo ""
echo "🔄 To switch to SVG visualization:"
echo "1. Open frontend/src/App.jsx"
echo "2. Find the line: import VisualizationCanvas from './components/VisualizationCanvas.jsx';"
echo "3. Replace with: import VisualizationCanvas from './components/VisualizationSVG.jsx';"
echo "4. Save and restart your application"
echo ""
echo "🎯 Benefits of SVG:"
echo "   • Smoother 60fps animations"
echo "   • Perfect scaling at any resolution"
echo "   • Better performance"
echo "   • Easier debugging"
echo "   • Professional visual quality"
echo ""
echo "📚 See frontend/src/components/README_SVG.md for detailed documentation"