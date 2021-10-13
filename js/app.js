//variables and colors for labels
var year_col = ['#578131', '#36c9c5', '#836f90', '#030563', '#db5957', '#c1299b'];
var year_lab = ['0-10 (0)', '11-20 (1)', '21-40 (2)', '41-60 (3)', '61-80 (4)', '>80 (5)'];
var role_lab = ['Male (0)', 'Female (1)', 'Pump', 'brewe_loc', 'main_loc'];
var role_col = ["#1e377b", "#f15b7e", "#310202", "#caad1c", "#c9531d"];
var x, y;
var margin = {
		top: 19,
		right: 19,
		bottom: 49,
		left: 69
	},
	width = 599 - margin.left - margin.right,
	height = 399 - margin.top - margin.bottom;
//variables for data
var pumps, people_diedSex, streets, people_died, deathdays, agegraph, chartpi, brewe_loc, main_loc;
//chart for multi use
var mfig
//variables for tooltips
var duraton_tip, chartpi_tip, loc_tip, graphpi_tip;
var zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
	.on("zoom", zoomed);
var drag = d3.behavior.drag()
	.origin(function (d) {
		return d;
	})
	.on("dragstart", pushstarted)
	.on("drag", pushed)
	.on("dragend", push_end);
window.onload = function () {
	//set click events
	document.getElementById('byAge').onclick = () => {
		d3.selectAll("circle").remove();
		drawItemsToMap();
		var xlog = d3.scale.linear();
		var ylog = d3.scale.linear();
		xlog.domain([0, 15]).range([0, 499]);
		ylog.domain([15, 0]).range([0, 499]);
		mfig.selectAll("circle")
			.data(people_diedSex)
			.enter().append("circle")
			.attr("cy", function (d) {
				return ylog(d.y);
			})
			.attr("cx", function (d) {
				return xlog(d.x);
			})
			.attr("r", 5)
			.style("fill", function (d) {
				return year_col[d.age];
			})
			.call(loc_tip)
			.on('mouseover', loc_tip.show)
			.on('mouseout', loc_tip.hide);
	};
	document.getElementById('byGender').onclick = () => {
		d3.selectAll("circle").remove();
		drawItemsToMap();
		var xlog = d3.scale.linear();
		var ylog = d3.scale.linear();
		xlog.domain([0, 15]).range([0, 499]);
		ylog.domain([15, 0]).range([0, 499]);
		mfig.selectAll("circle")
			.data(people_diedSex)
			.enter().append("circle")
			.attr("cy", function (d) {
				return ylog(d.y);
			})
			.attr("cx", function (d) {
				return xlog(d.x);
			})
			.attr("r", 5)
			.style("fill", function (d) {
				return role_col[d.gender];
			})
			.call(loc_tip)
			.on('mouseover', loc_tip.show)
			.on('mouseout', loc_tip.hide);
	}
	document.getElementById('zoomIn').onclick = () => {
		zoomClick('forward');
	}
	document.getElementById('zoomOut').onclick = () => {
		zoomClick('backward');
	}
	//get data at first from all our csv / json files.
	d3.csv("data/pumps.csv", function (list) {
		pumps = list;
		d3.csv("data/deaths_age_sex.csv", function (error, list) {
			people_diedSex = list;
			d3.csv("data/deathdays.csv", function (error, list) {
				deathdays = list;
				d3.json("data/streets.json", function (error, list) {
					streets = list;
					d3.csv("data/brewe_loc.csv", function (error, list) {
						brewe_loc = list;
						d3.csv("data/main_loc.csv", function (error, list) {
							main_loc = list;
							d3.json("data/barData.json", function (error, list) {
								agegraph = list;
								d3.json("data/genderData.json", function (error, list) {
									chartpi = list;
									createToolTips();
									createPieChart();
									createchartpiChart();
									createMapChart();
									createTimeChart();
									document.getElementById('byAge').click();
									createMapDetails();
								});
							});
						});
					});
				});
			});
		});
	});
}

