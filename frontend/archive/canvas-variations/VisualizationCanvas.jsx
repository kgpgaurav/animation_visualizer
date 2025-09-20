import React, { useRef, useEffect, useCallback, useState } from 'react';
import './VisualizationCanvas.css';

const VisualizationCanvas = ({ visualization, isPlaying, onAnimationEnd, startTime }) => {
  const canvasRef = useRef(null);
  const [layerRefs, setLayerRefs] = useState({});

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
        
      case 'polygon':
        if (props.points && props.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(props.points[0].x, props.points[0].y);
          for (let i = 1; i < props.points.length; i++) {
            ctx.lineTo(props.points[i].x, props.points[i].y);
          }
          ctx.closePath();
          
          if (props.fill) {
            ctx.fillStyle = props.fill;
            ctx.fill();
          }
          if (props.stroke) {
            ctx.strokeStyle = props.stroke;
            ctx.lineWidth = props.strokeWidth || 1;
            ctx.stroke();
          }
        }
        break;
        
      default:
        console.warn(`Unknown shape type: ${type}`);
    }
    
    ctx.restore();
  }, []);

  // Simple render function 
  const renderCanvas = useCallback((elapsed = 0) => {
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
  }, [visualization, drawShape, layerRefs]);

  // Simple animation loop
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

  // Initial render when not playing
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Make canvas size comparable to chat window
      const container = canvas.parentElement;
      const containerWidth = container?.clientWidth || 600;
      
      // Make canvas 90% of container width, ensuring full animation visibility
      const canvasWidth = Math.min(containerWidth * 0.9, 550);
      const canvasHeight = canvasWidth * 0.75; // 4:3 aspect ratio for optimal viewing
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      
      // Initial render
      if (visualization) {
        renderCanvas(0);
      }
    }
  }, [visualization, renderCanvas]);

  if (!visualization) {
    return (
      <div className="visualization-error">
        <div className="error-icon">⚠️</div>
        <h3>No Visualization Available</h3>
        <p>Ask a question to see a visualization</p>
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