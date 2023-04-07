const canvasOptions = {
  pixelRatio: 2,
  heatMap: d3.scaleLinear().domain([3, 6]).range(["red", "white"]),
  colorMap: d3.scaleLinear().domain([1, 100]).range(["gray", "white"]),
  strokeStyle: "cyan",
  x: undefined,
  y: undefined,
  z: undefined,
  strokeStyles: {
    x: colorScheme[0],
    y: colorScheme[1],
    z: colorScheme[2],
  },
};

/**
 * Convert the dense to slice points.
 * @param {Array} dense The very big array of the MRI point cloud.
 * @param {Object} filterColumn The object of select value on the column, like {column: 'z', value: 3}
 * @param {Boolean} quickLookFlag The toggle whether use small size values
 * @returns The array containing the points in the slice of filterColumn.
 */
function dense2slice(dense, filterColumn, quickLookFlag) {
  if (!dense) return [];

  var { column: columnName, value: columnValue } = filterColumn,
    { columns } = Global,
    columnIdx = columns.indexOf(columnName),
    valueIdx = columns.indexOf("v"),
    filtered = dense.filter((d) => Math.abs(d[columnIdx] - columnValue) < 0.5);

  // Only use the 2000 points with the smallest values,
  // it almost draw the outline of the slice,
  // the purpose of the shrinking is to speed up the drawing during rapid processing.
  if (quickLookFlag) {
    filtered.sort((a, b) => a[valueIdx] - b[valueIdx]);
    filtered = filtered.slice(0, 2000);
  }

  // console.log(`Found ${filtered.length} points in ${filterColumn}`);

  const slice = filtered.map((d) => {
    const obj = {};
    columns.map((c, i) => {
      // obj[c] = i < 3 ? parseInt(d[i] + 0.5) : d[i];
      obj[c] = d[i];
    });
    return obj;
  });

  return slice;
}

/**
 * Get the refreshed context.
 * @param {string} id The element id of the canvas.
 * @returns The context 2d
 */
function refreshContext(id) {
  var c = document.getElementById(id),
    { width, height } = c;

  const ctx = c.getContext("2d");

  Object.assign(ctx, { width, height, cWidth: width / 2, cHeight: height / 2 });

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  return ctx;
}

function prepareRender(columnName, columnValue, quickLookFlag) {
  var filterColumn = { column: columnName, value: columnValue },
    slice = dense2slice(Global.templateDense, filterColumn, quickLookFlag),
    sliceOverlay = dense2slice(
      Global.overlayDense,
      filterColumn,
      quickLookFlag
    ),
    extX = d3.extent(slice, (d) => d.x),
    extY = d3.extent(slice, (d) => d.y),
    extZ = d3.extent(slice, (d) => d.z),
    ctx = refreshContext(columnName + "-canvas");

  return { slice, sliceOverlay, extX, extY, extZ, ctx };
}

