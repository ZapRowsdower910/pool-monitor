define(["mule","constants","highcharts","jquery","logit"],
	function(mule,constants){
		"use strict";
		
		// Report w/o range - used for initial data load
		var validReports = ["getuserstatus"];
		// Report w/ range - used to update live reports
		var rangeReports = {
			"getuserstatus" : "getuserstatusrange"
		};
		var lastEntryDate = [];
		
		var reports = {
			init : function(poolObj){
				// disable UTC time
				Highcharts.setOptions({
					global: {
						useUTC: false
					}
				});
				
				// Build charts
				reports.setupCharts();
				// console.log(poolObj.action, validReports.indexOf(poolObj.action))
				
				// Only chart valid report types
				if(validReports.indexOf(poolObj.action) > -1){
					console.log(poolObj.action, validReports.indexOf(poolObj.action))
					reports.getReportData(poolObj);
				}
			},
			getReportData : function(poolObj, time){
				console.log(poolObj.action,arguments[0].action)
				// time arguments will become available after first data load
				var dfd = $.ajax({
					"type":"post",
					"url" : constants.URLS.proxy,
					data : {'url':poolObj.reportsUrl + poolObj.action + (time != undefined ? "&epochtime=" + time : "")},
					success : function(data){
						reports.parseData(data);
					},
					error : function(x,h,r){
						console.error(h,r)
					},
					dataType : 'json'
				});
				
				$.when(dfd).always(function(){
					console.log(poolObj.action)
					setTimeout(function(){
						console.log(poolObj.action, rangeReports[poolObj.action], rangeReports["getuserstatus"]);
						
						// After the first data load, we need to move to ranged requests to only get the most recent data
						poolObj.action = rangeReports[poolObj.action];
						// Start the reporting cycle over
						reports.getReportData(poolObj, lastEntryDate[0]++);
					}
					, 10000);
				})
			},
			parseData : function(data){
				console.log(data);
				
				if(data.resultset1.length){
					var userData = [];
					var userEntry = {
						data : []
					};
					
					var validsData = [];
					var validsEntry = {
						name:"Valid Shares",
						data : []
					};
					var invalidsEntry = {
						name:"Invalid Shares",
						data : []
					};
					$.each(data.resultset1, function(i,v){
						reports.createDataPoint(v,"hashrate",userEntry);
						reports.createDataPoint(v,"validshares",validsEntry);
						reports.createDataPoint(v,"invalidshares",invalidsEntry);
					});
					userData.push(userEntry);
//					console.log(userData);
					reports.updateUserData(userData);

					validsData.push(validsEntry);
					validsData.push(invalidsEntry);
//					console.log(validsData);
					reports.updateShares(validsData);
					
					lastEntryDate = userData[0].data[(userData[0].data.length-1)];
					
				} // no data to graph
			},
			createDataPoint : function(data,key,arraySet){
				var tempUser = [
					data.entrydate,
					data[key]
				];
				if(arraySet.name == undefined){
					arraySet.name = data.username;
				}
				arraySet.data.push(tempUser);
				return arraySet;
			},
			updateUserData : function(userData){
				var series = constants.cache.charts.user.series;
//					reporting.setupAxis(series, validsData);
				var wasUpdated = reports.setupAxis(constants.cache.charts.user, userData);
				if(!wasUpdated){
					$.each(userData[0].data, function(i,v){
						series[0].addPoint(v,true,false);
					});
				}
			},
			updateShares : function(validsData){
				var series = constants.cache.charts.shares.series;
				console.log(series.length);
				var wasUpdated = reports.setupAxis(constants.cache.charts.shares, validsData);
				if(!wasUpdated){
					$.each(validsData[0].data, function(i,v){
						series[0].addPoint(v,true,false);
					});
				}
				
			},
			setupAxis : function(chart,data){
				var wasUpdated = false;
				if(chart.series.length < data.length){
					for(var i = 0; i < data.length; i++){
						chart.addSeries(data[i]);
						wasUpdated = true;
					}
				}
				
				return wasUpdated;
			},
			setupCharts : function(){
				constants.cache.charts.user = new Highcharts.Chart({
					chart: {
						renderTo : $('.userhashrate-graph')[0],
						zoomType: 'x',
						spacingRight: 20
					},
					title : {
						'text': 'User Hashrate'
					},
					subtitle :{
						'text':'Click and drag to zoom in!'
					},
					xAxis : {
						'title':{
							'text':'Time'
						},
						'maxZoom' : 1 * 3600000,
						'type':'datetime'
					},
					yAxis : {
						'title' : {
							'text': 'Hashrate (Khs)'
						},
						'min':0
					},
					tooltip: {
						valueSuffix: 'Khs'
					},
					plotOptions: {
						series: {
							marker: {
								enabled: false,
								states: {
									hover: {
										enabled: true
									}
								}
							}
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'middle',
						borderWidth: 0
					},
					series:[]
				});
				
				constants.cache.charts.shares = new Highcharts.Chart({
					chart: {
						renderTo:$('.validrate-graph')[0],
						zoomType: 'x',
						spacingRight: 20
					},
					title : {
						'text': 'Valid Hashes'
					},
					subtitle :{
						'text':'Click and drag to zoom in!'
					},
					xAxis : {
						'title':{
							'text':'Time'
						},
						'maxZoom' : 1 * 3600000,
						'type':'datetime'
					},
					yAxis : {
						'title' : {
							'text': 'Shares'
						},
						'min':0
					},
					plotOptions: {
						series: {
							marker: {
								enabled: false,
								states: {
									hover: {
										enabled: true
									}
								}
							}
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'middle',
						borderWidth: 0
					},
					series:[]
				});
			}
		
		};
		
		return reports;
	}
);