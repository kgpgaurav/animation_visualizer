// Example animation with Bezier curve motion paths

const exampleVisualization = {
  width: 800,
  height: 600,
  duration: 5000, // 5 seconds
  fps: 60,
  aspectRatio: 16/9,
  layers: [
    {
      id: "background",
      type: "rect",
      props: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        fill: "#f5f5f5",
        zIndex: 0
      }
    },
    {
      id: "bezierPath",
      type: "line",
      props: {
        x1: 100,
        y1: 300,
        x2: 700,
        y2: 300,
        color: "#dddddd",
        lineWidth: 1,
        dash: [5, 5],
        zIndex: 1
      }
    },
    {
      id: "controlPoint1",
      type: "circle",
      props: {
        x: 300,
        y: 100,
        r: 5,
        fill: "#aaaaaa",
        zIndex: 2
      }
    },
    {
      id: "controlPoint2",
      type: "circle",
      props: {
        x: 500,
        y: 500,
        r: 5,
        fill: "#aaaaaa",
        zIndex: 2
      }
    },
    {
      id: "startPoint",
      type: "circle",
      props: {
        x: 100,
        y: 300,
        r: 8,
        fill: "#4285f4",
        zIndex: 3
      }
    },
    {
      id: "endPoint",
      type: "circle",
      props: {
        x: 700,
        y: 300,
        r: 8,
        fill: "#34a853",
        zIndex: 3
      }
    },
    {
      id: "movingObject",
      type: "circle",
      props: {
        x: 100,
        y: 300,
        r: 15,
        fill: "#ea4335",
        zIndex: 4
      },
      animations: [
        {
          property: "path",
          pathType: "bezier",
          points: [
            { x: 100, y: 300 },  // Start point
            { x: 300, y: 100 },  // Control point 1
            { x: 500, y: 500 },  // Control point 2
            { x: 700, y: 300 }   // End point
          ],
          start: 500,
          end: 4500,
          easing: "easeInOutCubic",
          loop: false
        }
      ]
    },
    {
      id: "pathLabel",
      type: "text",
      props: {
        x: 400,
        y: 50,
        text: "Cubic Bezier Path Animation",
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Arial",
        fill: "#333333",
        zIndex: 5
      }
    }
  ]
};

// To create a particle effect at the end of the animation
const animationWithParticles = {
  ...exampleVisualization,
  particleSystems: [
    {
      id: "completionEffect",
      x: 700,
      y: 300,
      spread: 30,
      velocity: 2,
      particleSize: 4,
      sizeVariance: 2,
      particleLife: 60,
      lifeVariance: 30,
      emissionRate: 0,  // Start with no emission
      active: true,
      colors: ["#ea4335", "#fbbc05", "#34a853", "#4285f4"],
      opacity: 0.8,
      fadeOut: true,
      gravity: 0.1,
      friction: 0.98
    }
  ],
  layers: [
    ...exampleVisualization.layers,
    {
      id: "emissionTrigger",
      type: "rect",
      props: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        fill: "transparent",
        zIndex: 0
      },
      animations: [
        {
          property: "emissionRate",
          from: 0,
          to: 5,
          start: 4500,  // Start emitting particles when main animation ends
          end: 4600,
          targetId: "completionEffect"  // Target the particle system
        }
      ]
    }
  ]
};

// Example of a more complex animation with multiple objects following different paths
const multiPathAnimation = {
  width: 800,
  height: 600,
  duration: 5000,
  fps: 60,
  aspectRatio: 16/9,
  layers: [
    {
      id: "background",
      type: "rect",
      props: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        fill: "#f5f5f5",
        zIndex: 0
      }
    },
    // Object 1 - Quadratic Bezier (3 points)
    {
      id: "object1",
      type: "circle",
      props: {
        x: 100,
        y: 100,
        r: 15,
        fill: "#4285f4",
        zIndex: 4
      },
      animations: [
        {
          property: "path",
          pathType: "bezier",
          points: [
            { x: 100, y: 100 },  // Start point
            { x: 400, y: 50 },   // Control point
            { x: 700, y: 100 }   // End point
          ],
          start: 500,
          end: 4000,
          easing: "easeInOutQuad"
        }
      ]
    },
    // Object 2 - Cubic Bezier (4 points)
    {
      id: "object2",
      type: "circle",
      props: {
        x: 100,
        y: 300,
        r: 15,
        fill: "#ea4335",
        zIndex: 4
      },
      animations: [
        {
          property: "path",
          pathType: "bezier",
          points: [
            { x: 100, y: 300 },  // Start point
            { x: 250, y: 200 },  // Control point 1
            { x: 550, y: 400 },  // Control point 2
            { x: 700, y: 300 }   // End point
          ],
          start: 500,
          end: 4000,
          easing: "easeOutElastic"
        }
      ]
    },
    // Object 3 - Linear path (for comparison)
    {
      id: "object3",
      type: "circle",
      props: {
        x: 100,
        y: 500,
        r: 15,
        fill: "#34a853",
        zIndex: 4
      },
      animations: [
        {
          property: "path",
          points: [
            { x: 100, y: 500 },
            { x: 700, y: 500 }
          ],
          start: 500,
          end: 4000,
          easing: "linear"
        }
      ]
    },
    // Labels
    {
      id: "label1",
      type: "text",
      props: {
        x: 400,
        y: 80,
        text: "Quadratic Bezier",
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#4285f4",
        zIndex: 5
      }
    },
    {
      id: "label2",
      type: "text",
      props: {
        x: 400,
        y: 280,
        text: "Cubic Bezier",
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#ea4335",
        zIndex: 5
      }
    },
    {
      id: "label3",
      type: "text",
      props: {
        x: 400,
        y: 480,
        text: "Linear Path",
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#34a853",
        zIndex: 5
      }
    }
  ]
};

// These examples can be used to demonstrate the new Bezier curve motion path capabilities

export { exampleVisualization, animationWithParticles, multiPathAnimation };