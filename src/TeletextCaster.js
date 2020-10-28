/* globals cast, chrome */
import { Event } from './Event.js';

const CHROMECAST_APPLICATION_CUSTOM_MESSAGE_NAMESPACE = 'urn:x-cast:uk.ltd.techandsoftware.teletext';
const CHROMECAST_RECEIVER_APPLICATION_ID = '000F65B3';

class TeletextCaster {
    constructor() {
        this.connected = new Event(this);
    }

    _init() {
        if (typeof cast == 'undefined') {
            console.error("TeletextCaster: failed to init: 'cast' not defined");
            return;
        }
        const options = {
            receiverApplicationId: CHROMECAST_RECEIVER_APPLICATION_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        };
        cast.framework.CastContext.getInstance().setOptions(options);
      
        this._remotePlayer = new cast.framework.RemotePlayer();
        this._remotePlayerController = new cast.framework.RemotePlayerController(this._remotePlayer);
        this._remotePlayerController.addEventListener(
            cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            e => this._handleChangeOfConnected(e.value)
        );
    }

    async display(packedPage) {
        if (!this._isConnected()) return;

        const session = this._getSession();
        const mediaInfo = new chrome.cast.media.MediaInfo('data:,', 'video/mp4');
        mediaInfo.entity = packedPage;
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        try {
            await session.loadMedia(request)
            console.debug('TeletextCaster.display: ok');
        } catch (e) {
            console.error('TeletextCaster.display failed:', e.toString());
        }
    }

    clearScreen() {
        this._sendCommand('clear');
    }

    toggleGrid() {
        this._sendCommand('grid');
    }

    toggleReveal() {
        this._sendCommand('reveal');
    }

    toggleMixMode() {
        this._sendCommand('mix');
    }

    toggleBoxMode() {
        this._sendCommand('box');
    }

    async _sendCommand(command) {
        if (!this._isConnected()) return;

        const session = this._getSession();
        try {
            await session.sendMessage(CHROMECAST_APPLICATION_CUSTOM_MESSAGE_NAMESPACE, `"${command}"`);
            console.debug(`TeletextCaster._sendCommand: ${command} sent o_O`)
        } catch (e) {
            console.error('TeletextCaster._sendCommand E67: failed to send:', e.toString());
        }
    }

    _isConnected() {
        return cast && cast.framework && this._remotePlayer.isConnected;
    }

    _getSession() {
        return cast.framework.CastContext.getInstance().getCurrentSession();
    }

    _handleChangeOfConnected(isConnected) {
        if (isConnected) this.connected.notify();
    }
}

export const ttxcaster = new TeletextCaster();

let checkForCastCount = 0;
window['__onGCastApiAvailable'] = isAvailable => {
    if (isAvailable) {
        if (typeof cast == 'undefined') {
            delayedCheckForCast();
        } else {
            ttxcaster._init();
        }
    }
};

// FUDGE cast isn't set reliably so we have to work around that
function delayedCheckForCast() {
    window.setTimeout(() => {
        if (typeof cast == 'undefined') {
            checkForCastCount++;
            if (checkForCastCount < 10) delayedCheckForCast();
        } else {
            ttxcaster._init();
        }
    }, 500);
}
