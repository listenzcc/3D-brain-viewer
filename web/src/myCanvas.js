function myCanvas(z = 0) {
  const container = document.getElementById("img-z"),
    url = `/fetch/img_example.json?query=z==${z}`;

  //   container.innerHTML = "<span>Loading image</span>";
  const c = document.getElementById("myCanvas"),
    { width, height } = c,
    ctx = c.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  d3.json(url).then((raw) => {
    console.log(raw);

    const extX = d3.extent(raw, (d) => d.x),
      extY = d3.extent(raw, (d) => d.y),
      extZ = d3.extent(raw, (d) => d.z),
      extV = d3.extent(raw, (d) => d.value),
      colorMap = d3.scaleLinear().domain(extV).range(["gray", "white"]),
      heatMap = d3.scaleLinear().domain([3, 6]).range(["red", "white"]);

    const scaleX = d3
        .scaleLinear()
        .domain([0, -extX[0] / 2])
        .range([height / 2, height / 2 + extX[0]]),
      scaleY = d3
        .scaleLinear()
        .domain([0, extY[1] / 2])
        .range([width / 2, width / 2 + extY[1]]);

    raw.map(({ x, y, value, filled_value }) => {
      if (filled_value > 3) {
        ctx.fillStyle = heatMap(filled_value);
      } else {
        ctx.fillStyle = colorMap(value);
      }
      ctx.fillRect(scaleY(y), scaleX(x), 2, 2);
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
  });
}

myCanvas(20);
