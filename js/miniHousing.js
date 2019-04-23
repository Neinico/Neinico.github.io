var MiniHousingGraph = function(target, width, height) {
    var self = this;

    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    self.width = width; //600 - margin.left - margin.right,
    self.height = height;// 300 - margin.top - margin.bottom;
    self.lineOffset = self.height * 0.01;
    self.fontsize = 12;

    self.housingTypes = ["1bedroom", "2bedroom", "3bedroom", "4bedroom", "5bedroomOrMore",
                    "all_homes", "Condominium", "SingleFamilyResidence"];

    var darkblue = "#42679E";

    self.x = d3.scaleTime().range([margin.left, self.width - margin.right]);
    self.y = d3.scaleLinear().range([self.height - margin.bottom, margin.top]);

    var dispatch = d3.dispatch("load", "statechange");
    var prevPoint = null;

    self.initialize = function() {
        self.createSVG(target);
        self.generateLineGraph('98105');
    }

    self.createSVG = function(target) {
        self.svg = d3.select("#" + target).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + self.width + " " + self.height);
    }

    self.generateLineGraph = function(selected_zip) {
        d3.csv("seattle_zip_transpose.csv", function(d) {
                d.date = Date.parse(d.date);
                return d;
        }, function(error, data) {
                if (error) throw error;

                // Format data so it's easier to plot multiple lines
                reformatData(data);

                // Get the index given the zipcode
                var index_zip_map = {};
                for (i = 0; i < self.zip_list.length; i++) {
                    var zip = self.zip_list[i][0].zipcode
                    index_zip_map[zip] = i;
                }
                self.zip_index = index_zip_map[selected_zip]

                self.createAxes(self.zip_index);
                plotLine(self.zip_index);
                drawFocus();
        });
    }

    function reformatData(data) {
        self.zip_list = [];
        var seattle_zips = d3.keys(data[1]);
        for (i = 0; i < seattle_zips.length - 1; i++) {
            zip = [];
            for (j = 0; j < data.length; j++) {
                var zip_object = {
                    zipcode:seattle_zips[i],
                    date:new Date(data[j].date),
                    price:parseInt(data[j][seattle_zips[i]])
                };
                zip.push(zip_object);
            }
            self.zip_list.push(zip);
        }
    }

    self.createAxes = function() {
        var xAxis = d3.axisBottom()
            .scale(self.x)
            .tickSize(0)
            .tickFormat(d3.timeFormat("'%y"));
        var yAxisLeft = d3.axisRight().scale(self.y)
            .ticks(6)
            .tickSize(0);

        // Scale the range of the data (floor the lowest date to jan of that year)
        var xDomain = d3.extent(self.zip_list[self.zip_index], function(d) { return d.date; });

        self.x.domain(xDomain);
        // NOTE: CHANGE ZIP HERE
        self.y.domain([0, d3.max(self.zip_list[self.zip_index], function(d) {
            return d.price; }) * 1.1]);

        // append the X Axis
        self.xAxis = self.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + (self.height - margin.bottom) + ")")
            .call(xAxis)

        self.xAxis.selectAll("path")
           .attr("stroke", "none")

        // append the Y Axis
        self.yAxis = self.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (self.width - margin.right) + ", 0)")
            .call(yAxisLeft);

        self.yAxis.selectAll("path")
            .attr("stroke", "none");

        self.xAxis.selectAll("text")
            .attr("font-family", "Open Sans");

        self.yAxis.selectAll("text")
            .attr("font-family", "Open Sans");
    }

    function plotLine(zip_index) {
        var valueline = d3.line()
            .x(function(d) { return self.x(d.date); })
            .y(function(d) { return self.y(d.price); });

        var areaUnder = d3.area()
    		.x(function(d) { return self.x(d.date); })
    		.y0(self.height - margin.bottom)
    		.y1(function(d) { return self.y(d.price); });

        self.svg.append("path")
            // NOTE: CHANGE ZIP HERE
            .datum(self.zip_list[self.zip_index])
            .attr("fill", "none")
            .attr("stroke", darkblue)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 2)
            .attr("d", valueline);

        /* Apply a gradient below the line */
        var areaGradient = self.svg
            .append("defs")
            .append("linearGradient")
            .attr("id","areaGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");

        areaGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", darkblue)
            .attr("stop-opacity", 0.6);
        areaGradient.append("stop")
            .attr("offset", "80%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0);

        // self.svg.append("path")
        //     .datum(self.zip_list[self.zip_index])
        //     .style("fill", "url(#areaGradient)")
        //     .attr("d", areaUnder);

        var under = self.svg.append("path")
            .datum(self.zip_list[self.zip_index])
            .attr("class", "under")
            .attr("d", areaUnder)
            .attr("fill", darkblue)
            .style("opacity", 1);
    }

    /*********
     * FOCUS *
     *********/
    function drawFocus() {
        var lastEntry = self.zip_list[self.zip_index];
        self.lastDate = lastEntry[lastEntry.length - 1].date;
        self.lastValue = lastEntry[lastEntry.length - 1].price;

        /** for mouse focus */
        self.bisectDate = d3.bisector(function(d) { return d.date; }).left;
        self.focus = self.svg.append("g")
            .attr("class", "focus");

        self.focus.append("circle")
            .attr("class", "houseFocusCircle")
            .attr("cx", self.x(self.lastDate))
            .attr("cy", self.y(self.lastValue))
            .style("opacity", 0)
            .attr("r", 4)
            .attr("fill", darkblue)
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
            .attr("class", "houseFocusLine")
            .attr("id", "housePart")
            .style("stroke", "white")
            .style("stroke-width", 1)
            .style("stroke-opacity", 0)
            .attr("x1", self.x(self.lastDate))
            .attr("y1", self.height - margin.bottom - self.lineOffset)
            .attr("x2", self.x(self.lastDate))
            .attr("y2", self.height - self.y(self.lastValue) + self.lineOffset)
            .style("stroke-dasharray", ("3, 3"))
            .attr("pointer-events", "none");

        var midY = (self.height - self.y(self.lastValue) - self.lineOffset
                        + margin.top + self.lineOffset) / 1.2;

        var textX = self.x(self.lastDate)
        var textOffset = self.width * 0.05 + self.fontsize * 2;
        textX = self.x(self.lastDate) <= (self.width / 2) ? textX + self.width * 0.03 : textX - self.width * 0.03;

        self.focus.append("text")
            .attr("class", "houseFocusText")
            .attr("fill", darkblue)
            .attr("id", "housePartText")
            .attr("font-size", (self.fontsize * 0.8) + "px")
            .attr("x", self.x(self.lastDate) - 100)
            .attr("y", midY)
            .style("fill-opacity", 0)
            .style("pointer-events", "none")
            .text(self.lastCount);

        self.focus.append("text")
            .attr("class", "houseFocusText")
            .attr("id", "houseWholeText")
            .attr("fill", darkblue)
            .attr("font-size", (self.fontsize * 1.2) + "px")
            .attr("x", self.x(self.lastDate) - 100)
            .attr("y", midY - self.fontsize * 1.5)
            .style("fill-opacity", 0)
            .style("pointer-events", "none")
            .text(d3.format(".01%")(self.lastValue));


        /** mouse event overlay */
        self.svg.append("rect")
            .attr("class", "focusRect")
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .attr("width", self.width)
            .attr("height", self.height)
            .attr("x", 0)
            .attr("y", 0)
            .style("pointer-events", "all")
            .on("mouseenter", function() {
                self.focusIn();
            })
            .on("mouseleave", function() {
                self.focusOut();
            })
            .on("mousemove", mousemove);
    }

    self.focusIn = function() {
        d3.selectAll(".houseFocusLine")
            .transition("fadeFocus")
            .duration(500)
            .style("stroke-opacity", 1);

        d3.selectAll(".houseFocusText")
                .transition("fadeFocus")
                .duration(500)
                .style("fill-opacity", 1);
    }

    self.focusOut = function() {
        d3.selectAll(".houseFocusLine")
            .transition("fadeFocus")
            .duration(500)
            .style("stroke-opacity", 0);

        d3.selectAll(".houseFocusText")
            .transition("fadeFocus")
            .duration(500)
            .style("fill-opacity", 0)

        // self.xAxisGroup.selectAll("text")
        //     .transition("fadeAxisText")
        //     .duration(500)
        //     .style("fill-opacity", 0);

        // reset the previous point
        prevPoint = null;
    }

    /** Focus on the nearest datapoint */
    function mousemove() {
        var x0 = self.x.invert(d3.mouse(this)[0]);
        var i = self.bisectDate(self.zip_list[self.zip_index], x0, 1);
        var d0 = self.zip_list[self.zip_index][i - 1];
        var d1 = self.zip_list[self.zip_index][i];
        if (typeof d0 != 'undefined' && typeof d1 != 'undefined') {
            point = x0 - d0.date > d1.date - x0 ? d1: d0;
            if (prevPoint != point) {
                prevPoint = point;
                d3.selectAll(".houseFocusCircle")
                    .attr("cx", self.x(point.date))
                    .attr("cy", self.y(point.price));

                /* Adjust part line */
                d3.selectAll("#housePart")
                    .attr("x1", self.x(point.date))
                    .attr("y1", self.height - self.lineOffset - margin.bottom)
                    .attr("x2", self.x(point.date))
                    .attr("y2", self.y(point.price) + self.lineOffset);

                var textX = self.x(point.date)
                var textOffset = self.width * 0.05 + self.fontsize * 2;
                textX = self.x(point.date) <= (self.width / 2) ? textX + self.width * 0.03 : textX - self.width * .03;

                /** Adjust focus text */
                d3.selectAll("#housePartText")
                    .attr("x", textX)
                    //.attr("y", (self.y(point.price) + self.height) / 2)
                    .attr("y", self.y(point.price) / 1.5)
                    .text(d3.timeFormat("%b %Y")(point.date));

                d3.selectAll("#houseWholeText")
                    .attr("x", textX)
                    //.attr("y", (self.y(point.price) + self.height) / 2 - self.fontsize * 1.5)
                    .attr("y", self.y(point.price) / 1.5 - self.fontsize * 1.5)
                    .text(d3.format("$,.2r")(point.price));

                if (self.x(point.date) > (self.width / 2)) {
                    d3.selectAll(".houseFocusText")
                        .attr("text-anchor", "end");
                } else {
                    d3.selectAll(".houseFocusText")
                        .attr("text-anchor", "front");
                }

                /** Highlight x axis label */
                // self.xAxisGroup.selectAll("text")
                //     .transition("fadeAxisText")
                //     .duration(500)
                //     .style("fill-opacity", function() {
                //         return d3.select(this).text() === d3.timeFormat("%Y")(point.date)
                //                 ? 1 : 0;
                //     })
            }
        }
    }
}
