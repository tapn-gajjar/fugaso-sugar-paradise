/**
 * Created by boria on 10.08.16.
 */
import {Event} from "./events/Event";
import {Packets} from "./packets/Packets";
import {PacketLogin} from "./packets/client/PacketLogin";
import {BaseNetworkManager} from "./BaseNetworkManager";
import {PacketLoginRs} from "./packets/server/PacketLoginRs";
import {PacketCurrencyRs} from "./packets/server/PacketCurrencyRs";
import {PacketJoinRs} from "./packets/server/PacketJoinRs";
import {PacketJoinDataRs} from "./packets/server/PacketJoinDataRs";
import {PacketGameDataRs} from "./packets/server/PacketGameDataRs";
import {PacketSpin} from "./packets/client/PacketSpin";
import {PacketCollect} from "./packets/client/PacketCollect";
import {PacketGambleChoice} from "./packets/client/PacketGambleChoice";
import {PacketFreeSpin} from "./packets/client/PacketFreeSpin";
import {PacketBetLine} from "./packets/client/PacketBetLine";
import {PacketFreeCollect} from "./packets/client/PacketFreeCollect";
import {PacketRespin} from "./packets/client/PacketRespin";
import {PacketBetSpin} from "./packets/client/PacketBetSpin";
import {PacketDrop} from "./packets/client/PacketDrop";
import {PacketHistory} from "./packets/client/PacketHistory";
import {PacketJackpots} from "./packets/client/PacketJackpots";
import {PacketBetLineRls} from "./packets/client/PacketBetLineRls";
import {PacketJackpotsCheck} from "./packets/client/PacketJackpotsCheck";
import {PacketBonus} from "./packets/client/PacketBonus";
import {PacketJackpotsHistory} from "./packets/client/PacketJackpotsHistory";
import {RHandle} from "./requests/RHandle";
import {RPing} from "./requests/RPing";
import {RJackpotPing} from "./requests/RJackpotPing";
import {PacketTournamentInfo} from "./packets/client/PacketTournamentInfo";

export class SimplexNetworkManager extends BaseNetworkManager {
    constructor(domain, session, pass, room, country = null) {
        super(domain, session, pass, room);

        this._pingTime = 90 * 1000;
        this._continuePing = false;
        this._pingJackpotTime = 90 * 1000;
        this._continuePingJackpot = false;
        this.country = country;
        this._packetPool = [];
        this._activeRHandle = false;
    }

    send(packet) {
        this._packetPool.push(packet);
        if (!this._activeRHandle) {
            this._activeRHandle = true;
            this._createRHandle();
        }
    }

    /**     * @private     */
    _createRHandle() {
        const packet = this._packetPool.shift();
        if (packet) {
            let headers = this.token && {"auth-token": this.token} || {};
            if (this.requestId)
                headers["request-id"] = this.requestId;
            new RHandle(this.domain, packet, headers).query(
                (l, status, request) => {
                    this.token = request.getResponseHeader("auth-token") || this.token;
                    this.requestId = request.getResponseHeader("request-id") || this.requestId;
                    this._checkRequestPool();
                    this.onmessage(l);
                },
                this.onRequestError.bind(this),
            );
        } else {
            console.error("network. not have packet to send");
        }
    }

    /**     * @private     */
    _checkRequestPool() {
        if (this._packetPool.length) this._createRHandle();
        else this._activeRHandle = false;
    }

    close() {
    }

    connect(onerror, onsuccess) {
        this.onerror = onerror;
        this.onsuccess = onsuccess;
        this.login();
    }

    empty() {
        let headers = this.token && {'auth-token': this.token} || null;
        if (headers)
            new RPing(this.domain, null, headers).query(this.onRequestSuccess.bind(this), this.onRequestError.bind(this));
    }

    ping(ms) {
        this._pingTime = ms || 90 * 1000;
        clearInterval(this.pingTimer);
        let headers = this.token && {'auth-token': this.token} || null;
        if (headers)
            this.pingTimer = setInterval(() => {
                new RPing(this.domain, null, headers).query(this.onRequestSuccess.bind(this), this.onRequestError.bind(this));
            }, this._pingTime);
    }

    stopPing() {
        clearInterval(this.pingTimer);
    }

