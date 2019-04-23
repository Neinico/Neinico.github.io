var ZipVis = function(target){

	var self = this;
	var body = document.body;
	var html = document.html;

	// dimensions for chart
	var width = 600;

	var chartOffsetLeft = 0
	var chartOffsetRight = 40
	var chartOffsetTop = 0

	var svgWidth = width + chartOffsetLeft + chartOffsetRight
	var svgHeight = 540;

	var height = svgHeight - 60;

	var barwidth;
	var graphOffsetLeft = 25;
	var graphOffsetRight = 60;
	var graphOffsetTop = 40;
	var graphOffsetBottom = 25;

    var barwidth;
    var barmargin;

	/* axes globals */
	var x;
	var y;

	/* COLORS */
	/* bars */
	var darkblue = "#002763";
	var lightblue = "#55a6fc";
	var medgrey = "#fcfcfc";

	/* opacity */
	var normopacity = 1;
	var fadeopacity = 0.4;

	/* fonts */
	// var grey = "#c4c4c4";
	// var darkgrey = "#848484";
	var grey = "#848484";
	var darkgrey = "#848484";


	/* background */
	var lightgrey = "#fcfcfc"


	/* text */
	var white = "#ffffff"
	var black = "#000000"

    var sectorNames = ['Professional, Scientific and Technical Services',
                    'Transportation and Warehousing',
                    'Other Services (Except Public Administration)',
                    'Retail Trade',
                    'Construction',
                    'Health Care & Social Assistance',
                    'Arts, Entertainment, & Recreation',
                    'Accommodation & Food Services',
                    'Administrative & Support & Waste',
                    'Wholesale Trade',
                    'Manufacturing',
                    'Real Estate, Rental & Leasing',
                    'Information',
                    'Educational Services',
                    'Finance and Insurance',
                    'Public Administration',
                    'Management of Companies and Enterprises',
                    'Agriculture, Forestry, Fishing and Hunting',
                    'Utilities',
                    'Mining',
                    'Unclassified'];

	var kelly_colors = ['#F99379', '#E25822', '#654522', '#C2B280', '#F38400', '#DCD300',
        '#882D17', '#F3C300', '#F6A600', '#BE0032', '#A1CAF1', '#0067A5', '#E68FAC', '#B3446C',
        '#008856', '#2B3D26', '#604E97', '#8DB600', '#875692', '#222222', '#848482'];

	var light_colors = ['#FFB5A2', '#F17C4D', '#795B3B', '#E8DCB5', '#FFA234', '#FDF425',
            '#AF4F38', '#FFD734', '#FFBD35', '#E31A50', '#D1E6FB', '#0094EC', '#F1B8CB',
            '#D57194', '#43B58A', '#4F6648', '#8475B3', '#B5E60A', '#A780AF', '#5F5E5E', '#B1B1AE']


var gradient = ["#420505", "#4A1010", "#531B1C", "#5C2628", "#653234", "#6E3D40", "#76484C", "#7F5357", "#885F63", "#916A6F", "#9A757B", "#A28087", "#AB8C93", "#B4979F", "#BDA2AA", "#C6ADB6", "#CEB9C2", "#D7C4CE", "#E0CFDA", "#E9DAE6", "#F2E6F2"]

    var zips = ['98118', '98119', '98116', '98117', '98115', '98112', '98195', '98199', '98178',       '98144', '98122', '98164', '98121', '98109', '98108', '98105', '98104', '98107', '98106', '98101', '98126', '98103', '98102', '98125', '98146', '98134', '98136', '98154', '98133', '98174', '98177'];

    var gold = '#F6A600'

	/* data globals */
	var currSector;
	var currId;

	var years = [2010, 2011, 2012, 2013, 2014, 2015, 2016]

	var year;

	self.sectors = new Array();

	for (var i = 0; i < sectorNames.length; i++) {
		self.sectors.push(sectorNames[i].toLowerCase().split(' ').join('_'));
	}

	self.initialize = function(sector_id, zip_id, currYear) {
	    year = currYear;
	    createSvg(target);
		generateZipBars(sector_id, zip_id);
	}

    function createSvg(target){
        self.clientWidth = 400;
        self.clientHeight = 400;

        if (document.getElementById(target).clientWidth >
				document.getElementById(target).clientHeight) {
			self.svg = d3.select("#" + target).append("svg")
				.attr("height", "100%")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", "0 0 " + self.clientWidth+ " " + self.clientHeight);
		} else {
			self.svg = d3.select("#" + target).append("svg")
				.attr("width", "100%")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", "0 0 " +self.clientWidth + " " + self.clientHeight);
		}

		self.chart = self.svg.append("svg")
                    .attr("class", "chart")
					// .attr("width", self.clientWidth)
					// .attr("height", self.clientHeight)
					// .attr("x", chartOffsetLeft)
					// .attr("y", chartOffsetTop)
					.style("stroke-width", 0);

	}

	function generateZipBars(sector_id, zip_id){
		sectorIndex = sector_id;
		if(sectorIndex == -1){
			d3.csv("data/zip_counts_aggregate/transposed/" + zips[zip_id] + "_aggregate_transposed.csv",
				function(data){
					dataset = data
					generateViz(dataset, zip_id)
				}
			);
		}
		else{
			sectorName = self.sectors[sectorIndex];
			d3.csv("data/sector_counts_by_zip/transposed/" + sectorName + "_transpose.csv",
				function(data){
					dataset = data;
					generateViz(dataset, zip_id);
				}
			);
		}
	};

	function generateViz(dataset, zip_id) {
		data = dataset;
		drawXAxis();
		drawYAxis(zip_id);
		drawBars(zip_id);
	}

	function drawXAxis() {
		x = d3.scaleBand().domain([2010, 2011, 2012, 2013, 2014, 2015, 2016])
	  		//.range([graphOffsetLeft + 1, width - graphOffsetRight - 33]);
	  		.range([graphOffsetLeft, self.clientWidth - graphOffsetRight]);


		xAxis = d3.axisBottom()
					.scale(x)
					.ticks(data.length)
					.tickFormat(d3.format("d"))


		self.xAxisGroup = self.chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + 0 + ", " + (self.clientHeight - graphOffsetBottom) + ")")
			.call(xAxis)

		self.xAxisGroup.selectAll("text")
			.attr("font-size", 16)
			.attr("text-anchor", "middle")
			.attr("font-family", "Open Sans")
			.attr("fill", grey)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none");

	}

	function drawYAxis(zip_id) {
		var vals = getVals(zip_id);

		var tmp = ["year"]
	  	y = d3.scaleLinear()
	  			.domain([0, d3.extent(vals)[1] * 1.1])
	  			.range([self.clientHeight - graphOffsetBottom, graphOffsetTop])
	  	y  = y.nice();

	  	yAxis = d3.axisRight()
	  				.scale(y)
                    .ticks(7);

	  	var yAxisDx = (self.clientWidth - graphOffsetRight);

	  	var yAxisGroup = self.chart.append("g")
	  						.attr("class", "y axis")
	  						.attr("transform", "translate(" + yAxisDx + ", 0)")
	  						.call(yAxis);

	  	yAxisGroup.selectAll("text")
	  		.attr("class", "yScaleText")
			.attr("font-size", 16)
			.attr("font-family", "Open Sans")
			.attr("fill", grey)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none");

		yAxisBBox = yAxisGroup.node().getBBox();

		// yAxisLabel = self.chart.append("text")
		// 	.attr("font-size", 10)
		// 	.attr("font-family", "Open Sans")
		// 	.attr("fill", darkgrey)
		// 	.attr("x", yAxisDx + 9)
		// 	.attr("y", yAxisBBox.y - 15)
		// 	// .attr("y", graphOffsetTop + 5)
		// 	.attr("dominant-baseline", "central")
		// 	.attr("pointer-events", "none")
		// 	.style("user-select", "none")
		// 	.style("-webkit-user-select", "none")
		// 	.style("-moz-user-select", "none")
		// 	.text("Business Count");
	}

	function drawBars(zip_id){
		var vals = getVals(zip_id)
		var groups = new Array()
		var valObjs = new Array()
		// group bars
		for(var i = 0; i < vals.length; i ++){
			var valObj = {
				year: years[i],
				value: parseInt(vals[i])
			}
			valObjs.push(valObj)
			var group = self.chart.append("g")
				.attr("class", "zipYearBar" + " year" + years[i])
				.datum(valObj)
				.style("cursor", "default")
				.on("mouseleave", function(){
				})

			groups.push(group);
		}
		barwidth = (self.clientWidth - (graphOffsetLeft + graphOffsetRight)) / 7;
		barmargin =  5;

		// draw bars
		for(var i = 0; i < groups.length; i ++){
			var rects = groups[i].selectAll("rect");
			rects.data([valObjs[i]])
				.enter()
				.append("rect")
				.attr("class", "zipRect")
                .attr("fill", function(d){
                	return d.year == year ? gold : sectorIndex == -1? "black" : gradient[sectorIndex]
                })
                .style("opacity", function(d) {
                    return d.year == year ? 0.7 : normopacity;
                })
				.attr("stroke", function(){
                	return sectorIndex == -1 ? "black" : gradient[sectorIndex];
                })
				.attr("x", function(d){
					return x(d.year) + barmargin/2;
				})
				.attr("y", function(d){
					return y(d.value);
				})
				.attr("width", barwidth - barmargin)
				.attr("height", function(d){
					return self.clientHeight - y(d.value) - graphOffsetBottom;
				})
				.on("mouseenter", function(d){
				});
		}

        self.svg.append("text")
            .attr("id", "bartitle")
            .attr("class", "unselectable")
            .attr("x", self.clientWidth / 2 - 10)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-family", "Open Sans")
            .attr("font-size", "19px")
            .text("All Businesses")
	}

	function fadeOthers(element) {
		function match(current, target) {
			return current === target;
		}

		d3.selectAll(".zipRect")
			.transition("fadeOthers")
			.style("fill-opacity", function(){
				return this == element ? normopacity : fadeopacity;
			})
			.style("stroke-opacity", function(){
				return this == element ? normopacity : fadeopacity;
			});
	}

	function unFadeAll() {
		d3.selectAll("rect")
			.transition("unfadeAll")
			.style("fill-opacity", normopacity)
			.style("stroke-opacity", normopacity)
	}

	function displayTotal(d, bar){
		var total = d.value
		var startOpacity = 0
		var infoGroup = self.chart.append("g").attr("class", "infoGroup");
		var bbox = d3.select(bar).node().getBBox();

		var count = infoGroup.append("text")
			.attr("id", "totalcount")
			.attr("x", bbox.x + (bbox.width) / 2)
			.attr("y", bbox.y - 12)
			.attr("font-family", "Open Sans")
			.attr("font-size", 24)
			.attr("font-weight", 300)
			.attr("text-anchor", "middle")
			.attr("fill", black)
			.style("fill-opacity", startOpacity)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.text(total);

		count.transition("fadeCountIn").delay(100).duration(500).ease(d3.easeLinear)
			.style("fill-opacity", 1);
	}

	function removeTotal(){
		d3.select("g.infoGroup")
			.remove();
	}

	self.update = function(sector_id, zip_id, currYear){
		year = currYear;
		sectorName = self.sectors[sector_id];
		sectorIndex = sector_id
		if(sectorIndex === -1){
			d3.csv("data/zip_counts_aggregate/transposed/" + zips[zip_id] + "_aggregate_transposed.csv",
				function(data){
					dataset = data
					updateViz(dataset, zip_id)
                    self.svg.select("#bartitle")
                        .text("All Businesses")
				}
			);
		}
		else{
			d3.csv("data/sector_counts_by_zip/transposed/" + sectorName + "_transpose.csv",
				function(data){
					dataset = data
					updateViz(dataset, zip_id);
                    self.svg.select("#bartitle")
                        .text(sectorNames[sector_id]);
				}
			);
		}
	}

	function updateViz(dataset, zip_id){
		data = dataset;
		updateAxes(zip_id);
		updateBars(zip_id);
	}

	function updateAxes(zip_id){
		var vals = getVals(zip_id);
		y.domain([0, d3.max(getValObjs(vals), function(d) {
            return d.value;
        })])

		self.chart.select(".y.axis")
			.transition()
			.duration(1000)
			.call(yAxis)
			.selectAll("text")
			.attr("fill", function(){
				return sectorIndex == -1? "black" : gradient[sectorIndex]
			})
	  		.attr("fill-opacity", 0.7)
			.attr("font-size", 18)
			.attr("font-family", "Open Sans")
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.transition()
			.attr("fill", grey)
			.attr("fill-opacity", 1);
	}

	function updateBars(zip_id){
		var vals = getVals(zip_id)
		var groups = new Array()
		var valObjs = getValObjs(vals)
		for(var i = 0; i < vals.length; i++){
			var group = self.chart.select(".year" + years[i])

			var rects =  group.selectAll("rect")

			rects.data([valObjs[i]])
				.transition("reposition")
				.duration(800)
				.attr("fill", function(d){
					return d.year == year ? gold : sectorIndex == -1? "#2d0202" : gradient[sectorIndex]
				})
                .style("opacity", function(d) {
                    return d.year == year ? 0.7 : normopacity;
                })
				.attr("y", function(d) {
					return y(d.value);
				})
				.attr("height", function(d) {
					return self.clientHeight - y(d.value) - graphOffsetBottom;
				}
			);

            if (rects.datum().year == year) {
                rects.transition()
                    .delay(0)
                    .duration(1000)
                    .style("opacity", 0.75)
                    .transition()
                        .duration(500)
                        .on("start", function repeat() {
                            d3.active(this)
                                .style("opacity", 0.5)
                                .transition()
                                .style("opacity", 0.75)
                                .transition()
                                .on("start", repeat);
                        });
            } else {
                rects.transition();
            }
		}
	}


	function getVals(zip_id){
		if(sectorIndex == -1){
			var vals = Object.values(data[0])
			return vals.slice(0,vals.length-1);
		}
		else{
			return Object.values(dataset[zip_id]).filter(function(x){
				return parseInt(x) < 98000
			});
		}
	}

	function getValObjs(vals){
		var valObjs = new Array()
		// group bars
		for(var i = 0; i < vals.length; i ++){
			var valObj = {
				year: years[i],
				value: parseInt(vals[i])
			}
			valObjs.push(valObj);
		}
		return valObjs
	}
}
