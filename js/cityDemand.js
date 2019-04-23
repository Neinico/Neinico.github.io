/**
 * A class for producing a simple percentage area plot using d3
 */

// creates a new SimplePArea appended to the given target
var CityDemand = function(target, fileName, color, name) {
	var self = this;
	var sizeModifier = 1;
	var graphOffsetLeft = 30;
	var graphOffsetRight = 30;
	var graphOffsetTop = 20;
	var graphOffsetBottom = 20;
	var prevPoint;
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var darkgrey = "#4c4c4c";

	self.initialize = function() {
		if (self.initalized) {
			return true;
		}

		// load data
		d3.csv("data/housing/" + fileName,
			function(row, i) {
				return {
					date: formatDate(row.date),
					days: row.value,
				};
			},
			function(error, rows) {
				if(error) {
					console.log(error);
				}
				self.dataset = rows;
				self.generate();
			}
		);
	}

	self.generate = function() {
		self.width = 400;
		self.height = 400;
		self.fontsize = 20;

		self.svg = d3.select("#" + target).append("svg")
			.attr("width", "80%")
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 " + self.width + " " + self.height)
			.attr("shape-rendering", "geometricPrecision");

		self.canvas = self.svg.append("g");

		self.lineOffset = self.height * 0.01;

		self.x = d3.scaleTime().domain(d3.extent(self.dataset, function(d) {
				return d.date;
			}))
			.range([graphOffsetLeft, self.width - graphOffsetRight]);

		self.y = d3.scaleLinear().domain([0, 175])
			.range([graphOffsetBottom, self.height - graphOffsetTop]);

        /********
        * TITLE *
        ********/
        var title = self.canvas.append("text")
            .attr("font-size", self.fontsize * 2)
            .attr("font-family", "Open Sans")
            .text(name)
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + self.width / 2 + "," + 50 + ")");

		/*********
		* X AXIS *
		**********/
		var xAxis = d3.axisBottom()
						.scale(self.x)
                        .ticks(self.dataset.length)
						.tickSize(0)
						.tickFormat(d3.timeFormat("%B %Y"));

		self.xAxisGroup = self.canvas.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(" + 0 + ", " + (self.height - graphOffsetBottom) + ")")
				.call(xAxis);

		self.xAxisGroup.selectAll("path")
				.style("stroke", "none");

		// format the text of the axis
		self.xAxisGroup.selectAll("text")
                .classed("unselectable", true)
				.attr("font-family", "Open Sans")
				.attr("font-size", "12px")
				.attr("fill", color)
				.style("fill-opacity", 0)
				.attr("y", function() {
					return parseInt(d3.select(this).attr("y")) + 5;
				})
				.attr("id", function(d, i) {
					return d3.select(this).text() + "label";
				});

		/*********
		 * GRAPH *
		 *********/
		var line = d3.line()
			.x(function(d) {
				return self.x(d.date);
			})
			.y(function(d) {
				return self.height - self.y(d.days);
			});

		var path = self.canvas.append("path")
			.datum(self.dataset)
			.attr("class", "line")
			.attr("d", line)
			.attr("stroke", color)
			.attr("stroke-width", 1)
			.attr("fill", "none");

		var areaUnder = d3.area()
    		.x(function(d) { return self.x(d.date); })
    		.y0(self.height - graphOffsetBottom)
    		.y1(function(d) { return self.height - self.y(d.days); });


    	var under = self.canvas.append("path")
    		.datum(self.dataset)
    		.attr("class", "under")
    		.attr("d", areaUnder)
    		.attr("fill", color)
    		.style("opacity", 0.5);

	    /** for endpoint */
	    self.lastDate = self.dataset[self.dataset.length - 1].date;
	    self.lastValue = self.dataset[self.dataset.length - 1].days;
			self.lastCount = self.dataset[self.dataset.length - 1].count;

	    /** for start point */
	    self.firstDate = self.dataset[0].date;
	    self.firstValue = self.dataset[0].days;

	    drawFocus();
	    drawAnnotations();
	 }

	/*********
	 * FOCUS *
	 *********/
	function drawFocus() {
		/** for mouse focus */
		self.bisectDate = d3.bisector(function(d) { return d.date; }).left;
	 	self.focus = self.svg.append("g")
	 		.attr("class", "focus");

	 	self.focus.append("circle")
	 		.attr("class", "focusCircle")
	 		.attr("cx", self.x(self.lastDate))
	    	.attr("cy", self.height - self.y(self.lastValue))
	    	.style("opacity", 0)
	 		.attr("r", 4)
	 		.attr("fill", color)
	 		.attr("pointer-events", "none")
	 		.transition()
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
	 			});;

	 	self.focus.append("line")
	 		.attr("class", "focusLine")
	 		.attr("id", "part")
			.style("stroke", color)
			.style("stroke-width", 1)
			.style("stroke-opacity", 0)
			.attr("x1", self.x(self.lastDate))
			.attr("y1", self.height - graphOffsetBottom - self.lineOffset)
			.attr("x2", self.x(self.lastDate))
			.attr("y2", self.height - self.y(self.lastValue) + self.lineOffset)
			.style("stroke-dasharray", ("3, 3"))
			.attr("pointer-events", "none");

		var midY = (self.height - self.y(self.lastValue) - self.lineOffset
						+ graphOffsetTop + self.lineOffset) / 1.3;

		var textX = self.x(self.lastDate)
		var textOffset = self.width * 0.05 + self.fontsize * 2;
		textX = self.x(self.lastDate) <= (self.width / 2) ? textX + self.width * 0.03 : textX - self.width * 0.03;

	 	self.focus.append("text")
	 		.attr("class", "focusText unselectable")
	 		.attr("fill", color)
	 		.attr("id", "partText")
	 		.attr("font-size", (self.fontsize * 0.8) + "px")
	 		.attr("x", self.x(self.lastDate) - 100)
	 		.attr("y", midY)
	 		.style("fill-opacity", 0)
	 		.style("pointer-events", "none")
	 		.text(formatNumber(self.lastCount));

	 	self.focus.append("text")
	 		.attr("class", "focusText unselectable")
	 		.attr("id", "wholeText")
	 		.attr("fill", color)
	 		.attr("font-size", (self.fontsize * 1.2) + "px")
	 		.attr("x", self.x(self.lastDate) - 100)
	 		.attr("y", midY - self.fontsize * 1.5)
	 		.style("fill-opacity", 0)
	 		.style("pointer-events", "none")
	 		.text(d3.format("$,d")(self.lastValue));


		/** mouse event overlay */
	 	self.canvas.append("rect")
			.attr("class", "focusRect")
	 		.attr("fill", "none")
	 		.attr("pointer-events", "all")
	 		.attr("width", self.width - graphOffsetLeft - graphOffsetRight)
	 		.attr("height", self.height - graphOffsetTop - graphOffsetBottom)
	 		.attr("x", graphOffsetLeft)
	 		.attr("y", graphOffsetTop)
			.style("pointer-events", "none")
	 		.on("mouseenter", function() {
	 			if (self.onmouseenter) {
                    self.onmouseenter();
                }
	 		})
	 		.on("mouseleave", function() {
	 			if (self.onmouseleave) {
                    self.onmouseleave()
                }
			})
	 		.on("mousemove", function() {
                if (self.onmousemove) {
                    self.onmousemove(this, 0);
                }
            });
	}

	self.focusIn = function() {
		self.focus.selectAll(".focusLine")
	 		.transition("fadeFocus" + name)
	 		.duration(500)
	 		.style("stroke-opacity", 1);

		self.focus.selectAll(".focusText")
		 		.transition("fadeFocus" + name)
		 		.duration(500)
		 		.style("fill-opacity", 1);

	}

	self.focusOut = function() {
		self.focus.selectAll(".focusLine")
			.transition("fadeFocus" + name)
			.duration(200)
			.style("stroke-opacity", 0);

		self.focus.selectAll(".focusText")
			.transition("fadeFocus" + name)
			.duration(200)
			.style("fill-opacity", 0)

		self.xAxisGroup.selectAll("text")
			.transition("fadeAxisText" + name)
			.duration(200)
			.style("fill-opacity", 0);

		// reset the previous point
		prevPoint = null;
	}
	/***************
 	 * ANNOTATIONS *
 	 ***************/
	function drawAnnotations() {
	 	var type = d3.annotationCalloutCircle;

		var annotations = [{
		  note: {
		  	title: d3.format(",d")(self.lastValue) + " days",
		    label: d3.timeFormat("%B %Y")(self.lastDate)
		  },
		  //can use x, y directly instead of data
		  x: self.x(self.lastDate),
		  y: self.height - self.y(self.lastValue),
		  dx: - self.width * 0.05,
		  dy: - self.height * 0.05,
		  subject: { radius: 5, radiusPadding: 5 }
		}, {note: {
		  	title: d3.format(",d")(self.firstValue) + " days",
		    label: d3.timeFormat("%B %Y")(self.firstDate)
		  },
		  //can use x, y directly instead of data
		  x: self.x(self.firstDate),
		  y: self.height - self.y(self.firstValue),
		  dx: self.width * 0.05,
		  dy: -self.height * 0.05,
		  subject: { radius: 5, radiusPadding: 5 }
		}]

		var makeAnnotations = d3.annotation()
		  	.editMode(false)
		  	.type(type)
		 	.annotations(annotations);

		self.annotations = self.canvas
		  	.insert("g", "rect")
		  	.attr("class", "annotation-group")
		  	.call(makeAnnotations);

		self.annotations.selectAll("rect")
			.attr("fill", "none");
		self.annotations.selectAll(".note-line")
			.attr("stroke", darkgrey)
			.attr("stroke-width", 0.5);
		self.annotations.selectAll(".annotation-connector")
			.attr("stroke", darkgrey)
			.attr("stroke-width", 0.5);
		self.annotations.selectAll("text")
            .classed("unselectable", true)
			.attr("fill", darkgrey)
			.attr("font-family", "Open Sans")
			.style("font-size", self.fontsize + "px");
		self.annotations.selectAll("text.annotation-note-title")
			.attr("font-weight", 400)
			.attr("margin-bottom", 0);
		self.annotations.selectAll("g.annotation-subject")
			.attr("fill", "none")
			.attr("stroke-width", "0");

		self.annotations
			.style("fill-opacity", 0)
			.style("stroke-opacity", 0);
	}

	/** Allows for mouse events */
	self.allowMouse = function() {
		self.canvas.select(".focusRect")
			.style("pointer-events", "all");
	}

	// fades out annotations
	self.hideAnnotations = function() {
		self.annotations
			.transition("fadeAnnotations" + name)
			.duration(200)
			.style("fill-opacity", 0)
			.style("stroke-opacity", 0);
	}

	/** fade in annotations */
	self.showAnnotations = function() {
		self.annotations
			.transition("fadeAnnotations" + name)
			.duration(200)
			.style("fill-opacity", 0.8)
			.style("stroke-opacity", 0.8);
	}

	function formatDate(raw) {
		var year = raw.substring(0, raw.indexOf('-'));
		var month = parseInt(raw.substring(raw.indexOf('-') + 1)) - 1;
		return new Date(year, month);
	}

	/** Focus on the nearest datapoint */
	self.mousemove = function(date, duration) {
		var i = self.bisectDate(self.dataset, date, 1);
		var d0 = self.dataset[i - 1];
		var d1 = self.dataset[i];
		if (typeof d0 != 'undefined' && typeof d1 != 'undefined') {
			point = date - d0.date > d1.date - date ? d1: d0;
			if (prevPoint != point) {
				prevPoint = point;
				self.focus.select(".focusCircle")
                    .transition()
                    .duration(duration)
					.attr("cx", self.x(point.date))
					.attr("cy", self.height - self.y(point.days));

				/* Adjust part line */
				self.focus.select("#part")
                    .transition()
                    .duration(duration)
					.attr("x1", self.x(point.date))
					.attr("y1", self.height - graphOffsetBottom - self.lineOffset)
					.attr("x2", self.x(point.date))
					.attr("y2", self.height - self.y(point.days) + self.lineOffset);


				var midY = (self.height - self.y(point.days) - self.lineOffset
							+ graphOffsetTop + self.lineOffset) / 1.3;

				var textX = self.x(point.date)
				var textOffset = self.width * 0.05 + self.fontsize * 2;
				textX = self.x(point.date) <= (self.width / 3) ? textX + self.width * 0.03 : textX - self.width * .03;

				/** Adjust focus text */
				self.focus.select("#partText")
                    .transition()
                    .duration(duration)
					.attr("x", textX)
					.attr("y", midY)
					.text(d3.timeFormat("%B %Y")(point.date));

				self.focus.select("#wholeText")
                    .transition()
                    .duration(duration)
					.attr("x", textX)
					.attr("y", midY - self.fontsize * 1.5)
					.text(d3.format(",d")(point.days));

				if (self.x(point.date) > (self.width / 3)) {
					self.focus.selectAll(".focusText")
						.attr("text-anchor", "end");
				} else {
					self.focus.selectAll(".focusText")
						.attr("text-anchor", "front");
				}

				// /** Highlight x axis label */
				// self.xAxisGroup.selectAll("text")
				// 	.style("fill-opacity", function() {
				// 		return d3.select(this).text() === d3.timeFormat("%B %Y")(point.date)
				// 				? 1 : 0;
				// 	})
			}
		}
	}

	function formatNumber(n) {
    	return d3.format(",d")(n);
	}
}
