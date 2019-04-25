/** GLOBALS */
// for first time loading animations
var slideOne = false;
var slideTwo = false;
var slideThree = false;
var slideFour = false;
var slideFive = false;
var slideSix = false;
var slideSeven = false;

var ZIPS = ['98118', '98119', '98116', '98117', '98115', '98112', '98195', '98199', '98178', '98144',
				'98122', '98164', '98121', '98109', '98108', '98105', '98104', '98107', '98106', '98101', '98126', '98103', '98102', '98125', '98146', '98134', '98136', '98154', '98133', '98174', '98177'];

var SECTORS = ['Fortnite','League of Legends', 'World of Warcraft'];

var kelly_colors = ['#F99379', '#E25822', '#654522', '#C2B280', '#F38400', '#DCD300',
    '#882D17', '#F3C300', '#F6A600', '#BE0032', '#A1CAF1', '#0067A5', '#E68FAC', '#B3446C',
    '#008856', '#2B3D26', '#604E97', '#8DB600', '#875692', '#222222', '#848482', '#000000'];

var light_colors = ['#FFB5A2', '#F17C4D', '#795B3B', '#E8DCB5', '#FFA234', '#FDF425',
        '#AF4F38', '#FFD734', '#FFBD35', '#E31A50', '#D1E6FB', '#0094EC', '#F1B8CB',
        '#D57194', '#43B58A', '#4F6648', '#8475B3', '#B5E60A', '#A780AF', '#5F5E5E', '#B1B1AE']

var gold = "#F6A600";

var sector = 1;
var year = 2016;
var bizMapYear = 0;
var cities;

