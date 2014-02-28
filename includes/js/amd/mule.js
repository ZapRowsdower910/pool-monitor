define(["notifier","commonUtils","constants","jquery","logit"],
	function(notifier,commonUtils,constants){
		"use strict";
		
		var localVars = {
			poolTemplate : undefined
		}
		
		$.ajax({
			'url':'monitorRow.html', 
			'success' : function(html){
				localVars.poolTemplate = html;
			},
			'dataType': 'html'
		});
		
		var mule = {
			sendMessage : function(postData,callback,$poolOut){

				return $.ajax({
					'type':'post',
					'url':constants.URLS.proxy,
					'data':{'url':postData},
					success : function(data){
						// if we have $poolOut we know this is a mpos call
						if($poolOut != undefined){
							var keys = Object.keys(data);
							// add poolOut to data
							data.poolOut = $poolOut;
							// Change end user notification to count down
							notifier.feedback.doneWorking(keys[0], $poolOut);
						}
						// parse data
						commonUtils.exeCallback(callback, data);
					},
					error : function(x,h,r){
						notifier.feedback.error(action, $poolOut);
						
						var poolObj = $poolOut.data('poolObj');
						if(++poolObj.errorCount >= constants.settings.errorLimit ){
								if(constants.state.monitorEnabled){
									$('#stop').click();
									$.pnotify_remove_all();
									notifier.show("Epic Fail","Consecutive error count of ["+settings.errorLimit+"] reached, disabling Monitoring. Review your settings or try again later.","fatal");
								}
							} else {
								notifier.show("Ohz Noz!","We hit an error on refresh! ["+r+"]","error");
							}
					},
					dataType : 'json'
				});
			},
			sendApiRequest : function(poolObj,action,callback){
				var url = poolObj.url + '&action=' + action + '&protocol=' + poolObj.protocol;
				
				var $poolOut = constants.cache.monitorOutput.find('.pool-out.' + poolObj.id);
				
				if($poolOut.length < 1){
					var $poolOut = $(localVars.poolTemplate).clone();
					
					$poolOut.addClass(poolObj.id);
					$poolOut.find('.panel-title').text(poolObj.label);
					
					constants.cache.monitorOutput.append($poolOut);
				}
				
				$poolOut.data('poolObj', poolObj);
				
				notifier.feedback.working(action, $poolOut, poolObj);
				var dfd = mule.sendMessage(url,callback,$poolOut);
				
				$.when(dfd).always(function(){
					var refreshTimer = setTimeout(function(){
						if(constants.state.monitorEnabled){
							mule.sendApiRequest(poolObj, action, callback);
						}
					}, poolObj.refreshRate);
					
					var actionPayload = $poolOut.data(action);
					// If a mass error happend its possible that monitoring has been disabled. This will
					// cause the $poolOut element to be destoryed and no actionPayload will exist.
					if(actionPayload != undefined){
						actionPayload.refreshTimer = refreshTimer;
						$poolOut.data(action,actionPayload);
					} else { 
						log.error("no actionPayload found");
					}
				});
			}
		}
		return mule
	}
);