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
import {PacketBlackJackDeal} from './packets/client/PacketBlackJackDeal'
import {PacketBlackJackHit} from './packets/client/PacketBlackJackHit'
import {PacketBlackJackStand} from './packets/client/PacketBlackJackStand'
import {PacketBlackJackTake} from './packets/client/PacketBlackJackTake'
import {PacketBlackJackDouble} from './packets/client/PacketBlackJackDouble'
import {PacketBlackJackInsurance} from './packets/client/PacketBlackJackInsurance'
import {PacketBlackJackSplit} from './packets/client/PacketBlackJackSplit'
import {PacketBlackJackTakeOne} from './packets/client/PacketBlackJackTakeOne'
import {PacketGambleChoice} from './packets/client/PacketGambleChoice'
import {PacketBlackJackEven} from './packets/client/PacketBlackJackEven'

export class BlackJackNetworkManager extends BaseNetworkManager {

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

    deal(bets){
        var packet = new PacketBlackJackDeal(bets);
        this.socket.send(packet);
    }

    hit(){
        var packet = new PacketBlackJackHit();
        this.socket.send(packet);
    }

    stand(){
        var packet = new PacketBlackJackStand();
        this.socket.send(packet);
    }

    take(){
        var packet = new PacketBlackJackTake();
        this.socket.send(packet);
    }

    takeOne(){
        var packet = new PacketBlackJackTakeOne();
        this.socket.send(packet);
    }

    double(){
        var packet = new PacketBlackJackDouble();
        this.socket.send(packet);
    }

    insure(use){
        var packet = new PacketBlackJackInsurance(use);
        this.socket.send(packet);
    }

    even(use){
        var packet = new PacketBlackJackEven(use);
        this.socket.send(packet);
    }

    split(){
        var packet = new PacketBlackJackSplit();
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

    onmessage(event) {
        var input = JSON.parse(event.data);
        var packet = new PacketGameDataRs(input);
        var event = new Event(packet.kind, packet);
        this.fireEvent(event);
    }
}