$(document).ready(function() {
    $('body').removeClass('fade-out');
	$('#fullpage').fullpage({
		//Navigation
		menu: '#menu',
		lockAnchors: false,
		anchors:['firstPage', 'secondPage',  'thirdPage', 'fourthPage', 'fifthPage', 'sixthPage', 'seventhPage', 'eigthPage', 'ninthPage', 'tenthpage'],
		navigation: true,
		navigationPosition: 'right',
		navigationTooltips: ['Introduction', 'Popular Games', 'ESPORTS', 'Biggest Games', 'Mobile Games', 'Sources'],
		showActiveTooltip: false,
		slidesNavigation: true,
		slidesNavPosition: 'bottom',

		//Scrolling
		css3: true,
		scrollingSpeed: 700,
		autoScrolling: true,
		fitToSection: false,
		fitToSectionDelay: 100,
		scrollBar: false,
		easing: 'easeInOutCubic',
		easingcss3: 'ease',
		loopBottom: false,
		loopTop: false,
		loopHorizontal: true,
		continuousVertical: false,
		continuousHorizontal: false,
		scrollHorizontally: false,
		interlockedSlides: false,
		dragAndMove: false,
		offsetSections: false,
		resetSliders: false,
		fadingEffect: false,
		normalScrollElements: '#element1, .element2',
		scrollOverflow: false,
		scrollOverflowReset: false,
		scrollOverflowOptions: null,
		touchSensitivity: 15,
		normalScrollElementTouchThreshold: 5,
		bigSectionsDestination: null,

		//Accessibility
		keyboardScrolling: true,
		animateAnchor: true,
		recordHistory: true,

		//Design
		controlArrows: true,
		verticalCentered: false,
		//sectionsColor : ['#fcfcfc', '#fcfcfc'],
		//paddingTop: '0em',
		paddingBottom: '10px',
		fixedElements: '#header, .footer',
		responsiveWidth: 0,
		responsiveHeight: 0,
		responsiveSlides: false,
		parallax: false,
		parallaxOptions: {type: 'reveal', percentage: 62, property: 'translate'},

		//Custom selectors
		sectionSelector: '.section',
		slideSelector: '.slide',

		lazyLoading: true,

		//events
		onLeave: function(index, nextIndex, direction){},
		afterLoad: function(anchorLink, index){
			if (index == 1 && !slideOne) {
				slideOne = true;
			}
			if (index == 3 && !slideThree) {
				slideThree = true;
				techPlot.showAnnotations();
				techPlot.allowMouse();
			}
			if (index == 4 && !slideFour) {
				slideFour = true;
				taxiPlot.showAnnotations();
				taxiPlot.allowMouse();
			}
            if (index == 5 && !slideFive) {
                slideFive = true;
                /** Animate the map when the user is not using it */
                var passive;
                bizMapYear = 0;
                var active = false;
                function step() {
                    businessMap.step(bizMapYear % 7);
                    bizMapYear++;
                }
                function check() {
                    if (businessMap.active) {
                        active = false;
                        window.clearInterval(passive);
                    } else {
                        if (!active) {
                            active = true;
                            passive = window.setInterval(step, 1000);
                        }
                    }
                }
                var checker = window.setInterval(check, 100);
            }
            if (index == 6 && !slideSix) {
                sf.showAnnotations();
                sf.allowMouse();
                la.showAnnotations();
                la.allowMouse();
                ny.showAnnotations();
                ny.allowMouse();
                seattle.showAnnotations();
                seattle.allowMouse();
            }
            if (index == 7 && !slideSeven) {
                for (var i = 0; i < citydemands.length; i++) {
                    citydemands[i].showAnnotations();
                    citydemands[i].allowMouse();
                }
            }
			/*if (index == 2 && !slideTwo) {
				slideTwo = true;
				var businessVis = new BusinessVis("businessVisualization");
				businessVis.initialize();
			}*/
		},
		afterRender: function(){},
		afterResize: function(){},
		afterResponsive: function(isResponsive){},
		afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex){},
		onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex){}
	});

    var options = {
        useEasing : true,
        useGrouping : true,
        separator : ',',
        decimal : '.',
    };
    var EAGraph = new SimpleLine("businessOverview", "RevenueEA.csv", '#F99379');
    EAGraph.initialize();

    var housingGraph = new SimpleLine("homeOverview", "Revenue(Activison Blizzard).csv", '#0067A5');
    housingGraph.initialize();
    options.prefix = '$';
    var businessCount = new CountUp("businessOverviewCount", 0, 9000000000, 0, 2, options);
    businessCount.start();
    options.prefix = '$';
    var housePriceCount = new CountUp("homeOverviewCount", 0, 9000000000, 0, 2, options);
    housePriceCount.start();

    var biggestGame = biggestGames();
    

	var businessVis = new BusinessVis("businessVisualization");
	businessVis.initialize();
    var bizviz0 = document.getElementById("bizviz0");
    var happened = false;
    bizviz0.onmouseover = function(event) {
        if (!happened) {
            happened = true;
            var yearBar = businessVis.svg.select(".year" + 2014);
            businessVis.previousBar = businessVis.svg.select(".year" + 2010);
            yearBar.each(function() {
                businessVis.dotEnter(this);
            });
            bizviz1.onmouseover = hideDots;
        }
    }
    var bizviz1 = document.getElementById("bizviz1");

    function hideDots(event) {
        if (!businessVis.active) {
            happened = false;
            businessVis.hideDotView();
        }
    }

	var techPlot = new SimplePArea("techPlot", "tech.csv", '#E68FAC', '#0067A5', 'tech');
	techPlot.initialize();
    // var tech0 = document.getElementById("tech0");
    // tech0.onmouseover = function(event) {
    //     techPlot.hideAnnotations();
    //     techPlot.focusIn();
    //     techPlot.mousemove(new Date(2011, 0), 500);
    // }
    // tech0.onmouseout = function(event) {
    //     techPlot.showAnnotations();
    //     techPlot.mousemove(new Date(2010, 0), 500);
    //     techPlot.focusOut();
    // }

	var taxiPlot = new SimplePArea("taxiPlot", "taxi.csv", '#F99379', '#0067A5', 'taxi');
	taxiPlot.initialize();
    var taxi0 = document.getElementById("taxi0");
    taxi0.onmouseover = function(event) {
        taxiPlot.hideAnnotations();
        taxiPlot.focusIn();
        taxiPlot.mousemove(new Date(2014, 0), 500);
    }
    taxi0.onmouseout = function(event) {
        taxiPlot.showAnnotations();
        taxiPlot.mousemove(new Date(2016, 0), 500)
        taxiPlot.focusOut();
    }


    /** Slide 5 */
    var businessMap = new SeattleZipMapBusiness("businessMap");
    createBusinessMenu(businessMap);
    var bizMapColumn = document.getElementById("businessMapColumn");
    bizMapColumn.onmouseenter = function(event) {
        businessMap.active = true;
    }
    bizMapColumn.onmouseleave = function(event) {
        businessMap.active = false;
    }
    var dropbutton = document.getElementById("dropbutton");
    dropbutton.style.backgroundColor = "white";

    var sector0 = document.getElementById("mapsector0");
    sector0.onmouseover = function(event) {
        businessMap.update(businessMap.sectorNames.indexOf('Transportation and Warehousing'))
        bizMapYear = 0;
        businessMap.step(0);
        dropbutton.innerHTML = 'Transportation and Warehousing' + " &#9662;";
    }

    /** Slide 6 */
    var sf = new CityHousing("sanfrancisco", "sfhousing.csv", '#E68FAC', "San Francisco");
    sf.initialize();
    var ny = new CityHousing("newyork", "nyhousing.csv", '#BE0032', "New York");
    ny.initialize();
    var la = new CityHousing("losangeles", "lahousing.csv", '#F99379', "Los Angeles");
    la.initialize();
    var seattle = new CityHousing("seattle", "seattlehousing.csv", '#0067A5', "Seattle");
    seattle.initialize();
    cities = [ny, la, sf, seattle];
    for (var i = 0; i < cities.length; i++) {
        var city = cities[i];
        city.onmousemove = function(target) {
            var date = city.x.invert(d3.mouse(target)[0]);
            for (var j = 0; j < cities.length; j++) {
                cities[j].mousemove(date);
            }
        }
        city.onmouseenter = function(target) {
            for (var j = 0; j < cities.length; j++) {
                cities[j].hideAnnotations();
                cities[j].focusIn();
            }
        }
        city.onmouseleave = function(target) {
            for (var j = 0; j < cities.length; j++) {
                cities[j].showAnnotations();
                cities[j].focusOut();
            }
        }
    }
    var percentages = ["+39%", "+50%", "+68%", "+69%"];
    var cityhousing0 = document.getElementById("cityhousing0");
    cityhousing0.onmouseover = function(event) {
        for (var i = 0; i < cities.length; i++) {
            cities[i].hideAnnotations();
            cities[i].display(percentages[i]);
        }
    }
    cityhousing0.onmouseout = function(event) {
        for (var i = 0; i < cities.length; i++) {
            cities[i].showAnnotations();
            cities[i].hideDisplay();
        }
    }

    /** Housing Demand */
    var chicagodemand = new CityDemand("sfdemand", "sfdemand.csv", '#E68FAC', "San Francisco");
    chicagodemand.initialize();
    var lademand = new CityDemand("losangelesdemand", "lademand.csv", '#F99379', "Los Angeles");
    lademand.initialize();
    var seattledemand = new CityDemand("seattledemand", "seattledemand.csv", '#0067A5', "Seattle");
    seattledemand.initialize();
    citydemands = [chicagodemand, lademand, seattledemand];
    for (var i = 0; i < citydemands.length; i++) {
        var citydemand = citydemands[i];
        citydemand.onmousemove = function(target) {
            var date = citydemand.x.invert(d3.mouse(target)[0]);
            for (var j = 0; j < citydemands.length; j++) {
                citydemands[j].mousemove(date);
            }
        }
        citydemand.onmouseenter = function(target) {
            for (var j = 0; j < citydemands.length; j++) {
                citydemands[j].hideAnnotations();
                citydemands[j].focusIn();
            }
        }
        citydemand.onmouseleave = function(target) {
            for (var j = 0; j < citydemands.length; j++) {
                citydemands[j].showAnnotations();
                citydemands[j].focusOut();
            }
        }
    }
    var demand0 = document.getElementById("demand0");
    demand0.onmouseover = function(event) {
        demandShow(new Date(2016, 11));
        demand0.style.backgroundColor = '#D1E6FB';
    }
    demand0.onmouseout = function(event) {
        demandHide();
        demand0.style.backgroundColor = '#A1CAF1';
    }


    var miniHousing = new HousingGraph("miniHousing");
    miniHousing.initialize();

    var radial = new RadialBusiness("radialBusiness");
    radial.initialize(2016);

    var map = new SeattleZipMapHousing("bigmap");


    map.onclick = function(d, element) {
        radial.showSelf();
        radial.elementClicked = null;
        radial.selectedSector = null;
        radial.selectedSector = "";
        map.zip = d.properties.GEOID10;
        radial.update(ZIPS.indexOf(map.zip), map.year);
        if(map.zip === '98134'){
        	miniHousing.hideSelf(true);
        }
        else{
        	miniHousing.showSelf();
        	miniHousing.update(5, map.zip, map.year, d3.select(element).attr("fill"));
        }

	}

    map.slideStop = function() {
        if (map.selectedRegion) {
            year = map.sliderScale.invert(map.svg.select(".handle").attr("cx"));
            radial.update(radial.zip, year);
            miniHousing.year = year;
            miniHousing.updateFill(map.selectedRegion.attr("fill"));
            miniHousing.mousemove(new Date(map.year, 11, 31), 0, gold, "white");
        }
    }

    map.blankClick = function() {
        // radial.hideSelf();
        // miniHousing.hideSelf();
    }
});

