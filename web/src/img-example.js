function imgExample() {
  const container = document.getElementById("img-z"),
    url = "/fetch/img_example.json?query=z==0";

  container.innerHTML = "<span>Loading image</span>";

  d3.json(url).then((raw) => {
    console.log(raw);

    const figWidth = 600,
      extX = d3.extent(raw, (d) => d.x),
      extY = d3.extent(raw, (d) => d.y),
      extZ = d3.extent(raw, (d) => d.z),
      extV = d3.extent(raw, (d) => d.value),
      scaleBrain = d3
        .scaleLinear()
        .domain([0, 1])
        .range([extV[0], d3.max(raw, (d) => d.filled_value) + extV[1]]),
      d = scaleBrain.invert(extV[1]),
      r = figWidth / (extY[1] - extY[0]) / 2;
    console.log(extV, scaleBrain(20));

    const options = {
      width: figWidth,
      height: (figWidth * (extX[1] - extX[0])) / (extY[1] - extY[0]),
      grid: true,
      padding: 0.01,
      x: {
        axis: false,
      },
      y: {
        axis: false,
        reverse: true,
        label: false,
      },
      color: {
        legend: true,
        type: "linear",
        interpolate: (t) => {
          const c =
            t < d
              ? `hsl(0, 0%, ${t * 100}%)`
              : `hsl(0, ${parseInt(((t - d) / (1 - d)) * 100)}%, 50%)`;
          return c;
        },
        // interpolate: (t) => `hsl(${t * 360},100%,50%)` // angry rainbow!
      },
      marks: [
        Plot.cell(raw, {
          x: "y",
          y: "x",
          fill: "value",
          strokeWidth: 0,
          r: r,
        }),
        Plot.cell(raw, {
          x: "y",
          y: "x",
          filter: (d) => d.filled_value > 3,
          fill: (d) => d.filled_value + extV[1],
          strokeWidth: 0,
          r: r,
        }),
      ],
    };

    container.innerHTML = `<span>Loaded ${url}</span>`;
    container.append(Plot.plot(options));
  });
}

// imgExample();
