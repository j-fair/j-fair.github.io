// @TODO: YOUR CODE HERE!
// Set svg width and height
var svgWidth = 800;
var svgHeight = 500;

// Chart margins, width, and height
var margin = {
    top: 50,
    right: 50,
    bottom: 75,
    left: 75
};

var chartWidth = svgWidth - margin.right - margin.left;
var chartHeight = svgHeight - margin.top - margin.bottom;

//  Svg wrapper
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append svg group and shift
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Read csv
d3.csv("data/data.csv").then(function(fileData) {
    // console.log(fileData);

    // Parse data
    fileData.forEach(function(state) {
        state.poverty = +state.poverty;
        state.healthcare = +state.healthcare;
    });

    // Create scales for X and Y-axis
    var xScale = d3.scaleLinear()
        .domain([d3.min(fileData, d => d.poverty - 2), d3.max(fileData, d => d.poverty + 2)])
        .range([0, chartWidth]);
    
    var yScale = d3.scaleLinear()
        .domain([d3.min(fileData, d => d.healthcare - 2), d3.max(fileData, d => d.healthcare + 2)])
        .range([chartHeight, 0])
    
    // Functions for axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(fileData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("r", "12")
        .attr("fill", "dodgerblue")
        .attr("opacity", "0.60");

    // Create text for circles
    var textCirclesGroup = chartGroup.selectAll("text")
        .data(fileData)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.poverty))
        .attr("y", d => yScale(d.healthcare))
        .attr("font-size", "8px")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "white")
        .text(d => d.abbr);

    // Initialize and create tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([10, 0])
        .style("color", "black")
        .style("background", "azure")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .html(function(d) {
            return(`<strong>${d.state}</strong><br>
                In Poverty: <strong>${d.poverty}%</strong><br>
                No Healthcare: <strong>${d.healthcare}%</strong>`);
        });
    
    chartGroup.call(toolTip);

    // Create event listeners to display/hide tooltip with mouse
    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
        d3.select(this)
            .transition()
            .duration(375)
            .attr("r", 20)
            .attr("stroke", "black")
            .attr("stroke-width", 3);
    })
        .on("mouseout", function(d) {
            toolTip.hide(d);
            d3.select(this)
                .transition()
                .duration(375)
                .attr("r", 12)
                .attr("stroke", "none")
                .attr("stroke-width", "none");
        });

    
    chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);

    chartGroup.append("g")
        .call(yAxis);

    // Create axis labels
    chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top})`)
        .attr("class", "axisText")
        .text(`In Poverty (%)`);

    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - (chartHeight / 2))
    .attr("class", "axisText")
    .text(`Lacks Healthcare (%)`);

});