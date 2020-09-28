export class Event {
    constructor(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    attach(listener) {
        this._listeners.push(listener);
    }

    notify(args) {
        this._listeners.forEach((val, index) => this._listeners[index](this._sender, args));
    }
}
