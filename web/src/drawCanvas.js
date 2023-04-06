/**
 * Convert the dense to slice points.
 * @param {Array} dense The very big array of the MRI point cloud.
 * @param {Object} filterColumn The object of select value on the column, like {column: 'z', value: 3}
 * @param {Array x2} valueRange The range of the value, the parameter is used to filter the points within the given range.
 * @returns The array containing the points in the slice of filterColumn.
 */
function dense2slice(dense, filterColumn, valueRange = [-65536, 65536]) {
  var { column: columnName, value: columnValue } = filterColumn,
    { columns } = dense,
    columnIdx = columns.indexOf(columnName),
    valueIdx = columns.indexOf("v"),
    filtered = dense.filter((d) => d[columnIdx] === columnValue);

  if (valueRange) {
    filtered = filtered.filter(
      (d) => (d[valueIdx] > valueRange[0]) & (d[valueIdx] < valueRange[1])
    );
  }

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

  Object.assign(ctx, { width, height });

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  return ctx;
}

const canvasOptions = {
  pixelRatio: 2,
  heatMap: d3.scaleLinear().domain([3, 6]).range(["red", "white"]),
  colorMap: d3.scaleLinear().domain([1, 100]).range(["gray", "white"]),
};

function redrawCanvas(filterColumn, quickLookFlag = false) {
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
