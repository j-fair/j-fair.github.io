//Variables for various placeholders to be used later

var idSelect = d3.select("#selDataset")

var demographicsTable = d3.select("#sample-metadata")
var barChart = d3.select("#bar")
var bubbleChart = d3.select("bubble")
var gaugeChart = d3.select("gauge")

// Function for initial population of charts
function init() {

    // Data reset function, added below
    resetData();

    d3.json("samples.json").then((data => {

        data.names.forEach((name => {
            var option = idSelect.append("option");
            option.text(name);
        })); 

        // First ID as default and plotting
        var initId = idSelect.property("value")
        plots(initId);

    }))

} 


function resetData() {

    demographicsTable.html("");
    barChart.html("");
    bubbleChart.html("");
    gaugeChart.html("");

}

// Plotting all da charts
function plots(id) {

    // Data load
    d3.json("samples.json").then((data => {

        var washfreq = data.metadata.filter(participant => participant.id == id)[0];

        var wfreq = washfreq.wfreq;

        //Empty demo table before new data
        demographicsTable.html("");

        Object.entries(washfreq).forEach((key)=>{
            demographicsTable.append("p").text(key[0] + " : " + key[1]);

        })

        var individualSample = data.samples.filter(sample => sample.id == id)[0];

        var otuIds = [];
        var otuLabels = [];
        var sampleValues = [];

        Object.entries(individualSample).forEach(([key, value]) => {

            switch (key) {
                case "otu_ids":
                    otuIds.push(value);
                    break;
                case "sample_values":
                    sampleValues.push(value);
                    break;
                case "otu_labels":
                    otuLabels.push(value);
                    break;
                default:
                    break;
            }

        })

        // Top 10 selection
        var topOtuIds = otuIds[0].slice(0, 10).reverse();
        var labels = otuLabels[0].slice(0, 10).reverse();
        var topSampleValues = sampleValues[0].slice(0, 10).reverse();

        var formattedIDs = topOtuIds.map(otuID => "OTU " + otuID);

        // Bar chart
        var traceBar = {
            x: topSampleValues,
            y: formattedIDs,
            text: labels,
            type: 'bar',
            orientation: 'h',
            marker: {
                color: 'light grey'
            }
        };

        var dataBar = [traceBar];

        var layoutBar = {
            height: 500,
            width: 600,
            title: {
                text: `<b>Top OTUs for Test Subject ${id}</b>`,
                font: {
                    size: 18,
                    color: 'black'
                }
            },
            xaxis: {
                title: "<b>Sample values<b>",
                color: 'black'
            },
            yaxis: {
                tickfont: { size: 14 }
            }
        }

        Plotly.newPlot("bar", dataBar, layoutBar);


        //Bubble chart
        var traceBub = {
            x: otuIds[0],
            y: sampleValues[0],
            text: otuLabels[0],
            mode: 'markers',
            marker: {
                size: sampleValues[0],
                color: otuIds[0],
            }
        };

        var dataBub = [traceBub];
        var layoutBub = {
            xaxis: {
                title: "<b>OTU Id</b>",
                color: 'black'
            },
            yaxis: {
                title: "<b>Sample Values</b>",
                color: 'black'
            },
            showlegend: false,
        };

        Plotly.newPlot('bubble', dataBub, layoutBub);

        if (wfreq == null) {
            wfreq = 0;
        }

        // the damn gauge
        var traceGauge = {
            domain: { x: [0, 1], y: [0, 1] },
            value: wfreq,
            type: "indicator",
            mode: "gauge",
            gauge: {
                axis: {
                    range: [0, 9],
                    tickmode: 'linear',
                    tickfont: {
                        size: 15
                    }
                },
                bar: { color: 'rgba(8,29,88,0)' }, // Using pointer, color transparency
                steps: [
                    { range: [0, 1], color: 'rgb(245,245,245)' },
                    { range: [1, 2], color: 'rgb(240,240,235)' },
                    { range: [2, 3], color: 'rgb(223,227,203)' },
                    { range: [3, 4], color: 'rgb(207,216,159)' },
                    { range: [4, 5], color: 'rgb(193,216,159)' },
                    { range: [5, 6], color: 'rgb(172,203,128)' },
                    { range: [6, 7], color: 'rgb(133,184,91)' },
                    { range: [7, 8], color: 'rgb(109,169,58)' },
                    { range: [8, 9], color: 'rgb(72,137,18)' }
                ]
            }
        };

        
        var angle = (wfreq / 9) * 180;


        // Had to google a bunch of this for creating the gauge with a needle. Math caclcs to supply the angle
        var degrees = 180 - angle,
            radius = .8;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            cX = String(x),
            cY = String(y),
            pathEnd = ' Z';
        var path = mainPath + cX + " " + cY + pathEnd;


        // create a trace to draw the circle where the needle is centered
        var traceNeedleCenter = {
            type: 'scatter',
            showlegend: false,
            x: [0],
            y: [0],
            marker: { size: 35, color: '850000' },
            name: wfreq,
            hoverinfo: 'name'
        };

        var dataGauge = [traceGauge, traceNeedleCenter];

        var layoutGauge = {

            // Needle pointer
            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            title: {
                text: `<b>Sample Person ${id}</b><br><b>Washing Frequency</b>`,
                font: {
                    size: 18,
                    color: 'black)'
                },
            },
            height: 500,
            width: 500,
            xaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1],
                fixedrange: true 
            },
            yaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-0.5, 1.5],
                fixedrange: true 
            }
        };


        Plotly.newPlot('gauge', dataGauge, layoutGauge);


    }));

}; 

function optionChanged(id) {

    resetData();

    plots(id);


} 

init();