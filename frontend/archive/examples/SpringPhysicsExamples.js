// Example of Spring Physics animations
const springPhysicsExample = {
  width: 800,
  height: 600,
  duration: 10000, // 10 seconds
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
        fill: "#fffaf0",
        zIndex: 0
      }
    },
    // Example 1: Basic Spring
    {
      id: "basic_spring_title",
      type: "text",
      props: {
        x: 200,
        y: 50,
        text: "Basic Spring",
        fontSize: 18,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333333",
        zIndex: 1
      }
    },
    {
      id: "basic_spring_circle",
      type: "circle",
      props: {
        x: 200,
        y: 100,
        r: 20,
        fill: "#4285f4",
        zIndex: 2
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 200,
          fromY: 100,
          toX: 200,
          toY: 300,
          stiffness: 0.1,  // Spring stiffness (0.01 to 1)
          damping: 0.6,    // Damping factor (0 to 1)
          mass: 1,         // Mass (affects momentum)
          start: 1000,
          end: 5000,
          loop: false
        }
      ]
    },
    
    // Example 2: Bouncy Spring (low damping)
    {
      id: "bouncy_spring_title",
      type: "text",
      props: {
        x: 400,
        y: 50,
        text: "Bouncy Spring (Low Damping)",
        fontSize: 18,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333333",
        zIndex: 1
      }
    },
    {
      id: "bouncy_spring_circle",
      type: "circle",
      props: {
        x: 400,
        y: 100,
        r: 20,
        fill: "#ea4335",
        zIndex: 2
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 400,
          fromY: 100,
          toX: 400,
          toY: 300,
          stiffness: 0.2,   // Higher stiffness
          damping: 0.2,     // Lower damping = more bounce
          mass: 1,
          start: 1000,
          end: 5000,
          loop: false
        }
      ]
    },
    
    // Example 3: Heavy Spring (high mass)
    {
      id: "heavy_spring_title",
      type: "text",
      props: {
        x: 600,
        y: 50,
        text: "Heavy Spring (High Mass)",
        fontSize: 18,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333333",
        zIndex: 1
      }
    },
    {
      id: "heavy_spring_circle",
      type: "circle",
      props: {
        x: 600,
        y: 100,
        r: 20,
        fill: "#fbbc05",
        zIndex: 2
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 600,
          fromY: 100,
          toX: 600,
          toY: 300,
          stiffness: 0.1,
          damping: 0.6,
          mass: 5,         // Higher mass = slower to respond
          start: 1000,
          end: 5000,
          loop: false
        }
      ]
    },
    
    // Example 4: Chained Springs
    {
      id: "chained_springs_title",
      type: "text",
      props: {
        x: 400,
        y: 380,
        text: "Chained Springs",
        fontSize: 18,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333333",
        zIndex: 1
      }
    },
    {
      id: "chained_spring_1",
      type: "circle",
      props: {
        x: 200,
        y: 450,
        r: 15,
        fill: "#4285f4",
        zIndex: 2
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 200,
          fromY: 450,
          toX: 350,
          toY: 450,
          stiffness: 0.1,
          damping: 0.7,
          mass: 1,
          start: 2000,
          end: 5000,
          loop: false
        }
      ]
    },
    {
      id: "chained_spring_2",
      type: "circle",
      props: {
        x: 200,
        y: 450,
        r: 15,
        fill: "#ea4335",
        zIndex: 2
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 200,
          fromY: 450,
          toX: 450,
          toY: 450,
          stiffness: 0.1,
          damping: 0.7,
          mass: 2,         // Heavier, so it will lag behind
          start: 2200,     // Start slightly after the first one
          end: 5000,
          loop: false
        }
      ]
    },
    {
      id: "chained_spring_3",
      type: "circle",
      props: {
        x: 200,
        y: 450,
        r: 15,
        fill: "#fbbc05",
        zIndex: 2
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 200,
          fromY: 450,
          toX: 550,
          toY: 450,
          stiffness: 0.1,
          damping: 0.7,
          mass: 3,         // Even heavier
          start: 2400,     // Start even later
          end: 5000,
          loop: false
        }
      ]
    },
    {
      id: "chained_spring_4",
      type: "circle",
      props: {
        x: 200,
        y: 450,
        r: 15,
        fill: "#34a853",
        zIndex: 2
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 200,
          fromY: 450,
          toX: 650,
          toY: 450,
          stiffness: 0.1,
          damping: 0.7,
          mass: 4,         // Heaviest
          start: 2600,     // Start last
          end: 5000,
          loop: false
        }
      ]
    },
    
    // Trigger to reset the animations
    {
      id: "reset_trigger",
      type: "text",
      props: {
        x: 400,
        y: 550,
        text: "Animations will reset...",
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#666666",
        zIndex: 1
      },
      animations: [
        {
          property: "opacity",
          from: 0,
          to: 1,
          start: 7000,
          end: 8000,
          loop: false
        },
        {
          property: "custom",
          targetProperty: "resetTrigger",
          start: 8000,
          end: 8100,
          onComplete: (layer, visualization) => {
            // Reset all spring animations
            visualization.layers.forEach(l => {
              if (l.animations) {
                l.animations.forEach(a => {
                  if (a.property === 'spring') {
                    a.triggered = true;
                  }
                });
              }
            });
          }
        }
      ]
    }
  ]
};

