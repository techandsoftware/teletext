/* globals cast, chrome */
const CHROMECAST_APPLICATION_CUSTOM_MESSAGE_NAMESPACE = 'urn:x-cast:uk.ltd.techandsoftware.teletext';
const CHROMECAST_RECEIVER_APPLICATION_ID = '000F65B3';

class TeletextCaster {
    constructor() {
    }

    _init() {
        if (typeof cast == 'undefined') {
            console.error("TeletextCaster: failed to init: 'cast' not defined");
            return;
        }
        var options = {
            receiverApplicationId: CHROMECAST_RECEIVER_APPLICATION_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        };
        cast.framework.CastContext.getInstance().setOptions(options);
      
        this._remotePlayer = new cast.framework.RemotePlayer();
        this._remotePlayerController = new cast.framework.RemotePlayerController(this._remotePlayer);
        this._remotePlayerController.addEventListener(
            cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            e => this._switchPlayer(e.value)
        );
    }

    discover() {

    }

    async display(packedPage) {
        const castSession = this._getSession();
        const mediaInfo = new chrome.cast.media.MediaInfo('data:,', 'video/mp4');
        mediaInfo.entity = packedPage;
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        try {
            await castSession.loadMedia(request)
            console.debug('TeletextCaster.display: ok');
        } catch (e) {
            console.trace(e);
            console.error('TeletextCaster.display failed:', e.message);
        }
    }

    clear() {

    }

    disconnect() {

    }

    reveal() {

    }

    mix() {

    }

    _getSession() {
        return cast.framework.CastContext.getInstance().getCurrentSession();
    }

    _switchPlayer(isConnected) {
        if (isConnected) {
            this.display("QIECBAgQIIcWLGg2EDFy2QIJu_cgZNUETLjQA2TN0xYr2DAodJIECBAgQIEGDB4_PUCBAgQIECBAgQIECBAgQIEANkvaMih0kgQIECDA1Qfv__OgQYGCBAgQIECBAgQIECBAgQIECBAgKHSSBAgQIH6FR-__-v7___oECBAgQIEAORPmxUE6LXpoECAodJIECBAoQKum7______9-gQIECBAgQA82_Zs39-aB8-QIAh0kgQIECBAgSev_____v06BAgQIECBAgQIECBAgQIECBAgKHSSBAgQIECBR00____-_w9GCBAgQIECBAgQIECBAgQIECAodJIECBAgQIECD8rx________ECBAgQIECBAgQIECBAgQICh0kgQIECBAgQLETRlv_______6oECBAgQIECBAgQIECBAgKHSyBAgQIHGQlwYIEH_-_x_____9-dECBAgQIECBAgQIECAIdLIECDAmJbfz_-0RJ0qBV________7sECBAgQIECBAgQIAh0sgQIMzAl-__fX5Sg0JECvX______586IECBAgQIECBAgCHSyBAgwJiW9OjX_0qBAgQIEX________-l8fPjBAgQIECAIdLIEHBYhQIECBQxQICWDhg5fv____________tUCBAgQIAh0sgzIECBAgQIEGlAgQEtP_______________-lQIECBAgCHSyBUwQIECBAgQakCBASQqv_____________-6FAgQIECAIdLIECJygQIECBAgaoEBJBg______________5-OiBAgQIAh0sgQKGKBAgQIEHBKgJIMH7____8v__________QoECBAgCHSyBRmQIECBA4RoECAkgVoVaNel________r16FAgQIECAIdLINCFAgwOEyBAgQICSBAgQePn7___r06RAgQIECBAgQIAh0sgQLeKxCgQIECBAgJIECDR__v0aNGhQIECBAgQIECBAgCHSSBAgQIECBAgQIECBAgQYP3_-1QIECBAgQIECBAgQIECAIdJIECBAgQIECBAgQIECBB6boUSBAgQIECBAgQIECBAgQIAh0kgQIECBAgQIECBAgQIFStAgQIECBAgQIECBAgQIECBAgAzsvjognZe_MFIy4cmzTuy8wdTfwQU-G_l0DVKy-lhyad6A");
        }
    }
}

export const ttxcaster = new TeletextCaster();

window['__onGCastApiAvailable'] = isAvailable => {
    if (isAvailable) {
        if (typeof cast == 'undefined') {
            throw new Error("TeletextCaster: 'cast' is not defined even though __onGCastApiAvailable says it is");
        }
        ttxcaster._init();
    }
};
