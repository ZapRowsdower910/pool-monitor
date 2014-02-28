define(["jquery","logit"],
	function(){
		"use strict";
		
		var formatter = {
			time : function(seconds){					
				var minutes = Math.floor( seconds / 60 );
				var secs = Math.floor(seconds % 60);
				var formattedTime = minutes + 'm ' + secs + 's';
				return formattedTime;
			},
			hashRate : function(rate){
				if(rate > 1024){
					if(rate > 1024000){
						return (rate / 1024000).toFixed(2) + 'Ghs';
					} else {
						return (rate / 1024).toFixed(2) + 'Mhs';
					}
				} else {
					return rate + 'Khs';
				}
			}
		};
		
		return formatter;
	}
);