// Example of spring-based interactions
const springInteractionsExample = {
  width: 800,
  height: 600,
  duration: 0, // Continuous
  fps: 60,
  aspectRatio: 16/9,
  interactive: true,
  layers: [
    {
      id: "background",
      type: "rect",
      props: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        fill: "#fffaf0",
        zIndex: 0
      }
    },
    {
      id: "title",
      type: "text",
      props: {
        x: 400,
        y: 50,
        text: "Spring-Based Interactions",
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333333",
        zIndex: 1
      }
    },
    {
      id: "instructions",
      type: "text",
      props: {
        x: 400,
        y: 90,
        text: "Click anywhere to create spring forces",
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#666666",
        zIndex: 1
      }
    },
    {
      id: "spring_ball_1",
      type: "circle",
      props: {
        x: 300,
        y: 300,
        r: 20,
        fill: "#4285f4",
        zIndex: 2
      },
      physics: {
        type: "spring",
        anchor: { x: 300, y: 300 },
        stiffness: 0.1,
        damping: 0.7,
        mass: 1
      },
      interactive: {
        draggable: true,
        onDrag: (x, y, layer) => {
          // Update position directly
          layer.props.x = x;
          layer.props.y = y;
        },
        onRelease: (x, y, layer) => {
          // Trigger spring back to anchor
          if (layer.animations) {
            const springAnim = layer.animations.find(a => a.property === 'spring');
            if (springAnim) {
              springAnim.fromX = x;
              springAnim.fromY = y;
              springAnim.toX = layer.physics.anchor.x;
              springAnim.toY = layer.physics.anchor.y;
              springAnim.triggered = true;
            }
          }
        }
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 300,
          fromY: 300,
          toX: 300,
          toY: 300,
          stiffness: 0.1,
          damping: 0.7,
          mass: 1,
          start: 0,
          end: 10000,
          loop: false
        }
      ]
    },
    {
      id: "spring_ball_2",
      type: "circle",
      props: {
        x: 500,
        y: 300,
        r: 20,
        fill: "#ea4335",
        zIndex: 2
      },
      physics: {
        type: "spring",
        anchor: { x: 500, y: 300 },
        stiffness: 0.1,
        damping: 0.3, // More bouncy
        mass: 1
      },
      interactive: {
        draggable: true,
        onDrag: (x, y, layer) => {
          layer.props.x = x;
          layer.props.y = y;
        },
        onRelease: (x, y, layer) => {
          if (layer.animations) {
            const springAnim = layer.animations.find(a => a.property === 'spring');
            if (springAnim) {
              springAnim.fromX = x;
              springAnim.fromY = y;
              springAnim.toX = layer.physics.anchor.x;
              springAnim.toY = layer.physics.anchor.y;
              springAnim.triggered = true;
            }
          }
        }
      },
      animations: [
        {
          property: "spring",
          targetProperty: "position",
          fromX: 500,
          fromY: 300,
          toX: 500,
          toY: 300,
          stiffness: 0.1,
          damping: 0.3,
          mass: 1,
          start: 0,
          end: 10000,
          loop: false
        }
      ]
    }
  ]
};

export { springPhysicsExample, springInteractionsExample };