(async function(){
  const svgWidth = 960;
  const svgHeight = 500;

  const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  const svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Import Data
  const stateData = await d3.csv("assets/data/data.csv");

  // Parse Data/Cast as numbers
  stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.smokes +=data.smokes;
    data.obesity +=data.obesity;
    data.income +=data.income;
  });

  // Create scale functions
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d.poverty)-1, d3.max(stateData, d => d.poverty)+1])
    .range([0, width]);

  const yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d.healthcare)-1, d3.max(stateData, d => d.healthcare)+1])
    .range([height, 0]);

  // Create axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  // Append Axes to the chart
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);

  // Create scatterplot
  const circlesGroup = chartGroup.selectAll("g circle")
    .data(stateData)
    .enter()
    .append("g");

  circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "15")
    .classed("stateCircle", true);

  circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d.poverty))
    .attr("dy", d => yLinearScale(d.healthcare)+5)
    .classed("stateText", true);

  // Create axes labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left + 40)
    .attr("dy", "1em")
    .text("Lacks Healthcare (%)")
    .classed("active", true);

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .text("In Poverty (%)")
    .classed("active", true);

})()