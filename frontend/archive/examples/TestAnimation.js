// Simple test animation for debugging
export const TestAnimation = {
  duration: 10000,
  fps: 30,
  aspectRatio: 1.333,
  layers: [
    {
      id: "earth",
      type: "circle",
      props: {
        x: 550,
        y: 300,
        r: 15,
        fill: "#2196f3"
      },
      animations: [
        {
          property: "orbit",
          start: 0,
          end: 10000,
          centerX: 400,
          centerY: 300,
          radius: 150
        }
      ]
    },
    {
      id: "sun",
      type: "circle",
      props: {
        x: 400,
        y: 300,
        r: 30,
        fill: "#ffeb3b"
      },
      animations: []
    },
    {
      id: "moving_text",
      type: "text",
      props: {
        x: 100,
        y: 100,
        text: "Moving Text",
        fontSize: 24,
        fill: "#333"
      },
      animations: [
        {
          property: "x",
          start: 1000,
          end: 6000,
          from: 100,
          to: 700
        }
      ]
    }
  ],
  particleSystems: []
};

export default TestAnimation;