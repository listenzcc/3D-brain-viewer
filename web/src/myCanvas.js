function myCanvas(columnIdx, value) {
  // How many pixels represent one point in the MRI point cloud.
  const pixelRatio = 2;

  const { templateDense, overlayDense } = Global;

  const ctx = (() => {
    const c = document.getElementById("myCanvas"),
      { width, height } = c,
      ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    Object.assign(ctx, { width, height });
    return ctx;
  })();

  function mkSlice(dense) {
    const filtered = dense.filter((d) => d[columnIdx] === value),
      { columns } = dense,
      slice = filtered.map((d) => {
        const obj = {};
        columns.map((c, i) => {
          obj[c] = d[i];
        });
        return obj;
      });
    return slice;
  }

  const slice = mkSlice(templateDense),
    sliceOverlay = mkSlice(overlayDense);

  {
    const extX = d3.extent(slice, (d) => d.x),
      extY = d3.extent(slice, (d) => d.y),
      extZ = d3.extent(slice, (d) => d.z),
      extV = d3.extent(slice, (d) => d.v),
      colorMap = d3.scaleLinear().domain(extV).range(["gray", "white"]),
      heatMap = d3.scaleLinear().domain([3, 6]).range(["red", "white"]),
      { width, height } = ctx;

    const scaleX = d3
        .scaleLinear()
        .domain([0, -extX[0] / pixelRatio])
        .range([height / pixelRatio, height / pixelRatio + extX[0]]),
      scaleY = d3
        .scaleLinear()
        .domain([0, extY[1] / pixelRatio])
        .range([width / pixelRatio, width / pixelRatio + extY[1]]);

    slice.map(({ x, y, v }) => {
      ctx.fillStyle = colorMap(v);
      ctx.fillRect(scaleY(y), scaleX(x), pixelRatio, pixelRatio);
    });

    sliceOverlay.map(({ x, y, v }) => {
      ctx.fillStyle = heatMap(v);
      ctx.fillRect(scaleY(y), scaleX(x), pixelRatio, pixelRatio);
    });

    ctx.strokeStyle = "cyan";
    ctx.strokeRect(scaleY(0) - 5, scaleX(0) - 5, 10, 10);

    ctx.strokeStyle = "cyan";
    ctx.strokeRect(
      scaleY(extY[1]),
      scaleX(extX[0]),
      scaleY(extY[0]) - scaleY(extY[1]),
      scaleX(extX[1]) - scaleX(extX[0])
    );
  }
}
