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
	var timeChart = dc.barChart("#time-chart");
	var barChart = dc.barChart("#dynamic-bar-chart");
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
			Group: phylumGroup
		},
		Class: {
			Dim: classDim,
			Group: classGroup
		},
		Order: {
			Dim: orderDim,
			Group: orderGroup
		},
		Family: {
			Dim: familyDim,
			Group: familyGroup
		},
		Genus: {
			Dim: genusDim,
			Group: genusGroup
		}
	};

	numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	timeChart
		.width(1080)
		.height(50)
		.margins({top: 10, right: 10, bottom: 20, left: 20})
		.dimension(dateDim)
		.brushOn(true)
		.group(nonEmptyDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.yAxis().ticks(4);

	barChart
		.width(1080)
		.height(138)
		.margins({top: 10, right: 10, bottom: 20, left: 20})
		.dimension(dateDim)
		.brushOn(false)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.group(numRecordsByDate)
		.transitionDuration(500);

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
		.height(545)
        .dimension(stateDim)
        .group(stateGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
		.xAxis().ticks(4);

	districtChart
    	.width(200)
		.height(545)
        .dimension(districtDim)
        .group(nonEmptyDistrict)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
		.labelOffsetY(10)
		.xAxis().ticks(4);
		
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
	})

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
	})

	// $(function () {
	// 	$('#dateStart').datetimepicker();
	// 	$('#dateEnd').datetimepicker({
	// 		useCurrent: false //Important! See issue #1075
	// 	});
	// 	$("#dateStart").on("dp.change", function (e) {
	// 		$('#dateEnd').data("DateTimePicker").minDate(e.date);
	// 	});
	// 	$("#dateEnd").on("dp.change", function (e) {
	// 		$('#dateStart').data("DateTimePicker").maxDate(e.date);
	// 	});
	// });

	function formatDate(date) {
		var day = date.getDate();
		var monthIndex = date.getMonth() + 1;
		var year = date.getFullYear();
	  
		return day + '/' + monthIndex + '/' + year;
	}

	function updateRange(start, end) {
		timeChart
			.x(d3.time.scale().domain([start, end]))
			.rescale();
		$('#inputdatestart').attr('readonly',true).val(formatDate(start));
		$('#inputdateend').attr('readonly',true).val(formatDate(end));
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
		districts_layer[element.properties.NAME_2] = district;
	});

	var state_geojson = L.layerGroup(Object.values(states_layer));
	var district_geojson = L.layerGroup(Object.values(districts_layer));

	function reset_geojson() {
		var states = Object.values(states_layer);
		var districts = Object.values(districts_layer);
		
		state_geojson.clearLayers();
		states.forEach(element => {
			state_geojson.addLayer(element)
		});

		district_geojson.clearLayers();
		districts.forEach(element => {
			district_geojson.addLayer(element);
		});
	}
	
	function update_state_layer(state) {
		state_geojson.clearLayers();
		if(!selected_states.includes(state)){
			selected_states.push(state);
		}
		else {
			selected_states.pop(state);
		}

		if (selected_states.length==0) {
			reset_geojson();
		} else {
			selected_states.forEach(element => {
				state_geojson.addLayer(states_layer[element]);
			});
		}
	}

	function update_district_layer(district) {
		district_geojson.clearLayers();
		if(!selected_districts.includes(district)){
			selected_districts.push(district);
		}
		else {
			selected_districts.pop(district);
		}

		if (selected_districts.length==0) {
			reset_geojson();
		} else {
			selected_districts.forEach(element => {
				district_geojson.addLayer(districts_layer[element]);
			});
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
        else if (range1[0].valueOf() === range2[0].valueOf() &&
            range1[1].valueOf() === range2[1].valueOf()) {
            return true;
        }
        return false;
	}

	//Update the heatmap if any dc chart get filtered
	dcCharts = [timeChart, entomofaunaChart, otherInvertebrateChart, vertebrateChart, habitatChart,
		 stateChart, barChart, districtChart, humidityChart, temperatureChart, pieChart1, pieChart2];

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {
			// Get active layers before deleting them
			var active = layerControl.getOverlays();

			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			});
			if (chart==timeChart) {
				if (filter!=null){
					if (!rangesEqual(timeChart.filter(), barChart.filter())) {
						dc.events.trigger(function () {
							barChart.focus(timeChart.filter());
						});
					}
				}
			}
			else if (chart==stateChart) {
				if (filter!=null){
					update_state_layer(filter);
				}
			}
			else if (chart==districtChart) {
				if (filter!=null){
					update_district_layer(filter);
				}
			}
			drawMap(active);
			
		});
	});

	dc.renderAll();
};