function createToolTips() {
	duraton_tip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>date: </strong><span style='color:#43568d'>${d.date}</span></p>
					<p style="font-size: 12px"><strong>people_died: </strong> <span style='color:#397979'>${d.deaths}</span></p>`;
		});

	chartpi_tip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>year Group: </strong><span style='color:#397979'>${d.data.age} (${d.data.ageGroup})</span></p>
					<p style="font-size: 12px"><strong>Total people died: </strong><span style='color:#397979'>${d.data.totalDeaths}</span></p>
					<p style="font-size: 12px"><strong>Percentage of people died: </strong><span style='color:#397979'>${d.data.deathsPercent}%</span></p>`;
		})

	loc_tip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>year Group: </strong><span style='color:#397979'>${d.age} (${+d.age === 0 ? '0-10' : +d.age === 1 ? '11-20' : +d.age === 2 ? '21-40' : +d.age === 3 ? '41-60' : +d.age === 4 ? '61-80' : '>80'})</span></p>
					<p style="font-size: 12px"><strong>Gender: </strong><span style='color:#397979'>${+d.gender === 0 ? 'Male (0)' : 'Female (1)'}</span></p>`;
		})

	graphpi_tip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>Gender: </strong><span style='color:#397979'>${d.data.label} (${d.data.gender})</span></p>
					<p style="font-size: 12px"><strong>Total people died: </strong><span style='color:#397979'>${d.data.totalDeaths}</span></p>
					<p style="font-size: 12px"><strong>Percentage of people died: </strong><span style='color:#397979'>${d.data.deathsPercent}%</span></p>`;
		})
}

//draw timeline graph
function createTimeChart() {
	var svg = d3.select("#time_chart")
		.append("svg")
		.attr("id", "timeline")
		.attr("width", "599")
		.attr("height", "749")
		.append("g")
		.attr("transform", "translate(50,349)");

	var width = 599 - margin.left - margin.right,
		height = 699 - margin.top - margin.bottom;

	var svg = d3.select('#timeline').append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var xlog = d3.scale.linear()
		.domain([0, 249])
		.range([0, 769]);
	var x = d3.scale.linear()
		.range([0, 24])
		.domain([0, d3.max(deathdays, function (d) {
			return d.deaths;
		})]);
	var grid = d3.range(26).map(function (i) {
		return {
			'x1': 0,
			'y1': 0,
			'x2': 0,
			'y2': 480
		};
	});
	var y = d3.scale.ordinal()
		.rangeRoundBands([height, 0], .1)
		.domain(deathdays.map(function (d) {
			return d.date;
		}));
	var values = [0, 0, 0, 5, 10, 10, 10, 20, 20, 30, 40, 50, 60, 70, 80, 90, 99, 110, 120, 120, 130, 140, 140, 140, 140, 150];
	var tickVals = grid.map(function (d, i) {
		/*if (i > 0) {*/
		return values[i];
		/*        } else if (i === 0) {
		            return "99";
		        }*/
	});
	//make y axis to show bar names
	var xAxis = d3.svg.axis();
	xAxis
		.orient('bottom')
		.scale(xlog)
		.tickValues(tickVals);
	var yAxis = d3.svg.axis()
		.scale(y)
		//no tick marks
		.tickSize(0)
		.orient("left");
	var gy = svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	svg.append("g")
		.attr("transform", "translate(0,620)")
		.attr('id', 'xaxis')
		.call(xAxis);
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left - 5)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Date");
	svg.append("text")
		.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 15) + ")")
		.style("text-anchor", "middle")
		.text("Number of Deaths")
	var graph = svg.selectAll(".bar")
		.data(deathdays)
		.enter()
		.append("g")

	//append rects
	graph.append("rect")
		.attr("class", "bar")
		.attr("y", function (d) {
			return y(d.date);
		})
		.attr("height", y.rangeBand())
		.attr("x", 0)
		.attr("width", function (d) {
			return x(d.deaths);
		})
		.call(duraton_tip)
		.on('mouseover', onChangeHover)
		.on('mouseout', duraton_tip.hide);

	//add a value label to the right of each bar
	graph.append("text")
		.attr("class", "label")
		//y position of the label is halfway down the bar
		.attr("y", function (d) {
			return y(d.date) + y.rangeBand() / 2 + 4;
		})
		//x position is 3 pixels to the right of the bar
		.attr("x", function (d) {
			return x(d.deaths) + 3;
		})
		.text(function (d) {
			return d.deaths;
		});
}

