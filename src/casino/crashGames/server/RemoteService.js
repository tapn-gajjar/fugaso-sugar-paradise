import {RHandle} from "./request/RHandle";
import {RPing} from "./request/RPing";

export class MessageType {
    static  CONNECT = "CONNECT"
    static  JOIN = "JOIN"
    static  BALANCE = "BALANCE"
    static  LEADERS = "LEADERS"
    static  ROUND_START = "ROUND_START"
    static  ROUND_RUNNING = "ROUND_RUNNING"
    static  ROUNDS = "ROUNDS"
    static  TICKER = "TICKER"
    static  BET = "BET"
    static  REMOVE_BET = "REMOVE_BET"
    static  MULTIPLIER_RAISE = "MULTIPLIER_RAISE"
    static  COLLECT = "COLLECT"
    static  ROUND_END = "ROUND_END"
    static  PLAYER_COUNT = "PLAYER_COUNT"
    static  CHANGE_IMAGE = "CHANGE_IMAGE"
    static  CHAT_STORY = "CHAT_STORY"
    static  CHAT_MESSAGE = "CHAT_MESSAGE"
    static  CHAT_BAN = "CHAT_BAN"
    static  GAME_STATE = "GAME_STATE"
    static  GAME_RULES = "RULES"
    static  BET_HISTORY = "BET_HISTORY"
    static  JACKPOT_INFO = "JACKPOT_INFO"
    static  JACKPOT_WIN = "JACKPOT_WIN"
    static  BETS_FREE = "BETS_FREE"
    static  IMAGE = "IMAGE"
    static  JACKPOT_HISTORY = "JACKPOT_HISTORY"
    static  DROP = "DROP"
    static  JOIN_GAME = "JOIN_GAME"
    static  MESSAGE_LIKE = "MESSAGE_LIKE"
    static  MESSAGE_DISLIKE = "MESSAGE_DISLIKE"
    static  ERROR = "ERROR"
    static  CUSTOM_ERROR = "CUSTOM_ERROR"
    static ROUND_INFO = "ROUND_INFO"
    static BETS_COLLECTED = "BETS_COLLECTED"
    static TOURNAMENT_INFO = "TOURNAMENT_INFO"
    static TOURNAMENT_WIN = "TOURNAMENT_WIN"
}

export class RequestType {
    static BALANCE = "BALANCE"
    static JOIN = "JOIN"
    static JOIN_GAME = "JOIN_GAME"
    static BET = "BET"
    static COLLECT = "COLLECT"
    static ROUND_INFO = "ROUND_INFO"
    static TOURNAMENT_INFO = "TOURNAMENT_INFO"
}

export class TickState {
    static ROUND_BET_STATE = 2
    static ROUND_INCREASE_STATE = 3
    static ROUND_CREATE_STATE = 4
}

export class CashOutType {
    static CASH_OUT_ACTION = 2
    static CANCEL_ACTION = 3
}

export class RequestBase {
    constructor(command) {
        this.command = command;
    }
}

export class BetData {
    constructor(index = 0,
                bet = 0,
                autoCollect = false,
                autoMultiplier = 0) {
        this.index = index;
        this.bet = bet;
        this.autoCollect = autoCollect;
        this.autoMultiplier = autoMultiplier;
    }
}

export class InfoData {
    constructor(id) {
        this.id = id;
    }
}

export class RequestTournamentIno extends RequestBase {
    constructor() {
        super(RequestType.TOURNAMENT_INFO);
    }
}

export class RequestRoundInfo extends RequestBase {
    constructor(data) {
        super(RequestType.ROUND_INFO);
        if (!(data instanceof InfoData)) throw Error("Wrong data type!")
        this.data = data
    }
}

export class RequestBet extends RequestBase {
    constructor(data) {
        super(RequestType.BET);
        if (!(data instanceof BetData)) throw Error("Wrong data type!")
        this.data = data
    }
}

export class CollectData {
    constructor(index = 0,
                subType = CashOutType.CASH_OUT_ACTION) {
        this.index = index;
        this.subType = subType;
    }
}

