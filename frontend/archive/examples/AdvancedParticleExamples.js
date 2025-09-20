// Advanced particle system with forces, collisions and interactions
// This module provides examples of enhanced particle effects using physics

export const AdvancedParticleExamples = {
  // Basic particle system with gravity and collision
  gravityParticles: {
    duration: 10,
    fps: 60,
    aspectRatio: 16/9,
    particleSystems: [
      {
        id: 'gravity-particles',
        x: 400,
        y: 100,
        emissionRate: 3,
        particleLife: 200,
        lifeVariance: 50,
        spread: 200,
        velocity: 2,
        particleSize: 8,
        sizeVariance: 4,
        colors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
        gravity: 0.2,
        friction: 0.98,
        bounce: 0.7,  // Bounce factor when hitting boundaries
        collisions: true,  // Enable particle collisions
        collisionDamping: 0.5,  // Energy loss on collision
        bounds: {  // Boundaries for particles
          x: 100,
          y: 500,
          width: 600,
          height: 100
        },
        active: true,
        fadeOut: true,
        shrink: true
      }
    ],
    layers: [
      {
        id: 'boundary',
        type: 'rect',
        props: {
          x: 100,
          y: 500,
          width: 600,
          height: 100,
          fill: 'transparent',
          stroke: '#34495e',
          strokeWidth: 2
        }
      },
      {
        id: 'text-label',
        type: 'text',
        props: {
          x: 400,
          y: 550,
          text: 'Gravity & Collision Boundary',
          fontSize: 20,
          fill: '#34495e',
          textAlign: 'center'
        }
      },
      {
        id: 'emitter-label',
        type: 'text',
        props: {
          x: 400, 
          y: 80,
          text: 'Particle Emitter',
          fontSize: 16,
          fill: '#7f8c8d',
          textAlign: 'center'
        }
      }
    ]
  },
  
  // Force fields affecting particles
  forceFields: {
    duration: 15,
    fps: 60,
    aspectRatio: 16/9,
    particleSystems: [
      {
        id: 'force-field-particles',
        x: 400,
        y: 300,
        emissionRate: 2,
        particleLife: 300,
        lifeVariance: 100,
        spread: 50,
        velocity: 1,
        particleSize: 6,
        sizeVariance: 3,
        colors: ['#3498db', '#2980b9', '#1abc9c', '#16a085'],
        gravity: 0,
        friction: 0.99,
        active: true,
        fadeOut: true,
        shrink: false
      }
    ],
    forceFields: [
      {
        id: 'attractor',
        type: 'point',
        x: 200,
        y: 200,
        strength: 0.3,  // Positive for attraction
        radius: 200     // Effective radius
      },
      {
        id: 'repeller',
        type: 'point',
        x: 600,
        y: 400,
        strength: -0.2,  // Negative for repulsion
        radius: 150      // Effective radius
      },
      {
        id: 'vortex',
        type: 'vortex',
        x: 400,
        y: 200,
        strength: 0.1,
        radius: 200
      }
    ],
    layers: [
      {
        id: 'attractor-indicator',
        type: 'circle',
        props: {
          x: 200,
          y: 200,
          radius: 15,
          fill: '#2ecc71',
          stroke: '#27ae60',
          strokeWidth: 2
        }
      },
      {
        id: 'attractor-field',
        type: 'circle',
        props: {
          x: 200,
          y: 200,
          radius: 200,
          fill: 'rgba(46, 204, 113, 0.1)',
          stroke: '#2ecc71',
          strokeWidth: 1
        }
      },
      {
        id: 'attractor-label',
        type: 'text',
        props: {
          x: 200,
          y: 200,
          text: 'Attractor',
          fontSize: 14,
          fill: '#27ae60',
          textAlign: 'center'
        }
      },
      {
        id: 'repeller-indicator',
        type: 'circle',
        props: {
          x: 600,
          y: 400,
          radius: 15,
          fill: '#e74c3c',
          stroke: '#c0392b',
          strokeWidth: 2
        }
      },
      {
        id: 'repeller-field',
        type: 'circle',
        props: {
          x: 600,
          y: 400,
          radius: 150,
          fill: 'rgba(231, 76, 60, 0.1)',
          stroke: '#e74c3c',
          strokeWidth: 1
        }
      },
      {
        id: 'repeller-label',
        type: 'text',
        props: {
          x: 600,
          y: 400,
          text: 'Repeller',
          fontSize: 14,
          fill: '#c0392b',
          textAlign: 'center'
        }
      },
      {
        id: 'vortex-indicator',
        type: 'circle',
        props: {
          x: 400,
          y: 200,
          radius: 15,
          fill: '#9b59b6',
          stroke: '#8e44ad',
          strokeWidth: 2
        }
      },
      {
        id: 'vortex-field',
        type: 'circle',
        props: {
          x: 400,
          y: 200,
          radius: 200,
          fill: 'rgba(155, 89, 182, 0.1)',
          stroke: '#9b59b6',
          strokeWidth: 1
        }
      },
      {
        id: 'vortex-label',
        type: 'text',
        props: {
          x: 400,
          y: 200,
          text: 'Vortex',
          fontSize: 14,
          fill: '#8e44ad',
          textAlign: 'center'
        }
      }
    ]
  },
  
  // Particle collisions with interactions
  particleInteractions: {
    duration: 20,
    fps: 60,
    aspectRatio: 16/9,
    particleSystems: [
      {
        id: 'red-particles',
        x: 200,
        y: 200,
        emissionRate: 1,
        particleLife: 400,
        lifeVariance: 100,
        spread: 10,
        velocity: 1.5,
        particleSize: 12,
        sizeVariance: 4,
        colors: ['#e74c3c', '#c0392b'],
        gravity: 0,
        friction: 0.99,
        mass: 2,  // Heavier particles
        active: true,
        fadeOut: true,
        shrink: false,
        interactionGroup: 'red'  // Group for interactions
      },
      {
        id: 'blue-particles',
        x: 600,
        y: 400,
        emissionRate: 1,
        particleLife: 400,
        lifeVariance: 100,
        spread: 10,
        velocity: 1.5,
        particleSize: 8,
        sizeVariance: 2,
        colors: ['#3498db', '#2980b9'],
        gravity: 0,
        friction: 0.99,
        mass: 1,  // Lighter particles
        active: true,
        fadeOut: true,
        shrink: false,
        interactionGroup: 'blue'  // Group for interactions
      }
    ],
    // Interaction rules between particle groups
    particleInteractions: [
      {
        groups: ['red', 'blue'],
        type: 'attract',
        strength: 0.1,
        minDistance: 30,  // Minimum distance for interaction
        maxDistance: 150  // Maximum distance for interaction
      },
      {
        groups: ['red', 'red'],
        type: 'repel',
        strength: 0.05,
        minDistance: 20,
        maxDistance: 100
      },
      {
        groups: ['blue', 'blue'],
        type: 'repel',
        strength: 0.08,
        minDistance: 20,
        maxDistance: 100
      }
    ],
    // Global force that affects all particles
    globalForces: [
      {
        type: 'drag',
        strength: 0.01  // Air resistance
      }
    ],
    // Boundaries with different behaviors
    boundaries: {
      type: 'wrap',  // 'wrap', 'bounce', or 'kill'
      x: 100,
      y: 100,
      width: 600,
      height: 400
    },
    layers: [
      {
        id: 'boundary',
        type: 'rect',
        props: {
          x: 100,
          y: 100,
          width: 600,
          height: 400,
          fill: 'transparent',
          stroke: '#34495e',
          strokeWidth: 2
        }
      },
      {
        id: 'red-emitter',
        type: 'circle',
        props: {
          x: 200,
          y: 200,
          radius: 10,
          fill: '#e74c3c',
          stroke: '#c0392b',
          strokeWidth: 2
        }
      },
      {
        id: 'red-label',
        type: 'text',
        props: {
          x: 200,
          y: 180,
          text: 'Red Particles',
          fontSize: 14,
          fill: '#c0392b',
          textAlign: 'center'
        }
      },
      {
        id: 'blue-emitter',
        type: 'circle',
        props: {
          x: 600,
          y: 400,
          radius: 10,
          fill: '#3498db',
          stroke: '#2980b9',
          strokeWidth: 2
        }
      },
      {
        id: 'blue-label',
        type: 'text',
        props: {
          x: 600,
          y: 380,
          text: 'Blue Particles',
          fontSize: 14,
          fill: '#2980b9',
          textAlign: 'center'
        }
      },
      {
        id: 'description',
        type: 'text',
        props: {
          x: 400,
          y: 50,
          text: 'Particle Interactions: Red/Blue Attract, Same Colors Repel',
          fontSize: 18,
          fill: '#34495e',
          textAlign: 'center'
        }
      }
    ]
  },
  
  // Fluid simulation with particles
  fluidEffect: {
    duration: 30,
    fps: 60,
    aspectRatio: 16/9,
    particleSystems: [
      {
        id: 'fluid-particles',
        x: 400,
        y: 300,
        emissionRate: 5,
        particleLife: 500,
        lifeVariance: 200,
        spread: 300,
        velocity: 0.5,
        particleSize: 5,
        sizeVariance: 2,
        colors: ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#9b59b6', '#8e44ad'],
        gravity: 0,
        friction: 0.98,
        viscosity: 0.8,    // Fluid resistance
        pressureStrength: 0.2,  // Pressure forces
        densityConstraint: 5,   // Target density
        active: true,
        fadeOut: true,
        shrink: false
      }
    ],
    // Flow fields to simulate fluid currents
    flowFields: [
      {
        id: 'circular-flow',
        type: 'circular',
        x: 400,
        y: 300,
        radius: 200,
        strength: 0.08,
        clockwise: true
      },
      {
        id: 'wave-flow',
        type: 'wave',
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        amplitude: 0.3,
        frequency: 0.01,
        speed: 0.5
      }
    ],
    // External forces that disturb the fluid
    externalForces: [
      {
        id: 'mouse-force',
        type: 'point',
        x: 300,
        y: 200,
        strength: 0.5,
        radius: 100,
        // In a real implementation, this would track mouse position
        animation: {
          path: [
            { x: 300, y: 200 },
            { x: 500, y: 300 },
            { x: 300, y: 400 },
            { x: 200, y: 300 }
          ],
          duration: 10,
          loop: true
        }
      }
    ],
    layers: [
      {
        id: 'flow-field-indicator',
        type: 'circle',
        props: {
          x: 400,
          y: 300,
          radius: 200,
          fill: 'transparent',
          stroke: 'rgba(52, 152, 219, 0.2)',
          strokeWidth: 1
        }
      },
      {
        id: 'force-indicator',
        type: 'circle',
        props: {
          x: 300,
          y: 200,
          radius: 15,
          fill: 'rgba(231, 76, 60, 0.6)',
          stroke: '#c0392b',
          strokeWidth: 2
        },
        animations: [
          {
            property: 'path',
            pathType: 'catmull-rom',
            start: 0,
            end: 10,
            points: [
              { x: 300, y: 200 },
              { x: 500, y: 300 },
              { x: 300, y: 400 },
              { x: 200, y: 300 }
            ],
            closed: true,
            loop: true,
            easing: 'linear'
          }
        ]
      },
      {
        id: 'force-field',
        type: 'circle',
        props: {
          x: 300,
          y: 200,
          radius: 100,
          fill: 'rgba(231, 76, 60, 0.1)',
          stroke: 'rgba(231, 76, 60, 0.3)',
          strokeWidth: 1
        },
        animations: [
          {
            property: 'path',
            pathType: 'catmull-rom',
            start: 0,
            end: 10,
            points: [
              { x: 300, y: 200 },
              { x: 500, y: 300 },
              { x: 300, y: 400 },
              { x: 200, y: 300 }
            ],
            closed: true,
            loop: true,
            easing: 'linear'
          }
        ]
      },
      {
        id: 'title',
        type: 'text',
        props: {
          x: 400,
          y: 50,
          text: 'Fluid Simulation with Particles',
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#2c3e50',
          textAlign: 'center'
        }
      },
      {
        id: 'description',
        type: 'text',
        props: {
          x: 400,
          y: 80,
          text: 'Flow fields and moving force create fluid-like motion',
          fontSize: 16,
          fill: '#7f8c8d',
          textAlign: 'center'
        }
      }
    ]
  }
};