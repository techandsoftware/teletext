export class Event {
    constructor(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    attach(listener) {
        this._listeners.push(listener);
        return this._listeners.length - 1;
    }

    notify(args) {
        this._listeners.forEach(fn => fn != null && fn(this._sender, args));
    }

    detach(index) {
        this._listeners[index] = null;
    }
}
