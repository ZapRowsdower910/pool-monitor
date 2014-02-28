/**
* Monitor 
* v0.0.1
**/

define(["pools","notifier","constants","jquery","bootstrap","logit"],
	function(pools,msg,constants){
		"use strict";

		var logConfig = {'loggingLevel':'debug', 'logToConsole':true, 'logToAlertFallback':false};
		
		var app = {
			init : function(){
				
				log.init(logConfig);
				log.info("Starting up Monitor App..");
				
				constants.cache.btns.nuke.click(function(){
					$.removeCookie('poolStorage');
					msg.show("Let the world burn..", "Stored pool data has been cleared.", "success");
				});
			
				$('.add-pool').click(function(){
					var $clone = constants.cache.monitorForm.children('.pool:first').clone();
					$clone.find("input[type='text']").val("");
					constants.cache.monitorForm.append($clone);
					pools.scanRemovePoolBtn();
				});
				
				$('#monitorForm').on('click','.remove-pool', function(){
					$(this).parents('.pool').remove();
					pools.scanRemovePoolBtn();
				});
				
				constants.cache.btns.stop.click(function(){
					if(constants.state.monitorEnabled){
						// Re-enable monitor flag
						constants.state.monitorEnabled = false;
						// toggle button states
						constants.cache.btns.stop.attr('disabled','disabled');
						constants.cache.btns.start.removeAttr('disabled');
						constants.cache.btns.addPool.removeAttr('disabled');
						// notify end user
						msg.show("Info","Stopping Monitoring..","info");
						
						// clean up pool output
						var $poolOut = $('.pool-out');
						$.each($poolOut, function(i,v){
							var dataz = $(v).data();
							$.each(dataz, function(i,v){
								if(v != 'poolObj'){
									clearInterval(v.timer);
									clearInterval(v.refreshTimer);
									// $.each(i, function(k,m){
										// if(k == 'timer'){
											// clearInterval(k);
										// }
									// });
								}
							});
						});
						
						constants.cache.monitorForm.slideDown();
						constants.cache.monitorOutput.slideUp();
						
						$poolOut.remove();
					}
				});
			
				constants.cache.monitorForm.submit(function(e){
					e.preventDefault();
					
					constants.cache.btns.stop.removeAttr('disabled');
					constants.cache.btns.start.attr('disabled','disabled');
					constants.cache.btns.addPool.attr('disabled','disabled');
					
					pools.parsePools();
				});
				
				// TODO: Add bootstrap js back in
				//$('.tooltipped').tooltip();
				
				$('.protocol-items').click(function(){
					var $this = $(this);
					console.log($this.text());
					var $btn = $this.parents("ul").siblings('.protocol');
					console.log($btn);
					$btn.html($this.text() + ' <span class="caret"></span>');
				});
			}
		};
		
		app.init();
		
		return app;
	}
);