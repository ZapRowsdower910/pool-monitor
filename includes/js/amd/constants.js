/**
* Constants
* v1.0.1
**/

define(["jquery"], function(){
		return {
			ERROR_TYPE: {
				ajax : "Ajax",
				prompt : "Prompt",
				resize : "Resize",
				animation : "Animation",
				general : "General",
				processor : "Processor",
				fatal : "Fatal",
				internal : "Internal"
			},
			URLS: {
				proxy : 'proxy.cfm'
			},
			EMPTY_WORKER : '<li class="list-group-item worker"><b class="workerLbl"></b> <span class="workerHashRate"></span></li>',
			settings : {
				errorLimit : 5
			},
			cache : {
				monitorForm : $('#monitorForm'),
				monitorOutput : $('#monitorOutput'),
				btns : {
					addPool : $('.add-pool'),
					start : $('#start'),
					stop : $('#stop'),
					nuke : $('.nuke-cookies')
				},
				charts : {
					user : undefined,
					shares : undefined
				}
			},
			state : {
				monitorEnabled : false
			}
		};
	}
);