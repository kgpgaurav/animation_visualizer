// Example of Catmull-Rom spline path following with orientation
const splinePathExample = {
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
    // Path points visualization
    {
      id: "path",
      type: "line",
      props: {
        points: [
          { x: 100, y: 300 },
          { x: 200, y: 150 },
          { x: 300, y: 450 },
          { x: 400, y: 100 },
          { x: 500, y: 400 },
          { x: 600, y: 200 },
          { x: 700, y: 300 }
        ],
        color: "#dddddd",
        lineWidth: 2,
        dash: [5, 5],
        zIndex: 1
      }
    },
    // Points visualization
    {
      id: "points",
      type: "circle",
      props: {
        x: 100,
        y: 300,
        r: 5,
        fill: "#aaaaaa",
        zIndex: 2
      },
      // Create clones for each point
      clones: [
        { x: 200, y: 150 },
        { x: 300, y: 450 },
        { x: 400, y: 100 },
        { x: 500, y: 400 },
        { x: 600, y: 200 },
        { x: 700, y: 300 }
      ]
    },
    // Arrow shape that follows the path and orients to it
    {
      id: "arrow",
      type: "polygon",
      props: {
        points: [
          { x: 0, y: -15 },   // tip
          { x: -10, y: 15 },  // left corner
          { x: 10, y: 15 }    // right corner
        ],
        x: 100,
        y: 300,
        fill: "#ea4335",
        stroke: "#333333",
        strokeWidth: 1,
        rotation: 0,
        zIndex: 4
      },
      animations: [
        {
          property: "path",
          pathType: "catmull-rom",
          points: [
            { x: 100, y: 300 },
            { x: 200, y: 150 },
            { x: 300, y: 450 },
            { x: 400, y: 100 },
            { x: 500, y: 400 },
            { x: 600, y: 200 },
            { x: 700, y: 300 }
          ],
          orientToPath: true,
          rotationOffset: 270, // Adjust orientation to point forward
          start: 0,
          end: 10000,
          easing: "linear",
          loop: true,
          closed: false
        }
      ]
    },
    // Title
    {
      id: "title",
      type: "text",
      props: {
        x: 400,
        y: 50,
        text: "Catmull-Rom Spline Path Following with Orientation",
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333333",
        zIndex: 5
      }
    }
  ]
};

// Example of a closed loop path with multiple objects
const closedLoopExample = {
  width: 800,
  height: 600,
  duration: 10000,
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
    // Closed path
    {
      id: "track",
      type: "polygon",
      props: {
        points: [
          { x: 150, y: 150 },
          { x: 650, y: 150 },
          { x: 650, y: 450 },
          { x: 150, y: 450 }
        ],
        fill: "transparent",
        stroke: "#dddddd",
        strokeWidth: 2,
        dash: [5, 5],
        zIndex: 1
      }
    },
    // Track corners
    {
      id: "corner1",
      type: "circle",
      props: {
        x: 150,
        y: 150,
        r: 5,
        fill: "#aaaaaa",
        zIndex: 2
      },
      clones: [
        { x: 650, y: 150, id: "corner2" },
        { x: 650, y: 450, id: "corner3" },
        { x: 150, y: 450, id: "corner4" }
      ]
    },
    // Moving objects on the track
    {
      id: "car1",
      type: "rect",
      props: {
        x: 150,
        y: 150,
        width: 30,
        height: 15,
        cornerRadius: 5,
        fill: "#4285f4",
        rotation: 0,
        zIndex: 3
      },
      animations: [
        {
          property: "path",
          pathType: "catmull-rom",
          points: [
            { x: 150, y: 150 },
            { x: 650, y: 150 },
            { x: 650, y: 450 },
            { x: 150, y: 450 },
            { x: 150, y: 150 }, // Repeat first point for smooth loop
            { x: 650, y: 150 }, // Repeat second point for smooth loop
          ],
          orientToPath: true,
          start: 0,
          end: 10000,
          easing: "linear",
          loop: true,
          closed: true
        }
      ]
    },
    {
      id: "car2",
      type: "rect",
      props: {
        x: 650,
        y: 150,
        width: 30,
        height: 15,
        cornerRadius: 5,
        fill: "#ea4335",
        rotation: 0,
        zIndex: 3
      },
      animations: [
        {
          property: "path",
          pathType: "catmull-rom",
          points: [
            { x: 650, y: 150 },
            { x: 650, y: 450 },
            { x: 150, y: 450 },
            { x: 150, y: 150 },
            { x: 650, y: 150 }, // Repeat first point for smooth loop
            { x: 650, y: 450 }, // Repeat second point for smooth loop
          ],
          orientToPath: true,
          start: 0,
          end: 10000,
          easing: "linear",
          loop: true,
          closed: true
        }
      ]
    },
    // Title
    {
      id: "title",
      type: "text",
      props: {
        x: 400,
        y: 50,
        text: "Closed Loop Path Following",
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333333",
        zIndex: 5
      }
    }
  ]
};

export { splinePathExample, closedLoopExample };