function redrawCanvas(point, quickLookFlag, forceRedrawXYZ) {
  const { pixelRatio, heatMap, colorMap, strokeStyles } = canvasOptions;
  // { templateDense, overlayDense } = Global;

  // If no template is loaded, draw nothing
  if (!Global.templateDense) {
    console.warn(
      "Can not render the canvas since the templateDense is not loaded."
    );
    return;
  }

  const selectedPoint = Global.overlayDense.filter(
    (d) =>
      Math.abs(d[0] - point.x) < 0.5 &&
      Math.abs(d[1] - point.y) < 0.5 &&
      Math.abs(d[2] - point.z) < 0.5
  );

  /**
   * Render the X slice
   */
  function renderX() {
    var startDate = new Date(),
      { slice, sliceOverlay, extX, extY, extZ, ctx } = prepareRender(
        "x",
        point["x"],
        quickLookFlag
      ),
      { cWidth, cHeight, width, height } = ctx;

    var scaleHeight = d3
        .scaleLinear()
        .domain([0, -extZ[0]])
        .range([cHeight, cHeight + extZ[0] * pixelRatio]),
      scaleWidth = d3
        .scaleLinear()
        .domain([0, extY[1]])
        .range([cWidth, cWidth + extY[1] * pixelRatio]);

    // Draw the bounding box
    ctx.strokeStyle = strokeStyles.x;
    ctx.strokeRect(
      scaleWidth(extY[0]),
      scaleHeight(extZ[1]),
      Math.abs(scaleWidth(extY[1]) - scaleWidth(extY[0])) + pixelRatio,
      Math.abs(scaleHeight(extZ[1]) - scaleHeight(extZ[0])) + pixelRatio
    );

    ctx.strokeStyle = strokeStyles.z;
    ctx.beginPath(),
      ctx.moveTo(0, scaleHeight(point["z"])),
      ctx.lineTo(width, scaleHeight(point["z"])),
      ctx.stroke();

    ctx.strokeStyle = strokeStyles.y;
    ctx.beginPath(),
      ctx.moveTo(scaleWidth(point["y"]), 0),
      ctx.lineTo(scaleWidth(point["y"]), height),
      ctx.stroke();

    // Draw the template
    slice.map(({ x, y, z, v }) => {
      ctx.fillStyle = colorMap(v);
      ctx.fillRect(scaleWidth(y), scaleHeight(z), pixelRatio, pixelRatio);
    });

    // Draw the overlay
    sliceOverlay.map(({ x, y, z, v }) => {
      ctx.fillStyle = heatMap(v);
      ctx.fillRect(scaleWidth(y), scaleHeight(z), pixelRatio, pixelRatio);
    });

    // Draw the center marker
    ctx.strokeStyle = strokeStyles.x;
    ctx.strokeRect(scaleWidth(0) - 5, scaleHeight(0) - 5, 10, 10);
    console.log(`Render x slice costs ${new Date() - startDate} milliseconds`);
  }

  /**
   * Render the Y slice
   */
  function renderY() {
    var startDate = new Date(),
      { slice, sliceOverlay, extX, extY, extZ, ctx } = prepareRender(
        "y",
        point["y"],
        quickLookFlag
      ),
      { cWidth, cHeight, width, height } = ctx;

    var scaleHeight = d3
        .scaleLinear()
        .domain([0, -extZ[0]])
        .range([cHeight, cHeight + extZ[0] * pixelRatio]),
      scaleWidth = d3
        .scaleLinear()
        .domain([0, extX[1]])
        .range([cWidth, cWidth + extX[1] * pixelRatio]);

    // Draw the bounding box
    ctx.strokeStyle = strokeStyles.y;
    ctx.strokeRect(
      scaleWidth(extX[0]),
      scaleHeight(extZ[1]),
      Math.abs(scaleWidth(extX[1]) - scaleWidth(extX[0])) + pixelRatio,
      Math.abs(scaleHeight(extZ[1]) - scaleHeight(extZ[0])) + pixelRatio
    );

    ctx.strokeStyle = strokeStyles.z;
    ctx.beginPath(),
      ctx.moveTo(0, scaleHeight(point["z"])),
      ctx.lineTo(width, scaleHeight(point["z"])),
      ctx.stroke();

    ctx.strokeStyle = strokeStyles.x;
    ctx.beginPath(),
      ctx.moveTo(scaleWidth(point["x"]), 0),
      ctx.lineTo(scaleWidth(point["x"]), height),
      ctx.stroke();

    // Draw the template
    slice.map(({ x, y, z, v }) => {
      ctx.fillStyle = colorMap(v);
      ctx.fillRect(scaleWidth(x), scaleHeight(z), pixelRatio, pixelRatio);
    });

    // Draw the overlay
    sliceOverlay.map(({ x, y, z, v }) => {
      ctx.fillStyle = heatMap(v);
      ctx.fillRect(scaleWidth(x), scaleHeight(z), pixelRatio, pixelRatio);
    });

    // Draw the center marker
    ctx.strokeStyle = strokeStyles.y;
    ctx.strokeRect(scaleWidth(0) - 5, scaleHeight(0) - 5, 10, 10);
    console.log(`Render y slice costs ${new Date() - startDate} milliseconds`);
  }

  /**
   * Render the Z slice
   */
  function renderZ() {
    var startDate = new Date(),
      { slice, sliceOverlay, extX, extY, extZ, ctx } = prepareRender(
        "z",
        point["z"],
        quickLookFlag
      ),
      { cWidth, cHeight, width, height } = ctx;

    var scaleHeight = d3
        .scaleLinear()
        .domain([0, -extX[0]])
        .range([cHeight, cHeight + extX[0] * pixelRatio]),
      scaleWidth = d3
        .scaleLinear()
        .domain([0, extY[1]])
        .range([cWidth, cWidth + extY[1] * pixelRatio]);

    // Draw the bounding box
    ctx.strokeStyle = strokeStyles.z;
    ctx.strokeRect(
      scaleWidth(extY[0]),
      scaleHeight(extX[1]),
      Math.abs(scaleWidth(extY[1]) - scaleWidth(extY[0])) + pixelRatio,
      Math.abs(scaleHeight(extX[1]) - scaleHeight(extX[0])) + pixelRatio
    );

    ctx.strokeStyle = strokeStyles.x;
    ctx.beginPath(),
      ctx.moveTo(0, scaleHeight(point["x"])),
      ctx.lineTo(width, scaleHeight(point["x"])),
      ctx.stroke();

    ctx.strokeStyle = strokeStyles.y;
    ctx.beginPath(),
      ctx.moveTo(scaleWidth(point["y"]), 0),
      ctx.lineTo(scaleWidth(point["y"]), height),
      ctx.stroke();

    // Draw the template
    slice.map(({ x, y, z, v }) => {
      ctx.fillStyle = colorMap(v);
      ctx.fillRect(scaleWidth(y), scaleHeight(x), pixelRatio, pixelRatio);
    });

    // Draw the overlay
    sliceOverlay.map(({ x, y, z, v }) => {
      ctx.fillStyle = heatMap(v);
      ctx.fillRect(scaleWidth(y), scaleHeight(x), pixelRatio, pixelRatio);
    });

    // Draw the center marker
    ctx.strokeStyle = strokeStyles.z;
    ctx.strokeRect(scaleWidth(0) - 5, scaleHeight(0) - 5, 10, 10);
    console.log(`Render z slice costs ${new Date() - startDate} milliseconds`);
  }

  requestAnimationFrame(() => {
    ["x", "y", "z"].map((column) => {
      // If the current slice is correct, doing nothing.
      if (!forceRedrawXYZ & (canvasOptions[column] === point[column])) {
        console.log(`Not redraw the ${column} since the value is not changed`);
        return;
      }

      if (column === "x") new Promise(renderX);
      if (column === "y") new Promise(renderY);
      if (column === "z") new Promise(renderZ);
    });
  });

  // Update the x, y and z attributes in canvasOptions
  Object.assign(canvasOptions, point);

  return selectedPoint;
}

