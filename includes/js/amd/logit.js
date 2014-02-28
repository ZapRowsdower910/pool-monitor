/***
	JSLogger
	v2.0.0
***/
define(["jquery"], 
	function(){

		var configs = {
			loggingLevel : "off",
			logToConsole : false,
			logToAlertFallback : false
		};
		var consoleState = {consolePresent : false, consoleGroup:false, initialized:false, enabled:false};
		var levels = ["off", "error","warn","info","debug"]; // Array index corresponds to text level of log output
		var logger = {
			init : function(options){
				if(options){
					$.extend(configs, options);
				}
				// backwards compatibility
				if(configs.loggingLevel === true){
					configs.loggingLevel = 'debug';
				} else if(configs.loggingLevel === false){
					configs.loggingLevel = 'off';
				}
				logger.testConsole();
				consoleState.initialized = true;
				logger.log(3, ["Logging initialized"]);
				return consoleState.enabled;
			},
			testConsole : function(){
				consoleState.consolePresent = !!(window.console && window.console.log);
				consoleState.consoleGroup = !!(consoleState.consolePresent && console.group && console.groupEnd);
				consoleState.groupEnabled = !!(configs.logToConsole && consoleState.consolePresent && consoleState.consoleGroup);
				if((configs.logToConsole || configs.logToAlertFallback) && (configs.loggingLevel != 'off')){
					consoleState.enabled = true;
				}
			},
			log : function(lvl, msgs){
				if(consoleState.initialized === false){
					logger.init();
				}
				
				for(var i = 0; i < levels.length; i++){
					if(levels[i] == configs.loggingLevel){
						
						if(lvl <= i){
							logger.writeToConsole(lvl, msgs);
						}
						break;
					}
				}
			},
			writeToConsole : function(lvl,msg){
				if(configs.logToConsole === false && configs.logToAlertFallback === true){
					alert(msg);
				} else if(configs.logToConsole === true && consoleState.consolePresent === true){
					// Get text version of log level
					var txtLvl = levels[lvl];
					
					var logData = '';
					for(var i = 0; i < msg.length; i++){
						logData += logger.dumpObj(msg[i]);
					}
					// Make sure we have this level before logging to it
					if(console[txtLvl]){
						console[txtLvl](logData);
					} else {
						console.log(logData);
					}
				}
			},
			startCollapsedGroup : function(name){
				if(configs.loggingLevel !== 'off'){
					if(name.length && consoleState.groupEnabled){
						console.groupCollapsed != undefined ? console.groupCollapsed(name[0]) : console.group(name[0]);
					}
				}
			},
			startGroup : function(name){
				if(configs.loggingLevel !== 'off'){
					if(name.length && consoleState.groupEnabled){
						console.group(name[0]);
					}
				}
			},
			endGroup : function(){
				if(configs.loggingLevel !== 'off'){
					if(consoleState.groupEnabled){
						console.groupEnd();
					}
				}
			},
			dumpObj : function(obj,itr){
				var returnString = "";
				if(!itr){
					itr = 0;
				}
				try{
					// We check to see if its DOM to prevent an infinite loop
					var isItDom = obj.tagName ? true : false;
					// Only go down 3 levels before breaking out
					if(typeof obj === 'object' && isItDom === false && itr < 3){
						$.each(obj, function(item, val){
							if(obj.hasOwnProperty(item)) {
								// is the value wrapped in $uery - if so its most likely a element
								var isValDom = val.$uery ? true : false;
								if(typeof val === 'object' && isValDom === false){
									returnString += "{" + item + " : " + logger.dumpObj(val,++itr) + "}";
								} else if(isValDom === true){
									returnString += "{ " + item + " : #" + val[0].id + " }";
								} else {
									returnString += "{ " + item + " : " + val + " }";
								}
							}
						});
					} else if(isItDom){
							returnString = obj.id != "" ? "#" + obj.id : obj.tagName + "." + obj.className;
					} else {
						returnString = obj;
					}
				// In the event of an error - simply return the string we passed in.
				} catch (ex){
					returnString = obj;
				}
				return returnString;
			}
		};
		
		window.log = {
			init : function(options){return logger.init(options);}, 
			error : function(){logger.log.call(this, 1,arguments); },
			warn : function(){logger.log.call(this, 2,arguments); },
			info : function(){logger.log.call(this, 3,arguments); },
			debug : function(){logger.log.call(this, 4,arguments); },
			startCollapsedGroup : function(){logger.startCollapsedGroup.call(this,arguments);},
			startGroup : function(){logger.startGroup.call(this,arguments);},
			endGroup : function(){logger.endGroup.call(this,arguments);}
		};

	}
);
