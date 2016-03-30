/**
 * This file is part of AdBlock Ultimate Browser Extension
 *
 * AdBlock Ultimate Browser Extension is free software: you can redistribute it and/or modify
 * it serves under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AdBlock Ultimate Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with AdBlock Ultimate Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Initializing required libraries for this file.
 * require method is overridden in Chrome extension (port/require.js).
 */
var LS = require('../../lib/utils/local-storage').LS;
var Log = require('../../lib/utils/log').Log;
var UI = require('../../lib/ui').UI;
//var Prefs = require('../prefs').Prefs;
var Prefs = {
	browser: 'Firefox'
};
//var PopupButton = require('../popupButton').PopupButton;

/**
 * Global stats
 */
var PageStatistic = exports.PageStatistic = function () {

	var pageStatisticProperty 	= "page-statistic";
	var userRankProperty		= "user-rank";
	var userRatedProperty		= "user-rated";
	var userShowBadgeAgain		= "user-show-badge";
	var ratePages = {'Firefox': 'https://addons.mozilla.org/en-US/firefox/addon/adblock-ultimate/reviews/add',
						'Chrome': 'https://chrome.google.com/webstore/detail/adblock-ultimate/ohahllgiabjaoigichmmfljhkcfikeof/reviews',
						'Opera': 'https://addons.opera.com/en/extensions/details/adblock-ultimate#feedback-container'};
	var contributePage = 'https://adblockultimate.com/donation.html';

	var userRanks = [{rank: 0, label: 'newbie', rankAt: 0, logo: 'icons/detailed/logo.png', 'action': '', 'buttonUrl': ''},
						{rank: 1, label: 'bronze', rankAt: 1000, logo: 'icons/detailed/logo-bronze.png', 'action': 'rate', 'buttonUrl': ratePages[Prefs.browser]},
						{rank: 2, label: 'silver', rankAt: 10000, logo: 'icons/detailed/logo-silver.png', 'action': 'rate', 'buttonUrl': ratePages[Prefs.browser]},
						{rank: 3, label: 'gold', rankAt: 100000, logo: 'icons/detailed/logo-gold.png', 'action': 'contribute', 'buttonUrl': contributePage}];
	this.setShowBadgeAgain = function(val){
	  LS.setItem(userShowBadgeAgain, !val);
	}

	this.getShowBadgeAgain = function(){
	  v = LS.getItem(userShowBadgeAgain);
	  if(!v && v != 0){
	    v = 1;
	  }
	  return v;
	}
	
	this.updateUserRank = function(rank){
		LS.setItem(userRankProperty, rank);
		if(this.getShowBadgeAgain() == 1){
			rank = this.getUserRank();
			UI.openUserPromotedPanel(rank);
		}
	}
	this.getUserRank = function(){
	  	var rankN = LS.getItem(userRankProperty) || 0;

	  	userRanks[1]['buttonUrl'] = ratePages[Prefs.browser];
	  	userRanks[2]['buttonUrl'] = ratePages[Prefs.browser];
	  	if(Prefs.browser == 'Safari'){
	  		userRanks[rankN]['buttonUrl'] = contributePage;
	  		userRanks[rankN]['action'] = 'contribute';
	  	}else if(rankN == 2){
			if(this.didUserRate() > 0){
				userRanks[rankN]['buttonUrl'] = contributePage;
				userRanks[rankN]['action'] = 'contribute';
		    }else{
		    	userRanks[rankN]['buttonUrl'] = ratePages[Prefs.browser];
		    	userRanks[rankN]['action'] = 'rate';
		  	}
	  	}
	  	return userRanks[rankN];
	}
	this.didUserRate = function(){
	  return LS.getItem(userRatedProperty) || 0;
	}
	this.updateUserRated = function(rated){
	  LS.setItem(userRatedProperty, rated);
	}
	/**
	 * Total count of blocked requests
	 *
	 * @returns Count of blocked requests
	 */
	this.getTotalBlocked = function () {
		return this._getPageStatistic().totalBlocked || 0;
	};

	/**
	 * Updates total count of blocked requests
	 *
	 * @param blocked Count of blocked requests
	 */
	this.updateTotalBlocked = function (blocked) {	    
		var stats = this._getPageStatistic();
		var rank = this.getUserRank();
		stats.totalBlocked = (stats.totalBlocked || 0) + blocked;
		  
		  newRank = 0;
		  for(i = rank['rank']; i < userRanks.length; i++){
		    newRank = i;
		    if(stats.totalBlocked < userRanks[i]['rankAt']){
		      newRank--;
		      break;
		    }
		  }
		  if(newRank > rank['rank'])
			this.updateUserRank(rank['rank']+1);
		
		LS.setItem(pageStatisticProperty, JSON.stringify(stats));
	};

	/**
	 * Resets tab stats
	 */
	this.resetStats = function () {
		LS.setItem(pageStatisticProperty, JSON.stringify(Object.create(null)));
	};

	/**
	 * Getter for total page stats (gets it from local storage)
	 *
	 * @returns {*}
	 * @private
	 */
	this._getPageStatistic = function () {
		var json = LS.getItem(pageStatisticProperty);
		var stats = Object.create(null);
		try {
			if (json) {
				stats = JSON.parse(json);
			}
		} catch (ex) {
			Log.error('Error retrieve page statistic from storage, cause {0}', ex);
		}
		return stats;
	}
};