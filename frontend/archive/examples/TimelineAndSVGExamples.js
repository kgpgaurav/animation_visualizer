// Examples of SVG path rendering and Timeline sequencing
// These examples demonstrate how to use SVG paths and timeline sequences for animation control

// SVG Path rendering examples
export const SVGPathExamples = {
  // Basic SVG path rendering
  basicSVGPath: {
    duration: 5,
    fps: 60,
    aspectRatio: 16/9,
    layers: [
      {
        id: 'svg-heart',
        type: 'svg',
        props: {
          x: 400,
          y: 300,
          // SVG path data for a heart shape
          path: 'M 0 -20 C -10 -40 -40 -30 -40 -10 C -40 20 0 40 0 40 C 0 40 40 20 40 -10 C 40 -30 10 -40 0 -20 Z',
          fill: '#e74c3c',
          stroke: '#c0392b',
          strokeWidth: 2,
          svgScale: 3,
          opacity: 1
        },
        animations: [
          {
            property: 'rotation',
            start: 0,
            end: 5,
            from: 0,
            to: 360,
            easing: 'easeInOutCubic',
            loop: true
          }
        ]
      },
      {
        id: 'text-label',
        type: 'text',
        props: {
          x: 400,
          y: 500,
          text: 'SVG Heart Path',
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#333',
          textAlign: 'center'
        }
      }
    ]
  },
  
  // Complex SVG icons with animation
  animatedIcons: {
    duration: 10,
    fps: 60,
    aspectRatio: 16/9,
    layers: [
      {
        id: 'svg-star',
        type: 'svg',
        props: {
          x: 200,
          y: 300,
          // SVG path data for a star
          path: 'M 0 -50 L 14 -15 L 50 -15 L 20 10 L 30 45 L 0 25 L -30 45 L -20 10 L -50 -15 L -14 -15 Z',
          fill: '#f1c40f',
          stroke: '#f39c12',
          strokeWidth: 2,
          svgScale: 1,
          opacity: 1
        },
        animations: [
          {
            property: 'scale',
            start: 0,
            end: 2,
            from: 0.5,
            to: 1.5,
            easing: 'easeOutElastic',
            loop: true
          }
        ]
      },
      {
        id: 'svg-gear',
        type: 'svg',
        props: {
          x: 600,
          y: 300,
          // SVG path data for a gear
          path: 'M 50 15 L 50 -15 L 80 -30 L 65 -65 L 30 -60 L 15 -90 L -15 -90 L -30 -60 L -65 -65 L -80 -30 L -50 -15 L -50 15 L -80 30 L -65 65 L -30 60 L -15 90 L 15 90 L 30 60 L 65 65 L 80 30 Z M 0 30 C -16.6 30 -30 16.6 -30 0 C -30 -16.6 -16.6 -30 0 -30 C 16.6 -30 30 -16.6 30 0 C 30 16.6 16.6 30 0 30 Z',
          fill: '#95a5a6',
          stroke: '#7f8c8d',
          strokeWidth: 3,
          svgScale: 0.8,
          opacity: 1
        },
        animations: [
          {
            property: 'rotation',
            start: 0,
            end: 10,
            from: 0,
            to: 360,
            easing: 'linear',
            loop: true
          }
        ]
      }
    ]
  }
};

