import React, { useRef, useEffect, useCallback, useState } from 'react';
import './VisualizationCanvas.css';

const VisualizationCanvas = ({ visualization, isPlaying, onAnimationEnd, startTime }) => {
  const canvasRef = useRef(null);
  const [layerRefs, setLayerRefs] = useState({});
  const [error, setError] = useState(null);

  // Simple easing functions
  const easingFunctions = {
    linear: (t) => t,
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
  };

  // Initialize layer refs when visualization changes
  useEffect(() => {
    if (visualization?.layers) {
      const refs = {};
      visualization.layers.forEach((layer, index) => {
        if (!layer.id) {
          layer.id = `layer_${index}`;
        }
        refs[layer.id] = {
          id: layer.id,
          currentProps: { ...layer.props }
        };
      });
      setLayerRefs(refs);
    }
  }, [visualization]);

  // Simple shape drawing function
  const drawShape = useCallback((ctx, type, props) => {
    ctx.save();
    
    // Apply opacity
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity;
    }

    // Apply rotation if present
    if (props.rotation !== undefined) {
      const centerX = props.x + (props.width ? props.width / 2 : 0);
      const centerY = props.y + (props.height ? props.height / 2 : 0);
      ctx.translate(centerX, centerY);
      ctx.rotate((props.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    switch (type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(props.x, props.y, props.r, 0, Math.PI * 2);
        ctx.fillStyle = props.fill || '#000';
        ctx.fill();
        if (props.stroke) {
          ctx.strokeStyle = props.stroke;
          ctx.lineWidth = props.strokeWidth || 1;
          ctx.stroke();
        }
        break;
        
      case 'rect':
        ctx.fillStyle = props.fill || '#000';
        ctx.fillRect(props.x, props.y, props.width, props.height);
        if (props.stroke) {
          ctx.strokeStyle = props.stroke;
          ctx.lineWidth = props.strokeWidth || 1;
          ctx.strokeRect(props.x, props.y, props.width, props.height);
        }
        break;
        
      case 'text':
        ctx.fillStyle = props.fill || '#000';
        ctx.font = `${props.fontWeight || ''} ${props.fontSize || 16}px ${props.fontFamily || 'Arial'}`;
        ctx.textAlign = props.textAlign || 'center';
        ctx.textBaseline = props.textBaseline || 'middle';
        ctx.fillText(props.text, props.x, props.y);
        break;
        
      default:
        console.warn(`Unknown shape type: ${type}`);
    }
    
    ctx.restore();
  }, []);

  // Simple render function
  const renderCanvas = useCallback((elapsed) => {
    const canvas = canvasRef.current;
    if (!canvas || !visualization) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill with background
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(0, 0, width, height);
    
    // Simple scaling - assume 800x600 coordinate system
    ctx.save();
    const scaleX = width / 800;
    const scaleY = height / 600;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (width - 800 * scale) / 2;
    const offsetY = (height - 600 * scale) / 2;
    
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Sort layers by z-index
    const layers = [...visualization.layers].sort((a, b) => {
      const zIndexA = a.props.zIndex || 0;
      const zIndexB = b.props.zIndex || 0;
      return zIndexA - zIndexB;
    });

    // Render each layer
    layers.forEach(layer => {
      const layerRef = layerRefs[layer.id];
      if (!layerRef) return;

      // Process animations
      const updatedProps = { ...layer.props };
      
      if (layer.animations && layer.animations.length > 0) {
        layer.animations.forEach(anim => {
          if (elapsed >= anim.start && elapsed <= anim.end) {
            let progress = (elapsed - anim.start) / (anim.end - anim.start);
            
            // Apply easing
            const easingFunction = anim.easing ? 
              (easingFunctions[anim.easing] || easingFunctions.linear) : 
              easingFunctions.linear;
            
            progress = easingFunction(progress);
            
            if (anim.property === 'orbit') {
              // Orbit animation
              const angle = progress * Math.PI * 2;
              updatedProps.x = anim.centerX + Math.cos(angle) * anim.radius;
              updatedProps.y = anim.centerY + Math.sin(angle) * anim.radius;
            } else if (anim.from !== undefined && anim.to !== undefined) {
              // Simple property animation
              updatedProps[anim.property] = anim.from + (anim.to - anim.from) * progress;
            }
          }
        });
      }

      // Update layer refs
      layerRefs[layer.id].currentProps = updatedProps;

      // Draw the shape
      drawShape(ctx, layer.type, updatedProps);
    });
    
    ctx.restore();
  }, [visualization, drawShape, layerRefs, easingFunctions]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !visualization) return;

    let animationId;
    
    const animate = () => {
      const elapsed = startTime ? performance.now() - startTime : 0;
      renderCanvas(elapsed);
      
      if (elapsed < visualization.duration) {
        animationId = requestAnimationFrame(animate);
      } else if (onAnimationEnd) {
        onAnimationEnd();
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, visualization, renderCanvas, startTime, onAnimationEnd]);

  // Canvas resize
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      
      const resizeCanvas = () => {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Maintain aspect ratio
        const aspectRatio = 4/3; // 800/600
        let width, height;
        
        if (containerWidth / containerHeight > aspectRatio) {
          height = containerHeight;
          width = height * aspectRatio;
        } else {
          width = containerWidth;
          height = width / aspectRatio;
        }
        
        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);
        
        // Re-render if not playing
        if (!isPlaying && visualization) {
          renderCanvas(startTime ? performance.now() - startTime : 0);
        }
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [visualization, isPlaying, renderCanvas, startTime]);

  if (!visualization) {
    return (
      <div className="visualization-error">
        <div className="error-icon">⚠️</div>
        <h3>No Visualization Available</h3>
        <p>Ask a question to see a visualization</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualization-error">
        <div className="error-icon">❌</div>
        <h3>Visualization Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="visualization-container">
      <canvas 
        ref={canvasRef}
        className="visualization-canvas"
        style={{
          background: '#fffaf0',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      />
    </div>
  );
};

export default VisualizationCanvas;