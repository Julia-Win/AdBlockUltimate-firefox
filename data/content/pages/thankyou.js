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
var PageController = function () {
};

PageController.prototype = {

	init: function () {

		this._bindEvents();
		this._render();
/*
		$(".sp-table-row-input").toggleCheckbox();
		$("[data-popup]").popupHelp();

		updateDisplayAdguardPromo(!userSettings.values[userSettings.names.DISABLE_SHOW_ADGUARD_PROMO_INFO]);
		customizePopupFooter(environmentOptions.isMacOs);
*/
	},
	_bindEvents: function () {
		this.malwareDomainsEnabledCheckbox = $('#malware');
		this.socialFilterEnabledCheckbox = $('#social');

  		this.malwareDomainsEnabledCheckbox.on('change', this.malwareDomainsEnabledChange);
        this.socialFilterEnabledCheckbox.on('change', this.socialFilterEnabledChange);

/*
		this.safebrowsingEnabledCheckbox = $("#safebrowsingEnabledCheckbox");
		this.trackingFilterEnabledCheckbox = $("#trackingFilterEnabledCheckbox");
		//this.socialFilterEnabledCheckbox = $("#socialFilterEnabledCheckbox");
		this.sendSafebrowsingStatsCheckbox = $("#sendSafebrowsingStatsCheckbox");
        this.allowAcceptableAdsCheckbox = $("#allowAcceptableAds");

        this.malwareDomainsEnabledCheckbox.on('change', this.safebrowsingEnabledChange);
        this.socialFilterEnabledCheckbox.on('change', this.safebrowsingEnabledChange);
/*
		this.safebrowsingEnabledCheckbox.on('change', this.safebrowsingEnabledChange);
		this.trackingFilterEnabledCheckbox.on('change', this.trackingFilterEnabledChange);
		this.socialFilterEnabledCheckbox.on('change', this.socialFilterEnabledChange);
		this.sendSafebrowsingStatsCheckbox.on('change', this.sendSafebrowsingStatsChange);
        this.allowAcceptableAdsCheckbox.on('change', this.allowAcceptableAdsChange);

		$(".openExtensionStore").on('click', function (e) {
			e.preventDefault();
			contentPage.sendMessage({type: 'openExtensionStore'});
		});
		*/
	},

	safebrowsingEnabledChange: function () {
		contentPage.sendMessage({
			type: 'changeUserSetting',
			key: userSettings.names.DISABLE_SAFEBROWSING,
			value: !this.checked
		});
	},

	trackingFilterEnabledChange: function () {
		if (this.checked) {
			contentPage.sendMessage({type: 'addAndEnableFilter', filterId: AntiBannerFiltersId.TRACKING_FILTER_ID});
		} else {
			contentPage.sendMessage({type: 'removeAntiBannerFilter', filterId: AntiBannerFiltersId.TRACKING_FILTER_ID});
		}
	},

	malwareDomainsEnabledChange: function () {
		if (this.checked) {
			contentPage.sendMessage({type: 'addAndEnableFilter', filterId: malwareFilterId});
		} else {
			contentPage.sendMessage({type: 'removeAntiBannerFilter', filterId: malwareFilterId});
		}
	},

	socialFilterEnabledChange: function () {
		if (this.checked) {
			contentPage.sendMessage({type: 'addAndEnableFilter', filterId: socialFilterId});
		} else {
			contentPage.sendMessage({type: 'removeAntiBannerFilter', filterId: socialFilterId});
		}
	},

	sendSafebrowsingStatsChange: function () {
		contentPage.sendMessage({
			type: 'changeUserSetting',
			key: userSettings.names.DISABLE_SEND_SAFEBROWSING_STATS,
			value: !this.checked
		});
		contentPage.sendMessage({
			type: 'changeUserSetting',
			key: userSettings.names.DISABLE_COLLECT_HITS,
			value: !this.checked
		});
	},
    allowAcceptableAdsChange: function() {
		if (this.checked) {
			contentPage.sendMessage({type: 'addAndEnableFilter', filterId: AntiBannerFiltersId.ACCEPTABLE_ADS_FILTER_ID});
		} else {
			contentPage.sendMessage({type: 'removeAntiBannerFilter', filterId: AntiBannerFiltersId.ACCEPTABLE_ADS_FILTER_ID});
		}
    },

	_render: function () {		
		var malwareFilterEnabled = malwareFilterId in enabledFilters;
		var socialFilterEnabled = socialFilterId in enabledFilters;
		this._renderFilter(this.malwareDomainsEnabledCheckbox, malwareFilterEnabled);
		this._renderFilter(this.socialFilterEnabledCheckbox, socialFilterEnabled);
	},

	_renderSafebrowsingSection: function (safebrowsingEnabled, sendSafebrowsingStats, collectHitStats) {
		this.safebrowsingEnabledCheckbox.updateCheckbox(safebrowsingEnabled);
		this.sendSafebrowsingStatsCheckbox.updateCheckbox(sendSafebrowsingStats || collectHitStats);
	},

	_renderFilter: function (checkbox, enabled) {
		checkbox.updateCheckbox(enabled);
	}
};
/*
 phishing and malware database contains
more than 1 million websites.
On average we add more than 100 ad filter rules every week.
90% of viruses and malicious software is distributed
through unscrupulous ad networks.
*/
var userSettings;
var AntiBannerFiltersId;
var enabledFilters;
var environmentOptions;
var malwareFilterId;
var socialFilterId;

contentPage.sendMessage({type: 'initializeFrameScript'}, function (response) {
	userSettings = response.userSettings;
	//enabledFilters = response.enabledFilters;
	environmentOptions = response.environmentOptions;
	AntiBannerFiltersId = response.constants.AntiBannerFiltersId;

	$.each(response.filtersMetadata, function(key, filter){
		if(filter.name == 'Malware Domains'){
			malwareFilterId = filter.filterId;
			if(malwareFilterId && socialFilterId)
				return false;
		}else if(filter.name == 'Fanboy\'s Social Blocking List'){
			socialFilterId = filter.filterId;
			if(malwareFilterId && socialFilterId)
				return false;
		}
	});

	contentPage.sendMessage({type: 'getFiltersMetadata'}, function (response) {
		enabledFilters = response.enabledFilters;
		$(document).ready(function () {
			var controller = new PageController();
			controller.init();
		});
	});
});

