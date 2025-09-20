// Comprehensive Demo of Advanced Particle System Features
// This file demonstrates the capabilities of the enhanced particle system

/**
 * This demo showcases:
 * 1. Force fields (attractors, repellers, vortex)
 * 2. Particle collisions with physics
 * 3. Particle interactions between groups
 * 4. Flow fields for fluid-like behavior
 * 5. Custom boundary behaviors
 */

export const AdvancedParticleDemo = {
  name: "Advanced Particle System Demo",
  description: "Demonstrating physics-based particle effects with forces, collisions and interactions",
  duration: 30000, // 30 seconds
  fps: 60,
  aspectRatio: 16/9,
  width: 800,
  height: 450,
  
  // Define particle systems
  particleSystems: [
    // System 1: Attractor-based system with collision physics
    {
      id: 'attractor-system',
      x: 400,
      y: 225,
      emissionRate: 2,
      particleLife: 300,
      lifeVariance: 50,
      spread: 300,
      velocity: 1,
      particleSize: 8,
      sizeVariance: 4,
      colors: ['#3498db', '#2980b9', '#1abc9c', '#16a085'],
      opacity: 0.8,
      active: true,
      fadeOut: true,
      collisions: true,
      collisionDamping: 0.6,
      particleMass: 1,
      
      // Force fields that affect particles
      forceFields: [
        {
          type: 'point',
          x: 400,
          y: 225,
          radius: 200,
          strength: -0.5 // Negative for attraction
        },
        {
          type: 'vortex',
          x: 400, 
          y: 225,
          radius: 150,
          strength: 0.3
        }
      ],
      
      // Boundary behavior
      bounds: {
        x: 50,
        y: 50,
        width: 700,
        height: 350
      },
      boundaries: {
        type: 'bounce' // 'bounce', 'wrap', or 'kill'
      }
    },
    
    // System 2: Particle interaction system
    {
      id: 'interaction-system-A',
      x: 200,
      y: 225,
      emissionRate: 1,
      particleLife: 400,
      lifeVariance: 100,
      spread: 50,
      velocity: 0.5,
      particleSize: 10,
      sizeVariance: 2,
      colors: ['#e74c3c', '#c0392b', '#d35400', '#e67e22'],
      opacity: 0.9,
      active: true,
      fadeOut: true,
      interactionGroup: 'group-A', // Define interaction group
      
      // Global forces affecting all particles
      globalForces: [
        {
          type: 'drag',
          strength: 0.01
        }
      ]
    },
    
    // System 3: Second interaction group
    {
      id: 'interaction-system-B',
      x: 600,
      y: 225,
      emissionRate: 1,
      particleLife: 400,
      lifeVariance: 100,
      spread: 50,
      velocity: 0.5,
      particleSize: 10,
      sizeVariance: 2,
      colors: ['#f1c40f', '#f39c12', '#2ecc71', '#27ae60'],
      opacity: 0.9,
      active: true,
      fadeOut: true,
      interactionGroup: 'group-B',
      shape: 'square', // Custom particle shape
      
      // Particle interactions between groups
      particleInteractions: [
        {
          groups: ['group-A', 'group-B'],
          type: 'attract',
          minDistance: 30,
          maxDistance: 150,
          strength: 0.03
        }
      ]
    },
    
    // System 4: Flow field demonstration
    {
      id: 'flow-field-system',
      x: 400,
      y: 350,
      emissionRate: 2,
      particleLife: 500,
      lifeVariance: 100,
      spread: 700,
      velocity: 0.2,
      particleSize: 5,
      sizeVariance: 2,
      colors: ['#9b59b6', '#8e44ad', '#3498db', '#2980b9'],
      opacity: 0.7,
      active: true,
      fadeOut: true,
      shape: 'triangle',
      
      // Flow fields for fluid-like behavior
      flowFields: [
        {
          type: 'wave',
          x: 0,
          y: 350,
          width: 800,
          height: 100,
          amplitude: 0.5,
          frequency: 2,
          speed: 0.5
        },
        {
          type: 'circular',
          x: 400,
          y: 225,
          radius: 300,
          strength: 0.2,
          clockwise: true
        }
      ]
    }
  ],
  
  // Define visualization layers
  layers: [
    // Background elements
    {
      id: 'background',
      type: 'rect',
      props: {
        x: 0,
        y: 0,
        width: 800,
        height: 450,
        fill: 'rgba(52, 73, 94, 0.1)',
        zIndex: 0
      }
    },
    
    // Boundary visualization
    {
      id: 'boundary',
      type: 'rect',
      props: {
        x: 50,
        y: 50,
        width: 700,
        height: 350,
        fill: 'transparent',
        stroke: 'rgba(52, 73, 94, 0.3)',
        strokeWidth: 2,
        zIndex: 1
      }
    },
    
    // Force field visualization (attractor)
    {
      id: 'attractor-field',
      type: 'circle',
      props: {
        x: 400,
        y: 225,
        radius: 200,
        fill: 'transparent',
        stroke: 'rgba(52, 152, 219, 0.2)',
        strokeWidth: 1,
        zIndex: 1
      }
    },
    
    // Vortex field visualization
    {
      id: 'vortex-field',
      type: 'circle',
      props: {
        x: 400,
        y: 225,
        radius: 150,
        fill: 'transparent',
        stroke: 'rgba(155, 89, 182, 0.2)',
        strokeDash: [5, 5],
        strokeWidth: 1,
        zIndex: 1
      }
    },
    
    // Group A label
    {
      id: 'group-a-label',
      type: 'text',
      props: {
        x: 200,
        y: 195,
        text: 'Group A',
        fontSize: 14,
        fill: 'rgba(231, 76, 60, 0.7)',
        textAlign: 'center',
        zIndex: 10
      }
    },
    
    // Group B label
    {
      id: 'group-b-label',
      type: 'text',
      props: {
        x: 600,
        y: 195,
        text: 'Group B',
        fontSize: 14,
        fill: 'rgba(46, 204, 113, 0.7)',
        textAlign: 'center',
        zIndex: 10
      }
    },
    
    // Flow field label
    {
      id: 'flow-field-label',
      type: 'text',
      props: {
        x: 400,
        y: 400,
        text: 'Wave Flow Field',
        fontSize: 14,
        fill: 'rgba(155, 89, 182, 0.7)',
        textAlign: 'center',
        zIndex: 10
      }
    },
    
    // Title
    {
      id: 'title',
      type: 'text',
      props: {
        x: 400,
        y: 30,
        text: 'Advanced Particle System Demo',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 'rgba(52, 73, 94, 0.8)',
        textAlign: 'center',
        zIndex: 20
      }
    }
  ]
};

// Export the demo
export default AdvancedParticleDemo;