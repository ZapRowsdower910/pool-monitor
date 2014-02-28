define(["formatData","constants","jquery","logit"],
	function(formatter,constants){
		"use strict";
		
		var priv = {
			setData : function($poolOut, clazz, val){
				$poolOut.find(clazz).text(val);
			},
			showData : function(){
				if(constants.cache.monitorOutput.hasClass('hidden')){
					constants.cache.monitorOutput.removeClass('hidden').slideDown();
				}
			}
		};
		
		var mpos = {
			"getuserstatus" : function(data){
				if(data != undefined && typeof data == 'object'){
					var $poolOut = data.poolOut;
					var base = data.getuserstatus.data;
					priv.setData($poolOut, '.username', base.username);
					priv.setData($poolOut, '.validshares', base.shares.valid);
					priv.setData($poolOut, '.invalidshares', base.shares.invalid);
					priv.setData($poolOut, '.sharerate', base.sharerate);
					priv.setData($poolOut, '.hashrate', formatter.hashRate(base.hashrate));
					// Display stats if not already displayed
					priv.showData();
				}
			},
			"getpoolstatus" : function(data){
				if(data != undefined && typeof data == 'object'){
					var $poolOut = data.poolOut;
					var base = data.getpoolstatus.data;
					priv.setData($poolOut, '.workers', base.workers);
					priv.setData($poolOut, '.poolHashrate', formatter.hashRate(base.hashrate));
					priv.setData($poolOut, '.difficulty', base.networkdiff);
					priv.setData($poolOut, '.nextblock', formatter.time(base.esttime));
					priv.setData($poolOut, '.lastblock', formatter.time(base.timesincelast));
					// Display stats if not already displayed
					priv.showData();
					
					if(base.timesincelast < 30){
						msg("Yay!","A block was found recently!","success");
					}
				}
			},
			"getuserworkers" : function(data){
				if(data != undefined && typeof data == 'object'){
					var $poolOut = data.poolOut;
					var $workersData = $poolOut.find('.workersData');
					$workersData.children('.worker:not(.group-heading)').remove()
					var workers = data.getuserworkers.data;
					$.each(workers, function(i,v){
						var $work = $(constants.EMPTY_WORKER).clone();
						if(v.hashrate == 0){
							$work.addClass('list-group-item-warning');
						} else {
							$work.addClass('list-group-item-success');
						}
						$work.find('.workerLbl').text(v.username);
						$work.find('.workerHashRate').text(formatter.hashRate(v.hashrate));
						$workersData.append($work);
					});

					// Display stats if not already displayed
					priv.showData();
				}
			},
			"getuserbalance" : function(data){
				if(data != undefined && typeof data == 'object'){
					var $poolOut = data.poolOut;
					var base = data.getuserbalance.data;
					priv.setData($poolOut, '.payout-confirmed', base.confirmed);
					priv.setData($poolOut, '.payout-unconfirmed', base.unconfirmed);
					priv.setData($poolOut, '.payout-orphaned', base.orphaned);
					// Display stats if not already displayed
					priv.showData();
				}
			}
		};
		
		return mpos;
	}
);