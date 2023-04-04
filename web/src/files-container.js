{
  const id = "files-container";
  document.getElementById(id).innerHTML = "";

  d3.json("/fetch/files.json").then(raw => {
    console.log(raw);
    d3
      .select("#" + id)
      .append("ol")
      .selectAll("li")
      .data(raw)
      .enter()
      .append("li")
      .append('div')
      .on('click', (e, data) => {
        console.log('Clicked', e.target)
        console.log(data)
      })
      .selectAll('p')
      .data(raw => {
        const lst = [];
        console.log(raw)
        for (let n in raw) {
            lst.push([n, raw[n]])
        }
        return lst;
      })
      .enter()
      .append('p')
      .text(d => d[0] + ': ' + d[1])
      ;
  });
}
