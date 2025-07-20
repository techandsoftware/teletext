// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

export class Event {
    constructor(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    attach_(listener) {
        this._listeners.push(listener);
        return this._listeners.length - 1;
    }

    notify_(args) {
        this._listeners.forEach(fn => fn != null && fn(this._sender, args));
    }

    detach_(index) {
        this._listeners[index] = null;
    }
}