// Timeline sequencing examples
export const TimelineExamples = {
  // Basic timeline example with sequence control
  basicSequence: {
    duration: 15,
    fps: 60,
    aspectRatio: 16/9,
    // Define a timeline with sequences
    timeline: {
      sequences: [
        {
          id: 'intro',
          startTime: 0,
          duration: 5,
          elements: ['circle1']
        },
        {
          id: 'middle',
          startTime: 5,
          duration: 5,
          elements: ['circle1', 'circle2']
        },
        {
          id: 'finale',
          startTime: 10,
          duration: 5,
          elements: ['circle1', 'circle2', 'circle3']
        }
      ],
      markers: [
        {
          id: 'marker1',
          time: 5,
          label: 'Start Second Sequence',
          onTrigger: (marker, visualization) => {
            console.log(`Triggered marker: ${marker.label} at time ${marker.time}`);
          }
        },
        {
          id: 'marker2',
          time: 10,
          label: 'Start Final Sequence',
          onTrigger: (marker, visualization) => {
            console.log(`Triggered marker: ${marker.label} at time ${marker.time}`);
          }
        }
      ]
    },
    layers: [
      {
        id: 'circle1',
        type: 'circle',
        props: {
          x: 200,
          y: 300,
          radius: 50,
          fill: '#3498db',
          stroke: '#2980b9',
          strokeWidth: 2,
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 0,
            end: 1,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'scale',
            start: 3,
            end: 5,
            from: 1,
            to: 1.5,
            easing: 'easeInOutQuad'
          },
          {
            property: 'path',
            pathType: 'catmull-rom',
            start: 10,
            end: 15,
            points: [
              { x: 200, y: 300 },
              { x: 400, y: 200 },
              { x: 600, y: 300 },
              { x: 400, y: 400 }
            ],
            closed: true,
            orientToPath: true,
            easing: 'linear'
          }
        ]
      },
      {
        id: 'circle2',
        type: 'circle',
        props: {
          x: 400,
          y: 300,
          radius: 40,
          fill: '#e74c3c',
          stroke: '#c0392b',
          strokeWidth: 2,
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 5,
            end: 6,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'orbit',
            start: 7,
            end: 15,
            centerX: 400,
            centerY: 300,
            radius: 150,
            easing: 'linear',
            loop: true
          }
        ]
      },
      {
        id: 'circle3',
        type: 'circle',
        props: {
          x: 600,
          y: 300,
          radius: 30,
          fill: '#2ecc71',
          stroke: '#27ae60',
          strokeWidth: 2,
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 10,
            end: 11,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'scale',
            start: 11,
            end: 15,
            from: 1,
            to: 2,
            easing: 'easeOutElastic'
          }
        ]
      },
      {
        id: 'text-label',
        type: 'text',
        props: {
          x: 400,
          y: 500,
          text: 'Timeline Sequence Example',
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#333',
          textAlign: 'center'
        }
      }
    ]
  },
  
  // Complex orchestrated animation with timeline control
  orchestratedAnimation: {
    duration: 20,
    fps: 60,
    aspectRatio: 16/9,
    timeline: {
      sequences: [
        {
          id: 'intro',
          startTime: 0,
          duration: 5,
          elements: ['title', 'subtitle']
        },
        {
          id: 'main',
          startTime: 5,
          duration: 10,
          elements: ['svg-object1', 'svg-object2', 'svg-object3']
        },
        {
          id: 'outro',
          startTime: 15,
          duration: 5,
          elements: ['final-text']
        }
      ],
      markers: [
        {
          id: 'start-main',
          time: 5,
          label: 'Start Main Animation',
          onTrigger: (marker, visualization) => {
            console.log(`Starting main animation at ${marker.time}s`);
          }
        },
        {
          id: 'climax',
          time: 12.5,
          label: 'Animation Climax',
          onTrigger: (marker, visualization) => {
            console.log(`Animation climax at ${marker.time}s`);
          }
        },
        {
          id: 'start-outro',
          time: 15,
          label: 'Start Outro',
          onTrigger: (marker, visualization) => {
            console.log(`Starting outro at ${marker.time}s`);
          }
        }
      ]
    },
    layers: [
      // Title that fades in during intro
      {
        id: 'title',
        type: 'text',
        props: {
          x: 400,
          y: 200,
          text: 'Advanced Animation System',
          fontSize: 40,
          fontWeight: 'bold',
          fill: '#34495e',
          textAlign: 'center',
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 0.5,
            end: 2,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'y',
            start: 0.5,
            end: 2,
            from: 150,
            to: 200,
            easing: 'easeOutCubic'
          },
          {
            property: 'opacity',
            start: 4,
            end: 5,
            from: 1,
            to: 0,
            easing: 'easeInCubic'
          }
        ]
      },
      
      // Subtitle that appears after title
      {
        id: 'subtitle',
        type: 'text',
        props: {
          x: 400,
          y: 260,
          text: 'Timeline and SVG Rendering',
          fontSize: 24,
          fill: '#7f8c8d',
          textAlign: 'center',
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 1.5,
            end: 3,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'opacity',
            start: 4,
            end: 5,
            from: 1,
            to: 0,
            easing: 'easeInCubic'
          }
        ]
      },
      
      // SVG Object 1 - Star
      {
        id: 'svg-object1',
        type: 'svg',
        props: {
          x: 200,
          y: 300,
          path: 'M 0 -50 L 14 -15 L 50 -15 L 20 10 L 30 45 L 0 25 L -30 45 L -20 10 L -50 -15 L -14 -15 Z',
          fill: '#f1c40f',
          stroke: '#f39c12',
          strokeWidth: 2,
          svgScale: 0,
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 5,
            end: 6,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'svgScale',
            start: 5,
            end: 6,
            from: 0,
            to: 1.2,
            easing: 'easeOutElastic'
          },
          {
            property: 'rotation',
            start: 6,
            end: 15,
            from: 0,
            to: 360,
            easing: 'linear',
            loop: true
          },
          {
            property: 'opacity',
            start: 14,
            end: 15,
            from: 1,
            to: 0,
            easing: 'easeInCubic'
          }
        ]
      },
      
      // SVG Object 2 - Gear
      {
        id: 'svg-object2',
        type: 'svg',
        props: {
          x: 400,
          y: 300,
          path: 'M 50 15 L 50 -15 L 80 -30 L 65 -65 L 30 -60 L 15 -90 L -15 -90 L -30 -60 L -65 -65 L -80 -30 L -50 -15 L -50 15 L -80 30 L -65 65 L -30 60 L -15 90 L 15 90 L 30 60 L 65 65 L 80 30 Z M 0 30 C -16.6 30 -30 16.6 -30 0 C -30 -16.6 -16.6 -30 0 -30 C 16.6 -30 30 -16.6 30 0 C 30 16.6 16.6 30 0 30 Z',
          fill: '#95a5a6',
          stroke: '#7f8c8d',
          strokeWidth: 3,
          svgScale: 0,
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 7,
            end: 8,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'svgScale',
            start: 7,
            end: 8,
            from: 0,
            to: 0.8,
            easing: 'easeOutElastic'
          },
          {
            property: 'rotation',
            start: 8,
            end: 15,
            from: 0,
            to: -360,
            easing: 'linear',
            loop: true
          },
          {
            property: 'opacity',
            start: 14,
            end: 15,
            from: 1,
            to: 0,
            easing: 'easeInCubic'
          }
        ]
      },
      
      // SVG Object 3 - Heart
      {
        id: 'svg-object3',
        type: 'svg',
        props: {
          x: 600,
          y: 300,
          path: 'M 0 -20 C -10 -40 -40 -30 -40 -10 C -40 20 0 40 0 40 C 0 40 40 20 40 -10 C 40 -30 10 -40 0 -20 Z',
          fill: '#e74c3c',
          stroke: '#c0392b',
          strokeWidth: 2,
          svgScale: 0,
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 9,
            end: 10,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'svgScale',
            start: 9,
            end: 10,
            from: 0,
            to: 1.5,
            easing: 'easeOutElastic'
          },
          {
            property: 'scale',
            start: 10,
            end: 15,
            from: 1,
            to: 1.3,
            easing: 'easeInOutQuad',
            loop: true
          },
          {
            property: 'opacity',
            start: 14,
            end: 15,
            from: 1,
            to: 0,
            easing: 'easeInCubic'
          }
        ]
      },
      
      // Final text
      {
        id: 'final-text',
        type: 'text',
        props: {
          x: 400,
          y: 300,
          text: 'Animation Complete!',
          fontSize: 36,
          fontWeight: 'bold',
          fill: '#2980b9',
          textAlign: 'center',
          opacity: 0
        },
        animations: [
          {
            property: 'opacity',
            start: 15,
            end: 16,
            from: 0,
            to: 1,
            easing: 'easeOutCubic'
          },
          {
            property: 'scale',
            start: 16,
            end: 18,
            from: 1,
            to: 1.2,
            easing: 'easeInOutQuad',
            loop: true
          }
        ]
      }
    ]
  }
};

