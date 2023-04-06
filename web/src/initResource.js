/*
File: initResource.js
Author: Chuncheng Zhang
Date: 2023-04-04
Functions:
    1. Pending
    2. Pending
    3. Pending
    4. Pending
    5. Pending
*/

// %% ---- 2023-04-04 ------------------------
// On startup
console.log("initResource.js is working...");

// %% ---- 2023-04-04 ------------------------
// Initialize the global variables
// and provide their managers

const Global = Object.assign(
  {},
  {
    author: "Chuncheng Zhang",
    date: new Date(),
    templateDense: undefined,
    overlayDense: undefined,
    overlayDensePath: undefined,
  }
);

Global.reportGlobal = () => {
  console.dir(Global);
};

// %% ---- 2023-04-04 ------------------------
// Load template
{
  function mkDense(rawList) {
    const n = rawList.length / 4,
      columns = ["x", "y", "z", "v"],
      dense = [];
    dense.columns = columns;

    for (var i = 0; i < n; i++) {
      dense.push(columns.map((c, j) => rawList[i * 4 + j]));
    }
    return dense;
  }

  d3.json("/fetch/template_dense.json").then((raw) => {
    Global.templateDense = mkDense(raw);
    console.log("Global.template_dense is updated.");

    d3.json("/fetch/overlay_dense.json").then((raw) => {
      Global.overlayDense = mkDense(raw);
      Global.overlayDense.map((d) => (d[3] /= 10.0));
      console.log("Global.overlay_dense is updated.");
      redraw();
    });
  });
}

// %% ---- 2023-04-04 ------------------------
// Pending
const colorScheme = d3.schemeCategory10;

// %% ---- 2023-04-04 ------------------------
// Pending
