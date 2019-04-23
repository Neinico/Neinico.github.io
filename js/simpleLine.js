/**
 * A class for producing a simple line graph using d3
 */

// creates a new SimpleLine appended to the given target
var SimpleLine = function(target, fileName, color) {
	var self = this;
	var widthModifier = 1;
	var graphOffsetLeft = 4;
	var graphOffsetRight = 20;
<<<<<<< HEAD
	//var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
=======
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
>>>>>>> 38393b02aa730d90c46ee44f3225e1490f30a59f

	self.initialize = function() {
		if (self.initalized) {
			return true;
		}

		self.width = Math.min(document.getElementById(target).clientWidth * widthModifier, 300);
		self.height = document.getElementById(target).clientHeight;

		// load data
		d3.csv("data/" + fileName,
			function(row, i) {
				return {
					date: formatDate(row.date),
					value: row.value
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
		self.svg = d3.select("#" + target).append("svg")
			.attr("width", self.width)
			.attr("height", self.height)
			.attr("shape-rendering", "geometricPrecision");

		self.canvas = self.svg.append("g");

		self.x = d3.scaleTime().domain(d3.extent(self.dataset, function(d) {
				return d.date;
			}))
			.range([graphOffsetLeft, self.width - graphOffsetRight]);

		self.y = d3.scaleLinear().domain([0, d3.extent(self.dataset, function(d) {
				return d.value;
			})[1]])
			.range([0, self.height - 20]);

		var line = d3.line()
			.x(function(d) {
				return self.x(d.date);
			})
			.y(function(d) {
				return self.height - self.y(d.value);
			});

		var path = self.canvas.append("path")
			.datum(self.dataset)
			.attr("class", "line")
			.attr("d", line)
			.attr("stroke", color)
			.attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
			.attr("fill", "none");

		var totalLength = path.node().getTotalLength();

		path.attr("stroke-dasharray", totalLength + " " + totalLength)
	      .attr("stroke-dashoffset", totalLength)
	      .transition()
	        .duration(2000)
	        .ease(d3.easeLinear)
	        .attr("stroke-dashoffset", 0);

	    /** for endpoint */
	    var lastDate = self.dataset[self.dataset.length - 1].date;
	    var lastValue = self.dataset[self.dataset.length - 1].value;

	 	/** for mouse focus */
		self.bisectDate = d3.bisector(function(d) { return d.date; }).left;
	 	self.focus = self.svg.append("g")
	 		.attr("class", "focus");

	 	self.focus.append("circle")
	 		.attr("class", "focusCircle")
	 		.attr("cx", self.x(lastDate))
	    	.attr("cy", self.height - self.y(lastValue))
	    	.style("opacity", 0)
	 		.attr("r", 4)
	 		.attr("fill", color)
	 		.transition()
	 		.delay(2000)
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

	 	self.canvas.append("rect")
	 		.attr("fill", "none")
	 		.attr("pointer-events", "all")
	 		.attr("width", self.width)
	 		.attr("height", self.height)
	 		.attr("x", graphOffsetLeft)
	 		.attr("y", 0)
	 		.on("mouseover", function() { self.focus.style("display", null)})
	 		.on("mousemove", mousemove);

	}

	function formatDate(raw) {
		var year = raw.substring(0, raw.indexOf('-'));
<<<<<<< HEAD
		//var month = parseInt(raw.substring(raw.indexOf('-') + 1)) - 1;
		return new Date(year);
=======
		var month = parseInt(raw.substring(raw.indexOf('-') + 1)) - 1;
		return new Date(year, month);
>>>>>>> 38393b02aa730d90c46ee44f3225e1490f30a59f
	}

	/** Focus on the nearest datapoint */
	function mousemove() {
		var x0 = self.x.invert(d3.mouse(this)[0]);
		var i = self.bisectDate(self.dataset, x0, 1);
		var d0 = self.dataset[i - 1];
		var d1 = self.dataset[i];
		if (typeof d0 != 'undefined' && typeof d1 != 'undefined') {
			var point = x0 - d0.date > d1.date - x0 ? d1: d0;
			self.focus.select(".focusCircle").attr("cx", self.x(point.date))
				.attr("cy", self.height - self.y(point.value));

			adjustCount(target, point.value);
			adjustDate(target, point.date);
		}
	}

	function formatNumber(n) {
    	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function adjustCount(target, end) {
		var element = document.getElementById(target + "Count");
		if (target === 'homeOverview') {
			element.innerHTML =  target === 'homeOverview' ? '$' + formatNumber(end) : formatNumber(end);
		} else {
			var start = element.innerHTML.replace(",", "").replace("$", "");
			var options = {
				useEasing : false,
				useGrouping : true,
				separator : ',',
				decimal : '.',
			};
			if (target === "homeOverview") {
				options.prefix = '$';
			}
			var countUp = new CountUp(element, start, end, 0, 0.05, options);
			countUp.start();
		}
	}

	function adjustDate(target, date) {
		var element = document.getElementById(target + "Date");
		var previous = element.innerHTML;
        if (target === "homeOverview") {
<<<<<<< HEAD
		    var next = previous.substring(0, previous.indexOf("of") + 3)  /*+ months[date.getMonth()]*/ + " " + date.getFullYear();
=======
		    var next = previous.substring(0, previous.indexOf("of") + 3)  + months[date.getMonth()] + " " + date.getFullYear();
>>>>>>> 38393b02aa730d90c46ee44f3225e1490f30a59f
        } else {
            var next = previous.substring(0, previous.indexOf("of") + 3) + date.getFullYear();
        }
		element.innerHTML = next;
	}
}
