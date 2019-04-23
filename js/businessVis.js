var BusinessVis = function(target) {
	var self = this;
	var body = document.body;
	var html = document.documentElement;

	// dimensions for the chart
	var width = 600;

	var chartOffsetLeft = 260;
	var chartOffsetRight = 0;
	var chartOffsetTop = 0;

	var streamWidth = 360;

	/** dimensions for the entire view */
	var svgWidth = width + chartOffsetLeft + chartOffsetRight + streamWidth; // 1040
	var svgHeight = 540;

	var height = svgHeight - 60;

	var streamHeight = 300;
	var streamOffsetLeft = width + chartOffsetLeft + chartOffsetRight;

	var shift = 40;

	/* Important Globals Here */
	var data;
	var streamData;
	var chart;
	var streamChart;
	self.svg;
	var keyedData;
	var orderedLayers;
	/*-------*/

	var index = 0;

	var normopacity = 0.8;
	var fadeopacity = 0.4;

	var streamfadeopacity = .1;
	var streamfadedelay = 20;

	var barwidth;
	var graphOffsetLeft = 40;
	var graphOffsetRight = 120;
	var graphOffsetTop = 40;
	var graphOffsetBottom = 25;
	var layerOffset = 150;


	/* COLORS */
	/* bars */
	var darkblue = "#002763";
	var lightblue = "#55a6fc";
	var medgrey = "#fcfcfc";

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


	/* other globals */
	var x; // scale
	var y; // scale
	var xAxis;
	var yAxis;
	var id = 7;

	var streamX;
	var streamY;
	var streamXAxis;
	var streamYAxis;

	/** highlight bar margins */
	var boxYMargin = 6;
	var boxXMargin = 8;

	self.previousBar;
	var prevNavBarId;

    var barwidth;
    var barmargin;

	var highlightId = 0;

	var circleRadius = 4;
	var circleStrokeWidth = 1;

    var sectorNames = ['Fortnite','League of Legends', 'World of Warcraft'];

	var kelly_colors = ['#F99379', '#E25822', '#654522', '#C2B280', '#F38400', '#DCD300',
        '#882D17', '#F3C300', '#F6A600', '#BE0032', '#A1CAF1', '#0067A5', '#E68FAC', '#B3446C',
        '#008856', '#2B3D26', '#604E97', '#8DB600', '#875692', '#222222', '#848482'];

	var light_colors = ['#FFB5A2', '#F17C4D', '#795B3B', '#E8DCB5', '#FFA234', '#FDF425',
            '#AF4F38', '#FFD734', '#FFBD35', '#E31A50', '#D1E6FB', '#0094EC', '#F1B8CB',
            '#D57194', '#43B58A', '#4F6648', '#8475B3', '#B5E60A', '#A780AF', '#5F5E5E', '#B1B1AE']

	var sectorIndex = 0;


	self.sectors = new Array();

	for (var i = 0; i < sectorNames.length; i++) {
		self.sectors.push(sectorNames[i].toLowerCase().split(' ').join('_'));
	}

	self.initialize = function() {
		createSvg(target);
		drawStreamXAxis();
		drawStreamGraph();
		generateBarGraph(0);
		drawNavBar();
	}

	function createSvg(target) {
		if (document.getElementById(target).clientWidth * svgHeight / svgWidth >
				document.getElementById(target).clientHeight) {
			self.svg = d3.select("#" + target).append("svg")
				.attr("height", "100%")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);
		} else {
			self.svg = d3.select("#" + target).append("svg")
				.attr("width", "100%")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);
		}

		self.chart = self.svg.append("svg")
					.attr("width", width)
					.attr("height", height)
					.attr("x", chartOffsetLeft)
					.attr("y", chartOffsetTop)
					.attr("shape-rendering", "geometricPrecision")
					.style("stroke-width", 0)
					.style("background-color", lightgrey)

		self.streamChart = self.svg.append("svg")
			.attr("width", streamWidth)
			.attr("height", streamHeight)
			.attr("x", width + chartOffsetLeft - 20)
			.attr("y", height - streamHeight)
			.attr("shape-rendering", "geometricPrecision")
			.style("stroke-width", 0);
	}

	function generateBarGraph(sector_id) {
		/* Load the Data */
		sectorIndex = sector_id;
		var sector_name = self.sectors[sector_id];
		d3.csv("data/business/" + sector_name + ".csv",
				function(row, i) {
					return {
						year: parseInt(row.year),
						total: parseInt(row.total),
						closed: parseInt(row.closed_count),
						old: parseInt(row.old_count),
						new: parseInt(row.new_count),
						old_from_old: parseInt(row.old_from_old_count),
						old_from_new: parseInt(row.old_from_new_count),
						closed_from_old: parseInt(row.closed_from_old_count),
						closed_from_new: parseInt(row.closed_from_new_count),
					};
				},
				function(error, rows) {
					if(error) {
						console.log(error);
					}
					dataset = rows;
					generateVis(rows.slice(index, index + 7));
				}
		);
	}

	/* creates the initial visualization */
	function generateVis(dataset) {
		data = dataset;

		drawXAxis();
		drawYAxis();
		drawData(data);
		drawTitle();
		// drawNavBar();
		highlightSectorBox(sectorIndex, true);
		prevNavBarId = sectorIndex;
		drawLegend();
	}

	/* Creates the title and next/back buttons */
	function drawTitle() {
		var titleGroup = self.chart.append("g")
			.attr("class", "titleGroup");

		var title = titleGroup.append("text")
			.attr("class", "graphTitle")
			.attr("x", 200)
			.attr("y", 60)
			.attr("font-family", "Open Sans")
			.attr("font-weight", 300)
			.attr("text-anchor", "middle")
			.attr("font-size", "18px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			//.text(sectorNames[getIndex(sectorIndex)]);
	}

	/* Animation for indicating the 'next' button */
	function highlightNextBox(box) {
		var boxXMargin = 8;

		var boxBBox = d3.select(box).select(".text").node().getBBox();

		var rect = d3.select(box).selectAll("rect")
			.attr("x", width)
			.transition("highlightBox")
			.attr("width", boxBBox.width + boxXMargin)
			.attr("x", boxBBox.x - boxXMargin / 2);

		var text = d3.select(box).selectAll("text")
			.transition()
			.attr("fill", white);
	}

	/* Animation for fading away highlight for 'next' button */
	function unhighlightNextBox(box) {
		var rect = d3.select(box).selectAll("rect")
			.transition("unhighlightBox")
			.attr("x", width)
			.attr("width", 0);

		var text = d3.select(box).selectAll("text")
			.transition()
			.attr("fill", darkgrey)
	}

	function highlightBackBox(box) {
		var boxXMargin = 8;

		var boxBBox = d3.select(box).select(".text").node().getBBox();

		var rect = d3.select(box).selectAll("rect")
			.transition("highlightBox" + d3.select(box).datum())
			.attr("width", boxBBox.width + boxXMargin);

		var text = d3.select(box).selectAll("text")
			.transition()
			.attr("fill", white);
	}

	function unhighlightBackBox(box) {
		var rect = d3.select(box).selectAll("rect")
			.transition("unhighlightBox" + d3.select(box).datum())
			.attr("width", 0)

		var text = d3.select(box).selectAll("text")
			.transition()
			.attr("fill", darkgrey)
	}



	function getIndex(sectorIndex) {
		return ((sectorIndex % self.sectors.length) + self.sectors.length) % self.sectors.length;
	}

	function updateTitle(boxGroup) {
		var boxYMargin = 6;
		var boxXMargin = 8;

		var title = d3.select(".graphTitle")
			.transition("changeTitle")
			.attr("fill", kelly_colors[getIndex(sectorIndex)])
			//.text(sectorNames[getIndex(sectorIndex)])
			.transition()
			.delay(500)
			.duration(500)
			.attr("fill", darkgrey);
	}

	function update(targetData, boxGroup) {
		var location = "data/business/" + targetData + ".csv";
		d3.csv(location,
			function(row, i) {
				return {
					year: parseInt(row.year),
					total: parseInt(row.total),
					closed: parseInt(row.closed_count),
					old: parseInt(row.old_count),
					new: parseInt(row.new_count),
					old_from_old: parseInt(row.old_from_old_count),
					old_from_new: parseInt(row.old_from_new_count),
					closed_from_old: parseInt(row.closed_from_old_count),
					closed_from_new: parseInt(row.closed_from_new_count),
				};
			},
			function(error, rows) {
				if(error) {
					console.log(error);
				}
				data = rows;
				updateVis(data, boxGroup);
			}
		);
	}

	function updateVis(data, boxGroup) {
		updateAxes(data);
		updateGraph(data);
		updateTitle(boxGroup);
		updateLegend();
	}

	function updateAxes(data) {
		y.domain([0, d3.extent(data, function(d) {return d.total + d.closed})[1]])
	  	d3.select(".y.axis")
	  		.transition()
	  		.duration(1000)
	  		.call(yAxis)
	  		.selectAll("text")
	  		.attr("fill", kelly_colors[getIndex(sectorIndex)])
	  		.attr("fill-opacity", 0.7)
			.attr("font-size", 10)
			.attr("font-family", "Open Sans")
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.transition()
			.attr("fill", grey)
			.attr("fill-opacity", 1);
	}

	function updateGraph(data) {
		var year = 2010;
		for (var i = 0; i < data.length; i++) {
			var row = new Array();
			row.push(data[i]);
			var group = d3.select(".year" + (year + i))
							.data(row);

			var rects = group.selectAll("rect");

			rects.filter(".old")
				.data(row)
				.transition("repositionOld")
				.duration(800)
				.attr("fill", kelly_colors[getIndex(sectorIndex)])
				.attr("y", function(d) {
					return graphHeight - normalize(d.old);
				})
				.attr("height", function(d) {
					return normalize(d.old);
				});

			rects.filter(".new")
				.data(row)
				.transition("repositionNew")
				.duration(800)
				.attr("fill", light_colors[getIndex(sectorIndex)])
				.attr("y", function(d) {
					return graphHeight
					- normalize(d.old)
					- normalize(d.new);
				})
				.attr("height", function(d) {
					return normalize(d.new);
				});

			// rects.filter(".closed")
			// 	.data(row)
			// 	.transition("repositionClosed")
			// 	.duration(800)
			// 	.attr("y", function(d) {
			// 		return graphHeight
			// 		- normalize(d.old)
			// 		- normalize(d.new)
			// 		- normalize(d.closed);
			// 	})
			// 	.attr("height", function(d) {
			// 		return normalize(d.closed);
			// 	});
		}
	}

	function drawData(data) {
		// group the bars by year
		var groups = new Array();
		var year = 2010
		for (var i = 0; i < data.length; i++) {
			var row = new Array();
			row.push(data[i]);
			var group = self.chart.append("g")
				.attr("class", "yearBar" + " year" + (year + i))
				.data(row)
				.style("cursor", "pointer")
				.on("mouseenter", function(d) {
					fadeOthers(this);
					displayTotal(d, self.chart, this, 0);
				})
				.on("mouseleave", function() {
					removeTotal();
					unFadeAll();
				})
				.on("click", function() {
					self.previousBar = d3.select(".year2010");
					self.dotEnter(this);
					d3.event.stopPropagation();
				});
			groups.push(group);
		}

		barwidth = (width - (graphOffsetLeft + graphOffsetRight)) / data.length;
		barmargin = 20;

		graphHeight = height - graphOffsetBottom;

		/* draw the bars*/
		for (var index = 0; index < data.length; index++) {
			var rects = groups[index].selectAll("rect");

			var row = new Array();
			row.push(data[index]);

			rects.filter(".old")
				.data(row)
				.enter()
				.append("rect")
				.attr("class", "old")
				.attr("fill", kelly_colors[getIndex(sectorIndex)])
				.attr("stroke", kelly_colors[getIndex(sectorIndex)])
				.style("stroke-opacity", normopacity)
				.style("fill-opacity", normopacity)
				.attr("opacity", 1)
				.attr("x", function(d) { return x(d.year) + barmargin / 2;})
				// .attr("transform", function(d) {
				// 	return "translate(" + (x(d.year)) + ", 0)";
				// })
				.attr("y", function(d) {
					return graphHeight - normalize(d.old);
				})
				.attr("width", barwidth - barmargin)
				.attr("height", function(d) {
					return normalize(d.old);
				})
				.on("mouseover", function(d) {
					//tooltip(this, d.old, "old", chart, kelly_colors[getIndex(sectorIndex)], white);
				})
				.on("mouseleave", function() {
					//removeTooltips();
				})
				.on("mouseout", function() {
					//removeTooltips();
				});

			rects.filter(".new")
				.data(row)
				.enter()
				.append("rect")
				.attr("class", "new")
				.attr("fill", light_colors[getIndex(sectorIndex)])
				.attr("stroke", light_colors[getIndex(sectorIndex)])
				.style("stroke-opacity", normopacity)
				.style("fill-opacity", normopacity)
				.attr("x", function(d) {return x(d.year) + barmargin / 2;})
				// .attr("transform", function(d) {
				// 	return "translate(" + (x(d.year)) + ", 0)";
				// })
				.attr("y", function(d) {
					return graphHeight
					- normalize(d.old)
					- normalize(d.new);
				})
				.attr("width", barwidth - barmargin)
				.attr("height", function(d) {
					return normalize(d.new);
				})
				.on("mouseover", function(d) {
					//tooltip(this, d.new, "new", chart, light_colors[getIndex(sectorIndex)], white);
				})
				.on("mouseout", function() {
					//removeTooltips();
				})
				.on("mouseout", function() {
					//removeTooltips();
				});
		}
	}

	var circleKeyOn = false;

	function drawCircleKey(pointsPerCircle) {
		if (!circleKeyOn) {
			circleKeyOn = true;
			var titlebbox = d3.select(".graphTitle").node().getBBox();
			// var x = titlebbox.x + titlebbox.width / 2 - 30;
			// var y = titlebbox.y + titlebbox.height + 30;
			// var cx = titlebbox.x + titlebbox.width / 2 - 40;
			// var cy = titlebbox.y + titlebbox.height + 26;
			var x = width / 2 -  100;
			var y = 20;
			var cx = x - 10;
			var cy = y - 4;

			var approx = Math.round(pointsPerCircle * 10) / 10;
			self.chart.append("text")
				.attr("class", "circleKey")
				.attr("x", x)
				.attr("y", y)
				.attr("fill", darkgrey)
				.attr("font-family", "Open Sans")
				.attr("font-size", "12px")
				.text(" approx. " + approx + " businesses");

			var circleKey = self.chart.append("circle")
				.attr("class", "circleKey")
				.attr("cx", cx)
				.attr("cy", cy)
				.attr("r", 4)
				.attr("stroke-width", 1)
				.attr("stroke", kelly_colors[getIndex(sectorIndex)])
				.attr("fill", kelly_colors[getIndex(sectorIndex)]);
		}
	}

	var maxNew = 0; // maximum new circle id
	var maxOld;

	var delayCounter;

	/** Displays the year by year view for new/existing businesses */
	function dotview(source, showSkeleton, allowClick) {
		var barGroup = source;
		toggleLegendDot();

		if (showSkeleton) {
			drawDotSkeleton(barGroup);
		}
		// hide bars
		var bars = d3.selectAll(".yearBar").selectAll("rect")
			.style("opacity", 0)
			.attr("width", barwidth);

		d3.selectAll("g.yearBar")
			.on("click", function() {
				d3.event.stopPropagation();
			})
			.on("mouseenter", null)
			.on("mouseleave", null);

		bbox = barGroup.node().getBBox();

		var year = barGroup.datum().year;

		var circleYear = "circleYear" + year;

		/* draw the dots */
		var num = Math.floor(bbox.height / 10);
		var r = 4; // circle radius
		var hpad = 3;
		var vpad = 3;

		// total circles
		var area = bbox.height * (barwidth - barmargin);
		var pointsPerArea = barGroup.datum().total / area;
		var pointsPerCircle = pointsPerArea * (2 * r + hpad) * (2 * r + vpad);
		var circlesPerPoint = 1 / pointsPerCircle
		var numCircles = Math.floor(circlesPerPoint * barGroup.datum().total);

		drawCircleKey(pointsPerCircle);

		// old circles
		var oldCircles = Math.floor(numCircles * barGroup.datum().old / barGroup.datum().total);
		var newCircles = Math.floor(numCircles * barGroup.datum().new / barGroup.datum().total);

		numCircles = oldCircles + newCircles;

		var newStart;

		for (var i = 0; i < oldCircles + newCircles; i++) {
			var x = Math.floor(i / 4);
			var y = i % 4;
			var cx = bbox.x + r + y * (2 * r + hpad);
			var cy = bbox.y + bbox.height - (r + vpad) - x * (2 * r + vpad);
			if (i < oldCircles) {
				var color = kelly_colors[getIndex(sectorIndex)];
				var circle = self.chart.append("circle")
					.attr("class", "dot old c" + i + " " + circleYear)
					.attr("cx", cx)
					.attr("cy", cy)
					.attr("r", r)
					.attr("stroke-width", 1)
		 			.attr("stroke", color)
		 			.attr("fill", color)
		 			.style("opacity", 1);
			} else {
				var color = light_colors[getIndex(sectorIndex)];

				var delay = (x - oldCircles / 4) * 100 + y * 50;

				var circle = self.chart.append("circle")
					.attr("class", "dot new c" + (i - oldCircles) + " " + circleYear)
					.attr("cx", cx)
					.attr("cy", -20)
					.style("opacity", 0)
					.attr("r", r)
					.attr("stroke-width", 1)
					.attr("stroke", light_colors[getIndex(sectorIndex)])
					.attr("fill", light_colors[getIndex(sectorIndex)])
				.transition("newCircles" + year)
					.ease(d3.easeLinear)
					.delay(delay)
					.duration(500)
					.attr("cy", cy)
					.style("opacity", 0.5);

			}
		}
		maxNew = newCircles - 1;
		maxOld = oldCircles - 1;

		if (allowClick) {
			allowOtherClick(barGroup);
		}
	}

	function removeDotSkeleton() {
		d3.selectAll(".skeleton")
			.transition()
			.style("opacity", 0)
			.remove();
	}

	/** Draw skeleton of a year (to hint click) */
	function drawDotSkeleton(source) {
		if (source.datum().year != 2016) {
			next = d3.select(".year" + (source.datum().year + 1));

			bbox = next.node().getBBox();

			var year = next.datum().year;

			var circleYear = "circleYear" + year;

			/* draw the dots */
			var num = Math.floor(bbox.height / 10);
			var r = 4; // circle radius
			var hpad = 3;
			var vpad = 3;

			// total circles
			var area = bbox.height * (barwidth - barmargin);
			var pointsPerArea = next.datum().total / area;
			var pointsPerCircle = pointsPerArea * (2 * r + hpad) * (2 * r + vpad);
			var circlesPerPoint = 1 / pointsPerCircle;
			var numCircles = Math.floor(circlesPerPoint * next.datum().total);

			// old circles
			var oldCircles = Math.floor(numCircles * next.datum().old / next.datum().total);
			var newCircles = Math.floor(numCircles * next.datum().new / next.datum().total);

			numCircles = oldCircles + newCircles;

			var newStart;

			for (var i = 0; i < oldCircles + newCircles; i++) {
				var x = Math.floor(i / 4);
				var y = i % 4;
				var cx = bbox.x + r + y * (2 * r + hpad);
				var cy = bbox.y + bbox.height - (r + vpad) - x * (2 * r + vpad);

				var circle = next.append("circle")
					.attr("class", "dot skeleton")
					.attr("cx", cx)
					.attr("cy", cy)
					.attr("r", 2)
					.attr("stroke-width", 1)
		 			.attr("stroke", light_colors[getIndex(sectorIndex)])
		 			.attr("fill", light_colors[getIndex(sectorIndex)])
		 			.style("opacity", 0)
		 			.transition()
		 			.delay(200)
		 			.duration(750)
		 			.style("opacity", 0.15)
		 			.on("start", function repeat() {
		 				d3.active(this)
		 					.attr("r", 4)
		 					.transition()
		 					.attr("r", 2)
		 					.transition()
		 					.on("start", repeat);
		 			});
			}
		}
	}

	self.dotEnter = function(target) {
        self.active = true;
		var max = d3.select(target).datum().year - 2009;
		var startN = self.previousBar.datum().year - 2010;
		self.dotEnterR(self.previousBar, startN, max);
	}

    self.dotEnterR = function(target, n, max) {
		var currTarget = target;
		if (n < max) {
			if (target.datum().year == 2010 && max == 1) {
				dotview(currTarget, false, false);
				self.previousBar = currTarget;
			} else if (target.datum().year == 2010 && max > 1) {
				currTarget.transition("stall").duration(750).on("end", function() {
					self.previousBar = d3.select(this);
					self.dotEnterR(d3.select(".year" + (2011)), n + 1, max);
				});
				dotview(currTarget, false, false);
				self.previousBar = currTarget;
			} else {
				currTarget.transition("stall").duration(750).on("end", function() {
					self.previousBar = d3.select(this);
					self.dotEnterR(d3.select(".year" + (2010 + n + 1)), n + 1, max);
				});
				dotViewTransition(currTarget, false, false);
			}
		}
		if (n == max - 1) {
			allowOtherClick(currTarget);
			drawDotSkeleton(currTarget);
		}
	}


	function dotViewTransition(dest, showSkeleton, allowClick) {
		removeDotSkeleton();
		var barGroup = dest;
		origin = self.previousBar;

		if (showSkeleton) {
			drawDotSkeleton(barGroup);
		}

		bbox = barGroup.node().getBBox();

		var year = barGroup.datum().year;
		var circleYear = "circleYear" + year;
		var prevCircleYear = "circleYear" + (year - 1);
		var oldFromOldCount = barGroup.datum().old_from_old;
		var oldFromNewCount = barGroup.datum().old_from_new;

		/* draw the dots */
		var num = Math.floor(bbox.height / 10);
		var r = 4; // circle radius
		var hpad = 3;
		var vpad = 3;

		var area = bbox.height * (barwidth - barmargin);
		var pointsPerArea = barGroup.datum().total / area;
		var pointsPerCircle = pointsPerArea * (2 * r + hpad) * (2 * r + vpad);
		var circlesPerPoint = 1 / pointsPerCircle;
		var numCircles = Math.floor(circlesPerPoint * barGroup.datum().total);

		// old circles
		var oldCircles = Math.floor(numCircles * barGroup.datum().old / barGroup.datum().total);
		var newCircles = Math.floor(numCircles * barGroup.datum().new / barGroup.datum().total);
		var oldFromNewCircles = Math.floor(numCircles * barGroup.datum().old_from_new / barGroup.datum().total);
		var oldFromOldCircles = Math.floor(numCircles * barGroup.datum().old_from_old / barGroup.datum().total);

		// oldCircles = oldFromOldCircles + oldFromNewCircles;
		// numCircles = oldFromNewCircles + oldFromOldCircles + newCircles;

		var oldFromNewStart;
		var newStart;

		var k = 0; // closed y counter
		var l = 0; // closed x counter
		var newFromNewCounter = 0;
		var oldFromOldCounter = 0;

		var xcounter = 0;
		var ycounter = 0;
		/** Draw the Circles, transitioning some from origin bar */
		for (var i = 0; i < oldCircles + newCircles; i++) {
			var x = Math.floor(i / 4);
			var y = i % 4;
			var cx = bbox.x + r + y * (2 * r + hpad);
			var cy = bbox.y + bbox.height - (r + vpad) - x * (2 * r + vpad);

			if (i < oldFromOldCircles && i < maxOld) { // old from old
				var color = kelly_colors[getIndex(sectorIndex)];

				var circle = d3.select(".old.c" + i)
					.classed(prevCircleYear, false)
					.attr("class", "dot old c" + i + " " + circleYear)
				.transition("oldFromOld" + year)
					.duration(500)
					.ease(d3.easeQuadInOut)
					.attr("cx", cx)
					.attr("cy", cy);

				circle.transition()
					.duration(500)
					.attr("fill", color)
					.attr("stroke", color)

				oldFromOldCounter++;
			} else if (i < (oldFromOldCircles + oldFromNewCircles) && newFromNewCounter <= maxNew) { // old from new
				// toggle for show oldClosed
				showOldClosed = true;
				var color = kelly_colors[getIndex(sectorIndex)];
				var id = i - Math.min(oldFromOldCircles, maxOld);
				var circle = d3.select(".new.c" + id)
					.classed("new c" + id, false)
					.classed(prevCircleYear, false)
					.attr("class", "dot old c" + i + " " + circleYear)
				.transition("oldFromNew" + year)
					.duration(500)
					.ease(d3.easeQuadInOut)
					.style("opacity", 1)
					.attr("cx", cx)
					.attr("cy", cy);

				circle.transition()
					.duration(500)
					.attr("fill", color)
					.attr("stroke", color)


				newFromNewCounter++;
			} else if (i < oldCircles) {
				showNewClosed = true;
				var color = kelly_colors[getIndex(sectorIndex)];
				var circle = self.chart.append("circle")
					.attr("class", "dot old c" + i + " " + circleYear)
					.attr("cx", cx)
					.attr("cy", cy)
					.attr("r", r)
					.attr("stroke-width", 1)
		 			.attr("stroke", color)
		 			.attr("fill", "transparent")
		 			.style("opacity", 0)
		 		.transition()
		 			.duration(100)
		 			.style("opacity", 1);
			} else { // new
				var color = light_colors[getIndex(sectorIndex)];

				var delay = (x - oldCircles / 4) * 100 + y * 50;

				var circle = self.chart.append("circle")
					.attr("cx", cx)
					.attr("cy", -20)
					.attr("r", r)
					.attr("stroke-width", 1)
					.attr("class", "dot new c" + (i - oldCircles) + " " + circleYear)
					.style("opacity", 0)
					.attr("stroke", light_colors[getIndex(sectorIndex)])
					.attr("fill", light_colors[getIndex(sectorIndex)])
				.transition("newCircles" + year)
					.ease(d3.easeQuadIn)
					.delay(delay)
					.duration(500)
					.style("opacity", 0.5)
					.attr("cy", cy);

				//maxNew = i - oldCircles;
			}
		}

		// show closed businesses (OLD)
		shownOldClosed = true;
		var pbbox = self.previousBar.node().getBBox();
		delayCounter = 0;
		for (var j = oldFromOldCounter; j <= maxOld; j++, ycounter++, xcounter++, delayCounter++) {
			var y = Math.floor(ycounter / 4);
			var x = xcounter % 4;
			var cx = pbbox.x + r + x * (2 * r + hpad);
			var cy = pbbox.y + pbbox.height - (r + vpad) - y * (2 * r + vpad);

			d3.select(".old.c" + j).classed("old c" + j, false)
				.attr("class", "dot cClose" + j + " " + prevCircleYear)
			.transition("fadeOld" + year)
				.delay(delayCounter * 50 + 1000)
				.duration(500)
				.ease(d3.easeQuadIn)
				.attr("fill", darkgrey)
				.attr("stroke", darkgrey)
				.attr("cx", cx)
				.attr("cy", cy);
		}

		// show closed businesses (NEW)
		shownNewClosed = true;
		var pbbox = self.previousBar.node().getBBox();
		for (var j = newFromNewCounter; j <= maxNew; j++, ycounter++, xcounter++, delayCounter++) {
			var y = Math.floor(ycounter / 4);
			var x = xcounter % 4;
			var cx = pbbox.x + r + x * (2 * r + hpad);
			var cy = pbbox.y + pbbox.height - (r + vpad) - y * (2 * r + vpad);

			d3.select(".new.c" + j).classed("new c" + j, false)
				.attr("class", "dot cClose" + j + " " + prevCircleYear)
			.transition("fadeNew" + year)
				.delay(delayCounter * 50 + 1000)
				.duration(500)
				.ease(d3.easeQuadIn)
				.attr("fill", grey)
				.attr("stroke", grey)
				.attr("cx", cx)
				.attr("cy", cy);
		}

		// display closed total
		var prev = self.previousBar;
		var yPos = pbbox.y + pbbox.height - (Math.floor(ycounter / 4) * (2 * r + vpad) + 20);
		displayClosed(barGroup.datum().closed, prev, barmargin, yPos);

		maxOld = oldCircles - 1;
		maxNew = newCircles - 1;

		// make other bars available for clicking
		if (allowClick) {
			allowOtherClick(barGroup);
		}
	}

	function flareSkeletonDots() {
		d3.selectAll(".skeleton")
			.transition()
			.attr("r", 4);
	}

	function shrinkSkeletonDots() {
		d3.selectAll(".skeleton")
			.transition()
			.delay(500)
			.duration(750)
			.on("start", function repeat() {
				d3.active(this)
					.attr("r", 2)
					.transition()
					.attr("r", 4)
					.transition()
					.on("start", repeat);
			});

	}

	function allowOtherClick(barGroup) {
		var source = barGroup;
        self.active = false;
	 	/** unbind other next transition clickers */
	 	d3.selectAll(".yearBar")
	 		.style("cursor", "default")
	 		.on("mouseenter", null)
	 		.on("mouseleave", null)
			.on("mouseover", null)
			.on("mouseout", null)
			.style("cursor", "default");

		d3.selectAll(".dot:not(.skeleton)")
			.on("click", function() {
				var dummy = 0;
				d3.event.stopPropagation();
			});

		source.on("click", function() {
				var dummy = 0; // dummy event
				d3.event.stopPropagation();
			});


		/** Bar one year over allowed for next transition */
		d3.select(".year" + (source.datum().year + 1))
			.style("cursor", "pointer")
			.on("mouseover", function() {
				//flareSkeletonDots();
			})
			.on("mouseout", function() {
				//shrinkSkeletonDots();
			})

			.on("click", function(d) {
				dotViewTransition(d3.select(this), true, true);
				removeTotal();
				displayTotal(d, self.chart, this, barmargin);
				self.previousBar = d3.select(this);
				d3.event.stopPropagation();
			});

		/** All previous bars allowed for reset */
		for (var i = 2010; i < source.datum().year; i++) {
			d3.select(".year" + i)
				.on("click", function(d) {
					removeCirclesAfterYear(d3.select(this));
					removeDotSkeleton();
					dotview(d3.select(this), true, true);
					removeTotal();
					displayTotal(d, self.chart, this, barmargin);
					self.previousBar = d3.select(this);
					d3.event.stopPropagation();
				});
		}

		/** All other foward bars also allow for reset */
		for (var i = source.datum().year + 2; i < 2017; i++) {
			d3.select(".year" + i)
				.on("click", function(d) {
					removeCirclesBeforeYear(d3.select(this));
					removeDotSkeleton();
					dotview(d3.select(this), true, true);
					removeTotal();
					displayTotal(d, self.chart, this, barmargin);
					self.previousBar = d3.select(this);
					d3.event.stopPropagation();
				});
		}

		/** Clicking white space will revert back to original bar view */
		self.svg.on("click", function() {
			self.hideDotView();
		})
	}

    self.hideDotView = function() {
        if (self.active) {
            return;``
        }
		toggleLegendBar();

		circleKeyOn = false;

		d3.selectAll(".circleKey")
			.transition()
			.duration(500)
			.style("opacity", 0)
			.remove();

		d3.selectAll(".dot")
			.transition("deleteCircles")
			.duration(500)
			.style("opacity", 0)
			.remove();

		d3.selectAll(".closedCount")
			.transition("removeCounts")
			.duration(500)
			.style("opacity", 0)
			.remove();

		removeTotal();

		// hide bars
		var bars = d3.selectAll(".yearBar").selectAll("rect")
			.attr("width", (barwidth - barmargin))
			.transition("adjustBackWidth")
			.duration(500)
			.style("opacity", normopacity);

		unFadeAll();

		d3.selectAll("g.yearBar")
			.style("cursor", "pointer")
			.on("mouseenter", function(d) {
				fadeOthers(this);
				displayTotal(d, self.chart, this, 0);
			})
			.on("mouseleave", function() {
				removeTotal();
				unFadeAll();
			})
			.on("click", function() {
				self.previousBar = d3.select(".year2010");
				self.dotEnter(this);
				d3.event.stopPropagation();
			});


	}

	function removeCirclesAfterYear(barGroup) {
		var group = barGroup;
		var year = group.datum().year;
		for (var i = year; i < 2017; i++) {
			d3.selectAll(".circleYear" + i)
				.transition()
				.duration(500)
				.style("opacity", 0)
				.remove();

			d3.select(".closedCount" + (i + 1))
				.transition()
				.duration(500)
				.style("opacity", 0)
				.remove();
		}
	}

	function removeCirclesBeforeYear(barGroup) {
		var group = barGroup;
		var year = group.datum().year;
		for (var i = 2009; i < year; i++) {
			d3.selectAll(".circleYear" + (i + 1))
				.transition()
				.duration(500)
				.style("opacity", 0)
				.remove();

			d3.select(".closedCount" + i)
				.transition()
				.duration(500)
				.style("opacity", 0)
				.remove();
		}
	}

	function drawStreamXAxis() {
		streamX = d3.scaleTime().domain([2010, 2016])
	  		//.range([graphOffsetLeft + 1, width - graphOffsetRight - 33]);
	  		.range([16, streamWidth - 40]);

		streamXAxis = d3.axisBottom()
					.scale(streamX)
					.ticks(7)
					.tickFormat(d3.format("d"))

		var xAxisGroup = self.streamChart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + 0 + ", " + (streamHeight - graphOffsetBottom) + ")")
			.call(streamXAxis);

		xAxisGroup.selectAll("text")
			.attr("font-size", 12)
			.attr("text-anchor", "middle")
			.attr("font-family", "Open Sans")
			.attr("fill", grey)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none");
	}

	function drawXAxis() {
		x = d3.scaleBand().domain([2010, 2011, 2012, 2013, 2014, 2015, 2016])
	  		//.range([graphOffsetLeft + 1, width - graphOffsetRight - 33]);
	  		.range([graphOffsetLeft, width - graphOffsetRight]);
		xAxis = d3.axisBottom()
					.scale(x)
					.ticks(data.length)
					.tickFormat(d3.format("d"))

		var xAxisGroup = self.chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + 0 + ", " + (height - graphOffsetBottom) + ")")
			.call(xAxis)

		xAxisGroup.selectAll("text")
			.attr("font-size", 14)
			.attr("text-anchor", "middle")
			.attr("font-family", "Open Sans")
			.attr("fill", grey)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none");

		/*
		xAxisLabel = self.chart.append("text")
			.attr("font-size", 12)
			.attr("font-family", "Open Sans")
			.attr("fill", darkgrey)
			.attr("x", 0)
			.attr("y", height - 10)
			.attr("dominant-baseline", "central")
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.text("Year"); */
	}

	function drawYAxis() {
	  	y = d3.scaleLinear()
	  			.domain([0, d3.extent(data, function(d) {return d.total + d.closed})[1]])
	  			.range([height - graphOffsetBottom, graphOffsetTop])
	  	yAxis = d3.axisRight()
	  				.scale(y);

	  	var yAxisDx = (width - graphOffsetRight);

	  	var yAxisGroup = self.chart.append("g")
	  						.attr("class", "y axis")
	  						.attr("transform", "translate(" + yAxisDx + ", 0)")
	  						.call(yAxis);

	  	yAxisGroup.selectAll("text")
	  		.attr("class", "yScaleText")
			.attr("font-size", 10)
			.attr("font-family", "Open Sans")
			.attr("fill", grey)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none");

		yAxisBBox = yAxisGroup.node().getBBox();

		yAxisLabel = self.chart.append("text")
			.attr("font-size", 10)
			.attr("font-family", "Open Sans")
			.attr("fill", darkgrey)
			.attr("x", yAxisDx + 9)
			.attr("y", yAxisBBox.y - 15)
			// .attr("y", graphOffsetTop + 5)
			.attr("dominant-baseline", "central")
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.text("Business Count");
	}

	function findX(i) {
		return graphOffsetLeft + i * (width - graphOffsetRight) / dataset.length
	}

	function normalize(n) {
		return (n * 1.0 / y.domain()[1]) * (graphHeight - graphOffsetTop);
	}

	function fadeOthers(element) {
		function match(current, target) {
			return current !== target;
		}

		d3.selectAll("g.yearBar")
			.filter(function() {return match(this, element)})
			.selectAll("rect")
			.transition("fadeOthers")
			.style("fill-opacity", fadeopacity)
			.style("stroke-opacity", fadeopacity);
	}

	function unFadeAll() {
		d3.selectAll("rect").filter(".old, .new, .closed")
			.transition("unfadeAll")
			.style("fill-opacity", normopacity)
			.style("stroke-opacity", normopacity)
		}

	function tooltip(element, n, state, chart, rectcolor, textcolor) {
		element = d3.select(element)
		var count = formatNumber(n);

		var x = parseFloat(element.attr("x")) + barwidth;
		var y = parseFloat(element.attr("y"))
				+ parseFloat(element.attr("height")) / 2;

		var tooltipGroup = self.chart.append("g").attr("class", "tooltipGroup");

		var text = tooltipGroup.append("text")
			.attr("id", "tooltip")
			.attr("x", x)
			.attr("y", y)
			.attr("font-family", "Open Sans")
			.attr("font-size", "12px")
			.attr("fill", textcolor)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.text(count + " " + state);

		var bbox = text.node().getBBox();

		var rect = tooltipGroup.insert("rect", "text")
			.attr("id", "tooltipbox")
			.attr("x", bbox.x - 6)
			.attr("y", bbox.y - 4)
			.attr("width", bbox.width + 12)
			.attr("height", bbox.height + 8)
			.attr("fill", rectcolor)
	}

	function removeTooltips() {
		d3.select("g.tooltipGroup").remove();
	}

	function displayClosed(n, bar, offset, y) {
		var initialOpacity = 0;

		var total = formatNumber(parseInt(n));

		var bbox = bar.node().getBBox();

		var count = self.chart.append("text")
			.attr("class", "closedCount closedCount" + (bar.datum().year  + 1))
			.attr("x", bbox.x + (bbox.width - offset) / 2)
			.attr("y", y)
			.attr("font-family", "Open Sans")
			.attr("font-size", "18px")
			.attr("text-anchor", "middle")
			.attr("fill", darkgrey)
			.style("fill-opacity", initialOpacity)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.text(total);

		count.transition("fadeCountIn").delay(1000).duration(500).ease(d3.easeLinear)
			.style("fill-opacity", 1);
	}

	function displayTotal(d, chart, bar, offset) {
		var initialOpacity = 0;

		var total = formatNumber(parseInt(d.total));

		var infoGroup = self.chart.append("g").attr("class", "infoGroup");

		var bbox = d3.select(bar).node().getBBox();

		var count = infoGroup.append("text")
			.attr("id", "totalcount")
			.attr("x", bbox.x + (bbox.width - offset) / 2)
			.attr("y", bbox.y - 12)
			.attr("font-family", "Open Sans")
			.attr("font-size", "20px")
			.attr("font-weight", 300)
			.attr("text-anchor", "middle")
			.attr("fill", black)
			.style("fill-opacity", initialOpacity)
			.attr("pointer-events", "none")
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.text(total);

		count.transition("fadeCountIn").delay(100).duration(500).ease(d3.easeLinear)
			.style("fill-opacity", 1);
	}

	function removeTotal() {
		d3.select("g.infoGroup").remove();
	}

	function formatNumber(n) {
	    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function drawNavBar() {
		var navBar = self.svg.append("g");

		var offset = (svgHeight - (22 * 20)) / 2;

		for (var i = 0; i < sectorNames.length; i++) {
			var sectorGroup = navBar.append("g")
				.attr("class", "navBar" + i + " unselectable")
				.data([[i]])
				.attr("id", i)
				.style("cursor", "pointer")
				.on("mouseover", function () {
					var id = d3.select(this).datum()[0];
					if (id != prevNavBarId) {
						highlightSectorBox(d3.select(this).datum());
					}
					streamFadeOthers(id, streamfadedelay);
				})
				.on("mouseout", function() {
					var id = d3.select(this).datum()[0];
					if (id != prevNavBarId) {
						unhighlightSectorBox(d3.select(this).datum());
					}
					streamFadeOthers(highlightId, streamfadedelay);
				})
				.on("click", function() {
					self.hideDotView();
					var id = d3.select(this).datum()[0];
					sectorIndex = id;
					highlightSectorBox(id, true);
					d3.select(this)
						.on("mouseleave", null);
					update(self.sectors[getIndex(sectorIndex)], this);
					for (var i = 0; i < self.sectors.length; i++) {
						if (i != id) {
							unhighlightSectorBox(i);
						}
					}
					highlightId = id;
					prevNavBarId = id;
				});

			var offset = (svgHeight - (22 * 20)) / 2 - 20;

			var sector = sectorGroup.append("text")
				.attr("class", "text")
				.attr("x", 15 + boxXMargin)
				.attr("y", 22 * i + offset)
				.attr("font-family", "Open Sans")
				.attr('font-weight', 300)
				.attr("text-anchor", "front")
				.attr("font-size", "12px")
				.attr("fill", darkgrey)
				.style("fill-opacity", 1)
				// .style("user-select", "none")
				// .style("-webkit-user-select", "none")
				// .style("-moz-user-select", "none")
				// .style("cursor", "default")
				.text(sectorNames[getIndex(i)]);

			var sectorBBox = sector.node().getBBox();

			var sectorBox = sectorGroup.insert("rect", "text")
				.data([[i]])
				.attr("class", "box")
				.attr("x", sectorBBox.x - boxXMargin / 2)
				.attr("y", sectorBBox.y - boxYMargin / 2)
				.attr("width", sectorBBox.width + boxXMargin)
				.attr("height", sectorBBox.height + boxYMargin)
				.attr("fill", "transparent");

			// circle for focus identifier
			var cx = sectorBBox.x + sectorBBox.width + 10 + sectorBBox.width / 20;
			var cy = sectorBBox.y + sectorBBox.height / 2 + 1;
			var circ = sectorGroup.append("circle")
				.attr("class", "highlightCirc")
				.attr("r", 5)
				.attr("cx", cx)
				.attr("cy", cy)
				.attr("fill", kelly_colors[i])
				.style("opacity", 0);
		}
	}

	function highlightSectorBox(boxId, clicked) {
		var box = d3.select(".navBar" + boxId);

		//var boxBBox = box.select(".text").node().getBBox();

		box.select(".highlightCirc")
			.transition()
	 		.duration(250)
	 		.style("opacity", 0.75)
	 		.transition()
	    		.duration(1000)
	    		.on("start", function repeat() {
	 				d3.active(this)
	 					.style("opacity", 0.5)
	 					.transition()
	 					.style("opacity", 0.75)
	 					.transition()
	 					.on("start", repeat);
	 			});;

	    if (clicked) {
	    	box.select(".text")
		 		.attr("font-weight", 400)
		 		.attr("font-style", "normal")
		 		.attr("fill", black);
		} else {
			box.select(".text")
				.attr("font-weight", 400)
				.attr("font-style", "normal");
		}

		 /*
		var rect = box.selectAll("rect")
			.transition("highlightBox" + boxId)
			.attr("width", boxBBox.width + boxXMargin);

		var text = box.selectAll("text")
			.transition()
			.attr("fill", white);*/
	}

	function unhighlightSectorBox(boxId) {
		var box = d3.select(".navBar" + boxId);

		box.select(".highlightCirc")
			.transition()
			.style("opacity", 0);

		box.select(".text")
	 		.attr("font-weight", 300)
	 		.attr("font-style", "normal")
	 		.attr("fill", darkgrey);

		/*
		var rect = box.selectAll("rect")
			.transition("unhighlightBox" + boxId)
			.delay(50)
			.attr("width", 0)

		var text = box.selectAll("text")
			.transition()
			.attr("fill", darkgrey)*/
	}

	function drawLegend() {
		var x = chartOffsetLeft + 100;
		var y = height + chartOffsetTop + 20;

		var newColor = light_colors[getIndex(sectorIndex)];
		var oldColor = kelly_colors[getIndex(sectorIndex)];

		var barLegendGroup = self.svg.append("g")
			.attr("class", "barLegendGroup");

		var newRectLegend = barLegendGroup.append("g");

		newRectLegend.append("rect")
			.attr("class", "newLegendRect")
			.attr("x", x)
			.attr("y", y + 5)
			.attr("width", 10)
			.attr("height", 10)
			.attr("opacity", 0.7)
			.attr("fill", newColor);

		newRectLegend.append("text")
			.attr("class", "newLegendValue")
			.attr("x", x + 20)
			.attr("y", y + 2.5)
			.attr("font-family", "Open Sans")
			.attr("text-anchor", "front")
			.attr("dominant-baseline", "text-before-edge")
			.attr("font-size", "10px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			.text("new businesses");

		var oldRectLegend = barLegendGroup.append("g");

		oldRectLegend.append("rect")
			.attr("class", "oldLegendRect")
			.attr("x", x + 200)
			.attr("y", y + 5)
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", oldColor)

		newRectLegend.append("text")
			.attr("class", "oldLegendValue")
			.attr("x", x + 220)
			.attr("y", y + 2.5)
			.attr("font-family", "Open Sans")
			.attr("text-anchor", "front")
			.attr("dominant-baseline", "text-before-edge")
			.attr("font-size", "10px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			.text("old businesses");

		var circleLegendGroup = self.svg.append("g")
			.attr("class", "circleLegendGroup");

		var newCircleLegend = circleLegendGroup.append("g");

		x = x - 50;

		newCircleLegend.append("circle")
			.attr("class", "newLegendCircle")
			.attr("cx", x)
			.attr("cy", y)
			.attr("r", circleRadius)
			.attr("stroke-width", circleStrokeWidth)
			.attr("fill", newColor)
			.attr("stroke", newColor)
			.style("opacity", 0.7);

		newCircleLegend.append("text")
			.attr("class", "newLegendCircleValue")
			.attr("x", x + 10)
			.attr("y", y - 7.5)
			.attr("font-family", "Open Sans")
			.attr("text-anchor", "front")
			.attr("dominant-baseline", "text-before-edge")
			.attr("font-size", "10px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			.text("new businesses");

		var oldSurpriseCircleLegend = circleLegendGroup.append("g");

		oldSurpriseCircleLegend.append("circle")
			.attr("class", "oldSurpriseLegendCircle")
			.attr("cx", x + 100)
			.attr("cy", y)
			.attr("r", circleRadius)
			.attr("stroke-width", circleStrokeWidth)
			.attr("fill", "transparent")
			.attr("stroke", oldColor)
			.style("opacity", 1);

		oldSurpriseCircleLegend.append("text")
			.attr("class", "oldSurpriseLegendCircleValue")
			.attr("x", x + 110)
			.attr("y", y - 7.5)
			.attr("font-family", "Open Sans")
			.attr("text-anchor", "front")
			.attr("dominant-baseline", "text-before-edge")
			.attr("font-size", "10px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			.text("old businesses (records appearing in that year)");


		var oldCircleLegend = circleLegendGroup.append("g");

		oldCircleLegend.append("circle")
			.attr("class", "oldLegendCircle")
			.attr("cx", x + 340)
			.attr("cy", y)
			.attr("r", circleRadius)
			.attr("stroke-width", circleStrokeWidth)
			.attr("fill", oldColor)
			.attr("stroke", oldColor);


		oldCircleLegend.append("text")
			.attr("class", "oldLegendCircleValue")
			.attr("x", x + 350)
			.attr("y", y - 7.5)
			.attr("font-family", "Open Sans")
			.attr("text-anchor", "front")
			.attr("dominant-baseline", "text-before-edge")
			.attr("font-size", "10px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			.text("old businesses");

		var closedFromNewCircleLegend = circleLegendGroup.append("g");

		closedFromNewCircleLegend.append("circle")
			.attr("class", "closedFromNewLegendCircle")
			.attr("cx", x + 30)
			.attr("cy", y + 25)
			.attr("r", circleRadius)
			.attr("stroke-width", circleStrokeWidth)
			.attr("fill", grey)
			.attr("stroke", grey);


		closedFromNewCircleLegend.append("text")
			.attr("class", "closedFromNewCircleValue")
			.attr("x", x + 40)
			.attr("y", y + 17.5)
			.attr("font-family", "Open Sans")
			.attr("text-anchor", "front")
			.attr("dominant-baseline", "text-before-edge")
			.attr("font-size", "10px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			.text("new businesses that got left behind");

		var closedFromOldCircleLegend = circleLegendGroup.append("g");

		closedFromOldCircleLegend.append("circle")
			.attr("class", "closedFromNewLegendCircle")
			.attr("cx", x + 220)
			.attr("cy", y + 25)
			.attr("r", circleRadius)
			.attr("stroke-width", circleStrokeWidth)
			.attr("fill", darkgrey)
			.attr("stroke", darkgrey);


		closedFromOldCircleLegend.append("text")
			.attr("class", "closedFromOldCircleValue")
			.attr("x", x + 230)
			.attr("y", y + 17.5)
			.attr("font-family", "Open Sans")
			.attr("text-anchor", "front")
			.attr("dominant-baseline", "text-before-edge")
			.attr("font-size", "10px")
			.attr("fill", darkgrey)
			.style("fill-opacity", 1)
			.style("user-select", "none")
			.style("-webkit-user-select", "none")
			.style("-moz-user-select", "none")
			.style("cursor", "default")
			.text("old businesses that got left behind");

		circleLegendGroup.selectAll("circle")
			.attr("stroke-opacity", 0)
			.attr("fill-opacity", 0);

		circleLegendGroup.selectAll("text")
			.attr("fill", "transparent");
	}


	function toggleLegendDot() {
		var legendGroup = d3.select(".circleLegendGroup");
		legendGroup.selectAll("text")
			.transition()
			.attr("fill", darkgrey);
		legendGroup.selectAll("circle")
			.transition()
			.attr("stroke-opacity", 1)
			.attr("fill-opacity", 1);

		var offLegendGroup = d3.select(".barLegendGroup");
		offLegendGroup.selectAll("text")
			.transition()
			.attr("fill", "transparent");
		offLegendGroup.selectAll("rect")
			.transition()
			.attr("fill-opacity", 0);
	}

	function toggleLegendBar() {
		var legendGroup = d3.select(".barLegendGroup");
		legendGroup.selectAll("text")
			.transition()
			.attr("fill", darkgrey);
		legendGroup.selectAll("rect")
			.transition()
			.attr("fill-opacity", 1);

		var offLegendGroup = d3.select(".circleLegendGroup");
		offLegendGroup.selectAll("text")
			.attr("fill", "transparent");
		offLegendGroup.selectAll("circle")
			.attr("stroke-opacity", 0)
			.attr("fill-opacity", 0);
	}

	function updateLegend() {
		var newColor = light_colors[getIndex(sectorIndex)];
		var oldColor = kelly_colors[getIndex(sectorIndex)];

		d3.select(".oldLegendRect")
			.transition()
			.duration(500)
			.attr("fill", oldColor);

		d3.select(".newLegendRect")
			.transition()
			.duration(500)
			.attr("fill", newColor);

		d3.select(".oldLegendCircle")
			.transition()
			.duration(500)
			.attr("stroke", oldColor)
			.attr("fill", oldColor);

		d3.select(".newLegendCircle")
			.transition()
			.duration(500)
			.attr("stroke", newColor)
			.attr("fill", newColor)
			.attr("opacity", 0.7);

		d3.select(".oldSurpriseLegendCircle")
			.transition()
			.duration(500)
			.attr("stroke", oldColor);
	}

	function drawStreamGraph() {
		/* Load the data */
		d3.csv("data/business/sector_counts.csv",
			function(row, i) {
					return{
						sector: row.sector,
						sector_count: row.sector_code,
						count: row.count,
						year: row.year,
					};
			},function(error, rows) {
				if (error) {
					console.log(error);
				}
				streamData = rows;
				loadTransposed();
			}
		);
	}

	function loadTransposed() {
		d3.csv("data/business/sector_counts_transpose.csv",
			function(error, rows) {
				if (error) {
					console.log(error);
				}
				transposedData = rows;
				generateStreamGraph(
					d3.nest()
						.key(function(d) {
							return d.sector;
						})
						.entries(data)
				);
			}
		);
	}


	/* Creates the initial visualization */
	function generateStreamGraph(nestedData) {
		keyedData = nestedData;
		keyedData.sort(function(a, b) {
			return -(a.values[6].count - b.values[6].count);
		});

		generateAxes();
		generateGraph();
	}

	/* Creates the scales and axes */
	function generateAxes() {
		streamY = d3.scaleLinear()
			.range([50, streamHeight - 20])
			.domain([0, d3.sum(streamData, function(d) {
				if (d.year == 2016) {
					return d.count;
				} else {
					return 0;
				}
			})]);
	}

	/* Draw graph */
	function generateGraph() {
        self.svg.append("text")
            .attr("class", "unselectable")
            .attr("id", "streamTitle")
            .text(sectorNames[sectorIndex])
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("font-weight", 400)
            .attr("fill", darkgrey)
            .attr("transform", "translate("  + (width + chartOffsetLeft - 40 + streamWidth / 2) + ", 150)");

		var area = d3.area()
			.curve(d3.curveCatmullRom)
			.x(function(d) {
				return streamX(d.data.Year);
			})
			.y0(function(d){
				return streamY(d[0]);
			})
			.y1(function(d) {
				return streamY(d[1]);
			});

		var lineValue = d3.line()
			.curve(d3.curveCatmullRom)
			.x(function(d) {
				return streamX(d.data.Year);
			})
			.y(function(d){
				return streamY(d[1]);
			});

		var stack = d3.stack()
			.keys(sectorNames)
			.value(function(d, key) {
				//console.log(d[key]);
				return d[key];
			})
			.order(d3.stackOrderInsideOut)
			.offset(d3.stackOffsetWiggle);

		var layers = stack(transposedData);
		var layers2 = stack(transposedData);
		// draw the area

		var sectorArea = self.streamChart.selectAll(".areapath")
			.data(layers)
			.enter()
			.append("path")
			.attr("id", function(d, i) {
				return i;
			})
			.attr("fill", function(d, i) {
				return kelly_colors[i];
			})
			.attr("d", area)
			.attr("class", function(d, i) {
				return "sectorPath " + "sector" + i;
			})
			.style("fill-opacity", function(d, i) {
				return i == sectorIndex ? normopacity : streamfadeopacity;
			})
			.style("cursor", "pointer")
			.on("mouseover", function(d) {
				streamFadeOthers(d3.select(this).attr("id"), streamfadedelay);
				var inId= d3.select(this).attr("id");
				if (inId != highlightId) {
					highlightSectorBox(inId);
				}
			})
			.on("mouseout", function() {
				//streamFadeOthers(highlightId, streamfadedelay);
				var outId = d3.select(this).attr("id");
				if (outId != highlightId) {
					unhighlightSectorBox(outId);
                    self.svg.select("#streamTitle")
                        .text(sectorNames[highlightId]);
				}
				unhighlightStream(outId);
			})
			.on("click", function() {
                if (!self.active) {
    				self.hideDotView();
    				var id = d3.select(this).attr("id");
    				sectorIndex = id;
    				highlightSectorBox(id, true);
    				update(self.sectors[getIndex(sectorIndex)], this);
    				for (var i = 0; i < self.sectors.length; i++) {
    					if (i != id) {
    						unhighlightSectorBox(i);
    					}
    				}
    				highlightId = id;
    				prevNavBarId = id;
                }
			});
			// on click do the nav bar on click

			// draw the line

			var sectorLine = self.streamChart.selectAll(".linePath")
				.data(layers2)
				.enter()
				.append("path")
				.attr("id", function(d, i) {
					return i;
				})
				.attr("stroke", function(d, i) {
					return kelly_colors[i];
				})
				.attr("stroke-width", 0)
				.attr("fill", "none")
				.attr("d", lineValue)
				.attr("class", function(d, i) {
					return "sectorLine" + i + " sectorLine";
				})
				.style("stroke-opacity", function(d, i) {
					return i == sectorIndex ? normopacity : streamfadeopacity;
				})
				.style("pointer-events", "none")
				.style("cursor", "pointer")
				// .on("mouseout", function() {
				// 	streamFadeOthers(highlightId, 0);
				// 	var currId = d3.select(this).attr("id");
				// 	if (currId != highlightId) {
				// 		unhighlightSectorBox(currId);
				// 	}
				// });

			orderedLayers = layers.sort(function(a, b){
				return a["index"] - b["index"];
			});

			var leftRangeArray = calculateMinMax(orderedLayers, 0)
			var rightRangeArray = calculateMinMax(orderedLayers, 6)

	 		var leftY = d3.scaleOrdinal()
	 				.range(leftRangeArray)
	 				.domain([formatNumber(d3.sum(streamData, function(d){
	 					if(d.year == 2010){
	 						return d.count;
	 					} else {
	 						return 0;
	 					}
	 				})), 0]);

	 		var rightY = d3.scaleOrdinal()
	 				.range(rightRangeArray)
	 				.domain([formatNumber(d3.sum(streamData, function(d){
	 					if(d.year == 2016){
	 						return d.count;
	 					} else {
	 						return 0;
	 					}
	 				}))], 0);


			var leftYAxis = d3.axisLeft().scale(leftY)
			.ticks(10);

			var rightYAxis = d3.axisRight().scale(rightY)
			.ticks(10);
		}

	function unhighlightStream(pathId, delay) {
		d3.selectAll(".sectorPath")
			.transition()
			.duration(250)
			.style("fill-opacity", function() {
				return d3.select(this).attr("id") == highlightId ? normopacity : streamfadeopacity;
			});

		d3.selectAll(".sectorLine")
			.transition()
			.duration(250)
			.style("stroke-opacity", function() {
				return d3.select(this).attr("id") == highlightId ? normopacity : streamfadeopacity;
			})
			.style("stroke-width", function() {
				return d3.select(this).attr("id") == highlightId ? 2 : 0;
			});
	}

	function streamFadeOthers(pathId, delay){
		d3.selectAll(".sectorPath")
			.transition()
			.duration(250)
			.style("fill-opacity", function() {
				return d3.select(this).attr("id") == pathId ? normopacity : streamfadeopacity;
			});

		d3.selectAll(".sectorLine")
			.transition()
			.duration(250)
			.style("stroke-opacity", function() {
				return d3.select(this).attr("id") == pathId ? normopacity : streamfadeopacity;
			})
			.attr("stroke-width", function() {
				return d3.select(this).attr("id") == pathId ? 2 : 0;
			});

        self.svg.select("#streamTitle")
            .text(sectorNames[pathId]);


		// d3.selectAll(".sectorPath")
		// 	.filter(function() {
		// 		return d3.select(this).attr("id") != id;
		// 	})
		// 	//.transition("steamFadeOthers" + this)
		// 	//.delay(delay)
		// 	.style("fill-opacity", streamfadeopacity)
		// 	.attr("stroke-width", 0);


		// d3.select(".sectorLine" + id)
		// 	.transition("fadeIn")
		// 	.delay(0)
		// 	.attr("stroke-width", 2)
		// 	.style("pointer-events", "none")
		// 	.style("stroke-opacity", normopacity);

		// d3.selectAll(".sectorLine")
		// 	.filter(function() {
		// 		return d3.select(this).attr("id") != id;
		// 	})
		// 	//.transition("steamFadeOthers" + this)
		// 	//.delay(delay)
		// 	.style("stroke-opacity", streamfadeopacity)
		// 	.attr("stroke-width", 0);
	}

	function calculateMinMax(orderedLayers, i) {
		return[streamY(orderedLayers[0][i][0]) - layerOffset, streamY(orderedLayers[orderedLayers.length-1][i][1]) - layerOffset]
	}

	function displayTooltip(element){

		var elementData = d3.select(element).data();
		var fill = d3.select(element).attr("fill")
		var yPos = ((elementData[0][6][0] + elementData[0][6][1])/2)
		text = elementData[0]["key"]

		console.log(text)
		console.log(text.split(" "))


		self.streamChart.append("text")
			.attr("fill-opacity", 0)
			.transition("displayTooltip" + this)
			.duration(1250)
			.attr("class", "tooltip")
			.attr("x", width - graphOffsetRight)
			.attr("y", y(yPos) - layerOffset)
			.attr("text-anchor", "start")
			.attr("font-size", "20px")
			.attr("font-family", "Open Sans")
			.attr("fill", fill)
			.style("fill-opacity", 2)
			.text(elementData[0]["key"]);
	}

	function isMatch(current, target){
		return current === target
	}
}