    pingJackpot(ms) {
        this._pingJackpotTime = ms || 90 * 1000;
        clearInterval(this.jackpotTimer);
        this.jackpotTimer = setInterval(() => {
            new RJackpotPing(this.domain, new PacketJackpots(), this.token && {"auth-token": this.token} || {}).query(
                (l, status, request) => {
                    this.token = request.getResponseHeader("auth-token") || this.token;
                    this.onmessage(l);
                },
                this.onRequestError.bind(this),
            );
        }, this._pingJackpotTime);
    }

    stopPingJackpot() {
        clearInterval(this.jackpotTimer);
    }

    betLine(bet, line) {
        const packet = new PacketBetLine(bet, line);
        this.send(packet);
    }

    betLineReels(bet, line, reels) {
        const packet = new PacketBetLineRls(bet, line, reels);
        this.send(packet);
    }

    betSpin(bet, line, denom, betCounter) {
        const packet = new PacketBetSpin(bet, line, denom, betCounter);
        this.send(packet);
    }

    respin() {
        const packet = new PacketRespin();
        this.send(packet);
    }

    spin() {
        const packet = new PacketSpin();
        this.send(packet);
    }

    login() {
        const packet = new PacketLogin(this.session, this.pass, this.country);
        this.send(packet);
    }

    freeSpin() {
        const packet = new PacketFreeSpin();
        this.send(packet);
    }

    freeCollect() {
        const packet = new PacketFreeCollect();
        this.send(packet);
    }

    collect() {
        const packet = new PacketCollect();
        this.send(packet);
    }

    gambleRed() {
        const packet = new PacketGambleChoice("r");
        this.send(packet);
    }

    gambleBlack() {
        const packet = new PacketGambleChoice("b");
        this.send(packet);
    }

    drop() {
        const packet = new PacketDrop();
        this.send(packet);
    }

    getHistory(limit) {
        const packet = new PacketHistory(limit);
        this.send(packet);
    }

    getJackpots() {
        const packet = new PacketJackpots();
        this.send(packet);
    }

    checkJackpots() {
        const packet = new PacketJackpotsCheck();
        this.send(packet);
    }

    jackpotHistory() {
        let packet = new PacketJackpotsHistory();
        this.send(packet);
    }

    bonus(position) {
        let packet = new PacketBonus(position);
        this.send(packet);
    }

    tournamentInfo() {
        let packet = new PacketTournamentInfo();
        this.send(packet);
    }

    onRequestError(jqXHR, textStatus, errorThrown) {
        if (this.pingTimer) {
            this.stopPing();
            this._continuePing = true;
        }
        if (this.jackpotTimer) {
            this.stopPingJackpot();
            this._continuePingJackpot = true;
        }
        this.onerror && this.onerror(jqXHR, textStatus, errorThrown);
    }

    onRequestSuccess() {
        if (this._continuePing) {
            this.ping(this._pingTime);
            this._continuePing = false;
        }
        if (this._continuePingJackpot) {
            this.pingJackpot(this._pingJackpotTime);
            this._continuePingJackpot = false;
        }
        this.onsuccess && this.onsuccess();
    }

    onmessage(list) {
        this.onRequestSuccess();
        list.forEach(input => {
            switch (input.kind) {
                case "LOGIN": {
                    let packet = new PacketLoginRs(input);
                    let event = new Event(Packets.PKT_LOGIN_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "CURRENCY": {
                    let packet = new PacketCurrencyRs(input);
                    let event = new Event(Packets.PKT_CURRENCY_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "JOIN": {
                    let packet = new PacketJoinRs(input);
                    let event = new Event(Packets.PKT_JOIN_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "JOIN_DATA": {
                    let packet = new PacketJoinDataRs(input);
                    let event = new Event(Packets.PKT_JOIN_DATA_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "GAME_DATA": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_GAME_DATA_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "HISTORY": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_HISTORY_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "JACKPOTS": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_JACKPOTS_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "JACKPOTS_WIN": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_JACKPOTS_WIN_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "BALANCE": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_BALANCE_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "CONDITION": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_CONDITION_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "CUSTOM_ERROR":
                case "ERROR": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_ERROR_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "BONUS": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_BONUS_RS.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "TOURNAMENT_INFO": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_TOURNAMENT_INFO.name, packet);
                    this.fireEvent(event);
                    break;
                }
                case "TOURNAMENT_WIN": {
                    let packet = new PacketGameDataRs(input);
                    let event = new Event(Packets.PKT_TOURNAMENT_WIN.name, packet);
                    this.fireEvent(event);
                    break;
                }
            }
        });
    }
}