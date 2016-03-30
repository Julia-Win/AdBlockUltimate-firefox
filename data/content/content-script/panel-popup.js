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
var controller = new PopupController({
    platform: 'firefox',
    abusePanelSupported: true
});
//override
controller.afterRender = function () {
    //resize popup
    controller.resizePopupWindow();
};
controller.resizePopup = function (width, height) {
    contentPage.sendMessage({type: 'resizePanelPopup', width: width, height: height});
};
//popup checkbox actions
controller.addWhiteListDomain = function (url) {
    contentPage.sendMessage({type: 'addWhiteListDomain', url: url});
};
controller.removeWhiteListDomain = function (url) {
    contentPage.sendMessage({type: 'removeWhiteListDomain', url: url});
};
controller.changeApplicationFilteringDisabled = function (disabled) {
    contentPage.sendMessage({type: 'changeApplicationFilteringDisabled', disabled: disabled});
};
//popup menu actions
controller.openSiteReportTab = function (url) {
    contentPage.sendMessage({type: 'openSiteReportTab', url: url});
};
controller.openSettingsTab = function () {
    contentPage.sendMessage({type: 'openSettingsTab'});
};
controller.toggleIconNumber = function(show){
    contentPage.sendMessage({
        type: 'changeUserSetting',
        key: 'disable-show-page-statistic',
        value: show
    });
}
controller.openAssistantInTab = function () {
    contentPage.sendMessage({type: 'openAssistant'});
};
controller.openLink = function (url) {
    contentPage.sendMessage({type: 'openTab', url: url});
};
controller.openAbusePanel = function () {
    contentPage.sendMessage({type: 'openAbusePanel'});
};
controller.openFilteringLog = function (tabId) {
    contentPage.sendMessage({type: 'openFilteringLog', tabId: tabId});
};
controller.resetBlockedAdsCount = function () {
    contentPage.sendMessage({type: 'resetBlockedAdsCount'});
};
controller.getUserRank = function(callback){
    contentPage.sendMessage({type: 'getUserRank'});
};
contentPage.onMessage.addListener(function (message) {
    if(message.type == 'getUserRank'){
        controller.setLogo(message['rank']['logo']);
    }
});    
contentPage.onMessage.addListener(function (message) {
    if (message.type === 'initPanelPopup') {
        //render popup
        controller.render(message.tabInfo, message.filteringInfo);
    }
    if (message.type === 'resizePanelPopup') {
        controller.resizePopupWindow();
    }
});
