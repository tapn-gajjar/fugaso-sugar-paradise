/**
 * Created by boria on 10.08.16.
 */
import {Event} from './events/Event'
import {Packets} from './packets/Packets'
import {PacketLogin} from './packets/client/PacketLogin'
import {BaseNetworkManager} from './BaseNetworkManager'
import {PacketLoginRs} from './packets/server/PacketLoginRs'
import {PacketCurrencyRs} from './packets/server/PacketCurrencyRs'
import {PacketJoinRs} from './packets/server/PacketJoinRs'
import {PacketJoinDataRs} from './packets/server/PacketJoinDataRs'
import {PacketGameDataRs} from './packets/server/PacketGameDataRs'
import {PacketSpin} from './packets/client/PacketSpin'
import {PacketCollect} from './packets/client/PacketCollect'
import {PacketGambleChoice} from './packets/client/PacketGambleChoice'
import {PacketFreeSpin} from './packets/client/PacketFreeSpin'
import {PacketBetLine} from './packets/client/PacketBetLine'
import {PacketEmpty} from './packets/client/PacketEmpty'
import {PacketFreeCollect} from './packets/client/PacketFreeCollect'
import {PacketRespin} from './packets/client/PacketRespin'
import {PacketBetSpin} from './packets/client/PacketBetSpin'
import {PacketDrop} from './packets/client/PacketDrop'
import {PacketHistory} from './packets/client/PacketHistory'
import {PacketJackpots} from './packets/client/PacketJackpots'
import {PacketBetLineRls} from './packets/client/PacketBetLineRls'
import {PacketJackpotsCheck} from './packets/client/PacketJackpotsCheck'
import {PacketBonus} from './packets/client/PacketBonus'
import {PacketJackpotsHistory} from "./packets/client/PacketJackpotsHistory";
import {PacketTournamentInfo} from "./packets/client/PacketTournamentInfo";

export class SlotNetworkManager extends BaseNetworkManager {

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

    betLine(bet, line) {
        var packet = new PacketBetLine(bet, line);
        this.socket.send(packet);
    }

    betLineReels(bet, line, reels) {
        var packet = new PacketBetLineRls(bet, line, reels);
        this.socket.send(packet);
    }

    betSpin(bet, line, denom, betCounter) {
        var packet = new PacketBetSpin(bet, line, denom, betCounter);
        this.socket.send(packet);
    }

    respin() {
        var packet = new PacketRespin();
        this.socket.send(packet);
    }

    spin() {
        var packet = new PacketSpin();
        this.socket.send(packet);
    }

    login() {
        var packet = new PacketLogin(this.session, this.pass);
        this.socket.send(packet);
    }

    freeSpin() {
        var packet = new PacketFreeSpin();
        this.socket.send(packet);
    }

    freeCollect() {
        var packet = new PacketFreeCollect();
        this.socket.send(packet);
    }

    collect() {
        var packet = new PacketCollect();
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

    drop() {
        var packet = new PacketDrop();
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

    checkJackpots() {
        var packet = new PacketJackpotsCheck();
        this.socket.send(packet);
    }

    jackpotHistory() {
        let packet = new PacketJackpotsHistory();
        this.socket.send(packet);
    }

    bonus(position){
        let packet = new PacketBonus(position);
        this.socket.send(packet);
    }

    tournamentInfo(){
        let packet = new PacketTournamentInfo();
        this.socket.send(packet);
    }

    onmessage(event) {
        var input = JSON.parse(event.data);
        switch (input.kind) {
            case 'LOGIN':
            {
                var packet = new PacketLoginRs(input);
                var event = new Event(Packets.PKT_LOGIN_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'CURRENCY':
            {
                var packet = new PacketCurrencyRs(input);
                var event = new Event(Packets.PKT_CURRENCY_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'JOIN':
            {
                var packet = new PacketJoinRs(input);
                var event = new Event(Packets.PKT_JOIN_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'JOIN_DATA':
            {
                var packet = new PacketJoinDataRs(input);
                var event = new Event(Packets.PKT_JOIN_DATA_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'GAME_DATA':
            {
                var packet = new PacketGameDataRs(input);
                var event = new Event(Packets.PKT_GAME_DATA_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'HISTORY':
            {
                var packet = new PacketGameDataRs(input);
                var event = new Event(Packets.PKT_HISTORY_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'JACKPOTS':
            {
                var packet = new PacketGameDataRs(input);
                var event = new Event(Packets.PKT_JACKPOTS_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'JACKPOTS_WIN':
            {
                var packet = new PacketGameDataRs(input);
                var event = new Event(Packets.PKT_JACKPOTS_WIN_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'BALANCE':
            {
                var packet = new PacketGameDataRs(input);
                var event = new Event(Packets.PKT_BALANCE_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'CONDITION':
            {
                var packet = new PacketGameDataRs(input);
                var event = new Event(Packets.PKT_CONDITION_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'ERROR':
            {
                var packet = new PacketGameDataRs(input);
                var event = new Event(Packets.PKT_ERROR_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'BONUS':
            {
                let packet = new PacketGameDataRs(input);
                let event = new Event(Packets.PKT_BONUS_RS.name, packet);
                this.fireEvent(event);
                break;
            }
            case 'TOURNAMENT_INFO': {
                let packet = new PacketGameDataRs(input);
                let event = new Event(Packets.PKT_TOURNAMENT_INFO.name, packet);
                this.fireEvent(event);
                break;
            }
        }
    }
}
