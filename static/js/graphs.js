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

	//Create a Crossfilter instance
	var ndx = crossfilter(records);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["timestamp"]; });
	var entomofaunaDim = ndx.dimension(function(d) { return d["Entomofauna"]; });
	var otherInvertebrateDim = ndx.dimension(function(d) { return d["OtherInvertebrate"]; });
	var vertebrateDim = ndx.dimension(function(d) { return d["Vertebrate"]; });
	var habitatDim = ndx.dimension(function(d) { return d["Habitat"]; });
	var locationdDim = ndx.dimension(function(d) { return d["State"]; });
	var temperatureDim = ndx.dimension(function(d) { return d["Temperature"]; });
	var humidityDim = ndx.dimension(function(d) { return d["Humidity"]; });
	var phylumDim = ndx.dimension(function(d) { return d["Phylum"]; });
	var classDim = ndx.dimension(function(d) { return d["Class"]; });
	var allDim = ndx.dimension(function(d) {return d;});


	//Group Data
	var numRecordsByDate = dateDim.group();
	var entomofaunaGroup = entomofaunaDim.group();
	var otherInvertebrateGroup = otherInvertebrateDim.group();
	var vertebrateGroup = vertebrateDim.group();
	var habitatGroup = habitatDim.group();
	var locationGroup = locationdDim.group();
	var temperatureGroup = temperatureDim.group();
	var humidityGroup = humidityDim.group();
	var phylumGroup = phylumDim.group();
	var classGroup = classDim.group();
	var all = ndx.groupAll();

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
	var locationChart = dc.rowChart("#location-row-chart");
	var temperatureChart = dc.barChart('#temperature-bar-chart');
	var humidityChart = dc.barChart('#humidity-bar-chart');
	var pieChart1 = dc.pieChart('#dynamic-pie-chart-1');
	var pieChart2 = dc.pieChart('#dynamic-pie-chart-2');


	numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	timeChart
		.width(780)
		.height(140)
		.margins({top: 10, right: 50, bottom: 20, left: 20})
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
		.width(300)
		.height(420)
        .dimension(habitatDim)
        .group(habitatGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

    locationChart
    	.width(200)
		.height(545)
        .dimension(locationdDim)
        .group(locationGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
		.xAxis().ticks(4);
		
	temperatureChart
		.width(310)
		.height(180)
		.margins({top: 10, right: 20, bottom: 20, left: 50})
        .dimension(temperatureDim)
        .group(temperatureGroup)
		.colors(['#6baed6'])
		.x(d3.scale.ordinal().domain(temperatureDim)) 
  		.xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis().ticks(4);

	humidityChart
		.width(310)
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
		.height(180)
		.dimension(phylumDim)
		.group(phylumGroup)
		.legend(dc.legend())
		.label(function(d) {
			return d.data.key + ' ' + Math.round((d.endAngle - d.startAngle) / Math.PI * 50) + '%';
		});

	pieChart2
		.width(310)
		.height(180)
		.dimension(classDim)
		.group(classGroup)
		.label(function(d) {
			return d.data.key + ' ' + Math.round((d.endAngle - d.startAngle) / Math.PI * 50) + '%';
		});



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

	// Read geojson data
	var state_geojson = L.geoJSON(state_json, {
		style:{
			color: state_color
		}
	});
	var district_geojson = L.geoJSON(district_json, {
		style:{
			color: district_color
		}
	});

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
		  baseMaps.OpenStreetMap.addTo(map);
		  markers.addTo(map);
	};

	//Draw Map
	drawMap();

	//Update the heatmap if any dc chart get filtered
	dcCharts = [timeChart, entomofaunaChart, otherInvertebrateChart, vertebrateChart, habitatChart,
		 locationChart, humidityChart, temperatureChart, pieChart1, pieChart2];

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {
			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			}); 
			drawMap();
		});
	});

	dc.renderAll();

};