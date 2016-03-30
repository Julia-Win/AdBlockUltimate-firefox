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
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var userSettings = require('./utils/user-settings').userSettings;
var EventNotifier = require('./utils/notifier').EventNotifier;
var EventNotifierTypes = require('./utils/common').EventNotifierTypes;

/**
 * Object that manages context menu
 */
var ContextMenu = exports.ContextMenu = {

	init: function (UI, SdkContextMenu) {

		this.UI = UI;
		this.contextMenu = SdkContextMenu;

		if (userSettings.showContextMenu()) {
			this._initMenuLazy();
		}
		EventNotifier.addListener(function (event, setting) {
			if (event == EventNotifierTypes.CHANGE_USER_SETTINGS && setting == userSettings.settings.DISABLE_SHOW_CONTEXT_MENU) {
				this._initMenuLazy();
				this._customizeMenu({});
			}
		}.bind(this));
	},

	onMessage: function (message) {
		switch (message.type) {
			case 'onContext':
				this._customizeMenu(message.data.contextDetails);
				break;
			case 'onClick':
				var url = message.data.url;
				var UI = this.UI;
				switch (message.data.action) {
					case 'context_site_filtering_off':
						UI.whiteListCurrentTab();
						break;
					case 'context_site_filtering_on':
						UI.unWhiteListCurrentTab();
						break;
						/*
					case 'context_enable_protection':
						UI.changeApplicationFilteringDisabled(false);
						break;
					case 'context_disable_protection':
						UI.changeApplicationFilteringDisabled(true);
						break;
						*/
					case 'context_block_site_ads':
						UI.openAssistant();
						break;
					case 'context_abuse_site':
						UI.openTab('https://adblockultimate.com/report?url='+encodeURIComponent(tabs.activeTab.url));
						break;
					case 'context_update_antibanner_filters':
						UI.checkAntiBannerFiltersUpdate();
						break;
					case 'context_open_settings':
						UI.openSettingsTab();
						break;
				}
				break;
		}
	},

	_createItem: function (label, options, constructorOptions) {
		var args = null;
		var data = null;
		if (options) {
			args = options.args;
			data = options.data;
		}
		var text = this.UI.getLocalizedMessage(label, args);
		var createProps = {label: text, data: data || label};
		if (constructorOptions) {
			for (var key in constructorOptions) {
				createProps[key] = constructorOptions[key];
			}
		}
		return this.contextMenu.Item(createProps);
	},

	_createSeparator: function () {
		return this.contextMenu.Separator();
	},
	_initMenuLazy: function () {
		if (this.menu) {
			return;
		}
		this.menu = this.contextMenu.Menu({
			label: "AdBlock Ultimte",
			contentScriptFile: [
				self.data.url('content/content-script/assistant/js/selector.js'),
				self.data.url('content/content-script/context-menu-content.js')
			],
			onMessage: this.onMessage.bind(this)
		});
		this.menu.addItem(this._createItem('item', 'item'));
	},

	_customizeMenu: function (contextDetails) {
		this._clearMenu();
		if (!userSettings.showContextMenu()) {
			return;
		}
		//frame info already updated
		var tabInfo = this.UI.getCurrentTabInfo();
		if (tabInfo.applicationFilteringDisabled) {
			this.menu.addItem(this._createItem('context_site_protection_disabled'));
			this.menu.addItem(this._createSeparator());
			this.menu.addItem(this._createItem('context_abuse_site'));
			this.menu.addItem(this._createSeparator());
			this.menu.addItem(this._createItem('context_open_settings'));
			//this.menu.addItem(this._createItem('context_enable_protection'));
		} else if (tabInfo.urlFilteringDisabled) {
			this.menu.addItem(this._createItem('context_site_filtering_disabled'));
			this.menu.addItem(this._createSeparator());
			this.menu.addItem(this._createItem('context_open_settings'));
			this.menu.addItem(this._createItem('context_update_antibanner_filters'));
		} else {
			if (tabInfo.adguardDetected) {
				if (tabInfo.adguardProductName) {
					this.menu.addItem(this._createItem('context_ads_has_been_removed_by_abu', {args: [tabInfo.adguardProductName]}));
				} else {
					this.menu.addItem(this._createItem('context_ads_has_been_removed'));
				}
				this.menu.addItem(this._createSeparator());
			}
			if (tabInfo.documentWhiteListed && !tabInfo.userWhiteListed) {
				this.menu.addItem(this._createItem('context_site_exception'));
			} else if (tabInfo.canAddRemoveRule) {
				if (tabInfo.documentWhiteListed) {
					this.menu.addItem(this._createItem('context_site_filtering_on'));
				} else {
					this.menu.addItem(this._createItem('context_site_filtering_off'));
				}
			}
			this.menu.addItem(this._createSeparator());
			this.menu.addItem(this._createItem('context_abuse_site'));
			if (!tabInfo.adguardDetected) {
				this.menu.addItem(this._createSeparator());
				this.menu.addItem(this._createItem('context_open_settings'));
				this.menu.addItem(this._createItem('context_update_antibanner_filters'));
				//this.menu.addItem(this._createItem('context_disable_protection'));
			}
		}
	},

	_clearMenu: function () {
		for (var i = this.menu.items.length - 1; i >= 0; i--) {
			this.menu.removeItem(this.menu.items[i]);
		}
		if (this.blockImageMenu) {
			this.blockImageMenu.destroy();
		}
	}
};
