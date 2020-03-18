queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);

function makeGraphs(error, recordsJson) {
	//Clean data
	var records = recordsJson;
	var dateFormat = d3.time.format("%d-%m-%Y");   //%Y-%m-%d %H:%M:%S
	
	records.forEach(function(d) {
		d["timestamp"] = dateFormat.parse(d["Date"]);
		d["Longitude"] = +d["Longitude"];
		d["Latitude"] = +d["Latitude"];
		d["District"] = d["State"] + '_' + d["District"];
	});

	//Filter out non-empty bins
	function remove_empty_bins(source_group) {
		return {
			all:function () {
				return source_group.all().filter(function(d) {
					return d.value != 0;
				});
			}
		};
	}

	//Create a Crossfilter instance
	var ndx = crossfilter(records);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["timestamp"]; });
	var entomofaunaDim = ndx.dimension(function(d) { return d["Entomofauna"]; });
	var otherInvertebrateDim = ndx.dimension(function(d) { return d["OtherInvertebrate"]; });
	var vertebrateDim = ndx.dimension(function(d) { return d["Vertebrate"]; });
	var habitatDim = ndx.dimension(function(d) { return d["Habitat"]; });
	var stateDim = ndx.dimension(function(d) { return d["State"]; });
	var districtDim = ndx.dimension(function(d) { return d["District"]; });
	var temperatureDim = ndx.dimension(function(d) { return d["Temperature"]; });
	var humidityDim = ndx.dimension(function(d) { return d["Humidity"]; });
	var phylumDim = ndx.dimension(function(d) { return d["Phylum"]; });
	var classDim = ndx.dimension(function(d) { return d["Class"]; });
	var orderDim = ndx.dimension(function(d) { return d["Order"]; });
	var familyDim = ndx.dimension(function(d) { return d["Family"]; });
	var genusDim = ndx.dimension(function(d) { return d["Genus"]; });
	var allDim = ndx.dimension(function(d) {return d;});

	//Group Data
	var numRecordsByDate = dateDim.group();
	var entomofaunaGroup = entomofaunaDim.group();
	var otherInvertebrateGroup = otherInvertebrateDim.group();
	var vertebrateGroup = vertebrateDim.group();
	var habitatGroup = habitatDim.group();
	var stateGroup = stateDim.group();
	var districtGroup = districtDim.group();
	var temperatureGroup = temperatureDim.group();
	var humidityGroup = humidityDim.group();
	var phylumGroup = phylumDim.group();
	var classGroup = classDim.group();
	var orderGroup = orderDim.group();
	var familyGroup = familyDim.group();
	var genusGroup = genusDim.group();
	var all = ndx.groupAll();
	var nonEmptyDistrict = remove_empty_bins(districtGroup);
	var nonEmptyDate = remove_empty_bins(numRecordsByDate);

	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["timestamp"];
	var maxDate = dateDim.top(1)[0]["timestamp"];

    //Charts
    var numberRecordsND = dc.numberDisplay("#number-records-nd");
	var barChart = dc.barChart("#dynamic-bar-chart");
	var timeChartSmall = dc.barChart("#time-chart-overview");
	var timeChart = dc.lineChart("#time-chart");
	var entomofaunaChart = dc.rowChart("#entomofauna-row-chart");
	var otherInvertebrateChart = dc.rowChart("#other-invertebrate-row-chart");
	var vertebrateChart = dc.rowChart("#vertebrate-row-chart");
	var habitatChart = dc.rowChart("#habitat-row-chart");
	var stateChart = dc.rowChart("#state-row-chart");
	var districtChart = dc.rowChart("#district-row-chart");
	var temperatureChart = dc.barChart('#temperature-bar-chart');
	var humidityChart = dc.barChart('#humidity-bar-chart');
	var pieChart1 = dc.pieChart('#dynamic-pie-chart-1');
	var pieChart2 = dc.pieChart('#dynamic-pie-chart-2');

	var key_map = {
		Phylum: {
			Dim: phylumDim,
			Group: remove_empty_bins(phylumGroup)
		},
		Class: {
			Dim: classDim,
			Group: remove_empty_bins(classGroup)
		},
		Order: {
			Dim: orderDim,
			Group: remove_empty_bins(orderGroup)
		},
		Family: {
			Dim: familyDim,
			Group: remove_empty_bins(familyGroup)
		},
		Genus: {
			Dim: genusDim,
			Group: remove_empty_bins(genusGroup)
		}
	};

	numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	timeChartSmall
		.width(1080)
		.height(50)
		.margins({top: 10, right: 10, bottom: 20, left: 20})
		.dimension(dateDim)
		.brushOn(true)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.yAxis().ticks(4);

	timeChart
		.width(1080)
		.height(140)
		.margins({top: 10, right: 10, bottom: 20, left: 20})
		.dimension(dateDim)
		.renderArea(true)				// for area
		.brushOn(false)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.group(numRecordsByDate)
		.elasticY(true)
		.transitionDuration(500)
		.yAxis().ticks(4);

		// .round(d3.time.day)
		// .xUnits(d3.time.day)

	barChart
		.width(1080)
		.height(140)
		.margins({top: 10, right: 10, bottom: 20, left: 50})
		.dimension(key_map["Phylum"].Dim)
        .group(key_map['Phylum'].Group)
		.colors(['#6baed6'])
		.x(d3.scale.ordinal().domain(key_map["Phylum"].Dim)) 
  		.xUnits(dc.units.ordinal)
		.elasticY(true)
		.yAxis().ticks(4);
	
		// .xAxisLabel('Categories')

	// barChart
	// 	.xAxis().tickValues([]);

	entomofaunaChart
        .width(300)
        .height(100)
        .dimension(entomofaunaDim)
        .group(entomofaunaGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

	otherInvertebrateChart
        .width(300)
        .height(100)
        .dimension(otherInvertebrateDim)
        .group(otherInvertebrateGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
		.xAxis().ticks(4);
		
	vertebrateChart
        .width(300)
        .height(100)
        .dimension(vertebrateDim)
        .group(vertebrateGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

	habitatChart
		.width(330)
		.height(420)
        .dimension(habitatDim)
        .group(habitatGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

    stateChart
    	.width(200)
		.height(950)
        .dimension(stateDim)
        .group(stateGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
		.xAxis().ticks(4);

	districtChart
    	.width(200)
        .dimension(districtDim)
        .group(nonEmptyDistrict)
		.ordering(function(d) { return -d.value })
		.label(function (d) { return String(d.key).split('_')[1]; })
        .colors(['#6baed6'])
        .elasticX(true)
		.labelOffsetY(10)
		.xAxis().ticks(4);

	function updateChartHeight(chart, minHeight) {
		/*
			so the proper height is easy to calculate (but you must pass the gap value, which has 5 by default).
			Assuming N=chart.group().all().length, then do:
			.fixedBarHeight(X)
			.height(X*N + gap*(N+1))
		*/
		var N = chart.group().all().length;
		var width = 15, gap = 5;
		var height = width*N + gap*(N+1);
		chart
			.height((height > minHeight) ? height : minHeight)
			.render();
	}
	
	updateChartHeight(districtChart, 950);	
		
	temperatureChart
		.width(350)
		.height(180)
		.margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(temperatureDim)
        .group(temperatureGroup)
		.colors(['#6baed6'])
		.x(d3.scale.ordinal().domain(temperatureDim)) 
  		.xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis().ticks(4);

	humidityChart
		.width(350)
		.height(180)
		.margins({top: 10, right: 20, bottom: 20, left: 50})
        .dimension(humidityDim)
        .group(humidityGroup)
		.colors(['#6baed6'])
		.x(d3.scale.ordinal().domain(humidityDim)) 
  		.xUnits(dc.units.ordinal)
        .elasticY(true)
		.yAxis().ticks(4);
		
	pieChart1
		.width(310)
		.height(178)
		.dimension(phylumDim)
		.group(phylumGroup)
		.label(function(d) {
			return d.data.key + ' ' + Math.round((d.endAngle - d.startAngle) / Math.PI * 50) + '%';
		});

	pieChart2
		.width(310)
		.height(178)
		.dimension(classDim)
		.group(classGroup)
		.label(function(d) {
			return d.data.key + ' ' + Math.round((d.endAngle - d.startAngle) / Math.PI * 50) + '%';
		});

	$('#dropdown-menu-1 a').on('click', function(){    
		$('#toggle-1').html($(this).html() + '<span class="caret"></span>');
		pieChart1
			.width(310)
			.height(178)
			.dimension(key_map[$(this).text()].Dim)
			.group(key_map[$(this).text()].Group)
			.label(function(d) {
				return d.data.key + ' ' + Math.round((d.endAngle - d.startAngle) / Math.PI * 50) + '%';
			});  
		pieChart1.filterAll();dc.redrawAll();  
	});

	$('#dropdown-menu-2 a').on('click', function(){    
		$('#toggle-2').html($(this).html() + '<span class="caret"></span>');   
		pieChart2
			.width(310)
			.height(178)
			.dimension(key_map[$(this).text()].Dim)
			.group(key_map[$(this).text()].Group)
			.label(function(d) {
				return d.data.key + ' ' + Math.round((d.endAngle - d.startAngle) / Math.PI * 50) + '%';
			});  
		pieChart2.filterAll();dc.redrawAll();   
	});

	$('#dropdown-menu-3 a').on('click', function(){    
		$('#toggle-3').html($(this).html() + '<span class="caret"></span>'); 
		var label = $(this).text();  
		barChart
		.dimension(key_map[label].Dim)
		.group(key_map[label].Group)
		.x(d3.scale.ordinal().domain(key_map[label].Dim)) 
		.xUnits(dc.units.ordinal)
		.elasticX(true);
		var focus_keys = [];
		// .xAxisLabel(label)
		key_map[label].Group.all().forEach(element => {
			focus_keys.push(element.key);
		});
		
		barChart.focus(focus_keys);
		barChart.filterAll(); dc.redrawAll();    
	});

	// $(function () {
	// 	$('inputdatestart').datepicker({format: "dd/mm/yyyy"}); 
	// 	$('inputdateend').datepicker({format: "dd/mm/yyyy"}); 

	// 	// $('#datetimepicker6').datetimepicker();
    //     // $('#datetimepicker7').datetimepicker({
    //     //     useCurrent: false //Important! See issue #1075
    //     // });
    //     // $("#datetimepicker6").on("dp.change", function (e) {
    //     //     $('#datetimepicker7').data("DateTimePicker").minDate(e.date);
    //     // });
    //     // $("#datetimepicker7").on("dp.change", function (e) {
    //     //     $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);
    //     // });
	// });

	function formatDate(date) {
		var day = date.getDate();
		var monthIndex = date.getMonth() + 1;
		var year = date.getFullYear();
	  
		return day + '/' + monthIndex + '/' + year;
	}

	function updateRange(start, end, readonly=true) {
		$('#inputdatestart').attr('readonly', readonly).val(formatDate(start));
		$('#inputdateend').attr('readonly', readonly).val(formatDate(end));
	}

	updateRange(minDate, maxDate);
	
	var latlng = L.latLng(23.07, 80.01);
	var markers = new L.markerClusterGroup();
	
	var OpenStreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		});

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		maxZoom: 18,
        minZoom: 2,
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	});;

	var baseMaps = {
		"OpenStreetMap": OpenStreetMap,
		"Satellite": Esri_WorldImagery
	};

	var state_color = "#6baed6";
	var district_color = "#7cb342";
	var fillColor = '#00000000';

	var selected_states = [];
	var selected_districts = [];

	var states_layer = {};
	var districts_layer = {};
	var state_district_map = {};

	// Read geojson data
	state_json.forEach(element => {
		var state = L.geoJSON([element], {
			style:{
				color: state_color,
				fillColor: fillColor
			}
		});
		states_layer[element.properties.NAME_1] = state;
	});

	district_json.forEach(element => {
		var district = L.geoJSON([element], {
			style:{
				color: district_color,
				fillColor: fillColor
			}
		});
		districts_layer[element.properties.NAME_1 + '_' + element.properties.NAME_2] = district;
		if (state_district_map[element.properties.NAME_1]==null) {
			state_district_map[element.properties.NAME_1] = {};
		}
		state_district_map[element.properties.NAME_1][element.properties.NAME_1 + '_' + element.properties.NAME_2] = district;
	});

	var state_geojson = L.layerGroup(Object.values(states_layer));
	var district_geojson = L.layerGroup(Object.values(districts_layer));

	function reset_geojson_state() {
		var states = Object.values(states_layer);
		state_geojson.clearLayers();
		states.forEach(element => {
			state_geojson.addLayer(element)
		});
		selected_states = [];
	}

	function reset_geojson_district() {
		var districts = Object.values(districts_layer);
		district_geojson.clearLayers();
		districts.forEach(element => {
			district_geojson.addLayer(element);
		});
		selected_districts = [];
	}

	function reset_geojson() {
		reset_geojson_state();
		reset_geojson_district();
	}

	function reset_geojson_districts(districts){	
		var new_districts = [];
		districts.forEach(element => {
			new_districts.push(element.key);
		});
		district_geojson.clearLayers();
		new_districts.forEach(element => {
			district_geojson.addLayer(districts_layer[element]);
		});
		selected_districts = [];
	}

	function update_district_layer(district, filter_select=false) {
		if (selected_districts.length==0 && district_geojson.getLayers().length!=0) {
			district_geojson.clearLayers();
		}
		// Check for filter selection
		if (filter_select) {
			district_geojson.clearLayers();
			selected_districts = [];
		}
		if(!selected_districts.includes(district)){
			selected_districts.push(district);
			district_geojson.addLayer(districts_layer[district]);
		}
		else {
			selected_districts = _.without(selected_districts, district);
			district_geojson.removeLayer(districts_layer[district]);
		}

		if (selected_districts.length==0) {
			reset_geojson_district();
		}
	}
	
	function update_state_layer(state) { 
		// Check if its first time 
		if (selected_states.length==0 && state_geojson.getLayers().length!=0) {
			state_geojson.clearLayers();
		}
		if(!selected_states.includes(state)){
			selected_states.push(state);
			state_geojson.addLayer(states_layer[state]);
		}
		else {
			selected_states = _.without(selected_states, state);
			state_geojson.removeLayer(states_layer[state]);
		}

		// Also update the corresponding districts 
		var districts = state_district_map[state];
		for(const dist_element in districts) {
			update_district_layer(dist_element);
		};

		if (selected_states.length==0) {
			reset_geojson_state();
		}
	}

	var overlayMaps = {
		"Markers": markers,
		"<span style='color: #6baed6'>States</span>": state_geojson,
		"<span style='color: #7cb342'>Districts</span>": district_geojson
	};

	var map = L.map('map', {
		center: latlng,
		zoom: 5,
		layers: [OpenStreetMap, markers]
	});

	var controlSearch = new L.Control.Search({
		position: 'topright',
		layer: markers,
		initial: false,
		zoom: 18,
		marker: false
	});

	
	// Add method to layer control class
	L.Control.Layers.include({
		getOverlays: function() {
		  // create hash to hold all layers
		  var control, layers;
		  layers = {};
		  control = this;
	  
		  // loop thru all layers in control
		  control._layers.forEach(function(obj) {
			var layerName;

			// get name of overlay
			layerName = obj.name;
			// store whether it's present on the map or not
			return layers[layerName] = control._map.hasLayer(obj.layer);
			
		  });
	  
		  return layers;
		}
	});

	var layerControl = new L.Control.Layers(baseMaps, overlayMaps);
	layerControl.addTo(map);

	map._layersMaxZoom = 18;

	var drawMap = function(active){
		markers.clearLayers();
		var markerList = [];

		map.setView(latlng, 5);

		_.each(allDim.top(Infinity), function (d) {
			var title = d["UniqueSurveyID"];
			var thumbnail = d["ImageAnimal"] || d["ImageHabitat"] || d["ImageHost"];
			var selfIcon = new L.divIcon({
				className: 'my-div-icon',
				iconSize: [50, 50],
				html: '<img  class="circle_img" src="' + thumbnail + '" style="border: 3px solid ' + '#FFFFFF' + '" />'
			});
			var marker = L.marker(new L.LatLng(parseFloat(d["Latitude"]).toPrecision(4), parseFloat(d["Longitude"]).toPrecision(4)), {
                title: title,
                icon: selfIcon
            }).setBouncingOptions({
                bounceHeight: 20,
                exclusive: true
            }).on('click', function (e) {
                showMarkerData(e);
                $("#sidebar-right").modal();
                this.bounce(3);
            }).addTo(markers);

            // Add data on marker itself
            marker.data = d;

            var content = title + "</br>" + "Latitude:" + d["Latitude"] + "</br>" + "Longitude:" + d["Longitude"];
            marker.bindPopup(content, {
                maxWidth: 600
            });
			
			marker.on('mouseover', function (e) {
                // Change content on the fly
                marker.openPopup();
			});
			
			function showMarkerData(e){
				var data =  e.target.data;
				document.getElementById("sidebar-title").innertext += "UNIQUE ID" + data.UniqueSurveyID;

				if (data.ImageAnimal != null) {
					document.getElementById("ImageAnimal").src = data.ImageAnimal;
				}
				if (data.ImageHabitat != null) {
					document.getElementById("ImageHabitat").src = data.ImageHabitat;
				}
				if (data.ImageHost != null) {
					document.getElementById("ImageHost").src = data.ImageHost;
				}

                //compile the string
                for (var i in data){
					if(i != 'Unnamed: 0'){
						document.getElementById("data").innerHTML += `<p class=\"font-weight-normal\" ><b>` + i + `: </b>` + data[i] + `</p>`;
					}
				}
            }
            markers.addLayer(marker);
            markerList.push(marker);
		  });		
		
		for (const layer in active) {
			if (active[layer]) {
				if (layer in baseMaps){
					baseMaps[layer].addTo(map);
				}
				else if(layer in overlayMaps){
					overlayMaps[layer].addTo(map);
				}
			}
		}

		controlSearch.on('search:locationfound', function (e) {
            if (e.layer._popup) {
                var index = markerList.map(function (e) {
                    return e.options.title;
                }).indexOf(e.text);
                var m = markerList[index];
                markers.zoomToShowLayer(m, function () {
                    m.openPopup();
                    m.bounce(3);
                });
            }
        });
		map.addControl(controlSearch);
	};

	//Draw Map
	drawMap(layerControl.getOverlays());

	// we need to this helper function out of coordinateGridMixin
    function rangesEqual(range1, range2) {
        if (!range1 && !range2) {
            return true;
        }
        else if (!range1 || !range2) {
            return false;
        }
        else if (range1.length === 0 && range2.length === 0) {
            return true;
        }
        else if (range1[0].valueOf() === range2[0].valueOf() && range1[1].valueOf() === range2[1].valueOf()) {
            return true;
        }
        return false;
	}

	//Update the heatmap if any dc chart get filtered
	dcCharts = [timeChartSmall, entomofaunaChart, otherInvertebrateChart, vertebrateChart, habitatChart,
		 stateChart, timeChart, barChart, districtChart, humidityChart, temperatureChart, pieChart1, pieChart2];

	/* Turn off resizing for now */
	// _.each(dcCharts, function (dcChart) {
	// 	apply_resizing(dcChart, 20);
	// });

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {			
			if (chart==timeChartSmall) {
				if (filter!=null){
					if (!rangesEqual(timeChartSmall.filter(), timeChart.filter())) {
						dc.events.trigger(function () {
							timeChart.focus(timeChartSmall.filter());
						});
					}
					updateRange(filter[0], filter[1]);
				}else{
					timeChart.focus([minDate, maxDate]);
					updateRange(minDate, maxDate);
				}
			}
			else if (chart==stateChart) {
				if (filter!=null){
					update_state_layer(filter);
				}else{
					reset_geojson_state();
				}
				updateChartHeight(districtChart, 950);
			}
			else if (chart==districtChart) {
				if (filter!=null){
					if (chart.filters().length==0) {
						reset_geojson_districts(chart.group().all());						
					}else{
						update_district_layer(filter, chart.filters().length==1);
					}
				}else{
					reset_geojson_district();
				}
			}
			// Get active layers before deleting them
			var active = layerControl.getOverlays();

			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			});

			drawMap(active);
			
		});
	});

	dc.renderAll();
};