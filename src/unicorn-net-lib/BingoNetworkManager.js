/**
 * Created by boria on 10.08.16.
 */
import {Event} from './events/Event'
import {PacketLogin} from './packets/client/PacketLogin'
import {BaseNetworkManager} from './BaseNetworkManager'
import {PacketGameDataRs} from './packets/server/PacketGameDataRs'
import {PacketBingoBuyTickets} from './packets/client/PacketBingoBuyTickets'
import {PacketBingoAskDraw} from './packets/client/PacketBingoAskDraw'
import {PacketJackpots} from './packets/client/PacketJackpots'

export class BingoNetworkManager extends BaseNetworkManager {

    close() {
        socket.close();
    }

    connect(onopen, onclose, onerror) {
        this.socket = new WebSocket(this.domain);
        this.socket.onopen = onopen;
        this.socket.onclose = e => {
            clearInterval(this.timer);
            onclose(e);
        };
        this.socket.onerror = onerror;
        this.socket.onmessage = e => this.onmessage(e);
    }

    empty() {
        var packet = new PacketEmpty();
        this.socket.send(packet);
    }

    ping() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.empty();
        }, 90 * 1000);
    }

    login() {
        var packet = new PacketLogin(this.session, this.pass);
        this.socket.send(packet);
    }

    /**
     * Buy tickets for round. Returns nothing if the balls are being pulled.
     * @param count of tickets
     */
    buyTickets(count) {
        var packet = new PacketBingoBuyTickets(count);
        this.socket.send(packet);
    }

    /**
     * Gives info how much time remains till pulling balls. Negative if the balls are being pulled.
     */
    askDraw() {
        var packet = new PacketBingoAskDraw();
        this.socket.send(packet);
    }

    getJackpots() {
        var packet = new PacketJackpots();
        this.socket.send(packet);
    }

    onmessage(event) {
        var input = JSON.parse(event.data);
        var packet = new PacketGameDataRs(input);
        var event = new Event(packet.kind, packet);
        this.fireEvent(event);
    }
}