export class RequestCollect extends RequestBase {
    constructor(data) {
        super(RequestType.COLLECT);
        if (!(data instanceof CollectData)) throw Error("Wrong data type!")
        this.data = data
    }
}

export class JoinData {
    constructor(roomId = 0) {
        this.roomId = roomId
    }
}

export class RequestJoinGame extends RequestBase {
    constructor(data) {
        super(RequestType.JOIN_GAME);
        if (!(data instanceof JoinData)) throw Error("Wrong data type!")
        this.data = data;
    }
}

export class RemoteService {
    constructor(url, auth) {
        this.domain = url;
        this.auth = auth;
        this.token = '';

        this._pingTimeConst = this._pingTime = 15 * 1000;
        this._continuePing = false;
        this._packetPool = [];
        this._activeRHandle = false;
        this._customClosed = false;
    }

    connect(onopen, onmessage, onerror, requestOnError, requestOnSuccess) {
        let u = new URL(this.domain + '/events');
        u.searchParams.append('sessionId', this.auth.session);
        u.searchParams.append('mode', this.auth.mode);
        this.auth.password && u.searchParams.append('password', this.auth.password);
        this.auth.operatorId && u.searchParams.append('operatorId', this.auth.operatorId);
        this.auth.userName && u.searchParams.append('userName', this.auth.userName);
        this.auth.country && u.searchParams.append('country', this.auth.country);
        u.searchParams.append('gameName', this.auth.gameName);
        this.sse = new EventSource(u);
        this.sse.onopen = onopen;
        this.sse.onmessage = onmessage;
        this.sse.onerror = onerror;

        this.onerror = requestOnError;
        this.onsuccess = requestOnSuccess;
    }

    joinGame() {
        let r = new RequestBase(RequestType.JOIN_GAME)
        this.send(r);
    }

    join() {
        let r = new RequestBase(RequestType.JOIN)
        this.send(r)
    }

    collect(index = 0) {
        let r = new RequestCollect(new CollectData(index, CashOutType.CASH_OUT_ACTION));
        this.send(r)
    }

    balanceCheck() {
        let r = new RequestBase(RequestType.BALANCE)
        this.send(r)
    }

    cancel(index = 0) {
        let r = new RequestCollect(new CollectData(index, CashOutType.CANCEL_ACTION));
        this.send(r);
    }

    bet(index = 0, bet = 100, autoCollect = false, autoMultiplier = 0) {
        let r = new RequestBet(new BetData(index, bet, autoCollect, autoMultiplier));
        this.send(r);
    }

    roundInfo(id) {
        let r = new RequestRoundInfo(new InfoData(id))
        this.send(r)
    }

    tournamentInfo(){
        let r = new RequestTournamentIno()
        return this.send(r)
    }

    ping(ms) {
        this._pingTime = ms || this._pingTimeConst;
        clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => {
            new RPing(this.domain).query(this.onRequestSuccess.bind(this), this.onRequestError.bind(this));
        }, this._pingTime);
    }

    stopPing() {
        clearInterval(this.pingTimer);
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
            new RHandle(this.domain, packet, headers, this).query(
                (l, status, request) => {
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

    onRequestError(jqXHR, textStatus, errorThrown) {
        if (this.pingTimer) {
            this.stopPing();
            this._continuePing = true;
        }
        this.onerror && this.onerror(jqXHR, textStatus, errorThrown);
    }

    onRequestSuccess() {
        if (this._continuePing) {
            this.ping(this._pingTime);
            this._continuePing = false;
        }
        this.onsuccess && this.onsuccess();
    }

    onmessage(data, textStatus, jqXHR) {
        this.onRequestSuccess();
    }

    close() {
        if (!this._customClosed) {
            this._customClosed = true;
        }
    }

    reopen() {
        if (this._customClosed) {
            this._customClosed = false;
            this.sse.close();
            this.connect(this.sse.onopen, this.sse.onmessage, this.sse.onerror, this.onerror, this.onsuccess);
            return true;
        } else {
            return false;
        }
    }

    reset() {
        this._customClosed = false;
    }
}



