define(["notifier","monitor","jquery","logit"],
	function(msg,monitor){
		"use strict";
	
		var pools = {
			parsePools : function(){
				var $pools = $('.pool');
				var poolStorage = [];
				
				$.each($pools, function(i,v){
					var poolObj = pools.getPoolObj($(v));
					if(poolObj.store){
						poolStorage.push(poolObj);
					}
					
					if(poolObj != undefined){
						// TODO decide what will b the pool monitor
						monitor.startMonitoring(poolObj);
					}
				});
				
				// TODO cookie plugin hook
				//$.cookie('poolStorage',poolStorage, {expires : 30});
			},
			getPoolObj : function($el){
				var apiKey = $el.find("input[name='apiKey']").val();
				var poolUrl = $el.find("input[name='poolUrl']").val();
				var poolLabel = $el.find("input[name='poolLabel']").val();
				var store = $el.find("input[name='store']:checked").val() || false;
				var protocol = $el.find(".protocol").data('value');
				
				if(apiKey && poolUrl){
				
					var url = muleEndPoint + '/givemedata?pool=' + poolUrl + '&api_key=' + apiKey;
					var refreshRate = $el.find("select[name='refreshRate']").val();
					var reportsUrl = url + "&protocol=" + protocol + "&report=";
					
					return {
						'protocol':protocol,
						'poolUrl' : poolUrl,
						'apiKey' : apiKey,
						'url' : url,
						'refreshRate' : refreshRate,
						'id' : 'pool-' + Math.floor(Math.random(1, 100000) * 100000),
						'errorCount' : 0,
						'label' : poolLabel,
						'store' : store,
						'reportsUrl' : reportsUrl
					};

				} else {
					// Todo - change this to form element feedback error
					msg.show("Ohz Noz!","You didn't fill out the form..","error");
				}
			},
			scanRemovePoolBtn : function(){
				var $pools = $('.pool');
				if($pools.length > 1){
					$pools.find(".remove-pool").removeAttr('disabled');
				} else {
					$pools.find(".remove-pool").attr('disabled','disabled');
				}
				
			}
		};
		return pools;
	}
);