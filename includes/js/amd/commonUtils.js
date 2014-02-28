/**
* CommonUtils - A collection of tools and script that are used accrossed many projects.
* v1.1.0
**/

define(["constants","jquery","logit"], 
	function(constants){
		"use strict";

		return {
			loadCSS : function(url){
				if(url){
					var e = document.createElement("link");
					e.href = url;
					e.type="text/css";
					e.rel="stylesheet";
					e.media="screen";
					document.getElementsByTagName("head")[0].appendChild(e);
					log.debug("CSS File Loaded ["+url+"]");
					
					return true;
				} else {
					log.debug("Invalid CSS File URL ["+url+"]");
					return false;
				}
			},
			
			handleError : function(errorDetails){
				log.error("Error Encountered", errorDetails);
			},
			exeCallback : function(callbackFn, data){
				try{
					if(typeof callbackFn == 'function'){
						log.startCollapsedGroup('Callback Function');
						log.info("Callback firing for [", callbackFn, "] with data of [", (data !== undefined ? data : ""), "]");
						if(data !== undefined){
							callbackFn.call(this, data);
						} else {
							callbackFn.call(this);
						}
						log.endGroup('Callback Function');
					} else if(callbackFn !== ""){
						log.warn("Callback function was not type function - unable to process callback.");
					}
				} catch(e){
					var errorData = {
						type : constants.ERROR_TYPE.general,
						message : 'A general error has occurred in the callback method',
						data : {
							'exception' : {
								'message' : e.message
							}
						}
					};
					this.handleError(errorData);
					log.endGroup('Callback Function');
					return false;
				}
			},
			preloadImages : function(arrayOfImages) {
				var client = GetInstance();

				if(arrayOfImages === undefined){
					if(client.getConfigs().LoadingImg !== "" && client.getConfigs().ExitImg !== ""){
						arrayOfImages = [ client.getConfigs().LoadingImg, client.getConfigs().ExitImg ];
					} else if(client.getConfigs().LoadingImg !== ""){
						arrayOfImages = [ client.getConfigs().LoadingImg ];
					} else if(client.getConfigs().ExitImg !== ""){
						arrayOfImages = [ client.getConfigs().ExitImg ];
					} else{
						log.debug("No images found to preload.")
						arrayOfImages = [];
					}
				}

				// If we have Extra Content search for any images and preload them
				if(client.getConfigs().ExtraContent !== ''){
					var $xtraImages = jQ('#'+client.getConfigs().ExtraContent).find('img');
					if($xtraImages.length){
						for(var i=0;i<$xtraImages.length;i++){
							arrayOfImages.push($xtraImages[i].src);
						}
					}
				}
				
				if(arrayOfImages instanceof Array ){

					for(var i = 0; i < arrayOfImages.length;i++){
						var imgLoader = new Image();
						imgLoader.src = arrayOfImages[i];
						log.debug("Image ["+arrayOfImages[i]+"] preloaded.");
					}
				}else{
					log.error("Input must be of type array.");
				}
			},
			// Will parse name value pairs into an Object only if that Object has the name defined in it already.
			parsePayload : function(payloadString, payload){
				
				log.startGroup("Populate Object");
				if(payloadString && payload && typeof payload == 'object'){
					log.debug("Populating object from response data..");
					
					var strPayload = new String(payloadString);
					var payloadArray = strPayload.split("&");
					
					for(var i = 0; i < payloadArray.length;i++){
						var temp = payloadArray[i].split("=");
						 if(temp.length > 1 && payload.hasOwnProperty(temp[0])){
							payload[temp[0]] = this.decode(temp[1]);
						 } else {
							log.debug("No Key Value pairs found.");
						 }
					}
					
					log.debug(payload);
				} else {
					log.debug("illegal arguments.");
				}
				log.endGroup();
			},
			decode : function(str) {
				return unescape(str.replace(/\+/g, " "));
			},
			ajaxRequestAsJSON : function(client, url, data, successCallback, failureCallback, timeout, context){
				var local = this;
				var ajaxDfd = jQ.ajax({
					url: url,
					type: "POST",
					data: data,
					processData: false,
					dataType: "json",
					success: function(data){
						if(context != undefined){
							successCallback.call(context, client, data);
						} else {
							successCallback(client, data);
						}
					},
					error: function(jqXHR, textStatus, errorThrown){
							local.executeCallback(failureCallback);
							// On Error we execute the AjaxErrorHandler - Merchants should integrate this on their side.
							var errorData = {
								type : constants.ERROR_TYPE.ajax,
								message : 'Ajax request resulted in an error',
								data : {
									'jqXHR':jqXHR,
									'textStatus':textStatus, 
									'errorThrown':errorThrown
								}
							};
							local.handleError(client, errorData);
					},
					timeout : timeout
				});
			
				return ajaxDfd;
			},
			validateConfig : function(name,val,type){
				if(!val || val.length < 0){
					throw new this.validationException("Invalid Configuration - ["+(name ? name : "")+"] [" + val + "]");
				}
				if(type){
					if(typeof val != type){
						throw new this.validationException("Invalid Configuration - ["+(name ? name : "")+"] is expected to be of type [" + type + "]");
					}
				}
				return true;
			},
			ajaxException : function(msg, data){
				this.type = constants.ERROR_TYPE.ajax;
				this.message = msg;
				this.data = data || {};
			},
			// Exception returned when validation fails.
			validationException : function(msg){
				this.type = constants.ERROR_TYPE.general;
				this.message = msg;
			},
			// Internal Exception for helper methods
			illegalArgumentsException : function(arg, msg){
				this.type = constants.ERROR_TYPE.internal,
				this.message = (msg != undefined) ? msg : "["+arg+"] is a required field and must be populated";
			},
			// Exceptions that cannot be recovered from
			fatalException : function(msg, details){
				this.type = constants.ERROR_TYPE.fatal;
				this.message = msg;
				this.data = data || {};
			}
		};
	}
);