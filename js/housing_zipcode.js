var HousingGraph = function(target) {
    var self = this;

    var margin = {top: 60, right: 120, bottom: 20, left: 120};
    self.width = 600; //600 - margin.left - margin.right,
    self.height = 300;// 300 - margin.top - margin.bottom;
    self.lineOffset = self.height * 0.01;
    self.fontsize = 12;

    self.housingTypes = ["1bedroom", "2bedroom", "3bedroom", "4bedroom", "5bedroomOrMore",
                    "all_homes", "Condominium", "SingleFamilyResidence"];

    var darkblue = '#0067A5';
    var graphOffsetBottom = 25;

    var darkgrey = "#4c4c4c";

    var gold = "#F6A600";

    self.x = d3.scaleTime().range([margin.left, self.width - margin.right - 5]);
    self.y = d3.scaleLinear().range([self.height - margin.bottom, margin.top]);

    var dispatch = d3.dispatch("load", "statechange");
    var prevPoint = null;

    self.hide = false;

    self.initialize = function() {
        self.createSVG(target);
        // NOTE: Default is all_homes
        self.generateLineGraph('98105', 5);
    }

    self.createSVG = function(target) {
        if (document.getElementById(target).clientWidth * self.height / self.width >
                document.getElementById(target).clientHeight) {
            self.svg = d3.select("#" + target).append("svg")
                .attr("height", "100%")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + self.width + " " + self.height);
        } else {
            self.svg = d3.select("#" + target).append("svg")
                .attr("width", "100%")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + self.width + " " + self.height);
        }
    }

    self.generateLineGraph = function(selected_zip, housing_id) {
        housing_type = self.housingTypes[housing_id];
        d3.csv("data/housing/seattle_" + housing_type + ".csv", function(d) {
                d.date = Date.parse(d.date);
                return d;
        }, function(error, data) {
                if (error) throw error;
                // Format data so it's easier to plot multiple lines
                reformatData(data);

                // Get the index given the zipcode
                self.index_zip_map = {};
                for (i = 0; i < self.zip_list.length; i++) {
                    var zip = self.zip_list[i][0].zipcode
                    self.index_zip_map[zip] = i;
                }
                self.zip_index = self.index_zip_map[selected_zip]

                self.createAxes(self.zip_index);
                plotLine(self.zip_index);
                drawTitle();
                drawFocus();
                self.hideSelf();
        });
    }

    function reformatData(data) {
        self.zip_list = [];
        var seattle_zips = d3.keys(data[1]);
        for (i = 0; i < seattle_zips.length - 1; i++) {
            zip = [];
            // Start at beginning of 2010, stop at end of 2016
            for (j = 166; j < data.length-2; j++) {
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
        self.yAxisLeft = d3.axisRight().scale(self.y)
            .ticks(6)
            .tickSize(0)
            .tickFormat(d3.format("$,d"));

        // Scale the range of the data (floor the lowest date to jan of that year)
        var xDomain = d3.extent(self.zip_list[self.zip_index], function(d) { return d.date; });
        var firstDate = new Date(xDomain[0].getFullYear(), 0);
        var endDate = new Date(2017, 0, 1);

        self.x.domain([firstDate, endDate]);
        // NOTE: CHANGE ZIP HERE
        self.y.domain([0, 1100000]);

        // append the X Axis
        self.xAxis = self.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + (self.height - margin.bottom) + ")")
            .call(xAxis);

        self.xAxis.selectAll("path")
           .attr("stroke", "none");

        // append the Y Axis
        self.yAxis = self.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (self.width - margin.right) + ", 0)")
            .call(self.yAxisLeft);

        self.yAxis.selectAll("path")
            .attr("stroke", "none");

        self.xAxis.selectAll("text")
            .attr("fill", darkgrey)
            .attr("font-size", "10px")
            .attr("font-family", "Open Sans");

        self.yAxis.selectAll("text")
            .attr("fill", darkgrey)
            .attr("font-size", "10px")
            .attr("font-family", "Open Sans");
    }

    function plotLine(zip_index) {
        self.valueline = d3.line()
            .x(function(d) { return self.x(d.date); })
            .y(function(d) { return self.y(d.price); });

        self.areaUnder = d3.area()
    		.x(function(d) { return self.x(d.date); })
    		.y0(self.height - margin.bottom)
    		.y1(function(d) { return self.y(d.price); });

        self.svg.append("path")
            // NOTE: CHANGE ZIP HERE
            .datum(self.zip_list[self.zip_index])
            .attr("class", "housingLine")
            .attr("fill", "none")
            .attr("stroke", darkblue)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 2)
            .attr("d", self.valueline);

        self.under = self.svg.append("path")
            .datum(self.zip_list[self.zip_index])
            .attr("class", "under")
            .attr("d", self.areaUnder)
            .attr("fill", darkblue)
            .style("opacity", 1);
    }

    function drawTitle() {
        self.svg.append("text")
            .attr("transform", "translate(" + (self.width - margin.right + 4) + ", 50)")
            .attr("font-size", "12px")
            .attr("fill", darkgrey)
            .attr("font-family", "Open Sans")
            //.attr("text-anchor", "middle")
            .text("Median Home Value");
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
                });

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

        var midY = self.y(self.lastValue) / 1.2;

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
            .attr("width", self.width - margin.left - margin.right)
            .attr("height", self.height)
            .attr("x", margin.left)
            .attr("y", 0)
            .style("pointer-events", "all")
            .on("mouseenter", function() {
                //self.focusIn();
            })
            .on("mouseleave", function() {
                self.mousemove(new Date(self.year, 11, 31), 0, gold, "white");
            })
            .on("mousemove", function() {
                self.mousemove(self.x.invert(d3.mouse(this)[0]), 0, self.color, "white")
            });

        self.focusIn();
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
    self.mousemove = function(date, duration, circleColor, lineColor) {
        var i = self.bisectDate(self.zip_list[self.zip_index], date, 1);
        var d0 = self.zip_list[self.zip_index][i - 1];
        var d1 = self.zip_list[self.zip_index][i];
        if (typeof d0 != 'undefined' && typeof d1 != 'undefined') {
            point = date - d0.date > d1.date - date ? d1: d0;
            if (prevPoint != point) {
                prevPoint = point;
                d3.selectAll(".houseFocusCircle")
                    .transition()
                    .duration(duration)
                    .attr("fill", circleColor)
                    .attr("cx", self.x(point.date))
                    .attr("cy", self.y(point.price));

                /* Adjust part line */
                d3.selectAll("#housePart")
                    .style("stroke", lineColor)
                    .attr("x1", self.x(point.date))
                    .attr("y1", self.height - self.lineOffset - margin.bottom)
                    .attr("x2", self.x(point.date))
                    .attr("y2", self.y(point.price) + self.lineOffset);

                var textX = self.x(point.date)
                var textOffset = self.width * 0.05 + self.fontsize * 2;
                textX = self.x(point.date) <= (self.width / 2) ? textX + self.width * 0.03 : textX - self.width * .03;

                /** Adjust focus text */
                d3.selectAll("#housePartText")
                    .transition()
                    .duration(duration)
                    .attr("x", textX)
                    //.attr("y", (self.y(point.price) + self.height) / 2)
                    .attr("y", self.y(point.price) / 1.2)
                    .text(d3.timeFormat("%b %Y")(point.date));

                d3.selectAll("#houseWholeText")
                    .transition()
                    .duration(duration)
                    .attr("x", textX)
                    //.attr("y", (self.y(point.price) + self.height) / 2 - self.fontsize * 1.5)
                    .attr("y", self.y(point.price) / 1.2 - self.fontsize * 1.5)
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

    /*********
     * UPDATE *
     *********/
    self.update = function(housing_id, selected_zip, currYear, color){
      self.year = currYear;
      self.color = color;
      housing_type = self.housingTypes[housing_id];
      self.zip_index = self.index_zip_map[selected_zip];

      d3.csv("data/housing/seattle_" + housing_type + ".csv", function(d) {
          d.date = Date.parse(d.date);
          return d;
      }, function(error, data) {
          if (error) throw error;
          reformatData(data);
          updateViz();
      });
    }

    self.updateFill = function(color) {
        var line = self.svg.select(".housingLine");
        line
          .transition()
          .duration(800)
          .attr("stroke", self.color);

        self.under
          .transition()
          .duration(800)
          .attr("fill", self.color)
          .style("opacity", 1);
    }

    function updateViz(){
      updateAxes();
      updateLine();
    }

    function updateAxes(){
      self.y.domain([0, 1100000]);

      self.svg.select(".y.axis")
        .transition()
        .duration(1000)
        .call(self.yAxisLeft)
        .selectAll("text")
        .attr("fill", darkgrey)
        .attr("font-size", "10px")
        .attr("font-family", "Open Sans");
    }

    function updateLine(){
      var line = self.svg.select(".housingLine");
      line.datum(self.zip_list[self.zip_index])
        .transition()
        .duration(800)
        .attr("stroke", self.color)
        .attr("d", self.valueline)

      self.under
        .datum(self.zip_list[self.zip_index])
        .transition()
        .duration(800)
        .attr("d", self.areaUnder)
        .attr("fill", self.color)
        .style("opacity", 1);

    self.xAxis.selectAll("text")
        .attr("font-family", "Open Sans");

    self.yAxis.selectAll("text")
        .attr("font-family", "Open Sans");

        self.svg.selectAll("text")
            .style("user-select", "none")
            .style("-webkit-user-select", "none")
            .style("-moz-user-select", "none")

      self.mousemove(self.x.invert(self.svg.select(".houseFocusCircle").attr("cx")), 800, gold, "white");
    }

    self.showSelf = function() {
        if (self.hide) {
            self.hide = false;
            self.svg.select(".hide")
                .selectAll("text")
                .remove();
            self.svg.select(".hide")
                .transition()
                .duration(500)
                .style("opacity", 0)
                .remove();

            self.svg.selectAll("text")
                .style("user-select", "none")
                .style("-webkit-user-select", "none")
                .style("-moz-user-select", "none")
        }
    }

    self.hideSelf = function(zip) {
        //// overlay to hide ////
        if (!self.hide) {
            self.hide = true;
            self.hide = self.svg.append("g")
                .attr("class", "hide")

            self.hide
                .append("rect")
                .style("opacity", 0)
                .attr("width", self.width)
                .attr("height", self.height)
                .attr("fill", "white")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .on("end", showPrompt);

            var text = zip === true ? "No Data Available" : "Select a ZIP on the Map";
            function showPrompt() {
                self.hide
                    .append("text")
                    .attr("transform", "translate(" + (self.width / 2) + "," + (self.height / 2)  +")")
                    .attr("text-anchor", "middle")
                    .attr("font-family", "Open Sans")
                    .attr("font-size", "24px")
                    .text(text)
                }
        }
    }

}