//draw map
function createMapChart() {
	mfig = d3.select("#map_chart")
		.append("svg")
		.attr("id", "main")
		.attr("width", "699")
		.attr("height", "699")
		.call(zoom)
		.append("g")
		.attr('id', 'svgZoom')
		.attr("transform", "translate(-50,150) ");

	// create d3 scale
	var xlog = d3.scale.linear();
	var ylog = d3.scale.linear();

	xlog.domain([0, 15]).range([0, 499]);
	ylog.domain([15, 0]).range([0, 499]);

	// define path generator
	let genPath = d3.svg.line()
		.x(function (d) {
			return xlog(d.x);
		})
		.y(function (d) {
			return ylog(d.y);
		});
	mfig.selectAll(".line")
		.data(streets)
		.enter().append("path")
		.style('fill', 'none')
		.style('stroke', 'black')
		.style('stroke-width', '2px')
		.attr("class", "map")
		.attr("d", genPath)
	mfig.append("text")
		.style("fill", "black")
		.style("font-size", "17px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(359,89) rotate(-35)")
		.text("Broad Street");
	mfig.append("text")
		.style("fill", "black")
		.style("font-size", "17px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(511,-19) rotate(69)")
		.text("Dean Street");
	mfig.append("text")
		.style("fill", "black")
		.style("font-size", "17px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(299,-56) rotate(-11)")
		.text("Oxford Street");
	mfig.append("text")
		.style("fill", "black")
		.style("font-size", "17px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(249,149) rotate(59)")
		.text("Regent Street");
}

//draw pie chart with Age Group
function createPieChart() {
	var width = 499,
		height = 299,
		radius = 349,
		numTicks = 5,
		sdat = [];

	var color = d3.scale.ordinal()
		.range(["#4f772d", "#3dccc7", "#7b6888", "#03045e", "#e78f8e", "#ba2d0b"]);

	var arc = d3.svg.arc()
		.outerRadius(function (d) {
			return 50 + (radius - 50) * d.data.percent / 99;
		})
		.innerRadius(20);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function (d) {
			return d.percent;
		});

	var grid = d3.svg.area.radial()
		.radius(299);

	var svg = d3.select("#pie_chart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	for (i = 0; i <= numTicks; i++) {
		sdat[i] = 20 + ((radius / numTicks) * i);
	}

	agegraph.forEach(function (d) {
		d.percent = d.deathsPercent;
	});

	var g = svg.selectAll(".arc")
		.data(pie(agegraph))
		.enter().append("g")
		.attr("class", "arc")
		.call(chartpi_tip)
		.on('mouseover', refreshMapDataByPie)
		.on('mouseout', chartpi_tip.hide);

	g.append("path")
		.attr("d", arc)
		.style("fill", function (d) {
			return color(d.data.age);
		});

	g.append("text")
		.attr("transform", function (d) {
			return "translate(" + arc.centroid(d) + ")";
		})
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text(function (d) {
			return d.data.percent;
		});
}

