var svg = d3.select("businessVisualization").append("svg")
      .attr("width", 960)
      .attr("height", 500)

    var width = 800;
    var height = 400;

    // http://bl.ocks.org/zanarmstrong/raw/05c1e95bf7aa16c4768e/
    var parseDate = d3.time.format("%Y-%m");
    var displayDate = d3.time.format("%b %y");
    var displayValue = d3.format(",.0f");
    
    // Ordinal scale
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .5);

    var y = d3.scale.linear()
        .range([height, height - 200]);

    var line = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.value); });
    
    var g = svg.append("g")
    	.attr("transform", "translate(50, 0)")
    
   	d3.csv("data/Revenue(ATVI).csv", function(error,data) {

      // Pre-processing
      data.forEach(function(d) {
				d.value;// = +d.value;
        d["date"] = parseDate.parse(d["date"]);
      });
      
      x.domain(data.map(function(d) { return d.year; }));
			y.domain([0, d3.max(data, function(d) { return d.value; })]);
      
      svg.selectAll("text").data(data).enter()
       .append("text")
        .text(function(d, i) { return displayDate(d.date); })
        .attr("y", 420)
        .attr("x", function(d) { return x(d.year); })
        .style("font-size", 15)
        .style("font-family", "monospace");

      g.selectAll(".value").data(data).enter()
       .append("text")
        .text(function(d, i) { return displayValue(d.value); })
        .attr("class", "value")
        .attr("y", function(d) { return y(d.value)-20; })
        .attr("x", function(d) { return x(d.year);})
        .style("font-size", 20)
      	.style("opacity",0)
        .style("font-family", "monospace");

      g.selectAll("path").data([data]).enter().append("path")
        .attr("class", "line")
        .attr("d", line);
     
     g.selectAll("line").data(data).enter().append("line")       
                    .attr('x1',function(d) { return x(d.year); })
                    .attr('y1',function(d) { return y(0); })
                    .attr('x2',function(d) { return x(d.year); })
                    .attr('y2',function(d) { return y(d.value); })
                    .style("stroke-width", 2)
                    .style("stroke", "gray")
                    .style("stroke-dasharray", ("2, 2"))
     								.style("opacity",0);

  
      g.selectAll("circle").data(data).enter()
      .append("circle")
      .attr("cx",function(d) { return x(d.year); })
  		.attr("cy",function(d) { return y(d.value); })
      .attr("r",8)  
      .attr("opacity",0.15)
       .on("mouseover", function(d) {
      	d3.select(this).attr("opacity",1).style("fill", "red");
      	d3.selectAll(".value").filter(function(e) {
          return d === e;
        })
        .style("opacity",1)
        .style("font-size", 30);
        d3.selectAll("line").filter(function(e) {
          return d === e;
        })
        .style("opacity",1)
      
    	})
      
			.on("mouseout", function(d) {
      			d3.select(this).transition().duration(50).style("fill","black").attr("opacity",0.15);
        d3.selectAll(".value").filter(function(e) {
          return d === e;})
          .style("opacity",0)
        .transition().duration(100);
      
   
       d3.selectAll("line").filter(function(e) {
          return d === e;
        })
        .style("opacity",0)
       .transition().duration(100);
        });
      
    });