function cityShow(date) {
    for (var i = 0; i < cities.length; i++) {
        cities[i].hideAnnotations();
        cities[i].focusIn();
        cities[i].mousemove(date, 0);
    }
}

function cityHide() {
    for (var i = 0; i < cities.length; i++) {
        cities[i].showAnnotations();
        cities[i].focusOut();
    }
}

function demandShow(date) {
    for (var i = 0; i < cities.length; i++) {
        citydemands[i].hideAnnotations();
        citydemands[i].focusIn();
        citydemands[i].mousemove(date, 0);
    }
}

function demandHide() {
    for (var i = 0; i < cities.length; i++) {
        citydemands[i].showAnnotations();
        citydemands[i].focusOut();
    }
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
    var button = document.getElementById('dropbutton');
    button.onmousenter = function() {
        businessMap.active = true;
    }
}

function createBusinessMenu(businessMap) {
    var dropdowns = document.getElementById("myDropdown");
    for (var i = 0; i < SECTORS.length; i++) {
        var item = document.createElement('a')
        item.innerHTML = businessMap.sectorNames[i];
        item.setAttribute("data-index", i)
        item.onclick = function(event) {
            dropbutton.innerHTML = event.target.innerHTML + " &#9662;";
            dropbutton.setAttribute("data-index", event.target.getAttribute("data-index"))
            businessMap.update(event.target.getAttribute("data-index"));
        }
        item.onmouseenter = function(event) {
            businessMap.active = true;
            event.target.style.backgroundColor = businessMap.kelly_colors[event.target.getAttribute("data-index")];
            event.target.style.color = "white";
            event.target.style.opacity = 1;
        }
        item.onmouseleave = function(event) {
            event.target.style.backgroundColor = "white";
            event.target.style.color = "black";
            event.target.style.opacity = 1;
        }
        dropdowns.appendChild(item);
    }

    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }
}
