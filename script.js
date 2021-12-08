const MAP_WIDTH = 700;
const MAP_HEIGHT = 700;
const BAR_CHART_WIDTH = 320;
const BAR_CHART_HEIGHT = 720;
const PIE_WIDTH = 350;
const PIE_HEIGHT = 300;
const MARGINS = {
  top: 20,
  right: 50,
  bottom: 20,
  left: 80,
  mapLeft: 20,
};
let SELECTED_VALUE = null;

const ageRanges = d3
  .scaleOrdinal()
  .domain([0, 1, 2, 3, 4, 5])
  .range(["0-10", "11-21", "21-40", "41-60", "61-80", ">80"]);

// tooltip
const tooltip = d3
  .select("#tooltip")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("width", "100px")
  .style("opacity", 0);

const drawMap = async () => {
  const streets = await d3.json("./datasets/streets.json");
  const pumps = await d3.csv("./datasets/pumps.csv");
  const deaths = await d3.csv("./datasets/deaths_age_sex.csv");

  const svg = d3
    .select("#map-chart")
    .append("svg")
    .attr("width", MAP_WIDTH)
    .attr("height", MAP_HEIGHT)
    .append("g")
    .attr("transform", `translate(0, 60)`);

  const labelData = ["Male", "Female", "Pump", "Brewery", "Work House"];

  //map color and text labels
  const label = svg
    .append("g")
    .attr("class", "label")
    .attr("transform", `translate(${MARGINS.mapLeft}, 0)`);

  label
    .selectAll("circle")
    .data(labelData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => i * 100)
    .attr("cy", -5)
    .attr("r", 10)
    .attr("fill", (d, i) => {
      if (i === 0) {
        return "#C94A4D";
      } else if (i === 1) {
        return "#AA14F0";
      } else if (i === 2) {
        return "orange";
      } else if (i === 3) {
        return "blue";
      } else {
        return "green";
      }
    });

  label
    .selectAll("text")
    .data(labelData)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d, i) => 20 + i * 100)
    .attr("y", 0)
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text((d) => d);

  // line generator
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(streets.flat().map((d) => d.x)))
    .range([0, MAP_WIDTH]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(streets.flat().map((d) => d.y)))
    .range([MAP_HEIGHT - 60, 0]);

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

    
  svg
    .append("text")
    .style("fill", "black")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(359,289) rotate(-30)")
    .text("Broad Street");
  svg
    .append("text")
    .style("fill", "black")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(550,150) rotate(69)")
    .text("Dean Street");
  svg
    .append("text")
    .style("fill", "black")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(250,85) rotate(-11)")
    .text("Oxford Street");
  svg
    .append("text")
    .style("fill", "black")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(190,360) rotate(59)")
    .text("Regent Street");

  streets.map((street) => {
    svg
      .append("path")
      .attr("d", lineGenerator(street))
      .attr("class", "street")
      .attr("fill", "white")
      .attr("stroke", "#8A0100")
      .attr("stroke-width", "2px")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("pointer-events", "none");
  });
  // add pumps
  const pump = svg.append("g").selectAll("circle").data(pumps);

  pump
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", "6px")
    .attr("fill", "orange")
    .attr("stroke", "#8A0100")
    .attr("stroke-width", "1px")
    .style("pointer-event", "none");

  svg
    .append("circle")
    .attr("cx", 250)
    .attr("cy", 200)
    .attr("r", "16px")
    .attr("fill", "blue")
    .attr("stroke", "none")
    .style("pointer-event", "none");

  svg
    .append("circle")
    .attr("cx", 350)
    .attr("cy", 300)
    .attr("r", "16px")
    .attr("fill", "green")
    .attr("stroke", "none")
    .style("pointer-event", "none");

  const death = svg.append("g").selectAll("circle").data(deaths);

  death
    .enter()
    .append("circle")
    .classed("death", true)
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", "4px")
    .attr("fill", (d) => (+d.gender === 0 ? "#C94A4D" : "#AA14F0"))
    .style("cursor", "pointer")
    .on("mouseover", function (e, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `Age: ${ageRanges(d.age)}<br/>Gender: ${d.gender === 0 ? "M" : "F"}`
        )
        .style("left", `${e.pageX - 10}px`)
        .style("top", `${e.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (e, d) {
      tooltip
        .style("left", `${e.pageX + 10}px`)
        .style("top", `${e.pageY - 10}px`);
    })
    .on("mouseout", function (e) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  death.exit().remove();


  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [0, 0],
      [MAP_WIDTH, MAP_HEIGHT],
    ])
    .on("zoom", function (event) {
      svg.attr("transform", event.transform);
    });

  d3.select("svg").call(zoom);
};

const drawBarChart = async () => {
  const data = await d3.csv("./datasets/deathdays.csv");
  const deaths = await d3.csv("./datasets/deaths_age_sex.csv");
  const streets = await d3.json("./datasets/streets.json");

  const svg = d3
    .select("#bar-chart")
    .append("svg")
    .attr("width", BAR_CHART_WIDTH)
    .attr("height", BAR_CHART_HEIGHT)
    .append("g")
    .attr("transform", `translate(${MARGINS.left}, ${MARGINS.top})`);

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.date))
    .range([0, BAR_CHART_HEIGHT - MARGINS.top - MARGINS.bottom])
    .padding(0.4);

  svg.append("g").call(d3.axisLeft(y)); // append y axis to svg

  //function to define the x scale and map data to width of svg
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.deaths)])
    .range([0, BAR_CHART_WIDTH - 80])
    .nice();

  //map scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(streets.flat().map((d) => d.x)))
    .range([0, MAP_WIDTH]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(streets.flat().map((d) => d.y)))
    .range([MAP_HEIGHT - 60, 0]);

  //append y axis label
  svg
    .append("text")
    .attr("y", -MARGINS.left / 2 - 10)
    .attr("x", -BAR_CHART_HEIGHT / 2)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .style("font-weight", "bold")
    .text("Date");

  //append x axis label
  svg
    .append("text")
    .attr("y", BAR_CHART_HEIGHT - MARGINS.bottom)
    .attr("x", BAR_CHART_WIDTH / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .style("font-weight", "bold")
    .text("Number of Deaths");

  // append rects to svg and set enter state
  const rects = svg.selectAll("rect").data(data);

  // update the state the on rects
  rects
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d.date))
    .on("mouseover", function (e, d) {
      d3.selectAll(".death").attr("opacity", (circle, i) => (i + 1 > d.deaths ? 0 : 1));

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(`Date: ${d.date}<br/>Deaths: ${d.deaths}`)
        .style("left", `${e.pageX - 10}px`)
        .style("top", `${e.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (e, d) {
      tooltip
        .style("left", `${e.pageX + 10}px`)
        .style("top", `${e.pageY - 10}px`);
    })
    .on("mouseout", function (e) {
      d3.selectAll(".death").attr("opacity", 1);
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .merge(rects)
    .transition()
    .duration(1000)
    .attr("x", (d) => x(0))
    .attr("y", (d) => y(d.date))
    .attr("width", (d) => x(+d.deaths))
    .attr("height", y.bandwidth())
    .attr("fill", "#8A0100")
    .attr("stroke", "#8A0100")
    .attr("stroke-width", "0.5px")
    .style("cursor", "pointer");

  // append text to end of rects
  rects
    .enter()
    .append("text")
    .attr("x", (d) => x(+d.deaths) + 5)
    .attr("y", (d) => y(d.date) + y.bandwidth() / 2)
    .merge(rects)
    .transition()
    .delay(900)
    .duration(1000)
    .attr("x", (d) => x(+d.deaths) + 3)
    .attr("y", (d) => y(d.date) + y.bandwidth() / 2)
    .text((d) => d.deaths)
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "black")
    .attr("alignment-baseline", "middle");
  // set exit behaviour
  rects.exit().remove();
};

const drawPies = async () => {
  const data = await d3.csv("./datasets/deaths_age_sex.csv");

  const color = d3
    .scaleOrdinal()
    .domain(["0", "1", "2", "3", "4", "5"])
    .range(["#C94A4D", "#AA14F0", "#FCDEBA", "#FCCCA8", "#FAAC8B", "#E87F70"]);

  const svg = d3
    .select("#age-pie")
    .append("svg")
    .attr("width", PIE_WIDTH)
    .attr("height", PIE_HEIGHT);

  const chartContainer = svg
    .append("g")
    .attr("transform", `translate(0, ${MARGINS.top})`)
    .append("g")
    .attr("transform", `translate(${PIE_WIDTH / 2.2}, ${PIE_HEIGHT / 2})`);

  //group data by age group
  const ageGroup = d3.group(data, (d) => +d.age);

  const pie = d3
    .pie()
    .value((d) => d[1].length)
    .sort(null);

  const path = d3
    .arc()
    .outerRadius(PIE_HEIGHT / 2 - MARGINS.top)
    .innerRadius(0);

  const arc = chartContainer
    .selectAll("arc")
    .data(pie(ageGroup))
    .enter()
    .append("g")
    .attr("class", "arc")
    .on("mousemove", (e, d) => {
      SELECTED_VALUE = d.data[0];
      d3.selectAll(".death").attr("opacity", (d) =>
        SELECTED_VALUE === +d.age ? 1 : 0
      );
    })
    .on("mouseleave", (e, d) => {
      SELECTED_VALUE = "";
      d3.selectAll(".death").attr("opacity", 1);
    });

  arc
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => color(d.data[0]))
    .attr("stroke", "black")
    .attr("stroke-width", "0.5px")
    .style("cursor", "pointer")
    .on("mouseover", function (e, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `Age: ${ageRanges(d.data[0])}<br/>Percentage: ${
            (d.data[1].length / data.length).toFixed(2) * 100 + "%"
          }<br>Deaths: ${d.data[1].length}`
        )
        .style("left", `${e.pageX - 10}px`)
        .style("top", `${e.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (e, d) {
      tooltip
        .style("left", `${e.pageX + 10}px`)
        .style("top", `${e.pageY - 10}px`);
    })
    .on("mouseout", function (e) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  arc
    .append("text")
    .attr("transform", (d) => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle")
    .text((d) => ageRanges(d.data[0]))
    .style("pointer-events", "none");

  const deathsBySex = d3
    .select("#sex-pie")
    .append("svg")
    .attr("width", PIE_WIDTH)
    .attr("height", PIE_HEIGHT);

  const chart = deathsBySex
    .append("g")
    .attr("transform", `translate(0, ${MARGINS.top})`)
    .append("g")
    .attr("transform", `translate(${PIE_WIDTH / 2.2}, ${PIE_HEIGHT / 2})`);

  //group data by age group
  const sexGroup = d3.group(data, (d) => +d.gender);

  const sexPie = d3
    .pie()
    .value((d) => d[1].length)
    .sort(null);

  const sexPath = d3
    .arc()
    .outerRadius(PIE_HEIGHT / 2 - MARGINS.top)
    .innerRadius(0);

  const sexArc = chart
    .selectAll("arc")
    .data(sexPie(sexGroup))
    .enter()
    .append("g")
    .attr("class", "arc")
    .on("mouseover", function (e, d) {
      SELECTED_VALUE = d.data[0];
      d3.selectAll(".death").attr("opacity", (d) =>
        SELECTED_VALUE === +d.gender ? 1 : 0
      );
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `Sex: ${d.data[0] === 0 ? "Male" : "Female"}<br/>Deaths: ${
            d.data[1].length
          }`
        )
        .style("left", `${e.pageX - 10}px`)
        .style("top", `${e.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (e, d) {
      tooltip
        .style("left", `${e.pageX + 10}px`)
        .style("top", `${e.pageY - 10}px`);
    })
    .on("mouseout", function (e) {
      SELECTED_VALUE = "";
      d3.selectAll(".death").attr("opacity", 1);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  sexArc
    .append("path")
    .attr("d", sexPath)
    .attr("fill", (d) => color(d.data[0]))
    .attr("stroke", "black")
    .attr("stroke-width", "0.5px")
    .style("cursor", "pointer");

  sexArc
    .append("text")
    .attr("transform", (d) => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle")
    .text((d) => (+d.data[0] === 0 ? "Male" : "Female"));

  sexArc
    .append("text")
    .attr(
      "transform",
      (d) => `translate(${path.centroid(d)[0]}, ${path.centroid(d)[1] + 25})`
    )
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle")
    .text((d) => Math.round((d.data[1].length / data.length) * 100) + "%");
};

drawMap();
drawBarChart();
drawPies();
