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

	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["timestamp"];
	var maxDate = dateDim.top(1)[0]["timestamp"];

    //Charts
    var numberRecordsND = dc.numberDisplay("#number-records-nd");
	var timeChart = dc.barChart("#time-chart");
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
		.width(790)
		.height(138)
		.margins({top: 10, right: 10, bottom: 20, left: 20})
		.dimension(dateDim)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.yAxis().ticks(4);

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

	//add extra var show_on_map:true
	// state_json.forEach(element => {
	// 	element.properties["show_on_map"] = true;
	// });

	// district_json.forEach(element => {
	// 	element.properties["show_on_map"] = true;
	// });

	var selected_states = [];
	var selected_districts = [];

	var states_layer = {};
	var districts_layer = {};

	// Read geojson data
	var state_geojson = L.geoJSON(state_json, {
		style:{
			color: state_color,
			fillColor: fillColor
		},
		filter: function(feature, layer) {
			states_layer[feature.properties.NAME_1] = layer;
			// return feature.properties.show_on_map;
		}
	});

	var district_geojson = L.geoJSON(district_json, {
		style:{
			color: district_color,
			fillColor: fillColor
		},
		filter: function(feature, layer) {
			districts_layer[feature.properties.NAME_2] = layer;
			// return feature.properties.show_on_map;
		}
	});

	function update_state_layer(state) {
		if(!selected_states.includes(state)){
			selected_states.push(state);
		}
		else {
			selected_states.pop(state);
		}
		// state_json.forEach(element => {
		// 	console.log
		// 	var feature = states_layer[element.properties.NAME_1];
		// 	if (feature!=null) {
		// 		console.log(element.properties.NAME_1);
		// 		state_geojson.removeLayer();

		// 		element.properties["show_on_map"] = selected_states.includes(element.properties.NAME_1);
		// 		if (element.properties["show_on_map"]) {
		// 			state_geojson.addData(states_layer[element.properties.NAME_1]);
		// 		}
		// 	}
		// });	
		console.log(state_geojson.layers);
		console.log(states_layer);
		console.log(states_layer[state]);
		state_geojson.addData(states_layer[state]);
	}

	function update_district_layer(district) {
		if(!selected_districts.includes(district)){
			selected_districts.push(district);
		}
		else {
			selected_districts.pop(district);
		}
		// district_json.forEach(element => {
		// 	district_geojson.removeLayer(districts_layer[element.properties.NAME_2]);

		// 	element.properties["show_on_map"] = selected_districts.includes(element.properties.NAME_2);
		// 	if (element.properties["show_on_map"]) {
		// 		district_geojson.addData(districts_layer[element.properties.NAME_2]);
		// 	}
		// });	
		console.log(districts_layer);
		console.log(districts_layer[district]);
		district_geojson.addData(districts_layer[district]);
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

	var layerControl = L.control.layers(baseMaps, overlayMaps);
	layerControl.addTo(map);

	var drawMap = function(){
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
		
		baseMaps.OpenStreetMap.addTo(map);
		markers.addTo(map);
	};

	//Draw Map
	drawMap();

	//Update the heatmap if any dc chart get filtered
	dcCharts = [timeChart, entomofaunaChart, otherInvertebrateChart, vertebrateChart, habitatChart,
		 stateChart, districtChart, humidityChart, temperatureChart, pieChart1, pieChart2];

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {
			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			});
			if (chart==timeChart) {
				if (filter!=null){
					updateRange(filter[0], filter[1]);
				}
			}
			// else if (chart==stateChart) {
			// 	if (filter!=null){
			// 		update_state_layer(filter);
			// 	}
			// }
			// else if (chart==districtChart) {
			// 	if (filter!=null){
			// 		update_district_layer(filter);
			// 	}
			// }
			drawMap();
			
		});
	});

	dc.renderAll();

};