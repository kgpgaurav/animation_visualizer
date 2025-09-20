import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import AdvancedParticleSystem from './AdvancedParticleSystem';
import MockVisualizationInfo from './MockVisualizationInfo';
import './VisualizationCanvas.css';
import './MockVisualizationInfo.css';

const VisualizationCanvas = ({ visualization, isPlaying, setIsPlaying, isMockVisualization }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null); 
  const [startTime, setStartTime] = useState(null);
  const [layerRefs, setLayerRefs] = useState({});
  const [error, setError] = useState(null);
  const [timelineState, setTimelineState] = useState({
    currentTime: 0,
    totalDuration: 0,
    sequences: [],
    activeSequence: null,
    markers: []
  });

  // Validate visualization data
  useEffect(() => {
    // Reset error state when visualization changes
    setError(null);
    
    if (!visualization) {
      console.warn("No visualization data provided");
      setError("No visualization data available");
      return;
    }
    
    try {
      // Validate essential properties
      if (!visualization.duration || typeof visualization.duration !== 'number') {
        throw new Error("Invalid or missing duration");
      }
      
      if (!visualization.fps || typeof visualization.fps !== 'number') {
        throw new Error("Invalid or missing fps");
      }
      
      if (!visualization.layers || !Array.isArray(visualization.layers) || visualization.layers.length === 0) {
        throw new Error("Missing or empty layers array");
      }
      
      // Check each layer for required properties
      visualization.layers.forEach((layer, index) => {
        if (!layer.id) {
          console.warn(`Layer at index ${index} missing id, generating one`);
          layer.id = `generated_layer_${index}`;
        }
        
        if (!layer.type) {
          throw new Error(`Layer "${layer.id}" missing required type property`);
        }
        
        if (!layer.props || typeof layer.props !== 'object') {
          console.warn(`Layer "${layer.id}" missing props, creating empty object`);
          layer.props = {};
        }
        
        if (!layer.animations || !Array.isArray(layer.animations)) {
          console.warn(`Layer "${layer.id}" missing animations array, creating empty array`);
          layer.animations = [];
        }
      });
      
      // Validate particle systems if present
      if (visualization.particleSystems) {
        if (!Array.isArray(visualization.particleSystems)) {
          console.warn("particleSystems is not an array, converting to empty array");
          visualization.particleSystems = [];
        }
      } else {
        // Ensure particleSystems exists
        visualization.particleSystems = [];
      }
    } catch (err) {
      console.error("Visualization validation error:", err.message);
      setError(`Invalid visualization format: ${err.message}`);
    }
  }, [visualization]);

  // Timeline sequencing controls
  const timeline = useMemo(() => {
    const renderAtTime = (time) => {
      if (canvasRef.current && visualization && !error) {
        // We'll use a simplified render just for seeking
        // The full renderCanvas function will be defined later
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Clear and draw background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fffaf0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // We'll let the proper renderCanvas function handle the actual rendering
        // when it's defined
      }
    };
    
    return {
      // Create a new timeline
      create: (config = {}) => {
        const defaultConfig = {
          duration: visualization?.duration || 0,
          autoplay: true,
          repeat: false
        };
        
        const timelineConfig = { ...defaultConfig, ...config };
        
        setTimelineState(prev => ({
          ...prev,
          totalDuration: timelineConfig.duration,
          currentTime: 0,
          sequences: [],
          markers: timelineConfig.markers || []
        }));
        
        return timelineConfig;
      },
      
      // Add a sequence to the timeline
      addSequence: (sequence) => {
        if (!sequence || !sequence.id) return;
        
        setTimelineState(prev => {
          // Insert sequence in correct order based on startTime
          const newSequences = [...prev.sequences, sequence].sort((a, b) => a.startTime - b.startTime);
          
          // Recalculate total duration if needed
          const lastEndTime = Math.max(...newSequences.map(s => s.startTime + s.duration));
          const totalDuration = Math.max(prev.totalDuration, lastEndTime);
          
          return {
            ...prev,
            sequences: newSequences,
            totalDuration
          };
        });
      },
      
      // Remove a sequence from the timeline
      removeSequence: (sequenceId) => {
        setTimelineState(prev => {
          const newSequences = prev.sequences.filter(s => s.id !== sequenceId);
          return {
            ...prev,
            sequences: newSequences
          };
        });
      },
      
      // Add a marker at a specific time
      addMarker: (marker) => {
        if (!marker || !marker.time) return;
        
        setTimelineState(prev => {
          const newMarkers = [...prev.markers, marker].sort((a, b) => a.time - b.time);
          return {
            ...prev,
            markers: newMarkers
          };
        });
      },
      
      // Remove a marker
      removeMarker: (markerId) => {
        setTimelineState(prev => {
          const newMarkers = prev.markers.filter(m => m.id !== markerId);
          return {
            ...prev,
            markers: newMarkers
          };
        });
      },
      
      // Seek to a specific time in the timeline
      seek: (time) => {
        const clampedTime = Math.max(0, Math.min(time, timelineState.totalDuration));
        setTimelineState(prev => ({
          ...prev,
          currentTime: clampedTime
        }));
        
        // Trigger rendering at this time
        renderAtTime(clampedTime);
      },
      
      // Get current timeline state
      getState: () => {
        return timelineState;
      },
      
      // Update the current time and check for sequence triggers
      update: (elapsed) => {
        // Update current time
        const currentTime = elapsed % timelineState.totalDuration;
        
        // Find active sequences
        const activeSequences = timelineState.sequences.filter(sequence => {
          const sequenceEndTime = sequence.startTime + sequence.duration;
          return currentTime >= sequence.startTime && currentTime <= sequenceEndTime;
        });
        
        // Find active markers
        const activeMarkers = timelineState.markers.filter(marker => {
          // A marker is "active" if we just crossed its time
          const prevTime = timelineState.currentTime;
          return (prevTime < marker.time && currentTime >= marker.time) ||
                 (timelineState.totalDuration > 0 && prevTime > currentTime && marker.time < prevTime);
        });
        
        // Execute marker callbacks
        activeMarkers.forEach(marker => {
          if (marker.onTrigger) {
            marker.onTrigger(marker, visualization);
          }
        });
        
        // Update state
        setTimelineState(prev => ({
          ...prev,
          currentTime,
          activeSequence: activeSequences.length > 0 ? activeSequences[0] : null
        }));
        
        return { currentTime, activeSequences, activeMarkers };
      }
    };
  }, [visualization, timelineState, error]);

  // Easing functions for smoother animations
  const easingFunctions = useMemo(() => ({
    // Linear (no easing)
    linear: t => t,
    // Quadratic
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    // Cubic
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // Elastic
    easeOutElastic: t => {
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },
    // Bounce
    easeOutBounce: t => {
      if (t < (1 / 2.75)) {
        return 7.5625 * t * t;
      } else if (t < (2 / 2.75)) {
        return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
      } else if (t < (2.5 / 2.75)) {
        return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
      } else {
        return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
      }
    }
  }), []);

  // Spring physics system for natural motion
  const springPhysics = useMemo(() => {
    return {
      // Create a spring animation with elasticity and damping
      createSpring: (startValue, endValue, options = {}) => {
        // Default values
        const stiffness = options.stiffness || 0.1; // Spring stiffness (0.01 to 1)
        const damping = options.damping || 0.8;     // Damping factor (0 to 1)
        const mass = options.mass || 1;             // Mass (affects momentum)
        const precision = options.precision || 0.001; // When to consider at rest
        
        return {
          // Current state
          value: startValue,
          velocity: 0,
          target: endValue,
          
          // Parameters
          stiffness,
          damping,
          mass,
          precision,
          
          // State
          atRest: false,
          
          // Update the spring animation
          update: function(deltaTime = 16) {
            // Normalize time step (convert to seconds)
            const dt = deltaTime / 1000;
            
            // Calculate spring force F = -k * x
            // where k = stiffness and x = displacement
            const displacement = this.value - this.target;
            const springForce = -this.stiffness * displacement;
            
            // Calculate damping force F = -c * v
            // where c = damping and v = velocity
            const dampingForce = -this.damping * this.velocity;
            
            // Sum forces
            const force = springForce + dampingForce;
            
            // Calculate acceleration (F = ma -> a = F/m)
            const acceleration = force / this.mass;
            
            // Update velocity (v = v0 + a*t)
            this.velocity += acceleration * dt;
            
            // Update position (x = x0 + v*t)
            this.value += this.velocity * dt;
            
            // Check if spring is at rest
            this.atRest = (
              Math.abs(this.velocity) < this.precision && 
              Math.abs(displacement) < this.precision
            );
            
            // If at rest, snap to exact target
            if (this.atRest) {
              this.value = this.target;
              this.velocity = 0;
            }
            
            return this.value;
          },
          
          // Set a new target
          setTarget: function(newTarget) {
            this.target = newTarget;
            this.atRest = false;
          },
          
          // Reset the spring
          reset: function(newValue, newTarget) {
            this.value = newValue !== undefined ? newValue : this.value;
            this.target = newTarget !== undefined ? newTarget : this.target;
            this.velocity = 0;
            this.atRest = false;
          }
        };
      },
      
      // Create a multi-dimensional spring (for x,y coordinates, etc)
      createVectorSpring: (startValues, endValues, options = {}) => {
        const springs = {};
        
        // Create a spring for each property
        Object.keys(startValues).forEach(key => {
          springs[key] = springPhysics.createSpring(
            startValues[key], 
            endValues[key], 
            options
          );
        });
        
        return {
          // Update all springs
          update: function(deltaTime = 16) {
            const values = {};
            let allAtRest = true;
            
            // Update each spring
            Object.keys(springs).forEach(key => {
              values[key] = springs[key].update(deltaTime);
              allAtRest = allAtRest && springs[key].atRest;
            });
            
            this.atRest = allAtRest;
            return values;
          },
          
          // Set new targets for all springs
          setTarget: function(newTargets) {
            Object.keys(newTargets).forEach(key => {
              if (springs[key]) {
                springs[key].setTarget(newTargets[key]);
              }
            });
            this.atRest = false;
          },
          
          // Reset all springs
          reset: function(newValues, newTargets) {
            Object.keys(springs).forEach(key => {
              const newValue = newValues ? newValues[key] : undefined;
              const newTarget = newTargets ? newTargets[key] : undefined;
              springs[key].reset(newValue, newTarget);
            });
            this.atRest = false;
          },
          
          // Spring is at rest when all component springs are at rest
          atRest: false
        };
      }
    };
  }, []);

  // Advanced path calculation functions
  const pathUtils = useMemo(() => {
    // Create an object with self-reference
    const utils = {
      // Calculate point on a Catmull-Rom spline
      getCatmullRomPoint: (p0, p1, p2, p3, t, alpha = 0.5) => {
        // Convert Catmull-Rom to Bezier
        const getCardinal = (p0, p1, p2, p3, t, tension) => {
          const t2 = t * t;
          const t3 = t2 * t;
          
          const s = (1 - tension) / 2;
          
          const b1 = s * ((-t3 + 2*t2 - t) * p0 + (3*t3 - 5*t2 + 2) * p1 + (-3*t3 + 4*t2 + t) * p2 + (t3 - t2) * p3);
          return b1;
        };
        
        // The t2 and t3 variables will be calculated inside the function when needed
        
        // Convert tension parameter to alpha for Catmull-Rom
        const tension = 1 - alpha;
        
        // X coordinate
        const x = getCardinal(p0.x, p1.x, p2.x, p3.x, t, tension);
        
        // Y coordinate
        const y = getCardinal(p0.y, p1.y, p2.y, p3.y, t, tension);
        
        return { x, y };
      },
      
      // Calculate the tangent at a point on a Catmull-Rom spline
      getCatmullRomTangent: (p0, p1, p2, p3, t, alpha = 0.5) => {
        // Similar to getCatmullRomPoint but we calculate the derivative
        const getTangent = (p0, p1, p2, p3, t, tension) => {
          const t2 = t * t;
          
          const s = (1 - tension) / 2;
          
          // Derivative of the cardinal spline formula
          const d = s * ((-3*t2 + 4*t - 1) * p0 + (9*t2 - 10*t + 2) * p1 + (-9*t2 + 8*t + 1) * p2 + (3*t2 - 2*t) * p3);
          return d;
        };
        
        const tension = 1 - alpha;
        
        // Tangent X and Y components
        const tx = getTangent(p0.x, p1.x, p2.x, p3.x, t, tension);
        const ty = getTangent(p0.y, p1.y, p2.y, p3.y, t, tension);
        
        // Normalize the tangent vector
        const length = Math.sqrt(tx * tx + ty * ty);
        if (length > 0) {
          return { x: tx / length, y: ty / length };
        } else {
          return { x: 0, y: 0 };
        }
      },
      
      // Get point along a path with multiple segments
      followPath: (points, t, closed = false, orientToPath = false) => {
        if (!points || points.length < 2) {
          return { x: 0, y: 0, angle: 0 };
        }
        
        // Handle closed paths by connecting back to the start
        const pathPoints = closed ? [...points, points[0], points[1]] : points;
        
        // We need at least 4 points for Catmull-Rom (including duplicated endpoints)
        if (pathPoints.length < 4) {
          // Fall back to linear interpolation for simple paths
          const i = Math.floor(t * (pathPoints.length - 1));
          const j = Math.min(i + 1, pathPoints.length - 1);
          const segmentT = t * (pathPoints.length - 1) - i;
          
          const x = pathPoints[i].x + (pathPoints[j].x - pathPoints[i].x) * segmentT;
          const y = pathPoints[i].y + (pathPoints[j].y - pathPoints[i].y) * segmentT;
          
          // Calculate angle
          let angle = 0;
          if (orientToPath) {
            angle = Math.atan2(pathPoints[j].y - pathPoints[i].y, pathPoints[j].x - pathPoints[i].x);
          }
          
          return { x, y, angle };
        }
        
        // Determine which segment we're in
        const numSegments = closed ? pathPoints.length - 3 : pathPoints.length - 3;
        const scaledT = t * numSegments;
        const segmentIndex = Math.min(Math.floor(scaledT), numSegments - 1);
        const segmentT = scaledT - segmentIndex;
        
        // Get the four points needed for this segment
        const p0 = pathPoints[segmentIndex];
        const p1 = pathPoints[segmentIndex + 1];
        const p2 = pathPoints[segmentIndex + 2];
        const p3 = pathPoints[segmentIndex + 3];
        
        // Calculate the point on the curve
        const point = utils.getCatmullRomPoint(p0, p1, p2, p3, segmentT);
        
        // Calculate the orientation angle if requested
        let angle = 0;
        if (orientToPath) {
          const tangent = utils.getCatmullRomTangent(p0, p1, p2, p3, segmentT);
          angle = Math.atan2(tangent.y, tangent.x);
        }
        
        return { ...point, angle };
      }
    };
    
    return utils;
  }, []);
  
  // SVG path rendering utilities
  const svgUtils = useMemo(() => {
    return {
      // Parse SVG path data string into a usable format
      parseSVGPath: (pathData) => {
        // Regular expression to match path commands and parameters
        const regex = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi;
        const commands = [];
        let match;
        
        while ((match = regex.exec(pathData)) !== null) {
          const command = match[1];
          const params = match[2].trim().split(/[\s,]+/).map(parseFloat);
          commands.push({ command, params });
        }
        
        return commands;
      },
      
      // Draw an SVG path on canvas
      drawSVGPath: (ctx, pathData, x = 0, y = 0, scale = 1, options = {}) => {
        const commands = typeof pathData === 'string' 
          ? svgUtils.parseSVGPath(pathData) 
          : pathData;
        
        if (!commands || commands.length === 0) return;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        if (options.rotate) {
          ctx.rotate(options.rotate);
        }
        
        ctx.beginPath();
        
        let currentX = 0;
        let currentY = 0;
        let startX = 0;
        let startY = 0;
        
        commands.forEach(({ command, params }) => {
          switch (command.toUpperCase()) {
            case 'M': // Move to (absolute)
              currentX = params[0];
              currentY = params[1];
              startX = currentX;
              startY = currentY;
              ctx.moveTo(currentX, currentY);
              break;
              
            case 'L': // Line to (absolute)
              currentX = params[0];
              currentY = params[1];
              ctx.lineTo(currentX, currentY);
              break;
              
            case 'H': // Horizontal line (absolute)
              currentX = params[0];
              ctx.lineTo(currentX, currentY);
              break;
              
            case 'V': // Vertical line (absolute)
              currentY = params[0];
              ctx.lineTo(currentX, currentY);
              break;
              
            case 'C': // Cubic Bezier (absolute)
              ctx.bezierCurveTo(params[0], params[1], params[2], params[3], params[4], params[5]);
              currentX = params[4];
              currentY = params[5];
              break;
              
            case 'S': // Smooth cubic Bezier (absolute)
              // Calculate the reflection of the previous control point
              // This requires tracking previous control points from C and S commands
              // Simplified implementation for now
              ctx.bezierCurveTo(currentX, currentY, params[0], params[1], params[2], params[3]);
              currentX = params[2];
              currentY = params[3];
              break;
              
            case 'Q': // Quadratic Bezier (absolute)
              ctx.quadraticCurveTo(params[0], params[1], params[2], params[3]);
              currentX = params[2];
              currentY = params[3];
              break;
              
            case 'T': // Smooth quadratic Bezier (absolute)
              // Simplified implementation
              ctx.quadraticCurveTo(currentX, currentY, params[0], params[1]);
              currentX = params[0];
              currentY = params[1];
              break;
              
            case 'A': // Elliptical arc (absolute)
              // Canvas doesn't have direct support for elliptical arcs
              // Would need a complex implementation to approximate
              // For now, just draw a line to the endpoint
              currentX = params[5];
              currentY = params[6];
              ctx.lineTo(currentX, currentY);
              break;
              
            case 'Z': // Close path
              ctx.closePath();
              currentX = startX;
              currentY = startY;
              break;
              
            default:
              console.warn(`Unsupported SVG path command: ${command}`);
              break;
          }
        });
        
        if (options.fill) {
          ctx.fillStyle = options.fill;
          ctx.fill();
        }
        
        if (options.stroke) {
          ctx.strokeStyle = options.stroke;
          ctx.lineWidth = options.strokeWidth || 1;
          ctx.lineCap = options.lineCap || 'butt';
          ctx.lineJoin = options.lineJoin || 'miter';
          ctx.stroke();
        }
        
        ctx.restore();
      },
      
      // Convert SVG viewBox to canvas coordinates
      mapToCanvas: (svgX, svgY, svgViewBox, canvasX, canvasY, canvasWidth, canvasHeight) => {
        // Map SVG coordinates to canvas coordinates
        const [viewX, viewY, viewWidth, viewHeight] = svgViewBox;
        
        const scaleX = canvasWidth / viewWidth;
        const scaleY = canvasHeight / viewHeight;
        
        return {
          x: canvasX + (svgX - viewX) * scaleX,
          y: canvasY + (svgY - viewY) * scaleY,
          scale: Math.min(scaleX, scaleY)
        };
      }
    };
  }, []);
  // Helper function to draw rounded rectangle
  const drawRoundedRect = useCallback((ctx, x, y, width, height, radius, fill, stroke, strokeWidth) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    ctx.fillStyle = fill || '#000';
    ctx.fill();
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 1;
      ctx.stroke();
    }
  }, []);
  
  // Helper function to draw star
  const drawStar = useCallback((ctx, cx, cy, points, outerRadius, innerRadius, fill, stroke, strokeWidth) => {
    ctx.beginPath();
    let step, halfStep, start, n, dx, dy;
    
    step = Math.PI * 2 / points;
    halfStep = step / 2;
    start = -Math.PI / 2;
    
    ctx.moveTo(cx + outerRadius * Math.cos(start), cy + outerRadius * Math.sin(start));
    
    for (n = 1; n <= points * 2; n++) {
      const radius = n % 2 ? innerRadius : outerRadius;
      dx = cx + radius * Math.cos(start + n * halfStep);
      dy = cy + radius * Math.sin(start + n * halfStep);
      ctx.lineTo(dx, dy);
    }
    
    ctx.closePath();
    ctx.fillStyle = fill || '#000';
    ctx.fill();
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 1;
      ctx.stroke();
    }
  }, []);
  
  // Helper function to draw images with props
  const drawImageWithProps = useCallback((ctx, img, props) => {
    const x = props.x || 0;
    const y = props.y || 0;
    const width = props.width || img.width;
    const height = props.height || img.height;
    
    if (props.clip && props.clip.type === 'circle') {
      // Draw image in a circular clip
      ctx.beginPath();
      ctx.arc(props.clip.x, props.clip.y, props.clip.radius, 0, Math.PI * 2);
      ctx.clip();
    } else if (props.clip && props.clip.type === 'rect') {
      // Draw image in a rectangular clip
      ctx.beginPath();
      ctx.rect(props.clip.x, props.clip.y, props.clip.width, props.clip.height);
      ctx.clip();
    }
    
    ctx.drawImage(img, x, y, width, height);
  }, []);

  // Create gradient based on props
  const createGradient = useCallback((ctx, gradientProps) => {
    if (!gradientProps || !gradientProps.type) return null;
    
    let gradient;
    
    if (gradientProps.type === 'linear') {
      gradient = ctx.createLinearGradient(
        gradientProps.x1 || 0,
        gradientProps.y1 || 0,
        gradientProps.x2 || 0,
        gradientProps.y2 || 0
      );
    } else if (gradientProps.type === 'radial') {
      gradient = ctx.createRadialGradient(
        gradientProps.x1 || 0,
        gradientProps.y1 || 0,
        gradientProps.r1 || 0,
        gradientProps.x2 || 0,
        gradientProps.y2 || 0,
        gradientProps.r2 || 0
      );
    } else {
      return null;
    }
    
    // Add color stops
    if (gradientProps.colorStops && Array.isArray(gradientProps.colorStops)) {
      gradientProps.colorStops.forEach(stop => {
        gradient.addColorStop(stop.offset, stop.color);
      });
    }
    
    return gradient;
  }, []);

  // Draw shapes function
  const drawShape = useCallback((ctx, type, props) => {
    ctx.save();
    
    // Apply global opacity if specified
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity;
    }
    
    // Apply scaling if specified
    if (props.scaleX !== undefined || props.scaleY !== undefined) {
      const centerX = props.x + (props.width ? props.width / 2 : 0);
      const centerY = props.y + (props.height ? props.height / 2 : 0);
      ctx.translate(centerX, centerY);
      ctx.scale(props.scaleX || 1, props.scaleY || 1);
      ctx.translate(-centerX, -centerY);
    }
    
    // Handle rotation if present
    if (props.rotation !== undefined) {
      const centerX = props.x + (props.width ? props.width / 2 : 0);
      const centerY = props.y + (props.height ? props.height / 2 : 0);
      ctx.translate(centerX, centerY);
      ctx.rotate((props.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // Apply shadow if specified
    if (props.shadow) {
      ctx.shadowColor = props.shadow.color || 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = props.shadow.blur || 5;
      ctx.shadowOffsetX = props.shadow.offsetX || 2;
      ctx.shadowOffsetY = props.shadow.offsetY || 2;
    }
    
    // Apply blur effect if specified
    if (props.blur) {
      ctx.filter = `blur(${props.blur}px)`;
    }
    
    // Apply brightness effect if specified
    if (props.brightness !== undefined) {
      ctx.filter = (ctx.filter || '') + ` brightness(${props.brightness})`;
    }
    
    // Apply contrast effect if specified
    if (props.contrast !== undefined) {
      ctx.filter = (ctx.filter || '') + ` contrast(${props.contrast})`;
    }

    switch (type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(props.x, props.y, props.r, 0, Math.PI * 2);
        
        // Check for gradient
        if (props.gradient) {
          const gradient = createGradient(ctx, props.gradient);
          if (gradient) {
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = props.fill || '#000';
          }
        } else {
          ctx.fillStyle = props.fill || '#000';
        }
        
        ctx.fill();
        if (props.stroke) {
          ctx.strokeStyle = props.stroke;
          ctx.lineWidth = props.strokeWidth || 1;
          ctx.stroke();
        }
        break;
        
      case 'rect':
        // Check for gradient
        let fillStyle = props.fill || '#000';
        if (props.gradient) {
          const gradient = createGradient(ctx, props.gradient);
          if (gradient) {
            fillStyle = gradient;
          }
        }
        
        if (props.cornerRadius) {
          drawRoundedRect(ctx, props.x, props.y, props.width, props.height, props.cornerRadius, fillStyle, props.stroke, props.strokeWidth);
        } else {
          ctx.fillStyle = fillStyle;
          ctx.fillRect(props.x, props.y, props.width, props.height);
          if (props.stroke) {
            ctx.strokeStyle = props.stroke;
            ctx.lineWidth = props.strokeWidth || 1;
            ctx.strokeRect(props.x, props.y, props.width, props.height);
          }
        }
        break;
        
      case 'text':
        if (props.stroke) {
          ctx.strokeStyle = props.stroke;
          ctx.lineWidth = props.strokeWidth || 1;
          ctx.font = `${props.fontWeight || ''} ${props.fontSize || 16}px ${props.fontFamily || 'Arial'}`;
          ctx.textAlign = props.textAlign || 'center';
          ctx.strokeText(props.text, props.x, props.y);
        }
        
        ctx.fillStyle = props.fill || '#000';
        ctx.font = `${props.fontWeight || ''} ${props.fontSize || 16}px ${props.fontFamily || 'Arial'}`;
        ctx.textAlign = props.textAlign || 'center';
        ctx.textBaseline = props.textBaseline || 'middle';
        ctx.fillText(props.text, props.x, props.y);
        break;
        
      case 'image':
        if (props.src) {
          const img = new Image();
          img.src = props.src;
          
          if (img.complete) {
            // If the image is already loaded
            drawImageWithProps(ctx, img, props);
          } else {
            // If the image is still loading
            img.onload = () => {
              drawImageWithProps(ctx, img, props);
            };
          }
        }
        break;
        
      case 'arrow':
        // Draw the arrow line
        ctx.beginPath();
        ctx.moveTo(props.x, props.y);
        ctx.lineTo(props.x + props.dx, props.y + props.dy);
        ctx.strokeStyle = props.color || '#000';
        ctx.lineWidth = props.lineWidth || 2;
        ctx.stroke();
        
        // Calculate the arrow head
        const angle = Math.atan2(props.dy, props.dx);
        const headLength = props.headLength || 10;
        const headWidth = props.headWidth || Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(props.x + props.dx, props.y + props.dy);
        ctx.lineTo(
          props.x + props.dx - headLength * Math.cos(angle - headWidth),
          props.y + props.dy - headLength * Math.sin(angle - headWidth)
        );
        ctx.lineTo(
          props.x + props.dx - headLength * Math.cos(angle + headWidth),
          props.y + props.dy - headLength * Math.sin(angle + headWidth)
        );
        ctx.closePath();
        ctx.fillStyle = props.color || '#000';
        ctx.fill();
        break;
        
      case 'line':
        ctx.beginPath();
        ctx.moveTo(props.x1, props.y1);
        ctx.lineTo(props.x2, props.y2);
        ctx.strokeStyle = props.color || '#000';
        ctx.lineWidth = props.lineWidth || 2;
        
        if (props.dash) {
          ctx.setLineDash(props.dash);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
        break;
        
      case 'svg':
        // Render SVG path data
        if (props.path) {
          svgUtils.drawSVGPath(
            ctx, 
            props.path,
            props.x || 0, 
            props.y || 0, 
            props.svgScale || 1,
            {
              fill: props.fill,
              stroke: props.stroke,
              strokeWidth: props.strokeWidth,
              lineCap: props.lineCap,
              lineJoin: props.lineJoin,
              rotate: props.svgRotation ? (props.svgRotation * Math.PI / 180) : 0
            }
          );
        }
        break;
        
      case 'polygon':
        if (props.points && props.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(props.points[0].x, props.points[0].y);
          
          for (let i = 1; i < props.points.length; i++) {
            ctx.lineTo(props.points[i].x, props.points[i].y);
          }
          
          ctx.closePath();
          ctx.fillStyle = props.fill || '#000';
          ctx.fill();
          
          if (props.stroke) {
            ctx.strokeStyle = props.stroke;
            ctx.lineWidth = props.strokeWidth || 1;
            ctx.stroke();
          }
        }
        break;
        
      case 'star':
        drawStar(ctx, props.x, props.y, props.points || 5, props.outerRadius || 30, props.innerRadius || 15, props.fill, props.stroke, props.strokeWidth);
        break;
        
      default:
        console.warn(`Unknown shape type: ${type}`);
    }
    
    ctx.restore();
  }, [drawRoundedRect, drawStar, drawImageWithProps, createGradient, svgUtils]);

  // Render canvas function
  const renderCanvas = useCallback((elapsed) => {
    const canvas = canvasRef.current;
    if (!canvas || !visualization) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill with warm white background
    ctx.fillStyle = '#fffaf0'; // Warm white (floral white)
    ctx.fillRect(0, 0, width, height);
    
    // Save the context state
    ctx.save();
    
    // Simple scaling - fit 800x600 coordinate system to canvas
    const scaleX = width / 800;
    const scaleY = height / 600;
    const scale = Math.min(scaleX, scaleY);
    
    // Center the coordinate system
    const offsetX = (width - 800 * scale) / 2;
    const offsetY = (height - 600 * scale) / 2;
    
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Analyze all layers to find the bounding box
    if (visualization.layers) {
      visualization.layers.forEach(layer => {
        const props = layer.props;
        
        if (props.x !== undefined && props.y !== undefined) {
          // Determine width and height based on shape type
          let elementWidth = 0, elementHeight = 0;
          
          if (layer.type === 'rect') {
            elementWidth = props.width || 0;
            elementHeight = props.height || 0;
          } else if (layer.type === 'circle') {
            elementWidth = elementHeight = (props.r || 0) * 2;
          } else if (layer.type === 'text') {
            // Approximate text dimensions
            elementWidth = (props.text?.length || 0) * (props.fontSize || 16) * 0.6;
            elementHeight = props.fontSize || 16;
          } else if (layer.type === 'star') {
            elementWidth = elementHeight = (props.outerRadius || 30) * 2;
          } else if (layer.type === 'polygon' || layer.type === 'path') {
            // For complex shapes, we need to analyze points
            if (props.points && Array.isArray(props.points)) {
              props.points.forEach(point => {
                updateBounds(point.x, point.y, 0, 0);
              });
            }
          }
          
          // Consider animations that might affect position
          if (layer.animations) {
            layer.animations.forEach(anim => {
              if (anim.property === 'path' && anim.points) {
                // For path animations, check all points
                anim.points.forEach(point => {
                  updateBounds(point.x, point.y, 0, 0);
                });
              } else if (anim.property === 'orbit' && anim.centerX !== undefined) {
                // For orbit animations
                const orbitRadius = anim.radius || 0;
                updateBounds(anim.centerX - orbitRadius, anim.centerY - orbitRadius, 
                            orbitRadius * 2, orbitRadius * 2);
              }
            });
          }
          
          // Update bounding box with current element
          updateBounds(props.x, props.y, elementWidth, elementHeight);
        }
      });
    }
    
    // Include particle systems in the bounding box
    if (visualization.particleSystems) {
      visualization.particleSystems.forEach(system => {
        // Add the emitter position
        if (system.x !== undefined && system.y !== undefined) {
          // Get maximum possible spread of particles
          const maxSpread = system.spread || 0;
          const maxVelocity = system.velocity || 0;
          const maxLife = system.particleLife || 0;
          const maxDistance = maxVelocity * maxLife;
          
          // Update bounds with a safe area around the emitter
          updateBounds(
            system.x - maxSpread/2 - maxDistance, 
            system.y - maxSpread/2 - maxDistance,
            maxSpread + maxDistance * 2, 
            maxSpread + maxDistance * 2
          );
        }
        
        // Add existing particles
        if (system.particles && system.particles.length > 0) {
          system.particles.forEach(particle => {
            updateBounds(
              particle.x - particle.size, 
              particle.y - particle.size, 
              particle.size * 2, 
              particle.size * 2
            );
          });
        }
      });
    }
    
    // Only apply centering if we have valid bounds
    if (minX !== Infinity && minY !== Infinity && maxX !== -Infinity && maxY !== -Infinity) {
      // Add padding to the bounds
      minX -= PADDING;
      minY -= PADDING;
      maxX += PADDING;
      maxY += PADDING;
      
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      // Calculate scaling factor if content is too large
      const scaleX = width / contentWidth;
      const scaleY = height / contentHeight;
      const scale = Math.min(1, Math.min(scaleX, scaleY));
      
      // Calculate centering offsets
      const offsetX = (width - contentWidth * scale) / 2 - minX * scale;
      const offsetY = (height - contentHeight * scale) / 2 - minY * scale;
      
      console.log(`📐 Frontend: Content bounds: (${minX}, ${minY}) to (${maxX}, ${maxY})`);
      console.log(`📐 Frontend: Content size: ${contentWidth}x${contentHeight}`);
      console.log(`📐 Frontend: Canvas size: ${width}x${height}`);
      console.log(`📐 Frontend: Scale: ${scale}, Offset: (${offsetX}, ${offsetY})`);
      
      // Apply the transformation (scale and translate)
      ctx.transform(scale, 0, 0, scale, offsetX, offsetY);
    } else {
      // If no valid bounds found, use simple scaling for standard coordinates (800x600)
      const standardWidth = 800;
      const standardHeight = 600;
      const scaleX = width / standardWidth;
      const scaleY = height / standardHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Center the standard coordinate system
      const offsetX = (width - standardWidth * scale) / 2;
      const offsetY = (height - standardHeight * scale) / 2;
      
      ctx.transform(scale, 0, 0, scale, offsetX, offsetY);
    }
    
    // Sort layers by z-index if specified
    const sortedLayers = [...visualization.layers].sort((a, b) => {
      const zIndexA = a.props.zIndex || 0;
      const zIndexB = b.props.zIndex || 0;
      return zIndexA - zIndexB;
    });
    
    // Render particle systems if any
    if (visualization.particleSystems) {
      visualization.particleSystems.forEach(system => {
        if (system.particles && system.particles.length > 0) {
          system.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            
            // Draw particle
            ctx.beginPath();
            
            // If the particle has a custom shape
            if (particle.shape === 'square') {
              // Draw a square
              const halfSize = particle.size / 2;
              ctx.fillRect(particle.x - halfSize, particle.y - halfSize, particle.size, particle.size);
            } else if (particle.shape === 'star') {
              // Draw a star
              const points = particle.points || 5;
              const outerRadius = particle.size;
              const innerRadius = particle.size * 0.4;
              
              ctx.translate(particle.x, particle.y);
              if (particle.rotation) {
                ctx.rotate(particle.rotation * Math.PI / 180);
              }
              
              ctx.beginPath();
              for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              }
              ctx.closePath();
              ctx.fill();
            } else if (particle.shape === 'triangle') {
              // Draw a triangle
              ctx.translate(particle.x, particle.y);
              if (particle.rotation) {
                ctx.rotate(particle.rotation * Math.PI / 180);
              }
              
              const size = particle.size;
              ctx.beginPath();
              ctx.moveTo(0, -size);
              ctx.lineTo(size * 0.866, size * 0.5); // 0.866 = sin(60°)
              ctx.lineTo(-size * 0.866, size * 0.5);
              ctx.closePath();
              ctx.fill();
            } else {
              // Default: draw a circle
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.fill();
            }
            
            ctx.restore();
          });
        }
      });
    }

    // Update and render each layer
    sortedLayers.forEach(layer => {
      const layerRef = layerRefs[layer.id];
      if (!layerRef) return;

      // Process animations for this layer
      const updatedProps = { ...layer.props };
      
      if (layer.animations && layer.animations.length > 0) {
        layer.animations.forEach(anim => {
          // Handle looping animations
          let effectiveElapsed = elapsed;
          if (anim.loop === true && anim.end > anim.start) {
            const animDuration = anim.end - anim.start;
            effectiveElapsed = anim.start + ((elapsed - anim.start) % animDuration);
          }
          
          // Only process animation if we're within its time range
          if (effectiveElapsed >= anim.start && effectiveElapsed <= anim.end) {
            let progress = (effectiveElapsed - anim.start) / (anim.end - anim.start);
            
            // Apply easing function if specified
            const easingFunction = anim.easing ? 
              (easingFunctions[anim.easing] || easingFunctions.linear) : 
              easingFunctions.linear;
            
            progress = easingFunction(progress);
            
            if (anim.property === 'orbit') {
              // Special case for orbit animation
              const angle = progress * Math.PI * 2;
              updatedProps.x = anim.centerX + Math.cos(angle) * anim.radius;
              updatedProps.y = anim.centerY + Math.sin(angle) * anim.radius;
            } else if (anim.property === 'rotation') {
              // Handle rotation animation
              updatedProps.rotation = anim.from + (anim.to - anim.from) * progress;
            } else if (anim.property === 'path') {
              if (anim.pathType === 'catmull-rom' && anim.points && anim.points.length >= 4) {
                // Catmull-Rom spline path following with orientation
                const result = pathUtils.followPath(
                  anim.points, 
                  progress, 
                  anim.closed || false,
                  anim.orientToPath || false
                );
                
                // Update position
                updatedProps.x = result.x;
                updatedProps.y = result.y;
                
                // Update rotation to follow path direction if requested
                if (anim.orientToPath) {
                  updatedProps.rotation = (result.angle * 180 / Math.PI);
                  
                  // Apply rotation offset if specified
                  if (anim.rotationOffset !== undefined) {
                    updatedProps.rotation += anim.rotationOffset;
                  }
                }
              } else if (anim.pathType === 'bezier' && anim.points && anim.points.length >= 3) {
                // Bezier curve animation
                const p = progress;
                const invP = 1 - p;
                
                if (anim.points.length === 4) {
                  // Cubic Bezier curve (4 points)
                  const p0 = anim.points[0];
                  const p1 = anim.points[1];
                  const p2 = anim.points[2];
                  const p3 = anim.points[3];
                  
                  // Calculate position using cubic Bezier formula
                  updatedProps.x = invP*invP*invP*p0.x + 3*invP*invP*p*p1.x + 3*invP*p*p*p2.x + p*p*p*p3.x;
                  updatedProps.y = invP*invP*invP*p0.y + 3*invP*invP*p*p1.y + 3*invP*p*p*p2.y + p*p*p*p3.y;
                } else {
                  // Quadratic Bezier curve (3 points)
                  const p0 = anim.points[0];
                  const p1 = anim.points[1];
                  const p2 = anim.points[2];
                  
                  // Calculate position using quadratic Bezier formula
                  updatedProps.x = invP*invP*p0.x + 2*invP*p*p1.x + p*p*p2.x;
                  updatedProps.y = invP*invP*p0.y + 2*invP*p*p1.y + p*p*p2.y;
                }
              } else if (anim.points) {
                // Linear path animation (original implementation)
                const pointIndex = Math.min(
                  Math.floor(progress * (anim.points.length - 1)), 
                  anim.points.length - 2
                );
                const pathProgress = (progress * (anim.points.length - 1)) - pointIndex;
                
                const p1 = anim.points[pointIndex];
                const p2 = anim.points[pointIndex + 1];
                
                updatedProps.x = p1.x + (p2.x - p1.x) * pathProgress;
                updatedProps.y = p1.y + (p2.y - p1.y) * pathProgress;
              }
            } else if (anim.property === 'scale') {
              // Handle scaling
              updatedProps.scaleX = anim.fromX + (anim.toX - anim.fromX) * progress;
              updatedProps.scaleY = anim.fromY + (anim.toY - anim.fromY) * progress;
            } else if (anim.property === 'opacity') {
              // Handle opacity
              updatedProps.opacity = anim.from + (anim.to - anim.from) * progress;
            } else if (anim.property === 'spring') {
              // Spring-based animation
              // We need to store the spring instance in the layer ref
              if (!layerRef.springs) {
                layerRef.springs = {};
              }
              
              // Create a unique spring ID for this animation
              const springId = `${anim.property}_${anim.targetProperty}`;
              
              // Create spring if it doesn't exist yet
              if (!layerRef.springs[springId]) {
                // For vector properties like position (x,y)
                if (anim.targetProperty === 'position') {
                  layerRef.springs[springId] = springPhysics.createVectorSpring(
                    { x: anim.fromX || updatedProps.x, y: anim.fromY || updatedProps.y },
                    { x: anim.toX || anim.from?.x, y: anim.toY || anim.from?.y },
                    {
                      stiffness: anim.stiffness || 0.1,
                      damping: anim.damping || 0.8,
                      mass: anim.mass || 1
                    }
                  );
                } else {
                  // For single value properties
                  layerRef.springs[springId] = springPhysics.createSpring(
                    anim.from,
                    anim.to,
                    {
                      stiffness: anim.stiffness || 0.1,
                      damping: anim.damping || 0.8,
                      mass: anim.mass || 1
                    }
                  );
                }
              }
              
              // If we're at the beginning of the animation or it's triggered
              if (effectiveElapsed === anim.start || anim.triggered) {
                // Reset and trigger the spring
                if (anim.targetProperty === 'position') {
                  layerRef.springs[springId].setTarget({ 
                    x: anim.toX, 
                    y: anim.toY 
                  });
                } else {
                  layerRef.springs[springId].setTarget(anim.to);
                }
                
                // Clear the triggered flag if it was set
                if (anim.triggered) {
                  anim.triggered = false;
                }
              }
              
              // Update the spring (with approx elapsed time since last frame)
              const deltaTime = 16; // assume ~60fps
              
              if (anim.targetProperty === 'position') {
                const pos = layerRef.springs[springId].update(deltaTime);
                updatedProps.x = pos.x;
                updatedProps.y = pos.y;
              } else {
                updatedProps[anim.targetProperty] = layerRef.springs[springId].update(deltaTime);
              }
            } else {
              // Linear interpolation for standard properties
              updatedProps[anim.property] = anim.from + (anim.to - anim.from) * progress;
            }
          } else if (elapsed > anim.end && !anim.loop) {
            // If we're past the end time, set to final value
            if (anim.property === 'orbit') {
              const angle = Math.PI * 2;
              updatedProps.x = anim.centerX + Math.cos(angle) * anim.radius;
              updatedProps.y = anim.centerY + Math.sin(angle) * anim.radius;
            } else if (anim.property === 'rotation') {
              updatedProps.rotation = anim.to;
            } else if (anim.property === 'path') {
              if (anim.pathType === 'catmull-rom' && anim.points && anim.points.length >= 4) {
                // For Catmull-Rom paths, use the last point
                const lastPoint = anim.points[anim.points.length - 1];
                updatedProps.x = lastPoint.x;
                updatedProps.y = lastPoint.y;
                
                // Set final rotation if orientToPath is true
                if (anim.orientToPath) {
                  // Get the angle between the last two points
                  const lastPoints = anim.points.slice(-2);
                  if (lastPoints.length === 2) {
                    const dx = lastPoints[1].x - lastPoints[0].x;
                    const dy = lastPoints[1].y - lastPoints[0].y;
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    updatedProps.rotation = angle;
                    
                    // Apply rotation offset if specified
                    if (anim.rotationOffset !== undefined) {
                      updatedProps.rotation += anim.rotationOffset;
                    }
                  }
                }
              } else if (anim.pathType === 'bezier' && anim.points && anim.points.length >= 3) {
                // For Bezier paths, use the last point when animation ends
                const lastPoint = anim.points[anim.points.length - 1];
                updatedProps.x = lastPoint.x;
                updatedProps.y = lastPoint.y;
              } else if (anim.points) {
                // For regular paths, use the last point
                const lastPoint = anim.points[anim.points.length - 1];
                updatedProps.x = lastPoint.x;
                updatedProps.y = lastPoint.y;
              }
            } else if (anim.property === 'scale') {
              updatedProps.scaleX = anim.toX;
              updatedProps.scaleY = anim.toY;
            } else if (anim.property === 'opacity') {
              updatedProps.opacity = anim.to;
            } else if (anim.property === 'spring') {
              // For spring animations, just set to the final target
              if (anim.targetProperty === 'position') {
                updatedProps.x = anim.toX;
                updatedProps.y = anim.toY;
              } else {
                updatedProps[anim.targetProperty] = anim.to;
              }
            } else {
              updatedProps[anim.property] = anim.to;
            }
          }
        });
      }

      // Update the layer's current properties
      layerRefs[layer.id].currentProps = updatedProps;

      // Render based on shape type
      drawShape(ctx, layer.type, updatedProps);
      
      // We no longer need to track if all animations are complete
      // This allows animations to continue playing
    });
    
    // Restore the context to clear any global transformations we applied
    ctx.restore();
    
    // Keep track if all animations are complete, but don't stop playing automatically
    // This allows the animation to continue showing the final state
  }, [visualization, drawShape, layerRefs, easingFunctions, pathUtils, springPhysics]);

  // Particle system management
  const updateParticles = useCallback((elapsed, particles) => {
    if (!particles || !Array.isArray(particles)) return [];
    
    // Process each particle
    return particles.filter(p => {
      // Update particle position based on velocity
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply gravity if specified
      if (p.gravity) {
        p.vy += p.gravity;
      }
      
      // Apply friction if specified
      if (p.friction) {
        p.vx *= p.friction;
        p.vy *= p.friction;
      }
      
      // Update lifetime
      p.life -= 1;
      
      // Update opacity based on life
      if (p.fadeOut) {
        p.opacity = (p.life / p.maxLife) * p.initialOpacity;
      }
      
      // Update size based on life
      if (p.shrink) {
        p.size = (p.life / p.maxLife) * p.initialSize;
      }
      
      // Keep particle if still alive
      return p.life > 0;
    });
  }, []);

  // Animation loop function
  const animationLoop = useCallback(() => {
    if (!canvasRef.current || !visualization) return;

    const now = performance.now();
    const elapsed = startTime ? now - startTime : 0;
    
    // Calculate the effective time for rendering, allowing the animation to loop
    // If elapsed time exceeds duration, we'll use modulo to restart the animation
    const effectiveElapsed = visualization.duration > 0 
      ? elapsed % visualization.duration 
      : elapsed;
    
    // Update timeline state if enabled
    if (timelineState.totalDuration > 0) {
      const timelineResults = timeline.update(effectiveElapsed / 1000);
      
      // If we have active sequences, we can use them to control animations
      if (timelineResults.activeSequences && timelineResults.activeSequences.length > 0) {
        // We could add sequence-specific processing here
        // For example, activating/deactivating elements based on the active sequence
      }
    }
    
    // Update any particle systems
    if (visualization.particleSystems) {
      visualization.particleSystems.forEach(system => {
        // Initialize advanced particle system if it doesn't exist
        if (!system.advancedSystem) {
          system.advancedSystem = new AdvancedParticleSystem({
            gravity: system.gravity || 0,
            friction: system.friction || 0.99,
            bounds: system.bounds || null,
            collisions: system.collisions || false,
            collisionDamping: system.collisionDamping || 0.5,
            forceFields: system.forceFields || [],
            particleInteractions: system.particleInteractions || [],
            globalForces: system.globalForces || [],
            flowFields: system.flowFields || [],
            boundaries: system.boundaries || { type: 'none' }
          });
          
          // Initialize particles array if needed
          if (!system.particles) {
            system.particles = [];
          }
        }
        
        // Add new particles based on emission rate
        if (system.active && system.emissionRate) {
          const particlesToEmit = Math.floor(Math.random() * system.emissionRate);
          for (let i = 0; i < particlesToEmit; i++) {
            const newParticle = {
              x: system.x + (Math.random() * system.spread) - (system.spread / 2),
              y: system.y + (Math.random() * system.spread) - (system.spread / 2),
              vx: (Math.random() * system.velocity) - (system.velocity / 2),
              vy: (Math.random() * system.velocity) - (system.velocity / 2),
              size: system.particleSize + (Math.random() * system.sizeVariance),
              color: system.colors[Math.floor(Math.random() * system.colors.length)],
              life: 1.0, // Normalized life (0-1)
              maxLife: system.particleLife + Math.floor(Math.random() * system.lifeVariance),
              mass: system.particleMass || 1,
              opacity: system.opacity || 1,
              initialOpacity: system.opacity || 1,
              initialSize: system.particleSize + (Math.random() * system.sizeVariance),
              fadeOut: system.fadeOut !== false,
              shrink: system.shrink || false,
              interactionGroup: system.interactionGroup || null
            };
            
            // Add to advanced system
            system.advancedSystem.addParticle(newParticle);
            // Also add to regular array for backward compatibility
            system.particles.push(newParticle);
          }
        }
        
        // Update particles using the advanced system
        if (system.advancedSystem) {
          // Calculate deltaTime in milliseconds for the update
          const deltaTime = 1000 / (visualization.fps || 60);
          system.advancedSystem.update(deltaTime);
          
          // Update the regular particles array for backward compatibility
          system.particles = system.advancedSystem.particles;
        } else {
          // Fallback to legacy particle update for backward compatibility
          system.particles = updateParticles(elapsed, system.particles);
        }
      });
    }
    
    renderCanvas(effectiveElapsed);
    animationRef.current = requestAnimationFrame(animationLoop);
  }, [visualization, startTime, renderCanvas, updateParticles, timeline, timelineState]);

  // Reset animation when visualization changes
  useEffect(() => {
    if (visualization) {
      console.log("Visualization changed, resetting animation state");
      // Create refs for each layer
      const newLayerRefs = {};
      visualization.layers.forEach(layer => {
        newLayerRefs[layer.id] = {
          ...layer,
          currentProps: { ...layer.props }
        };
      });
      setLayerRefs(newLayerRefs);
      setStartTime(null);
    }
  }, [visualization]);

  // Handle play/pause state changes
  useEffect(() => {
    console.log("Play state changed:", isPlaying, "startTime:", startTime);
    if (isPlaying) {
      if (!startTime) {
        console.log("Setting new start time");
        setStartTime(performance.now());
      }
      console.log("Starting animation loop");
      animationLoop();
    } else {
      console.log("Stopping animation loop");
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, startTime, animationLoop]);

  // Canvas resize effect
  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas size to match its container with some padding for better centering
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const container = canvas.parentElement;
          // Use 100% of the container width/height to fill available space
          // while maintaining aspect ratio
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          // Determine the aspect ratio to maintain (use 16:9 if not specified)
          const aspectRatio = visualization?.aspectRatio || 16/9;
          
          // Calculate dimensions that fit within the container while maintaining aspect ratio
          let width, height;
          
          if (containerWidth / containerHeight > aspectRatio) {
            // Constrain by height
            height = containerHeight;
            width = height * aspectRatio;
          } else {
            // Constrain by width
            width = containerWidth;
            height = width / aspectRatio;
          }
          
          // Set dimensions
          canvas.width = Math.floor(width);
          canvas.height = Math.floor(height);
          
          // Re-render immediately if we're not playing
          if (!isPlaying && visualization) {
            renderCanvas(startTime ? performance.now() - startTime : 0);
          }
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

  // Check if we have an error from validation
  if (error) {
    return (
      <div className="visualization-error">
        <div className="error-icon">❌</div>
        <h3>Visualization Error</h3>
        <p>{error}</p>
        <p className="error-tip">Try asking a different question or refreshing the page</p>
      </div>
    );
  }

  // Check if visualization has the required structure
  const isValidVisualization = visualization && 
    visualization.duration && 
    visualization.fps && 
    Array.isArray(visualization.layers) && 
    visualization.layers.length > 0;

  if (!isValidVisualization) {
    return (
      <div className="visualization-error">
        <div className="error-icon">⚠️</div>
        <h3>Invalid Visualization</h3>
        <p>The visualization data is incomplete or malformed.</p>
        <p className="error-tip">Try asking a different question</p>
      </div>
    );
  }

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef} 
        style={{display: 'block', width: '100%', height: '100%'}} 
      />
      <div className="visualization-overlay">
        <MockVisualizationInfo isMockVisualization={isMockVisualization} />
      </div>
    </div>
  );
};

export default VisualizationCanvas;
