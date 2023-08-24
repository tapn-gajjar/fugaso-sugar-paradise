export class BaseNetworkManager {
    constructor(domain, session, pass, room) {
        this.session = session;
        this.domain = domain;
        this.pass = pass;
        this.room = Number(room);
        this.listenMap = {};
    }

    addListener(type, listener) {
        let listeners = this.listenMap[type];
        if (!listeners) {
            listeners = [];
            this.listenMap[type] = listeners;
        }
        listeners.push(listener);
    }

    fireEvent(event) {
        const type = event.type;
        const listeners = this.listenMap[type];
        if (listeners) {
            listeners.forEach(l=>l(event));
        }
    }

    connect(onopen, onclose, onerror) {
        this.socket = new WebSocket(this.domain);
        this.socket.onopen = onopen;
        this.socket.onclose = onclose;
        this.socket.onerror = onerror;
        this.socket.onmessage = e=>this.onmessage(e);
    }

}