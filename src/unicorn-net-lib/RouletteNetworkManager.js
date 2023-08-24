/**
 * Created by boria on 10.08.16.
 */
import {Event} from './events/Event'
import {PacketLogin} from './packets/client/PacketLogin'
import {BaseNetworkManager} from './BaseNetworkManager'
import {PacketCollect} from './packets/client/PacketCollect'
import {PacketEmpty} from './packets/client/PacketEmpty'
import {PacketHistory} from './packets/client/PacketHistory'
import {PacketJackpots} from './packets/client/PacketJackpots'
import {PacketGameDataRs} from './packets/server/PacketGameDataRs'
import {PacketGambleChoice} from './packets/client/PacketGambleChoice'
import {PacketRoulettePlay} from './packets/client/PacketRoulettePlay'
import {PacketRouletteStats} from './packets/client/PacketRouletteStats'

export class RouletteNetworkManager extends BaseNetworkManager {

    close() {
        socket.close();
    }

    connect(onopen, onclose, onerror) {
        this.socket = new WebSocket(this.domain);
        this.socket.onopen = onopen;
        this.socket.onclose = e=> {
            clearInterval(this.timer);
            onclose(e);
        };
        this.socket.onerror = onerror;
        this.socket.onmessage = e=>this.onmessage(e);
    }

    empty() {
        var packet = new PacketEmpty();
        this.socket.send(packet);
    }

    ping() {
        clearInterval(this.timer);
        this.timer = setInterval(()=> {
            this.empty();
        }, 90 * 1000);
    }

    login() {
        var packet = new PacketLogin(this.session, this.pass);
        this.socket.send(packet);
    }

    collect() {
        var packet = new PacketCollect();
        this.socket.send(packet);
    }

    getHistory(limit) {
        var packet = new PacketHistory(limit);
        this.socket.send(packet);
    }

    getJackpots() {
        var packet = new PacketJackpots();
        this.socket.send(packet);
    }

    play(bets){
        var packet = new PacketRoulettePlay(bets);
        this.socket.send(packet);
    }

    gambleRed() {
        var packet = new PacketGambleChoice('r');
        this.socket.send(packet);
    }

    gambleBlack() {
        var packet = new PacketGambleChoice('b');
        this.socket.send(packet);
    }

    getStats(){
        var packet = new PacketRouletteStats();
        this.socket.send(packet);
    }

    onmessage(event) {
        var input = JSON.parse(event.data);
        var packet = new PacketGameDataRs(input);
        var event = new Event(packet.kind, packet);
        this.fireEvent(event);
    }
}