// Combined example with spring physics, SVG paths, and timeline sequencing
export const CombinedExample = {
  duration: 30,
  fps: 60,
  aspectRatio: 16/9,
  timeline: {
    sequences: [
      {
        id: 'intro',
        startTime: 0,
        duration: 10,
        elements: ['title', 'subtitle', 'spring-object1']
      },
      {
        id: 'main',
        startTime: 10,
        duration: 10,
        elements: ['svg-path1', 'svg-path2', 'spring-object2']
      },
      {
        id: 'finale',
        startTime: 20,
        duration: 10,
        elements: ['svg-path3', 'spring-object3', 'final-text']
      }
    ],
    markers: [
      {
        id: 'marker1',
        time: 10,
        label: 'Start Main Section',
        onTrigger: (marker, visualization) => {
          console.log(`Triggered: ${marker.label} at ${marker.time}s`);
        }
      },
      {
        id: 'marker2',
        time: 20,
        label: 'Start Finale',
        onTrigger: (marker, visualization) => {
          console.log(`Triggered: ${marker.label} at ${marker.time}s`);
        }
      }
    ]
  },
  // Add spring physics objects here
  springPhysics: [
    {
      id: 'spring-object1',
      startX: 200,
      startY: 300,
      targetX: 400,
      targetY: 200,
      stiffness: 0.1,
      damping: 0.8,
      mass: 1,
      startTime: 2,
      endTime: 10
    },
    {
      id: 'spring-object2',
      startX: 600,
      startY: 400,
      targetX: 400,
      targetY: 300,
      stiffness: 0.05,
      damping: 0.7,
      mass: 2,
      startTime: 12,
      endTime: 20
    },
    {
      id: 'spring-object3',
      startX: 200,
      startY: 400,
      targetX: 600,
      targetY: 400,
      stiffness: 0.2,
      damping: 0.5,
      mass: 1.5,
      startTime: 22,
      endTime: 30
    }
  ],
  // Add particle systems here
  particleSystems: [
    {
      id: 'particles1',
      x: 400,
      y: 300,
      emissionRate: 5,
      spread: 10,
      velocity: 2,
      particleSize: 5,
      sizeVariance: 3,
      colors: ['#3498db', '#2980b9', '#1abc9c', '#16a085'],
      particleLife: 120,
      lifeVariance: 60,
      opacity: 0.8,
      fadeOut: true,
      shrink: true,
      active: true
    }
  ],
  layers: [
    // Title
    {
      id: 'title',
      type: 'text',
      props: {
        x: 400,
        y: 150,
        text: 'Advanced Animation System',
        fontSize: 40,
        fontWeight: 'bold',
        fill: '#2c3e50',
        textAlign: 'center',
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 1,
          end: 3,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        {
          property: 'opacity',
          start: 8,
          end: 10,
          from: 1,
          to: 0,
          easing: 'easeInCubic'
        }
      ]
    },
    // Subtitle
    {
      id: 'subtitle',
      type: 'text',
      props: {
        x: 400,
        y: 200,
        text: 'Combining SVG, Spring Physics, and Timeline Sequencing',
        fontSize: 20,
        fill: '#7f8c8d',
        textAlign: 'center',
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 2,
          end: 4,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        {
          property: 'opacity',
          start: 8,
          end: 10,
          from: 1,
          to: 0,
          easing: 'easeInCubic'
        }
      ]
    },
    // Spring Object 1 (Circle)
    {
      id: 'spring-object1',
      type: 'circle',
      props: {
        x: 200,
        y: 300,
        radius: 30,
        fill: '#3498db',
        stroke: '#2980b9',
        strokeWidth: 2,
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 2,
          end: 3,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        // Spring animation handled by spring physics system
        {
          property: 'opacity',
          start: 9,
          end: 10,
          from: 1,
          to: 0,
          easing: 'easeInCubic'
        }
      ]
    },
    // SVG Path 1 (Star)
    {
      id: 'svg-path1',
      type: 'svg',
      props: {
        x: 200,
        y: 200,
        path: 'M 0 -50 L 14 -15 L 50 -15 L 20 10 L 30 45 L 0 25 L -30 45 L -20 10 L -50 -15 L -14 -15 Z',
        fill: '#f1c40f',
        stroke: '#f39c12',
        strokeWidth: 2,
        svgScale: 0,
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 10,
          end: 11,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        {
          property: 'svgScale',
          start: 10,
          end: 11,
          from: 0,
          to: 1,
          easing: 'easeOutElastic'
        },
        {
          property: 'path',
          pathType: 'catmull-rom',
          start: 12,
          end: 18,
          points: [
            { x: 200, y: 200 },
            { x: 300, y: 100 },
            { x: 500, y: 150 },
            { x: 600, y: 250 },
            { x: 500, y: 350 },
            { x: 300, y: 300 }
          ],
          closed: true,
          orientToPath: true,
          easing: 'linear'
        },
        {
          property: 'opacity',
          start: 19,
          end: 20,
          from: 1,
          to: 0,
          easing: 'easeInCubic'
        }
      ]
    },
    // SVG Path 2 (Gear)
    {
      id: 'svg-path2',
      type: 'svg',
      props: {
        x: 600,
        y: 200,
        path: 'M 50 15 L 50 -15 L 80 -30 L 65 -65 L 30 -60 L 15 -90 L -15 -90 L -30 -60 L -65 -65 L -80 -30 L -50 -15 L -50 15 L -80 30 L -65 65 L -30 60 L -15 90 L 15 90 L 30 60 L 65 65 L 80 30 Z M 0 30 C -16.6 30 -30 16.6 -30 0 C -30 -16.6 -16.6 -30 0 -30 C 16.6 -30 30 -16.6 30 0 C 30 16.6 16.6 30 0 30 Z',
        fill: '#95a5a6',
        stroke: '#7f8c8d',
        strokeWidth: 3,
        svgScale: 0,
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 12,
          end: 13,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        {
          property: 'svgScale',
          start: 12,
          end: 13,
          from: 0,
          to: 0.7,
          easing: 'easeOutElastic'
        },
        {
          property: 'rotation',
          start: 13,
          end: 20,
          from: 0,
          to: -720,
          easing: 'linear'
        },
        {
          property: 'opacity',
          start: 19,
          end: 20,
          from: 1,
          to: 0,
          easing: 'easeInCubic'
        }
      ]
    },
    // Spring Object 2 (Circle)
    {
      id: 'spring-object2',
      type: 'circle',
      props: {
        x: 600,
        y: 400,
        radius: 40,
        fill: '#e74c3c',
        stroke: '#c0392b',
        strokeWidth: 2,
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 12,
          end: 13,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        // Spring animation handled by spring physics system
        {
          property: 'opacity',
          start: 19,
          end: 20,
          from: 1,
          to: 0,
          easing: 'easeInCubic'
        }
      ]
    },
    // SVG Path 3 (Heart)
    {
      id: 'svg-path3',
      type: 'svg',
      props: {
        x: 400,
        y: 300,
        path: 'M 0 -20 C -10 -40 -40 -30 -40 -10 C -40 20 0 40 0 40 C 0 40 40 20 40 -10 C 40 -30 10 -40 0 -20 Z',
        fill: '#e74c3c',
        stroke: '#c0392b',
        strokeWidth: 2,
        svgScale: 0,
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 20,
          end: 21,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        {
          property: 'svgScale',
          start: 20,
          end: 21,
          from: 0,
          to: 2,
          easing: 'easeOutElastic'
        },
        {
          property: 'scale',
          start: 22,
          end: 28,
          from: 1,
          to: 1.5,
          easing: 'easeInOutQuad',
          loop: true
        }
      ]
    },
    // Spring Object 3 (Circle)
    {
      id: 'spring-object3',
      type: 'circle',
      props: {
        x: 200,
        y: 400,
        radius: 35,
        fill: '#2ecc71',
        stroke: '#27ae60',
        strokeWidth: 2,
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 22,
          end: 23,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        }
        // Spring animation handled by spring physics system
      ]
    },
    // Final Text
    {
      id: 'final-text',
      type: 'text',
      props: {
        x: 400,
        y: 500,
        text: 'Animation Complete!',
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#2c3e50',
        textAlign: 'center',
        opacity: 0
      },
      animations: [
        {
          property: 'opacity',
          start: 25,
          end: 26,
          from: 0,
          to: 1,
          easing: 'easeOutCubic'
        },
        {
          property: 'y',
          start: 25,
          end: 26,
          from: 550,
          to: 500,
          easing: 'easeOutCubic'
        }
      ]
    }
  ]
};