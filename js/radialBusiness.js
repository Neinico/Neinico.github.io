var RadialBusiness = function(target) {

    var self = this;
    var target = target;
    self.margin = {top: 0, bottom: 0, left: 0, right: 0};
    var zips = ['98118', '98119', '98116', '98117', '98115', '98112', '98195', '98199', '98178',       '98144', '98122', '98164', '98121', '98109', '98108', '98105', '98104', '98107', '98106', '98101', '98126', '98103', '98102', '98125', '98146', '98134', '98136', '98154', '98133', '98174', '98177'];

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

    var normopacity = .8;
    var fadeopacity = .4;
    var duration = 250;

    self.zip = 20;
    self.year;
    self.sectors = new Array();
	for (var i = 0; i < sectorNames.length; i++) {
		self.sectors.push(sectorNames[i].toLowerCase().split(' ').join('_'));
	}

var gradient = ["#420505", "#4A1010", "#531B1C", "#5C2628", "#653234", "#6E3D40", "#76484C", "#7F5357", "#885F63", "#916A6F", "#9A757B", "#A28087", "#AB8C93", "#B4979F", "#BDA2AA", "#C6ADB6", "#CEB9C2", "#D7C4CE", "#E0CFDA", "#E9DAE6", "#F2E6F2"]

    self.hide = false;

    self.colors = d3.scaleOrdinal().domain(self.sectors).range(gradient);

    self.initialize = function(currYear) {
        if (self.initialized) {
            return true;
        }
        self.initialized = true;
        self.year = currYear;
        d3.csv("data/zip_counts_by_sector/" + zips[self.zip] + ".csv",
                function(data) {
                    self.dataset = data;
                    generate();
        });

    }

    function generate() {
        self.elementClicked = null
        var parent = document.getElementById(target);
        self.width = 1600;
        self.height = 800;

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

        self.canvas = self.svg.append("g")
            .attr("transform", "translate(" + (self.width / 2) + ", " + self.height / 2 + ")");

        var barmargin = self.width / 32;
        var barwidth = 400//- barmargin * 2;
        self.bar = self.svg.append("svg")
            .attr("id", "miniBusiness")
            .attr("x", self.width / 2 - barwidth / 2)
            .attr("y", self.height / 2 - barwidth / 2)
            .attr("width", barwidth)
            .attr("height", barwidth);

        self.inner = new ZipVis("miniBusiness");
        self.inner.initialize(-1,0, self.year);

        self.radius = self.height / 2;

        var row = Object.entries(self.dataset[self.year - 2010]);
        self.transposed = [];
        for (var i = 1; i < row.length; i++) {
            self.transposed.push({
                sector: row[i][0],
                count: parseInt(row[i][1])
            })
        }

        self.path = d3.arc()
            .outerRadius(self.radius - 50)
            .innerRadius(self.radius - 110);

        self.outerArc = d3.arc()
            .outerRadius(self.radius - 30)
            .innerRadius(self.radius - 30)

        self.pie = d3.pie()
            .sort(function(a, b) {
                return b.count - a.count;
            })
            .value(function(d) { return d.count; })

        self.arcs = self.canvas.selectAll("path")
            .data(self.pie(self.transposed))
            .enter()
            .append("path")
                .attr("class", "arcpath")
                .attr("d", self.path)
                .each(function(d) { this._current = d; })
                .attr("id", function(d, i) {
                    return i;
                })
                .style("fill", function(d) {
                    return self.colors(d.data.sector);
                })
                .style("fill-opacity", 1)
                .style("stroke-width", 1)
                .style("stroke", "white")
                .attr("cursor", "pointer")
                .on("mouseover", function() {
                    showLabel(this);
                })
                .on("mouseout", function() {
                    showLabel(null);
                })
                .on("click", function(d) {
                    if(this == self.elementClicked){
                        moveOut(null);
                        self.elementClicked = null;
                        self.selectedSector = null;
                        self.inner.update(-1,self.zip, self.year);
                    }
                    else {
                        //self.inner.update(d3.select(this).attr("id"), self.zip);
                        self.selectedSector = d.data.sector;
                        self.elementClicked = this;
                        var sector_name = d.data.sector;
                        moveOut(this);
                        var index = self.sectors.indexOf(sector_name);
                        self.inner.update(index,self.zip, self.year);
                    }
                });

        self.svg.append("text")
            .attr("id", "zipTitle")
            .attr("class", "unselectable")
            .attr("x", 0)
            .attr("y", 100)
            .attr("font-size", 64)
            .style("opacity", 0)
            .text(zips[self.zip]);

        drawLabels();
        self.hideSelf();

    }

    function drawLabels() {
        var pieData = self.pie(self.transposed);

        // sort the data by count to find the top 5
        var copy = [];
        for (var i = 0; i < pieData.length; i++) {
            copy.push(pieData[i]);
        }
        copy.sort(function(a, b) {
            return b.data.count - a.data.count;
        })
        self.topSectors = []
        for (var i = 0; i < 5; i++) {
            self.topSectors.push(copy[i].data.sector);
        }

        self.text = self.canvas.selectAll("text")
            .data(pieData);

        self.text
            .enter()
    		.append("text")
            .attr("class", "labeltext")
    		.attr("dominant-baseline", "middle")
            .style("-webkit-user-select", "none")
            .style("-moz-user-select", "none")
            .style("-ms-user-select", "none")
            .style("cursor", "default")
            .style("opacity", function(d) {
                return self.topSectors.indexOf(d.data.sector) != -1 ? 1 : 0;
            })
    		.text(function(d) {
    			return sectorNames[self.sectors.indexOf(d.data.sector)];
    		});

        function midAngle(d) {
        	return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        self.canvas.selectAll("text")
            .transition()
            .duration(1000)
    		.attrTween("transform", function(d) {
    			this._current = this._current || d;
    			var interpolate = d3.interpolate(this._current, d);
    			this._current = interpolate(0);
    			return function(t) {
    				var d2 = interpolate(t);
    				var pos = self.outerArc.centroid(d2);
    				return "translate("+ pos +")";
    			};
    		})
    		.styleTween("text-anchor", function(d){
    			this._current = this._current || d;
    			var interpolate = d3.interpolate(this._current, d);
    			this._current = interpolate(0);
    			return function(t) {
    				var d2 = interpolate(t);
    				return midAngle(d2) < Math.PI ? "start":"end";
    			};
    		});
    }

    self.update = function(zipId, currYear) {
        var prevZip = self.zip;
        self.zip = zipId;
        self.year = currYear;
        d3.csv("data/zip_counts_by_sector/" + zips[self.zip] + ".csv",
                function(data) {
                    self.dataset = data;
                    if (prevZip != self.zip) {
                        self.svg.select("#zipTitle").text(zips[self.zip])
                            .transition().duration(500)
                            .attr("fill", "#F6A600")
                            .transition().duration(500)
                            .attr("fill", "black")
                    }
                    updateGraph();
                    updateLabels();
                    self.inner.update(-1, self.zip, self.year);
        });
    }

    function updateLabels() {
        var pieData = self.pie(self.transposed);

        // sort the data by count to find the top 5
        var copy = [];
        for (var i = 0; i < pieData.length; i++) {
            copy.push(pieData[i]);
        }
        copy.sort(function(a, b) {
            return b.data.count - a.data.count;
        })
        self.topSectors = []
        for (var i = 0; i < 5; i++) {
            self.topSectors.push(copy[i].data.sector);
        }

        self.text = self.canvas.selectAll("text")
            .data(pieData);

        self.text
            .attr("font-size", "20px")
            .text(function(d) {
                return sectorNames[self.sectors.indexOf(d.data.sector)];
            });

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        self.canvas.selectAll("text")
            .transition()
            .duration(1000)
            .style("opacity", function(d) {
                return self.topSectors.indexOf(d.data.sector) != -1 ? 1 : 0;
            })
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = self.outerArc.centroid(d2);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });

    }

    function updateGraph() {
        var row = Object.entries(self.dataset[self.year-2010]);
        self.transposed = [];
        for (var i = 1; i < row.length; i++) {
            self.transposed.push({
                sector: row[i][0],
                count: parseInt(row[i][1])
            })
        }
        moveOut(null);
        self.arcs.data(self.pie(self.transposed));
        self.arcs
            .transition("changeZip")
            .duration(750)
            .delay(function(d, i) {
                return self.sectors.indexOf(d.data.sector) * 75;
            })
            .attrTween("d", arcTween);
    }

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return self.path(i(t));
        };
    }

    function moveOut(element) {
        var outpath = d3.arc()
            .innerRadius(function() {
                return this === element ? self.radius - 90 : self.radius - 110;
            })
            .outerRadius(function() {
                return this === element ? self.radius - 30 : self.radius - 50;
            });

        var outer = d3.arc()
            .innerRadius(self.radius - 15)
            .outerRadius(self.radius - 15);

        self.canvas.selectAll(".arcpath")
            .transition("moveOut")
            .attr("d", outpath);

        self.canvas.selectAll(".arcpath")
            .style("fill-opacity", function() {
                return this === element ? 1 : 1;
            });

        var sector;
        if (element != null) {
            sector = d3.select(element).datum().data.sector;
        } else {
            sector = null;
        }
        self.canvas.selectAll(".labeltext")
            .style("opacity", function(d) {
                return d.data.sector === sector
                    || self.topSectors.indexOf(d.data.sector) != -1
                    || d.data.sector == self.selectedSector ? 1 : 0;
            })
            .transition("labelMove")
            .attr("transform", function(d) {
                var pos;
                if (d.data.sector === sector) {
                    pos = outer.centroid(d);
                } else {
                    pos = self.outerArc.centroid(d);
                }
                return "translate(" + pos + ")";
            });
    }

    function showLabel(element) {
        var sector = element != null ? d3.select(element).datum().data.sector : null;
        self.canvas.selectAll(".labeltext")
            .style("font-weight", function(d) {
                return d.data.sector === sector
                    || d.data.sector == self.selectedSector ? 600 : 300;
            })
            .style("opacity", function(d) {
                return d.data.sector === sector
                    || self.topSectors.indexOf(d.data.sector) != -1
                    || d.data.sector == self.selectedSector ? 1 : 0;
            });
    }

    function fadeOthers(element) {
        function match(current, target) {
            return current === target;
        }

        d3.selectAll("g.arc")
            .transition("fadeOthers")
            .duration(duration)
            .style("fill-opacity", function(){
                return match(this, element) ? normopacity : fadeopacity;
            })
            .style("stroke-opacity", function(){
                return match(this,element) ? normopacity : fadeopacity;
            });
    }

    function unFadeAll(){
        d3.selectAll("g.arc")
            .transition("unFadeAll")
            .style("fill-opacity", normopacity)
            .style("stroke-opacity", normopacity);
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

            self.svg.select("#zipTitle")
                .transition("hideZip")
                .duration(500)
                .style("opacity", 1);
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
                .attr("x", 100)
                .attr("width", self.width - 100)
                .attr("height", self.height)
                .attr("fill", "white")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .on("end", showPrompt);

            self.svg.select("#zipTitle")
                .transition("hideZip")
                .duration(500)
                .style("opacity", 0);

            var text = "";
            function showPrompt() {
                self.hide
                    .append("text")
                    .attr("transform", "translate(" + (self.width / 2) + "," + (self.height / 2)  +")")
                    .attr("text-anchor", "middle")
                    .attr("font-family", "Open Sans")
                    .attr("font-size", "32px")
                    .text(text)
                }
        }
    }
}
