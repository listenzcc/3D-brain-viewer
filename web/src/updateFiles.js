{
  const id = "files-container";
  document.getElementById(id).innerHTML = "";
  document.getElementById("file-selector-container").innerHTML = "";

  d3.json("/fetch/files.json").then((raw) => {
    console.log(raw);
    const id = "file-selector-container",
      data = raw.filter((d) => d.filename === "zstat1.nii.gz");

    document.getElementById(id).innerHTML = "";
    d3.select("#" + id)
      .append("select")
      .on("change", (e) => {
        const { selectedIndex } = e.target,
          { idx, pathlib } = data[selectedIndex];

        console.log(data[selectedIndex]);

        Global.overlayDensePath = "::Pending";

        d3.json("/fetch/overlay_dense.json?idx=" + idx).then((raw) => {
          Global.overlayDense = mkDense(raw);
          Global.overlayDense.map((d) => (d[3] /= 10.0));
          Global.overlayDensePath = pathlib;
          console.log("Global.overlay_dense is updated to " + pathlib);
          redraw();
        });
      })
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .attr("userData", (d) => d)
      .text((d) => [d.filename, d.parent].join(" | "));
  });

  // d3.json("/fetch/files.json").then((raw) => {
  //   console.log(raw);
  //   d3.select("#" + id)
  //     .append("ol")
  //     .selectAll("li")
  //     .data(raw)
  //     .enter()
  //     .append("li")
  //     .append("div")
  //     .on("click", (e, data) => {
  //       console.log("Clicked", e.target, data);
  //     })
  //     .selectAll("p")
  //     .data((raw) => {
  //       const lst = [];
  //       for (let n in raw) {
  //         lst.push([n, raw[n]]);
  //       }
  //       return lst;
  //     })
  //     .enter()
  //     .append("p")
  //     .text((d) => d[0] + ": " + d[1]);
  // });
}
