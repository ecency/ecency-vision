import GridLayout from "react-grid-layout";

/**
 *
 */
export const DEFAULT_LAYOUT: GridLayout.Layouts = {
  lg: [
    { i: "s", x: 0, y: 0, w: 3, h: 6, minW: 2 },
    { i: "tv", x: 3, y: 0, w: 6, h: 3, minH: 3, minW: 3 },
    { i: "h", x: 9, y: 0, w: 3, h: 6, minW: 2 },
    { i: "tf", x: 3, y: 1, w: 6, h: 3, minH: 3 },
    { i: "oo", x: 0, y: 2, w: 12, h: 2, minW: 3 }
  ],
  md: [
    { i: "s", x: 0, y: 0, w: 1, h: 6 },
    { i: "tv", x: 0, y: 1, w: 2, h: 3 },
    { i: "h", x: 1, y: 0, w: 1, h: 6 },
    { i: "tf", x: 0, y: 2, w: 1, h: 3 },
    { i: "oo", x: 1, y: 2, w: 1, h: 3 }
  ],
  sm: [
    { i: "s", x: 0, y: 0, w: 1, h: 3 },
    { i: "tv", x: 0, y: 2, w: 3, h: 3 },
    { i: "h", x: 0, y: 4, w: 3, h: 6 },
    { i: "tf", x: 1, y: 0, w: 2, h: 3 },
    { i: "oo", x: 0, y: 1, w: 3, h: 2 }
  ]
};