function redrawCanvas1(filterColumn, quickLookFlag = false) {
  // How many pixels represent one point in the MRI point cloud.
  const { pixelRatio, heatMap, colorMap } = canvasOptions;

  var { templateDense, overlayDense } = Global,
    ctx = refreshContext("z-canvas"),
    slice = dense2slice(
      templateDense,
      filterColumn,
      quickLookFlag ? [0, 10] : undefined
    ),
    sliceOverlay = dense2slice(overlayDense, filterColumn);

  {
    var extX = d3.extent(slice, (d) => d.x),
      extY = d3.extent(slice, (d) => d.y),
      extZ = d3.extent(slice, (d) => d.z),
      { width, height } = ctx,
      cWidth = width / 2,
      cHeight = height / 2;

    var scaleHeight = d3
        .scaleLinear()
        .domain([0, -extX[0]])
        .range([cHeight, cHeight + extX[0] * pixelRatio]),
      scaleWidth = d3
        .scaleLinear()
        .domain([0, extY[1]])
        .range([cWidth, cWidth + extY[1] * pixelRatio]);

    slice.map(({ x, y, v }) => {
      ctx.fillStyle = colorMap(v);
      ctx.fillRect(scaleWidth(y), scaleHeight(x), pixelRatio, pixelRatio);
    });

    sliceOverlay.map(({ x, y, v }) => {
      ctx.fillStyle = heatMap(v);
      ctx.fillRect(scaleWidth(y), scaleHeight(x), pixelRatio, pixelRatio);
    });

    // Center marker
    ctx.strokeStyle = "cyan";
    ctx.strokeRect(scaleWidth(0) - 5, scaleHeight(0) - 5, 10, 10);

    // Bounding box
    ctx.strokeStyle = "cyan";
    ctx.strokeRect(
      scaleWidth(extY[1]),
      scaleHeight(extX[0]),
      scaleWidth(extY[0]) - scaleWidth(extY[1]),
      scaleHeight(extX[1]) - scaleHeight(extX[0])
    );
  }
}
