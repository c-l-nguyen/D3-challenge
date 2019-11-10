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

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// function used for updating x-scale const upon click on axis label
function xScale(csvData, chosenXAxis) {
  // create scales
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxis]) - 1,
      d3.max(csvData, d => d[chosenXAxis]) + 1
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale const upon click on axis label
function yScale(csvData, chosenYAxis) {
  // create scales
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) - 1,
      d3.max(csvData, d => d[chosenYAxis]) + 1
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis const upon click on axis label
function renderYAxes(newYScale, yAxis) {
  let leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// functions used for updating circles group with a transition to
// new circles for both X and Y coordinates
function renderXCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// functions used for updating circles text with a transition on
// new circles for both X and Y coordinates
function renderXText(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYText(circlesGroup, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[chosenYAxis])+5);

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  let label  = "";
  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  } else if (chosenXAxis === "age"){
    label = "Age:";
  } else {
    label = "Income:";
  }

  const toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
          return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
      });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
  })
  // onmouseout event
  .on("mouseout", function(data, index) {
      toolTip.hide(data, this);
  });

return circlesGroup;
}

(async function(){

  // Import Data
  const stateData = await d3.csv("assets/data/data.csv");

  // Parse Data/Cast as numbers
  stateData.forEach(function(data) {
    data.poverty    = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age        = +data.age;
    data.smokes     = +data.smokes;
    data.obesity    = +data.obesity;
    data.income     = +data.income;
  });

  // Initialize scale functions
  let xLinearScale = xScale(stateData, chosenXAxis);
  let yLinearScale = yScale(stateData, chosenYAxis);

  // Initialize axis functions
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  // Append x and y axes to the chart
  let xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  let yAxis = chartGroup.append("g")
    .call(leftAxis);

  // Create scatterplot and append initial circles
  let circlesGroup = chartGroup.selectAll("g circle")
    .data(stateData)
    .enter()
    .append("g");
  
  let circlesXY = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed("stateCircle", true);
  
  let circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
    .classed("stateText", true);

  // Create group for 2 x-axis labels
  const xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 30})`);

  const povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .text("In Poverty (%)")
      .classed("active", true);

  const ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .text("Age (Median)")
      .classed("inactive", true);

  // Create group for 2 y-axis labels
  const ylabelsGroup = chartGroup.append("g");

  const healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", -40)
    .attr("value", "healthcare") // value to grab for event listener
    .text("Lacks Healthcare (%)")
    .classed("active", true);

  const smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", -60)
    .attr("value", "smokes") // value to grab for event listener
    .text("Smokes (%)")
    .classed("inactive", true);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    const value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // updates x scale for new data
      xLinearScale = xScale(stateData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesXY = renderXCircles(circlesXY, xLinearScale, chosenXAxis);

      // updates circles text with new x values
      circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    const value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // updates y scale for new data
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesXY = renderYCircles(circlesXY, yLinearScale, chosenYAxis);

      // updates circles text with new x values
      circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "smokes") {
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
          healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });

})()