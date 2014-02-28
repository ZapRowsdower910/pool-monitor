define(["formatData","commonUtils","module","jquery","jquery.pnotify","bootstrap","logit"],
	function(formatter,commonUtils,module){
		"use strict";
		
		var configs = {
			theme : 'jqueryui', // jquery-ui, bootstrap
			pnotifyCSS : '../../css/jquery.pnotify.default.css',
			pnotifyCSSOptional : '../../css/jquery.pnotify.default.icons.css',
			notifier	: 'pnotify'  // pnotify, log
		};
		
		var notifier = {
			init : function(opts){
				if (opts ) { 
					$.extend( configs, opts );
				}
			
				if ( module.config() ) { 
					$.extend( configs, module.config() );
				}
				
				notifier.loadPnotify(commonUtils);
			},
			loadPnotify : function(commonUtils){
				
				commonUtils.loadCSS(configs.path + configs.pnotifyCSS);
				if(configs.pnotifyCSSOptional.length > 0){
					commonUtils.loadCSS(configs.path + configs.pnotifyCSSOptional);
				}
			},	
			show : function(hdr, msg, type){
				if(configs.notifier === 'pnotify'){
						notifier.firePnotify(hdr, msg, type);
				} else if(configs.notifier === 'log'){
					if(type === 'error'){
						log.error(msg);
					} else if(type === 'success' || type === 'info'){
						log.info(msg);
					}
				}
			},
			firePnotify : function(hdr, msg, type){
				if($.pnotify != undefined){
					$.pnotify({
							pnotify_title: hdr,
							pnotify_text: msg,
							pnotify_type : type,
							pnotify_opacity: .8,
							pnotify_shadow: true,
							pnotify_history: false,
							styling : configs.theme,
							delay : 3000,
							hide : type == 'error' ? false : true,
							closer_hover: type == 'error' ? false : true
					});
				} else {
					log.error("pnotify not loaded correctly!");
					configs.notifier = 'log';
				}
			},
			feedback : {
				setupFeedback : function(action, $poolOut, poolObj){
					var actionPayload = $poolOut.data(action);
					if(actionPayload == undefined){
						actionPayload = {
							'timer' : undefined,
							'countDown' : poolObj.refreshRate / 1000,
							'refreshRate' : poolObj.refreshRate,
							'refreshTimer' : undefined
						};
						
						$poolOut.data(action, actionPayload);
					}
					
					return actionPayload;
				},
				working : function(action, $poolOut, poolObj){
					// Setup data if this is our first time thru
					var actionPayload = notifier.feedback.setupFeedback(action, $poolOut, poolObj);
					
					if(actionPayload.timer != undefined){
						clearInterval(actionPayload.timer);
						actionPayload.timer = undefined;
						$poolOut.data(action, actionPayload);
					}
					
					$poolOut.find('.'+action).text("Refreshing data..").prepend("<span class='glyphicon glyphicon-refresh'></span> ");
				},
				doneWorking : function(action, $poolOut){
					var actionPayload = $poolOut.data(action);
					
					if(actionPayload == undefined){
						console.error("actionPayload is undefined", action, $poolOut.data());
					}else if(actionPayload.timer == undefined){
						actionPayload.countDown = actionPayload.refreshRate / 1000;
						actionPayload.timer = setInterval(function(){
							var actionPayload = $poolOut.data(action);
							if(actionPayload.countDown > 0){
								$poolOut.find('.'+action).text(" Updated. Next update in " + formatter.time(actionPayload.countDown) ).prepend("<span class='glyphicon glyphicon-ok'></span> ");
								--actionPayload.countDown;
							} else {
								$poolOut.find('.'+action).text(" Updated. Next update in " + formatter.time(0) ).prepend("<span class='glyphicon glyphicon-ok'></span> ");
								clearInterval(actionPayload.timer);
							}
							$poolOut.data(action, actionPayload);
						},
						1000);
						
						$poolOut.data(action, actionPayload);
					}
				},
				error : function(action, $poolOut){
					var actionPayload = $poolOut.data(action);
					$poolOut.find('.'+action).text("Opps, bad things..").prepend("<span class='glyphicon glyphicon-warning-sign'></span> ");
					if(actionPayload != undefined && actionPayload.timer != undefined){
						clearInterval(actionPayload.timer);
						$poolOut.data(action, actionPayload);
					}
				}
			}
			
		}
		
		return notifier;
	}
);