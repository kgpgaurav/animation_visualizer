import React, { useRef, useEffect, useState } from 'react';
import './VisualizationSVG.css';
import anime from 'animejs';

const VisualizationSVG = ({ visualization, isPlaying, onAnimationEnd, startTime }) => {
  const svgRef = useRef(null);
  const [animationInstance, setAnimationInstance] = useState(null);

  // Create SVG elements based on layer type
  const renderSVGElement = (layer) => {
    const { id, type, props } = layer;
    
    const baseProps = {
      key: id,
      id: id,
      fill: props.fill || props.color || '#4CAF50',
      stroke: props.stroke || 'none',
      strokeWidth: props.strokeWidth || 1,
      opacity: 1, // Start visible - animations will control opacity
    };

    switch (type) {
      case 'circle':
        return (
          <circle
            {...baseProps}
            cx={props.x || props.cx || 0}
            cy={props.y || props.cy || 0}
            r={props.r || props.radius || 10}
          />
        );
      case 'rect':
      case 'rectangle':
        return (
          <rect
            {...baseProps}
            x={props.x || 0}
            y={props.y || 0}
            width={props.width || props.w || 50}
            height={props.height || props.h || 50}
          />
        );
      case 'text':
        return (
          <text
            {...baseProps}
            x={props.x || 0}
            y={props.y || 0}
            fontSize={props.fontSize || props.size || 16}
            textAnchor={props.textAnchor || 'middle'}
            dominantBaseline={props.dominantBaseline || 'central'}
            style={{ userSelect: 'none' }} // Prevent text selection
          >
            {props.text || props.content || props.label || 'Text'}
          </text>
        );
      case 'ellipse':
        return (
          <ellipse
            {...baseProps}
            cx={props.x || props.cx || 0}
            cy={props.y || props.cy || 0}
            rx={props.rx || props.radiusX || 20}
            ry={props.ry || props.radiusY || 10}
          />
        );
      case 'line':
        return (
          <line
            {...baseProps}
            x1={props.x1 || props.startX || 0}
            y1={props.y1 || props.startY || 0}
            x2={props.x2 || props.endX || 50}
            y2={props.y2 || props.endY || 50}
            stroke={props.stroke || props.color || '#000'}
          />
        );
      case 'arrow':
        // Handle both angle-based and coordinate-based arrows
        if (props.x1 !== undefined && props.y1 !== undefined && props.x2 !== undefined && props.y2 !== undefined) {
          // Coordinate-based arrow (x1,y1) to (x2,y2)
          const x1 = props.x1 || 0;
          const y1 = props.y1 || 0;
          const x2 = props.x2 || 50;
          const y2 = props.y2 || 50;
          const arrowColor = props.stroke || props.color || '#666';
          
          // Calculate arrow head direction
          const dx = x2 - x1;
          const dy = y2 - y1;
          const angle = Math.atan2(dy, dx);
          
          return (
            <g key={id} id={id}>
              {/* Arrow line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={arrowColor}
                strokeWidth={props.strokeWidth || 3}
                opacity={baseProps.opacity}
              />
              {/* Arrow head */}
              <polygon
                points={`${x2},${y2} ${x2 - 10 * Math.cos(angle - 0.3)},${y2 - 10 * Math.sin(angle - 0.3)} ${x2 - 10 * Math.cos(angle + 0.3)},${y2 - 10 * Math.sin(angle + 0.3)}`}
                fill={arrowColor}
                opacity={baseProps.opacity}
              />
            </g>
          );
        } else {
          // Angle-based arrow (legacy support)
          const arrowLength = props.length || 50;
          const arrowAngle = (props.angle || 0) * Math.PI / 180;
          const startX = props.x || 0;
          const startY = props.y || 0;
          const endX = startX + Math.cos(arrowAngle) * arrowLength;
          const endY = startY + Math.sin(arrowAngle) * arrowLength;
          const arrowColor = props.stroke || props.color || '#666';
          
          return (
            <g key={id} id={id}>
              {/* Arrow line */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={arrowColor}
                strokeWidth={props.strokeWidth || 2}
                opacity={baseProps.opacity}
              />
              {/* Arrow head */}
              <polygon
                points={`${endX},${endY} ${endX - 8 * Math.cos(arrowAngle - 0.3)},${endY - 8 * Math.sin(arrowAngle - 0.3)} ${endX - 8 * Math.cos(arrowAngle + 0.3)},${endY - 8 * Math.sin(arrowAngle + 0.3)}`}
                fill={arrowColor}
                opacity={baseProps.opacity}
              />
            </g>
          );
        }
      case 'orbit':
        // Orbital path visualization
        return (
          <circle
            {...baseProps}
            cx={props.centerX || (800 / 2)} // Use center of viewBox
            cy={props.centerY || (500 / 2)} // Use center of viewBox
            r={props.radius || 100}
            fill="none"
            stroke={props.stroke || props.color || '#ddd'}
            strokeWidth={props.strokeWidth || 1}
            strokeDasharray={props.dashed ? "5,5" : "none"}
          />
        );
      case 'polygon':
        // Polygon shape for complex forms (leaves, arrows, etc.)
        const points = props.points || [];
        let pointsStr = '';
        
        if (Array.isArray(points) && points.length > 0) {
          // Handle array of point objects: [{x: 100, y: 200}, ...]
          if (typeof points[0] === 'object' && points[0].x !== undefined) {
            pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
          }
          // Handle array of coordinate pairs: [[100, 200], [150, 250], ...]
          else if (Array.isArray(points[0])) {
            pointsStr = points.map(p => `${p[0]},${p[1]}`).join(' ');
          }
          // Handle flat array: [100, 200, 150, 250, ...]
          else if (typeof points[0] === 'number') {
            for (let i = 0; i < points.length; i += 2) {
              if (i + 1 < points.length) {
                pointsStr += `${points[i]},${points[i + 1]} `;
              }
            }
            pointsStr = pointsStr.trim();
          }
        }
        
        // Fallback for string points format: "100,200 150,250 ..."
        if (!pointsStr && typeof props.points === 'string') {
          pointsStr = props.points;
        }
        
        // Default triangle if no points provided
        if (!pointsStr) {
          const x = props.x || 0;
          const y = props.y || 0;
          const size = props.size || 50;
          pointsStr = `${x},${y} ${x + size},${y + size/2} ${x},${y + size}`;
        }
        
        return (
          <polygon
            {...baseProps}
            points={pointsStr}
            data-original-points={pointsStr}
          />
        );
      default:
        return (
          <rect
            {...baseProps}
            x={props.x || 0}
            y={props.y || 0}
            width={props.width || props.w || 50}
            height={props.height || props.h || 50}
          />
        );
    }
  };

  // Start animations when playing
  useEffect(() => {
    if (!visualization || !isPlaying || !visualization.layers) {
      if (animationInstance) {
        animationInstance.pause();
      }
      return;
    }

    // Create timeline
    const tl = anime.timeline({
      autoplay: false,
      loop: false,
      direction: 'normal',
      complete: () => {
        if (onAnimationEnd) {
          onAnimationEnd();
        }
      }
    });
    
    // Wait for DOM to be ready, then start animations
    setTimeout(() => {
      // First, make all elements visible
      visualization.layers.forEach((layer) => {
        const element = document.querySelector(`#${layer.id}`);
        if (element) {
          element.style.opacity = '1';
        }
      });
    }, 100);

    // Add animations for each layer
    visualization.layers.forEach((layer, index) => {
      if (!layer.animations || layer.animations.length === 0) {
        // Add a default fade-in animation if none exists
        setTimeout(() => {
          const element = document.querySelector(`#${layer.id}`);
          if (element) {
            element.style.opacity = '0.3';
            tl.add({
              targets: `#${layer.id}`,
              opacity: [0.3, 1],
              scale: [0.9, 1],
              duration: 1500,
              delay: index * 300,
              easing: 'easeInOutQuad'
            });
          }
        }, 50);
        return;
      }

      layer.animations.forEach((anim, animIndex) => {
        const target = `#${layer.id}`;
        const duration = (anim.end - anim.start) || 2000;
        const delay = anim.start || (index * 500);

        if (anim.property === 'orbit') {
          // Orbital animation with continuous circular movement
          // Use center of SVG viewBox as default center
          const centerX = anim.centerX || (width / 2);
          const centerY = anim.centerY || (height / 2);
          const radius = anim.radius || Math.min(width, height) * 0.15;
          
          // Get the element to determine the correct attributes
          const element = document.querySelector(target);
          const elementType = element ? element.tagName.toLowerCase() : 'unknown';
          
          // Set initial position on the orbit
          if (element) {
            const initialAngle = 0; // Start at 0 degrees (right side)
            const initialX = centerX + Math.cos(initialAngle) * radius;
            const initialY = centerY + Math.sin(initialAngle) * radius;
            
            if (elementType === 'circle' || elementType === 'ellipse') {
              element.setAttribute('cx', initialX);
              element.setAttribute('cy', initialY);
            } else if (elementType === 'rect') {
              const width = parseFloat(element.getAttribute('width')) || 50;
              const height = parseFloat(element.getAttribute('height')) || 50;
              element.setAttribute('x', initialX - width / 2);
              element.setAttribute('y', initialY - height / 2);
            } else if (elementType === 'text') {
              element.setAttribute('x', initialX);
              element.setAttribute('y', initialY);
            } else if (elementType === 'polygon') {
              // For polygons, translate all points to initial orbital position
              const originalPoints = element.getAttribute('data-original-points');
              if (originalPoints) {
                // Calculate the center of the original polygon
                const pointPairs = originalPoints.split(' ');
                let centerOriginalX = 0, centerOriginalY = 0;
                pointPairs.forEach(pair => {
                  const [px, py] = pair.split(',').map(parseFloat);
                  centerOriginalX += px;
                  centerOriginalY += py;
                });
                centerOriginalX /= pointPairs.length;
                centerOriginalY /= pointPairs.length;
                
                // Translate all points to initial orbital position
                const offsetX = initialX - centerOriginalX;
                const offsetY = initialY - centerOriginalY;
                const newPoints = originalPoints.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, (match, px, py) => {
                  return `${parseFloat(px) + offsetX},${parseFloat(py) + offsetY}`;
                });
                element.setAttribute('points', newPoints);
              }
            }
          }
          
          tl.add({
            targets: target,
            duration: duration,
            delay: delay,
            easing: 'linear',
            loop: true, // Continuous orbiting
            update: function(anim) {
              const progress = anim.progress / 100;
              const angle = progress * Math.PI * 2; // Full circle
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              const element = document.querySelector(target);
              if (element) {
                if (elementType === 'circle' || elementType === 'ellipse') {
                  element.setAttribute('cx', x);
                  element.setAttribute('cy', y);
                } else if (elementType === 'rect') {
                  const width = parseFloat(element.getAttribute('width')) || 50;
                  const height = parseFloat(element.getAttribute('height')) || 50;
                  element.setAttribute('x', x - width / 2);
                  element.setAttribute('y', y - height / 2);
                } else if (elementType === 'text') {
                  element.setAttribute('x', x);
                  element.setAttribute('y', y);
                } else if (elementType === 'polygon') {
                  // For polygons, translate all points to new position
                  const originalPoints = element.getAttribute('data-original-points');
                  if (originalPoints) {
                    // Calculate the center of the original polygon
                    const pointPairs = originalPoints.split(' ');
                    let centerOriginalX = 0, centerOriginalY = 0;
                    pointPairs.forEach(pair => {
                      const [px, py] = pair.split(',').map(parseFloat);
                      centerOriginalX += px;
                      centerOriginalY += py;
                    });
                    centerOriginalX /= pointPairs.length;
                    centerOriginalY /= pointPairs.length;
                    
                    // Translate all points to new orbital position
                    const offsetX = x - centerOriginalX;
                    const offsetY = y - centerOriginalY;
                    const newPoints = originalPoints.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, (match, px, py) => {
                      return `${parseFloat(px) + offsetX},${parseFloat(py) + offsetY}`;
                    });
                    element.setAttribute('points', newPoints);
                  }
                }
              }
            }
          }, delay);
        } else if (anim.from !== undefined && anim.to !== undefined) {
          // Property animation with from/to values
          const animeProps = {
            targets: target,
            duration: duration,
            delay: delay,
            easing: 'easeInOutQuad'
          };

          // Get element type to determine correct attributes
          const element = document.querySelector(target);
          const elementType = element ? element.tagName.toLowerCase() : 'unknown';
          
          console.log(`🎯 Targeting ${elementType} element for ${anim.property} animation`);

          switch (anim.property) {
            case 'x':
              if (elementType === 'circle' || elementType === 'ellipse') {
                animeProps.cx = [anim.from, anim.to]; // for circles/ellipses
              } else if (elementType === 'polygon') {
                // For polygons, we need to transform all points
                animeProps.update = function(anime) {
                  const progress = anime.progress / 100;
                  const currentX = anim.from + (anim.to - anim.from) * progress;
                  const element = document.querySelector(target);
                  
                  if (element && element.getAttribute('data-original-points')) {
                    const originalPoints = element.getAttribute('data-original-points');
                    const offsetX = currentX - anim.from;
                    const newPoints = originalPoints.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
                      return `${parseFloat(x) + offsetX},${y}`;
                    });
                    element.setAttribute('points', newPoints);
                  }
                };
              } else {
                animeProps.x = [anim.from, anim.to];  // for rects/text
              }
              console.log(`→ Moving ${elementType} horizontally from ${anim.from} to ${anim.to}`);
              break;
            case 'y':
              if (elementType === 'circle' || elementType === 'ellipse') {
                animeProps.cy = [anim.from, anim.to]; // for circles/ellipses
              } else if (elementType === 'polygon') {
                // For polygons, we need to transform all points
                animeProps.update = function(anime) {
                  const progress = anime.progress / 100;
                  const currentY = anim.from + (anim.to - anim.from) * progress;
                  const element = document.querySelector(target);
                  
                  if (element && element.getAttribute('data-original-points')) {
                    const originalPoints = element.getAttribute('data-original-points');
                    const offsetY = currentY - anim.from;
                    const newPoints = originalPoints.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
                      return `${x},${parseFloat(y) + offsetY}`;
                    });
                    element.setAttribute('points', newPoints);
                  }
                };
              } else {
                animeProps.y = [anim.from, anim.to];  // for rects/text
              }
              console.log(`↑ Moving ${elementType} vertically from ${anim.from} to ${anim.to}`);
              break;
            case 'opacity':
              animeProps.opacity = [anim.from, anim.to];
              console.log(`✨ Fading ${elementType} from ${anim.from} to ${anim.to}`);
              break;
            case 'scale':
              animeProps.scale = [anim.from, anim.to];
              animeProps.transformOrigin = 'center center';
              console.log(`📏 Scaling ${elementType} from ${anim.from} to ${anim.to}`);
              break;
            case 'path':
              // Curved movement between two points
              const pathStartX = anim.startX || anim.from;
              const pathStartY = anim.startY || anim.fromY;
              const pathEndX = anim.endX || anim.to;
              const pathEndY = anim.endY || anim.toY;
              
              animeProps.update = function(anim) {
                const progress = anim.progress / 100;
                const currentX = pathStartX + (pathEndX - pathStartX) * progress;
                const currentY = pathStartY + (pathEndY - pathStartY) * progress;
                
                const element = document.querySelector(target);
                if (element) {
                  if (elementType === 'circle' || elementType === 'ellipse') {
                    element.setAttribute('cx', currentX);
                    element.setAttribute('cy', currentY);
                  } else if (elementType === 'rect') {
                    element.setAttribute('x', currentX);
                    element.setAttribute('y', currentY);
                  } else if (elementType === 'text') {
                    element.setAttribute('x', currentX);
                    element.setAttribute('y', currentY);
                  } else if (elementType === 'polygon') {
                    // For polygons, translate all points to new path position
                    const originalPoints = element.getAttribute('data-original-points');
                    if (originalPoints) {
                      // Calculate the center of the original polygon
                      const pointPairs = originalPoints.split(' ');
                      let centerOriginalX = 0, centerOriginalY = 0;
                      pointPairs.forEach(pair => {
                        const [px, py] = pair.split(',').map(parseFloat);
                        centerOriginalX += px;
                        centerOriginalY += py;
                      });
                      centerOriginalX /= pointPairs.length;
                      centerOriginalY /= pointPairs.length;
                      
                      // Translate all points to new path position
                      const offsetX = currentX - centerOriginalX;
                      const offsetY = currentY - centerOriginalY;
                      const newPoints = originalPoints.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, (match, px, py) => {
                        return `${parseFloat(px) + offsetX},${parseFloat(py) + offsetY}`;
                      });
                      element.setAttribute('points', newPoints);
                    }
                  }
                }
              };
              console.log(`🌟 Path movement from (${pathStartX},${pathStartY}) to (${pathEndX},${pathEndY})`);
              break;
            default:
              break;
          }

          // Add to timeline at specific time to prevent overlapping
          if (Object.keys(animeProps).length > 3) { // More than just targets, duration, delay
            console.log(`✅ Adding ${anim.property} animation:`, animeProps);
            tl.add(animeProps, delay);
          } else {
            console.warn(`❌ No valid animation properties for ${anim.property}`);
          }
        } else {
          // Fallback: create a simple animation based on property name
          console.log(`🔄 Creating fallback animation for ${anim.property}`);
          const fallbackProps = {
            targets: target,
            duration: duration,
            delay: delay,
            easing: 'easeInOutQuad'
          };
          
          switch (anim.property) {
            case 'fadeIn':
              fallbackProps.opacity = [0, 1];
              break;
            case 'slideIn':
              fallbackProps.translateX = [-50, 0];
              break;
            case 'grow':
              fallbackProps.scale = [0.5, 1];
              break;
            default:
              fallbackProps.opacity = [0.5, 1];
              break;
          }
          
          tl.add(fallbackProps, delay);
        }
      });
    });

    // Set animation instance and play
    setAnimationInstance(tl);
    
    console.log('🎬 Timeline duration:', tl.duration);
    console.log('🎬 Timeline children:', tl.children?.length || 0);
    
    // Start the animation immediately
    console.log('▶️ Starting animation playback...');
    try {
      // Ensure all elements are visible before starting
      visualization.layers.forEach((layer) => {
        const element = document.querySelector(`#${layer.id}`);
        if (element && !layer.animations?.some(anim => anim.property === 'opacity' && anim.from === 0)) {
          element.style.opacity = '1';
        }
      });
      
      tl.play();
      console.log('✅ Animation started successfully');
      
    } catch (error) {
      console.error('❌ Error starting animation:', error);
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up animation');
      if (tl) {
        tl.pause();
      }
    };
  }, [visualization, isPlaying, startTime, onAnimationEnd, animationInstance]);

  // Pause animation when not playing
  useEffect(() => {
    if (!isPlaying && animationInstance) {
      console.log('⏸️ Pausing animation');
      animationInstance.pause();
    } else if (isPlaying && animationInstance) {
      console.log('▶️ Resuming animation');
      animationInstance.play();
    }
  }, [isPlaying, animationInstance]);

  if (!visualization) {
    return (
      <div className="visualization-container">
        <div className="no-visualization">
          <p>❌ No visualization data available</p>
          <p>Waiting for animation data...</p>
        </div>
      </div>
    );
  }

  const { layers = [], duration = 10000, aspectRatio = 1.333 } = visualization;
  
  // Debug: Log what we're about to render
  console.log('🖼️ Rendering visualization:', {
    layers: layers.length,
    duration,
    aspectRatio,
    layerDetails: layers.map(l => ({ id: l.id, type: l.type, hasAnimations: !!l.animations?.length }))
  });

  const width = 800;
  const height = 500; // Fixed height for consistent rendering
  
  return (
    <div className="visualization-container">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="visualization-svg"
        style={{ 
          background: '#f8f9fa', 
          border: '2px solid #dee2e6',
          marginBottom: '20px', // Add space between SVG and buttons
          maxWidth: '800px',
          maxHeight: '500px',
          width: '100%',
          height: 'auto'
        }}
      >
        {layers.length > 0 ? (
          layers.map(layer => renderSVGElement(layer))
        ) : (
          <text x={width/2} y={height/2} textAnchor="middle" fill="#666">
            No layers to display
          </text>
        )}
      </svg>
    </div>
  );
};

export default VisualizationSVG;