//draw pie chart with Gender
function createchartpiChart() {
	var width = 299,
		height = 199,
		radius = 99,
		numTicks = 5,
		sdat = [];

	var color = d3.scale.ordinal()
		.range(["#203b86", "#ef476f"]);

	var arc = d3.svg.arc()
		.outerRadius(function (d) {
			return 50 + (radius - 50) * d.data.percent / 99;
		})
		.innerRadius(20);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function (d) {
			return d.percent;
		});

	var grid = d3.svg.area.radial()
		.radius(99);

	var svg = d3.select("#pie_gender_chart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	for (i = 0; i <= numTicks; i++) {
		sdat[i] = 20 + ((radius / numTicks) * i);
	}

	chartpi.forEach(function (d) {
		d.percent = d.deathsPercent;
	});

	var g = svg.selectAll(".arc")
		.data(pie(chartpi))
		.enter().append("g")
		.attr("class", "arc")
		.call(graphpi_tip)
		.on('mouseover', refreshMapDataBychartpi)
		.on('mouseout', graphpi_tip.hide);

	g.append("path")
		.attr("d", arc)
		.style("fill", function (d) {
			return color(d.data.label);
		});

	g.append("text")
		.attr("transform", function (d) {
			return "translate(" + arc.centroid(d) + ")";
		})
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text(function (d) {
			return d.data.percent;
		});
}

//draw pumps, brewe_loc, and main_loc
function drawItemsToMap() {
	var xlog = d3.scale.linear();
	var ylog = d3.scale.linear();
	xlog.domain([0, 15]).range([0, 449]);
	ylog.domain([15, 0]).range([0, 449]);
	pumpsChart = d3.select('#main').select('g').selectAll(".circle_p").data(pumps);

	pumpsChart.enter().append("circle")
		.attr("r", 15)
		.style("fill", "#3e0303");

	pumpsChart
		.attr("cx", function (d) {
			return xlog(d.x);
		})
		.attr("cy", function (d) {
			return ylog(d.y);
		});

	var brewe_locChart = d3.select('#main').select('g').selectAll(".circle_p").data(brewe_loc);

	brewe_locChart.enter().append("circle")
		.attr("r", 15)
		.style("fill", "#e2c32a");

	brewe_locChart
		.attr("cx", function (d) {
			return xlog(d.x);
		})
		.attr("cy", function (d) {
			return ylog(d.y);
		});

	var main_locChart = d3.select('#main').select('g').selectAll(".circle_p").data(main_loc);

	main_locChart.enter().append("circle")
		.attr("r", 15)
		.style("fill", "#dd5c20");

	main_locChart
		.attr("cx", function (d) {
			return xlog(d.x);
		})
		.attr("cy", function (d) {
			return ylog(d.y);
		});
}

/* update data functions */
function onChangeHover(data) {
	const d = people_diedSex.slice(0, data.deaths);
	refreshAgeDeathData(d);
	duraton_tip.show(data);
}

//draw death data based on Gender
function refreshGenderDeathData(data) {
	d3.selectAll("circle").remove();
	drawItemsToMap();
	var xlog = d3.scale.linear();
	var ylog = d3.scale.linear();
	xlog.domain([0, 15]).range([0, 499]);
	ylog.domain([15, 0]).range([0, 499]);
	var circles = d3.select('#main').select('g').selectAll(".circle_d").data(data);
	circles.enter().append("circle")
		.attr("r", 5)
		.style("fill", function (d) {
			return role_col[d.gender];
		})
	circles
		.attr("cx", function (d) {
			return xlog(d.x);
		})
		.attr("cy", function (d) {
			return ylog(d.y);
		})

	if (data.length) {
		circles.call(loc_tip)
			.on('mouseover', loc_tip.show)
			.on('mouseout', loc_tip.hide);
	}
	circles.exit().remove();
}

//draw death data based on Gender
function refreshAgeDeathData(data) {
	d3.selectAll("circle").remove();
	drawItemsToMap();
	var xlog = d3.scale.linear();
	var ylog = d3.scale.linear();
	xlog.domain([0, 15]).range([0, 499]);
	ylog.domain([15, 0]).range([0, 499]);
	var circles = d3.select('#main').select('g').selectAll(".circle_d").data(data);
	circles.enter().append("circle")
		.attr("r", 5)
		.style("fill", function (d) {
			return year_col[d.age];
		})
	circles
		.attr("cx", function (d) {
			return xlog(d.x);
		})
		.attr("cy", function (d) {
			return ylog(d.y);
		})

	if (data.length) {
		circles.call(loc_tip)
			.on('mouseover', loc_tip.show)
			.on('mouseout', loc_tip.hide);
	}
	circles.exit().remove();
}

