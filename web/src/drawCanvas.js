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
    { columns } = dense,
    columnIdx = columns.indexOf(columnName),
    valueIdx = columns.indexOf("v"),
    filtered = dense.filter((d) => d[columnIdx] === columnValue);

  if (quickLookFlag) {
    // d3.shuffle(filtered);
    filtered.sort((a, b) => a[valueIdx] - b[valueIdx]);
    filtered = filtered.slice(0, 2000);
  }

  // console.log(`Found ${filtered.length} points in ${filterColumn}`);

  const slice = filtered.map((d) => {
    const obj = {};
    columns.map((c, i) => {
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

const canvasOptions = {
  pixelRatio: 2,
  heatMap: d3.scaleLinear().domain([3, 6]).range(["red", "white"]),
  colorMap: d3.scaleLinear().domain([1, 100]).range(["gray", "white"]),
  strokeStyle: "cyan",
};

function redrawCanvas(point, quickLookFlag) {
  const { pixelRatio, heatMap, colorMap, strokeStyle } = canvasOptions,
    { templateDense, overlayDense } = Global;

  if (!templateDense) {
    console.warn(
      "Can not render the canvas since the templateDense is undefined."
    );
    return;
  }

  // console.log(point);

  var filterColumn, ctx, slice, sliceOverlay;

  ["x", "y", "z"].map((column) => {
    filterColumn = { column, value: point[column] };

    slice = dense2slice(
      templateDense,
      filterColumn,
      quickLookFlag // ? [0, 10] : undefined
    );
    sliceOverlay = dense2slice(overlayDense, filterColumn, quickLookFlag);

    ctx = refreshContext(`${column}-canvas`);
    var { cWidth, cHeight, width, height } = ctx,
      extX = d3.extent(slice, (d) => d.x),
      extY = d3.extent(slice, (d) => d.y),
      extZ = d3.extent(slice, (d) => d.z);

    // X slice
    if (column === "x") {
      var scaleHeight = d3
          .scaleLinear()
          .domain([0, -extZ[0]])
          .range([cHeight, cHeight + extZ[0] * pixelRatio]),
        scaleWidth = d3
          .scaleLinear()
          .domain([0, extY[1]])
          .range([cWidth, cWidth + extY[1] * pixelRatio]);

      // Draw the bounding box
      ctx.strokeStyle = strokeStyle;
      ctx.strokeRect(
        scaleWidth(extY[0]),
        scaleHeight(extZ[1]),
        Math.abs(scaleWidth(extY[1]) - scaleWidth(extY[0])) + pixelRatio,
        Math.abs(scaleHeight(extZ[1]) - scaleHeight(extZ[0])) + pixelRatio
      );

      ctx.beginPath(),
        ctx.moveTo(0, scaleHeight(point["z"])),
        ctx.lineTo(width, scaleHeight(point["z"])),
        ctx.stroke();

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
      ctx.strokeStyle = strokeStyle;
      ctx.strokeRect(scaleWidth(0) - 5, scaleHeight(0) - 5, 10, 10);
    }

    // Y slice
    if (column === "y") {
      var scaleHeight = d3
          .scaleLinear()
          .domain([0, -extZ[0]])
          .range([cHeight, cHeight + extZ[0] * pixelRatio]),
        scaleWidth = d3
          .scaleLinear()
          .domain([0, extX[1]])
          .range([cWidth, cWidth + extX[1] * pixelRatio]);

      // Draw the bounding box
      ctx.strokeStyle = strokeStyle;
      ctx.strokeRect(
        scaleWidth(extX[0]),
        scaleHeight(extZ[1]),
        Math.abs(scaleWidth(extX[1]) - scaleWidth(extX[0])) + pixelRatio,
        Math.abs(scaleHeight(extZ[1]) - scaleHeight(extZ[0])) + pixelRatio
      );

      ctx.beginPath(),
        ctx.moveTo(0, scaleHeight(point["z"])),
        ctx.lineTo(width, scaleHeight(point["z"])),
        ctx.stroke();

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
      ctx.strokeStyle = strokeStyle;
      ctx.strokeRect(scaleWidth(0) - 5, scaleHeight(0) - 5, 10, 10);
    }

    // Z slice
    if (column === "z") {
      var scaleHeight = d3
          .scaleLinear()
          .domain([0, -extX[0]])
          .range([cHeight, cHeight + extX[0] * pixelRatio]),
        scaleWidth = d3
          .scaleLinear()
          .domain([0, extY[1]])
          .range([cWidth, cWidth + extY[1] * pixelRatio]);

      // Draw the bounding box
      ctx.strokeStyle = strokeStyle;
      ctx.strokeRect(
        scaleWidth(extY[0]),
        scaleHeight(extX[1]),
        Math.abs(scaleWidth(extY[1]) - scaleWidth(extY[0])) + pixelRatio,
        Math.abs(scaleHeight(extX[1]) - scaleHeight(extX[0])) + pixelRatio
      );

      ctx.beginPath(),
        ctx.moveTo(0, scaleHeight(point["x"])),
        ctx.lineTo(width, scaleHeight(point["x"])),
        ctx.stroke();

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
      ctx.strokeStyle = strokeStyle;
      ctx.strokeRect(scaleWidth(0) - 5, scaleHeight(0) - 5, 10, 10);
    }
  });
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
