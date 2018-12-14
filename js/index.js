(function() {
	/////////////// Bubble Chart ///////////////

  var diameter = 700;
  var color = d3.scale.category20b();

  // add tooltips to the graph's bubbles
  var div = d3.select("#graph").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0)
  .style("text-align", "left");

  // append an svg to #graph where we will put the bubble chart
  var svg = d3.select('#graph').append('svg')
  .attr('width', diameter)
  .attr('height', diameter);

  // define the layout as "pack", a heirarchical layout of circles, whose size
  // are determined by the size element of nodes
  var bubble = d3.layout.pack()
  .size([diameter, diameter])
  .value(function(d) {return d.size;})
  .padding(5);
  
  // generate graph data, but only have one level of nodes (no children)
  var nodes = bubble.nodes(processData())
  .filter(function(d) { return !d.children; });

  // join the data
  var vis = svg.selectAll('circle')
  .data(nodes);
  
  // add the bubbles to the graph
  vis.enter().append('circle')
  .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
  .attr('r', function(d) { return d.r; })
  .attr('class', "circle")
  .style("fill", function(d){ return color(d.value)})
  // show/hide the tooltips based on mouse position
  .on("mouseover", function(d) {	
    div.transition()		
    .duration(500)	
    .style("opacity", .9);		
    div.html("ARTIST&emsp;" + d["name"] + "<br/> PLAYS&emsp;&emsp;" + d["size"])
    .style("left", (d3.event.pageX) + "px")		
    .style("top", (d3.event.pageY - 28) + "px");	
  })	
  .on("mouseout", function(d) {   
          div.transition()    
          .duration(500)    
          .style("opacity", 0); 
        });				



  /////////////// Pie Charts ///////////////

  // for each artist in my top 100 artists, make a pie chart of my listening percentages
  for(var i = 0; i < nodes.length; i++){
    dataset = [
      {label: "mylistens", count: nodes[i]["quotient"]*200, percent: nodes[i]["quotient"]},
      {label: "all listens", count: (1-nodes[i]["quotient"])*50}
    ];

    makePieChart(dataset, nodes[i]["name"]);
  }

  function makePieChart(dataset, name){
    var width = 180, height = 180, radius = Math.min(width, height) / 2;
    var donutWidth = 35;
    
    // append an svg to #chart where we will make a new pie chart 
    var svg = d3.select('#chart').append('svg')
            .attr('width', width)
            .attr('height', height)
            .on("mouseout", function(d) {   
              div.transition()    
              .duration(500)    
              .style("opacity", 0); 
            })
            // add tooltips to display my listening percentage
            .on("mouseover", function(d) {  
                div.transition()    
                .duration(500)  
                .style("opacity", .9);    
                div.html((dataset[0]["percent"]*100).toFixed(4) + "% of all plays")
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
            .on("mouseout", function(d) {   
                div.transition()    
                .duration(500)    
                .style("opacity", 0); 
            });

    // center the pie chart in g
    var group = svg.append('g')
            .attr('transform', 'translate(' + (width / 2) +',' + (height / 2) + ')');
          
    // define the pie charts inner and outer radii. i chose to make mine donut shape
    var arc = d3.svg.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

    // define the layout as a pie chart whose values are the "count" from dataset
    var pie = d3.layout.pie()
            .value(function(d) { return d.count; });

    // draw the pie chart with the specified data
    var path = group.selectAll('.arc')
            .data(pie(dataset))
            .enter()
            .append('g')
              .attr('class', arc)

    // color the arcs
    path.append("path")
              .attr("d", arc)
              .attr('fill', function(d) { return color(d.data.count); })

    // label each artists listening percentage chart
    group.append("text")
              .attr("class", "label")
              .attr("text-anchor", "middle")
              .text(name)
      }



  /////////////// Data Loading ///////////////

  // process the json data so D3 can read it
  function processData() {
    var obj = DATA["artists"]
    // console.log(obj)
    var dataset = []

    for(var i=0; i < obj.length; i++){
      dataset.push({"name": obj[i]["name"], "size": parseInt(obj[i]["myListens"]), "quotient":parseFloat(obj[i]["quotient"]) });
    }
    return {children: dataset};
  }

  
})();