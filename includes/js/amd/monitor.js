/**
* Monitor 
* v0.0.1
**/

define(["mule","mpos","notifier","constants","reports","jquery","logit"],
	function(mule,mpos,msg,constants,reports){
		"use strict";
		
		var monitor = {
			startMonitoring : function(poolObj){
				constants.state.monitorEnabled = true;
				constants.cache.monitorForm.slideUp();
				
				$.pnotify_remove_all();
				msg.show("Time to work", "Monitoring has started.","success");
				$.each(mpos, function(k,v){
					poolObj.action = k;
					mule.sendApiRequest(poolObj,k,v);
					
					reports.init(poolObj);
				});
			}
		};
		
		
		return monitor;
	}
);