function createMapDetails() {
	let data = '';
	year_col.forEach((color, i) => {
		const template = `<div style="background-color: ${color}"  class="miniLine">
                      <p>${year_lab[i]}</p>
                    </div>`;
		data += template;
	});
	role_col.forEach((color, i) => {
		const template = `<div style="background-color: ${color}"  class="miniLine">
                      <p>${role_lab[i]}</p>
                    </div>`;
		data += template;
	})
	document.getElementById('icons_map').innerHTML = data.trim();
}

function zoomed() {
	mapChart.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function pushstarted(d) {
	d3.event.sourceEvent.stopPropagation();
	d3.select(this).classed("dragging", true);
}

function pushed(d) {
	d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function push_end(d) {
	d3.select(this).classed("dragging", false);
}

function zoomed() {
	mfig.attr("transform",
		"translate(" + zoom.translate() + ")" +
		"scale(" + zoom.scale() + ")"
	);
}

function interpolateZoom(translate, scale) {
	var self = this;
	return d3.transition().duration(349).tween("zoom", function () {
		var iTranslate = d3.interpolate(zoom.translate(), translate),
			iScale = d3.interpolate(zoom.scale(), scale);
		return function (t) {
			zoom
				.scale(iScale(t))
				.translate(iTranslate(t));
			zoomed();
		};
	});
}

function zoomClick(zoomDirection) {
	var direction = 1,
		factor = 0.2,
		target_zoom = 1,
		center = [width / 2 + 199, height / 2 - 99],
		extent = zoom.scaleExtent(),
		translate = zoom.translate(),
		translate0 = [],
		l = [],
		view = {
			x: translate[0],
			y: translate[1],
			k: zoom.scale()
		};
	direction = zoomDirection === 'forward' ? 1 : -1;
	target_zoom = zoom.scale() * (1 + factor * direction);

	if (target_zoom < extent[0] || target_zoom > extent[1]) {
		return false;
	}

	translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
	view.k = target_zoom;
	l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

	view.x += center[0] - l[0];
	view.y += center[1] - l[1];

	interpolateZoom([view.x, view.y], view.k);
}

//to refresh the map based on hovered / selected Age Group pie slice
function refreshMapDataByPie(d) {
	var ageGroup = d.data.ageGroup;
	if (ageGroup == 0) {
		filteredData = people_diedSex.filter(function (d) {
			return d.age == 0
		});
	} else if (ageGroup == 1) {
		filteredData = people_diedSex.filter(function (d) {
			return d.age == 1
		});
	} else if (ageGroup == 2) {
		filteredData = people_diedSex.filter(function (d) {
			return d.age == 2
		});
	} else if (ageGroup == 3) {
		filteredData = people_diedSex.filter(function (d) {
			return d.age == 3
		});
	} else if (ageGroup == 4) {
		filteredData = people_diedSex.filter(function (d) {
			return d.age == 4
		});
	} else if (ageGroup == 5) {
		filteredData = people_diedSex.filter(function (d) {
			return d.age == 5
		});
	}
	chartpi_tip.show(d);
	refreshAgeDeathData(filteredData);
}

//to refresh the map based on hovered / selected Gender pie slice
function refreshMapDataBychartpi(d) {
	var gender = d.data.gender;
	var filteredData;
	if (gender == 0) {
		filteredData = people_diedSex.filter(function (d) {
			return d.gender == 0
		});
	} else if (gender == 1) {
		filteredData = people_diedSex.filter(function (d) {
			return d.gender == 1
		});
	}
	graphpi_tip.show(d);
	refreshGenderDeathData(filteredData);
}