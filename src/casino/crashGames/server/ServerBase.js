import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {MessageType, RemoteService, TickState} from "./RemoteService";
import {CrashConst} from "../CrashConst";
import {UserBet, UserBetConst} from "../data/UserBet";
import {MainViewBase} from "../gui/pages/MainViewBase";
import {TStaticConst} from "../../tournament/TStaticConst";

export class ServerBase extends PIXI.utils.EventEmitter {
    constructor() {
        super();
        let protocol = location.protocol + "//";
        this._domain = protocol + AppG.hostUrl;
        this._playerId = AppG.playerId;
        this._sessionId = AppG.sessionId;
        this._operatorId = AppG.operatorId;
        this._password = AppG.password;
        this._gameName = AppG.gameName;
        this._mode = AppG.mode;
        this._serverEvenError = false;

        this._console = AppG.serverConsole;
        this._createVars();
        AppG.emit.on(CrashConst.G_START_RECONNECT, this._gameInetReConnect, this);
    }

    /**     * @private     */
    _createVars() {
        this._currBet = 0;
        this._playerBalance = 0;
        this._isGameConnect = false;
        this._creditType = 100;
        this._userName = null;
        this._betConfig = {};
        this._bufferBetConfig = {};

        this._historyData = null;
        this._historyTopData = null;

        this._betsTopData = null;
        this._userBetsData = [];
        this._bets = [];
        this._userBets = [];
        this._saveAllHistoryRounds = [];

        this._totalWinInGame = 0;
        this._totalWinInRound = 0;
        this._gameIsClose = false;
        this._timeForBet = 0;
        this._time = 0;
        this._playerCount = 1;
        this._delayOnConnect = false;
    }

    connectToServer(onCompleteHandler) {
        this._onCompleteHandler = onCompleteHandler;

        let session = {};
        session.userName = this._playerId;
        session.password = this._password;
        session.session = this._sessionId;
        session.operatorId = this._operatorId;
        session.mode = this._mode;
        session.gameName = this._gameName;

        this.netManager = new RemoteService(this._domain, session);
        this.netManager.connect(e => {
                // OMY.Omy.log('LOGIN RESPONSE: ', e.data);
            }, this.onGetServerData.bind(this), this._onServerError.bind(this),
            this.onError.bind(this), this.onSuccess.bind(this));
    }

    onError(xhr, textStatus, errorThrown) {
        AppG.not_connection = true;
        if (textStatus === "critical") {
            if (!this._serverEvenError) this.netManager.close();
        } else {
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_NO_INET);
        }
    }

    onSuccess() {
        if (this._serverEvenError) return;
        if (this.netManager.reopen()) {
            this._serverEvenError = true;
            return;
        }
        AppG.not_connection = false;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active &&
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).wType === AppConst.WARNING_NO_INET) {
            OMY.Omy.viewManager.hideWindow(AppConst.W_WARNING);
        }
    }

    _onServerError(e) {
        if (e.data) {
            OMY.Omy.error("ON ERROR", e);
            this._gameIsClose = true;
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_CUSTOM_WARNING, e.data.message, null, e.data.code);
        } else {
            this._serverEvenError = true;
            if (!AppG.not_connection) {
                AppG.not_connection = true;
                OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_NO_INET);
            }
        }
    }

    /**     * @private     */
    _gameInetReConnect() {
        this._onCompleteHandler = this._gameInetReConnectEnd.bind(this);
        this.netManager.reset();
        this._createVars();
    }

    /**     * @private     */
    _gameInetReConnectEnd() {
        AppG.emit.emit(CrashConst.G_END_RECONNECT);
    }

    /**     * @private     */
    _finallyConnect() {
        if (this._startTournInfo) {
            this._delayFinallyCall = true;
            return;
        }
        this._checkGameRecover();
        this._isGameConnect = true;
        this._onCompleteHandler();
    }

    onGetServerData(e) {
        let packet = JSON.parse(e.data);
        const list = packet.list;
        for (let i = 0; i < list.length; i++) {
            const data = list[i];
            switch (data.command) {
                case MessageType.CONNECT: {
                    this._isGameConnect && AppG.emit.emit(CrashConst.G_START_RECONNECT);
                    this.payInHandler(data.data);
                    break;
                }
                case MessageType.JOIN: {
                    this.gameConfHandler(data.data);
                    break;
                }
                case MessageType.JOIN_GAME: {
                    this._console && OMY.Omy.log('MessageType.JOIN_GAME. State:', data.data.currentState, data.data);
                    this.stateUpdate(data.data);
                    this._serverEvenError = false;
                    AppG.not_connection && this.onSuccess();
                    if (!this._betsTopData && this._bufferTopData) this._updateLeaderTable(this._bufferTopData);
                    if (this._currentState === TickState.ROUND_BET_STATE) {
                        this._delayOnConnect = true;
                        return;
                    } else if (this._currentState === TickState.ROUND_CREATE_STATE) {
                        if (this._historyData?.length)
                            this._roundMulti = this._historyData[this._historyData.length - 1]["multiplier"];
                    }
                    this._finallyConnect();
                    break;
                }
                case MessageType.ROUND_START: {
                    this._console && OMY.Omy.log('MessageType.ROUND_START', data.data);
                    this.roundUpdate(data.data);
                    AppG.emit.emit(CrashConst.S_ROUND_START);
                    break;
                }
                case MessageType.ROUND_RUNNING: {
                    this._console && OMY.Omy.log('MessageType.ROUND_RUNNING', data.data);
                    this.roundUpdate(data.data);
                    AppG.emit.emit(CrashConst.S_ROUND_RUNNING);
                    break;
                }
                case MessageType.ROUND_END: {
                    this._console && OMY.Omy.log('MessageType.ROUND_END', data.data);
                    this.roundUpdate(data.data);
                    this.roundEnd(data.data);
                    break;
                }
                case MessageType.CUSTOM_ERROR:{
                    this._console && OMY.Omy.error('MessageType.CUSTOM_ERROR', data.data, data.data.text);
                    OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_CUSTOM_WARNING, data.data.text, null, MessageType.CUSTOM_ERROR);
                    break;
                }
                case MessageType.ERROR: {
                    switch (data.data.text) {
                        case "MAGNIFY_MAN_IS_BUSTED":
                        case "INCORRECT_GAME_STATE": {
                            AppG.emit.emit(CrashConst.WARNING_MESSAGE, data.data.text);
                            break;
                        }

                        default: {
                            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(CrashConst.WARNING_BET_STATE, null, null, data.data.text);
                            break;
                        }
                    }

                    this._console && OMY.Omy.error('MessageType.BET_ERROR', data.data, data.data.text);
                    for (let betId in this._betConfig) {
                        if (this._betConfig[betId]["sending"]) {
                            this._betConfig[betId]["sending"] = false;
                            AppG.emit.emit(CrashConst.EMIT_ON_BET_SET, betId);
                        } else if (this._betConfig[betId]["cancelSending"]) {
                            this._betConfig[betId]["cancelSending"] = false;
                            AppG.emit.emit(CrashConst.EMIT_ON_BET_SET, betId);
                        } else if (this._betConfig[betId]["takeSending"]) {
                            this._betConfig[betId]["takeSending"] = false;
                        }
                    }
                    break;
                }
                case MessageType.MULTIPLIER_RAISE: {
                    // this._console && OMY.Omy.info('Multi', data.data);
                    this._roundMulti = data.data.current;
                    AppG.emit.emit(CrashConst.S_MULTIPLIER, data.data.current, data.data.stop);
                    break;
                }
                case MessageType.TICKER: {
                    this.stateUpdate(data.data);
                    break;
                }
                case MessageType.BALANCE: {
                    this._console && OMY.Omy.log('MessageType.BALANCE', data.data.balance, data.data);
                    this.playerBalance = data.data.balance;
                    break;
                }
                case MessageType.LEADERS: {
                    this._updateLeaderTable(data.data);
                    break;
                }
                case MessageType.ROUNDS: {
                    this._createHistoryData(data.data);
                    break;
                }
                case MessageType.BET: {
                    this._console && OMY.Omy.log('MessageType.BET', data.data);
                    if (this._userId === data.data.userId) {
                        let betId = data.data.index;
                        this._userBets.push(data.data);
                        this._betConfig[betId]["sending"] = false;
                        this._betConfig[betId]["onServer"] = true;
                        this.totalBet += data.data.bet;
                        this._updateCurrentBet();
                        AppG.emit.emit(CrashConst.EMIT_ON_BET_SET, betId);
                    } else {
                        this._bets.push(data.data);
                    }
                    AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
                    break;
                }
                case MessageType.REMOVE_BET: {
                    this._console && OMY.Omy.log('MessageType.REMOVE_BET', data.data);
                    let betId = data.data.index;
                    if (this._userId === data.data.userId) {
                        for (let j = 0; j < this._userBets.length; j++) {
                            if (this._userBets[j].index === betId) {
                                this._userBets.splice(j, 1);
                                break;
                            }
                        }
                        delete this._betConfig[betId];
                        this.totalBet -= data.data.bet;
                        this._updateCurrentBet();
                        AppG.emit.emit(CrashConst.EMIT_ON_CANCEL_SET, betId);
                    } else {
                        for (let j = 0; j < this._bets.length; j++) {
                            if (this._bets[j].userId === data.data.userId && this._bets[j].index === betId) {
                                this._bets.splice(j, 1);
                                break;
                            }
                        }
                    }
                    AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
                    break;
                }
                case MessageType.COLLECT: {
                    this._console && OMY.Omy.log('MessageType.COLLECT', data.data);
                    let betId = data.data.index;
                    if (this._userId === data.data.userId) {
                        for (let j = 0; j < this._userBets.length; j++) {
                            if (this._userBets[j].index === betId) {
                                this._userBets[j].multiplierAuto = data.data.multiplierAuto;
                                this._userBets[j].gain = data.data.gain;
                                if (!MainViewBase.onAir)
                                    AppG.emit.emit(CrashConst.BET_DATA_UPDATE, betId, UserBetConst.isBetting, false);
                                break;
                            }
                        }
                        delete this._betConfig[betId];
                        this.setBalance();
                        let countOnServer = 0;
                        for (let id in this._betConfig) {
                            if (this._betConfig[id]["onServer"])
                                countOnServer++;
                        }
                        if (countOnServer === 0) this.totalBet = 0;
                        this._totalWinInRound += data.data.gain;
                        AppG.emit.emit(AppConst.APP_EMIT_ON_WIN, this._totalWinInRound, data.data.multiplierAuto, data.data.gain);
                        if (!this._bufferBetConfig[betId])
                            AppG.emit.emit(CrashConst.EMIT_ON_CASHOUT_SET, betId);
                        AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
                        if (this._bufferBetConfig[betId]) {
                            this.setBet(betId,
                                this._bufferBetConfig[betId]["bet"],
                                this._bufferBetConfig[betId]["cashOut"],
                                this._bufferBetConfig[betId]["autoCashOut"]);
                            delete this._bufferBetConfig[betId];
                        }
                    } else {
                        for (let j = 0; j < this._bets.length; j++) {
                            if (this._bets[j].userId === data.data.userId && this._bets[j].index === betId) {
                                this._bets[j].multiplierAuto = data.data.multiplierAuto;
                                this._bets[j].gain = data.data.gain;
                                break;
                            }
                        }
                        AppG.emit.emit(CrashConst.EMIT_ON_CASHOUT, data.data);
                        AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
                    }
                    break;
                }
                case MessageType.PLAYER_COUNT: {
                    this._console && OMY.Omy.log('MessageType.PLAYER_COUNT', data.data);
                    this._playerCount = data.data.counter;
                    AppG.emit.emit(CrashConst.EMIT_ON_COUNT_PLAYER);
                    break;
                }
                case MessageType.GAME_STATE: {
                    this._console && OMY.Omy.log('MessageType.GAME_STATE', data.data);
                    break;
                }
                case MessageType.BET_HISTORY: {
                    this._createBetUserStart(data.data);
                    break;
                }
                case MessageType.BETS_FREE: {
                    // this._console && OMY.Omy.log('MessageType.BETS_FREE', data.data);
                    break;
                }
                case MessageType.ROUND_INFO: {
                    this._console && OMY.Omy.log('MessageType.ROUND_INFO', data.data);
                    this._saveAllHistoryRounds.push(data.data);
                    this.emit(CrashConst.EMIT_ON_GET_ROUND, data.data);
                    break;
                }
                case MessageType.BETS_COLLECTED: {
                    this._console && OMY.Omy.log('MessageType.BETS_COLLECTED', data.data);
                    this._userBetWasCollected(data.data);
                    break;
                }
                case MessageType.TOURNAMENT_INFO: {
                    this._console && OMY.Omy.log('MessageType.TOURNAMENT_INFO', data.data);
                    this._onGetTournament(data);
                    break;
                }
                case MessageType.TOURNAMENT_WIN: {
                    this._console && OMY.Omy.log('MessageType.TOURNAMENT_WIN', data.data);
                    this._tournamentWinHandler(data);
                    break;
                }
            }
        }
    }

    payInHandler(packet) {
        this._console && OMY.Omy.log('MessageType.CONNECT', packet);
        // OMY.Omy.navigateBtn.unBlockingScreen();
        // this._creditType = packet.creditType;

        this.playerBalance = packet.balance;
        this.netManager.ping();
        AppG.currency = packet.currency;
        this._currencyName = packet.currencyCode || "USD"; //IRR USD
        this._console && OMY.Omy.log("currency", packet.currency);
        this._userName = packet.nick;
        this._userId = packet.userId;
        this.netManager.token = packet.token;
        this.netManager.join();
        this._console && OMY.Omy.log("Join sent.");
        this._getStartTournamentInfo();
    }

    gameConfHandler(packet) {
        this._console && OMY.Omy.log('MessageType.JOIN', packet);
        this._console && OMY.Omy.log('currBet', packet.gameInfo.currentBet);
        this.totalBet = 0;
        this._bigWinAmount = packet.gameInfo.bigWinAmount;
        this._bigWinMultiplier = packet.gameInfo.bigWinMultiplier;
        this._leaderMinGain = packet.gameInfo.leaderMinGain;
        this._maxBet = packet.gameInfo.maxBet;
        this._maxGain = packet.gameInfo.maxGain;
        this._minBet = packet.gameInfo.minBet;
        this._possBets = packet.gameInfo.betSteps || [0.20, 0.30, 0.40, 0.50, 1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100];
        let defaultBet = (this._possBets.length <= 4) ?
            this._possBets[this._possBets.length - 1] : this._possBets[4];
        this._defaultBet = defaultBet || 0;
        this._euroRates = packet.gameInfo.euroRates;
        if (!this._euroRates.hasOwnProperty(this._currencyName))
            OMY.Omy.error('not have this currency for convert', this._currencyName);
        this.netManager.balanceCheck();
        this._console && OMY.Omy.log("Balance check sent.");
        this.netManager.joinGame();
        this._console && OMY.Omy.log("Join game sent.");

        let m = AppG.gameConst.countUserBetData;
        /** @type {Array.<UserBet>} */
        this._userBetData = [];
        for (let i = 0; i < m; i++) {
            this._userBetData.push(new UserBet(i));
        }
    }

    clearWinTournament() {
        this._totalWinTournament = 0;
        // this.playerBalance = this._tournamentBalance;
    }

    /**     * @private     */
    _getStartTournamentInfo() {
        this._startTournInfo = true;
        this.checkTournament();
    }

    checkTournament() {
        if (AppG.tournament.debugTour) {
            OMY.Omy.add.timer(.1, this._onGetTournament, this,
                0, false, true, 0, [TStaticConst.t_magnify_debug_data]);
            return;
        }
        this.netManager.tournamentInfo();
        AppG.serverConsole && OMY.Omy.log("on check Tournament packet:");
    }

    _onGetTournament(e) {
        AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.PKT_TOURNAMENT_INFO");
        let packet = e.data;
        AppG.serverConsole && OMY.Omy.log("data:", packet);
        this.emit(this.TOURNAMENT_UPDATE, packet);
        if (this._startTournInfo) {
            // this.netManager.addListener(Packets.PKT_TOURNAMENT_WIN.name, this._tournamentWinHandler.bind(this));
            AppG.tournament.checkActivated(packet);
            this._startTournInfo = false;
            if (this._delayFinallyCall) {
                this._delayFinallyCall = false;
                this._finallyConnect();
            }
        }
    }

    /**     * @private     */
    _tournamentWinHandler(e) {
        AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.TOURNAMENT_WIN");
        let packet = e.data;
        AppG.serverConsole && OMY.Omy.log("data:", packet);
        this._totalWinTournament = packet.amount;
        this._tournamentBalance = packet.balance;
        this.emit(this.TOURNAMENT_WIN, packet);
        AppG.tournament.showUserWin();
    }

    /**     * @private     */
    _createBetUserStart(packet) {
        this._console && OMY.Omy.log('MessageType.BET_HISTORY', packet);
        /** @type {Array} */
        this._userBetsData = packet.list;
        this._userBetsData.reverse();
        if (this._userBetsData.length > CrashConst.COUNT_ON_USER_BET_TABLE) {
            this._userBetsData = this._userBetsData.slice(this._userBetsData.length - CrashConst.COUNT_ON_USER_BET_TABLE);
        }
        /** @type {String} */
        let str;
        for (let userBetsDatum of this._userBetsData) {
            str = userBetsDatum.username;
            if (str.length > 5) {
                userBetsDatum.username = str[0] + "..." + str[str.length - 1];
            }
        }
    }

    /**     * @private     */
    _userBetWasCollected(packet) {
        /** @type {Array} */
        const userBets = this.userBetsData;
        for (let i = 0; i < packet.bets.length; i++) {
            let bet = packet.bets[i];
            for (let j = 0; j < userBets.length; j++) {
                if (userBets[j].roundId === bet.roundId && userBets[j].index === bet.index) {
                    userBets[j].balanceOn = bet.balanceOn;
                    userBets[j].gain = bet.gain;
                    userBets[j].multiplierAuto = bet.multiplierAuto;
                    userBets[j].timeBet = bet.timeBet;
                    break;
                }
            }
        }
    }

    /**     * @private     */
    _updateLeaderTable(packet) {
        this._console && OMY.Omy.log('MessageType.LEADERS', packet);
        this._bufferTopData = packet;
        if (!this._euroRates) return;
        if (this._betsTopData) {
            for (let bet of packet.users) {
                if (bet["currencyCode"] !== this._currencyName) {
                    bet["bet"] = this.convertValue(bet["bet"], bet["currencyCode"]);
                    bet["gain"] = this.convertValue(bet["gain"], bet["currencyCode"]);
                    bet["currencyCode"] = this._currencyName;
                }
            }
            OMY.OMath.sortNumber(packet.users, "gain", true);
            if (packet.users.length > CrashConst.COUNT_ON_LEADER_BET_TABLE) {
                packet.users = packet.users.slice(packet.users.length - CrashConst.COUNT_ON_LEADER_BET_TABLE);
            }
            let newElement = false;
            let inBoard = false;
            for (let bet of packet.users) {
                inBoard = false;
                for (let userBetsDatum of this._betsTopData) {
                    if (userBetsDatum.bet === bet.bet
                        && userBetsDatum.gain === bet.gain
                        && userBetsDatum.multiplierAuto === bet.multiplierAuto
                        && userBetsDatum.userId === bet.userId) {
                        inBoard = true;
                        break;
                    }
                }
                if (!inBoard) {
                    let str = bet.username;
                    if (str.length > 5) bet.username = str[0] + "..." + str[str.length - 1];
                    this._betsTopData.push(bet);
                    newElement = true;
                }
            }
            if (newElement) {
                OMY.OMath.sortNumber(this._betsTopData, "gain", true);
                if (this._betsTopData.length > CrashConst.COUNT_ON_LEADER_BET_TABLE) {
                    this._betsTopData = this._betsTopData.slice(this._betsTopData.length - CrashConst.COUNT_ON_LEADER_BET_TABLE);
                }
                AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
            }
        } else {
            this._betsTopData = packet.users;
            this._bufferTopData = null;
            for (let i = 0; i < this._betsTopData.length; i++) {
                let bet = this._betsTopData[i];
                if (bet["currencyCode"] !== this._currencyName) {
                    bet["bet"] = this.convertValue(bet["bet"], bet["currencyCode"]);
                    bet["gain"] = this.convertValue(bet["gain"], bet["currencyCode"]);
                    bet["currencyCode"] = this._currencyName;
                }
            }
            OMY.OMath.sortNumber(this._betsTopData, "gain", true);
            if (this._betsTopData.length > CrashConst.COUNT_ON_LEADER_BET_TABLE) {
                this._betsTopData = this._betsTopData.slice(this._betsTopData.length - CrashConst.COUNT_ON_LEADER_BET_TABLE);
            }
            /** @type {String} */
            let str;
            for (let userBetsDatum of this._betsTopData) {
                str = userBetsDatum.username;
                if (str.length > 5) userBetsDatum.username = str[0] + "..." + str[str.length - 1];
            }
            AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
        }
    }

    roundUpdate(packet) {
        AppG.gameRoundId = packet.roundId;
        // this._console && OMY.Omy.log('roundId', packet.roundId);
        this._isRoundDone = packet.done;
        this._multiplier = packet.multiplier;
        if (!this._isGameConnect)
            this._bets = packet.bets;
    }

    roundEnd(packet) {
        let userBets = [];
        const bets = packet.bets;
        for (let i = 0; i < bets.length; i++) {
            if (bets[i].userId === this._userId)
                userBets.push(bets[i].index);
        }
        for (let betId in this._betConfig) {
            if (OMY.OMath.inArray(userBets, Number(betId)) && this._betConfig[betId]["onServer"]) {
                AppG.emit.emit(CrashConst.BET_DATA_UPDATE, betId, UserBetConst.isBetting, false);
                delete this._betConfig[betId];
            }
        }
        const buffer = this.userBetsData;
        for (let i = 0; i < buffer.length; i++) {
            let bet = buffer[i];
            if (bet.roundId === packet.roundId)
                bet.roundMultiplier = packet.multiplier;
        }
        this.setBalance();
        AppG.emit.emit(CrashConst.S_ROUND_END, userBets);

        let isWin = false;
        for (let j = 0; j < packet["bets"].length; j++) {
            if (Boolean(packet["bets"][j]["gain"])) {
                isWin = true;
                break;
            }
        }
        packet.isWin = isWin;
        if (this._historyData) {
            this._historyData.push(packet);
            if (this._historyData.length > CrashConst.COUNT_ON_HISTORY_TABLE) this._historyData.shift();
            // this._console && OMY.Omy.info('historyData', this._historyData);
            AppG.emit.emit(CrashConst.EMIT_ON_HISTORY_UPDATE);
        }
    }

    /**     * @private     */
    _checkGameRecover() {
        this._userBets.length = 0;
        /** @type {Array} */
        const buffer = this._bets.concat();
        this._bets.length = 0;
        while (buffer.length) {
            let bet = buffer.shift();
            if (bet.userId === this._userId) this._userBets.push(bet);
            else this._bets.push(bet);
        }
        for (let i = 0; i < this._userBets.length; i++) {
            if (this._userBets[i].gain !== 0) {
                this._totalWinInRound += this._userBets[i].gain;
                continue;
            }
            let betId = this._userBets[i].index;
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, betId, UserBetConst.bet, this._userBets[i].bet);
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, betId, UserBetConst.cash, this._userBets[i].multiplierAuto);
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, betId, UserBetConst.autoCash, this._userBets[i].autoCollect);
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, betId, UserBetConst.isBetting, true);

            if (!this._betConfig[betId]) this._betConfig[betId] = {
                onServer: true,
                sending: false,
                cacheOnBalance: true
            };
            this._betConfig[betId]["bet"] = this._userBets[i].bet;
            this._betConfig[betId]["cashOut"] = this._userBets[i].multiplierAuto;
            this._betConfig[betId]["autoCashOut"] = this._userBets[i].autoCollect;
            this.totalBet += this._userBets[i].bet;
        }
        if (Boolean(this._totalWinInRound))
            AppG.emit.emit(AppConst.APP_EMIT_ON_WIN, this._totalWinInRound);
    }

    _onUpTime() {
        this._time += 1;
    }

    stateUpdate(packet) {
        this._console && OMY.Omy.log('MessageType.TICKER', packet.currentState, packet);
        this._currentState = packet.currentState;
        this._nextState = packet.nextState;
        if (!this._time) OMY.Omy.addSecUpdater(this._onUpTime, this);
        this._console && OMY.Omy.log('Time diff:', packet.currentTime - this._time * 1000.0);
        this._endTime = packet.endTime / 1000.0;
        this._time = packet.currentTime / 1000.0;
        this._timeForBet = packet.time;
        switch (this._currentState) {
            case TickState.ROUND_CREATE_STATE: {
                this.totalBet = 0;
                this._totalWinInGame += this._totalWinInRound;
                break;
            }
            case TickState.ROUND_INCREASE_STATE: {
                this._totalWinInRound = 0;
                this.setBalance();
                if (!this._isGameConnect) {
                    if (this._bets?.length === 0 || this._bets?.length !== packet.bets.length)
                        this._bets = packet.bets;
                } else {
                    this._bets = [];
                    let bet;
                    let buffer = packet.bets.concat();
                    while (buffer.length) {
                        bet = buffer.shift();
                        if (bet.userId !== this._userId)
                            this._bets.push(bet);
                    }
                }
                if (this._delayOnConnect) {
                    this._delayOnConnect = false;
                    this._finallyConnect();
                }
                AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
                break;
            }
            case TickState.ROUND_BET_STATE: {
                this._totalWinInRound = 0;
                AppG.emit.emit(AppConst.APP_EMIT_ON_WIN, this._totalWinInRound);
                while (this._userBets.length) {
                    this._userBetsData.push(this._userBets.shift());
                }
                if (this._userBetsData.length > CrashConst.COUNT_ON_USER_BET_TABLE) {
                    this._userBetsData = this._userBetsData.slice(this._userBetsData.length - CrashConst.COUNT_ON_USER_BET_TABLE);
                }
                this._bets.length = 0;
                AppG.emit.emit(CrashConst.EMIT_ON_BETS_UPDATE);
                this.totalBet = 0;
                for (let betId in this._betConfig) {
                    let data = this._betConfig[betId];
                    if (!data["onServer"]) {
                        this.setBet(betId, data["bet"], data["cashOut"], data["autoCashOut"]);
                    }
                }
                break;
            }
        }
        AppG.emit.emit(CrashConst.S_GAME_STATE_UPDATE, this._currentState, this._nextState);
    }

    /**     * @private     */
    _updateCurrentBet(updateBalance = true) {
        this._currBet = 0;
        for (let id in this._betConfig) {
            if (!this._betConfig[id]["cacheOnBalance"])
                this._currBet += this._betConfig[id]["bet"];
        }
        updateBalance && AppG.emit.emit(AppConst.APP_EMIT_ON_CREDIT);
    }

    _createHistoryData(packet) {
        this._console && OMY.Omy.log('MessageType.ROUNDS', packet);
        if (!this._historyData || this._isGameConnect) {
            packet.rounds.reverse();
            if (packet.rounds.length > CrashConst.COUNT_ON_HISTORY_TABLE) {
                this._historyData = packet.rounds.slice(packet.rounds.length - CrashConst.COUNT_ON_HISTORY_TABLE);
            } else {
                this._historyData = packet.rounds;
            }
            for (let i = 0; i < this._historyData.length; i++) {
                let isWin = false;
                for (let j = 0; j < this._historyData[i]["bets"].length; j++) {
                    if (Boolean(this._historyData[i]["bets"][j]["gain"])) {
                        isWin = true;
                        break;
                    }
                }
                this._historyData[i].isWin = isWin;
            }
            this._isGameConnect && AppG.emit.emit(CrashConst.EMIT_ON_HISTORY_UPDATE, true);
            // this._console && OMY.Omy.info('historyData', this._historyData);
        }

        OMY.OMath.sortNumber(packet.topRounds, "multiplier", true);
        if (packet.topRounds.length > CrashConst.COUNT_ON_TOP_HISTORY_TABLE) {
            this._historyTopData = packet.topRounds.slice(packet.topRounds.length - CrashConst.COUNT_ON_TOP_HISTORY_TABLE);
        } else {
            this._historyTopData = packet.topRounds;
        }
        AppG.emit.emit(CrashConst.EMIT_ON_HISTORY_TOP_UPDATE);
        // this._console && OMY.Omy.info('historyTopData', this._historyTopData);
    }

    /**
     * change bet game
     * @param {Number}betId, def = 0
     * @param {Number}currentBet
     * @param {Number}currentCashOut
     * @param {Boolean}autoCashOut
     */
    setBet(betId, currentBet, currentCashOut = 0, autoCashOut = false) {
        if (!this._betConfig[betId]) this._betConfig[betId] = {onServer: false, sending: false, cacheOnBalance: false};
        if (this._betConfig[betId]["sending"]) return;
        if (this._betConfig[betId]["takeSending"]) {
            this._bufferBetConfig[betId] = {onServer: false, sending: false, cacheOnBalance: false};
            this._bufferBetConfig[betId]["sending"] = this.isBetState;
            this._bufferBetConfig[betId]["onServer"] = false;
            this._bufferBetConfig[betId]["cacheOnBalance"] = false;
            this._bufferBetConfig[betId]["bet"] = currentBet;
            this._bufferBetConfig[betId]["cashOut"] = currentCashOut;
            this._bufferBetConfig[betId]["autoCashOut"] = autoCashOut;
            return;
        }
        if (this._betConfig[betId]["onServer"]) return;

        this._betConfig[betId]["sending"] = this.isBetState;
        this._betConfig[betId]["onServer"] = false;
        this._betConfig[betId]["cacheOnBalance"] = false;
        this._betConfig[betId]["bet"] = currentBet;
        this._betConfig[betId]["cashOut"] = currentCashOut;
        this._betConfig[betId]["autoCashOut"] = autoCashOut;
        this._updateCurrentBet();
        if (this.isBetState) {
            this.netManager.bet(betId, currentBet,
                autoCashOut, (autoCashOut) ? currentCashOut : 1);
            this._console && OMY.Omy.log("Bet sent.");
        } else {
            AppG.emit.emit(CrashConst.EMIT_ON_BET_SET, betId);
        }
    }

    /**
     * @param {Number}betId
     */
    setCashOut(betId) {
        if (this._currentState === TickState.ROUND_INCREASE_STATE) {
            if (this._betConfig[betId]["takeSending"]) return;
            this._betConfig[betId]["takeSending"] = true;
            this.netManager.collect(betId);
            this._console && OMY.Omy.log("Take sent.");
        }
    }

    /**
     * @param {Number}betId
     */
    setCancel(betId) {
        if (this.isBetState) {
            if (!this._betConfig[betId]) {
                AppG.emit.emit(CrashConst.EMIT_ON_CANCEL_SET, betId);
                return;
            }
            if (this._betConfig[betId]["cancelSending"]) return;
            this._betConfig[betId]["cancelSending"] = true;
            this.netManager.cancel(betId);
            this._console && OMY.Omy.log("Cancel sent.");
        } else {
            if (this._betConfig[betId])
                delete this._betConfig[betId];
            AppG.emit.emit(CrashConst.EMIT_ON_CANCEL_SET, betId);
        }
        this._updateCurrentBet();
    }

    setBalance() {
        for (let id in this._betConfig) {
            if (this._betConfig[id]["onServer"]) {
                this._betConfig[id]["cacheOnBalance"] = true;
            }
        }
        this._updateCurrentBet(false);
        this.netManager.balanceCheck();
        this._console && OMY.Omy.log("Balance check sent.");
    }

    /**
     * @param {Number}betId
     */
    isBetting(betId) {
        if (!this._betConfig[betId]) return false;
        return this._betConfig[betId]["onServer"];
    }

    /**
     * @param {Number}betId
     */
    isBetExists(betId) {
        return Boolean(this._betConfig[betId]);
    }

    /**
     * @param {Number}betIndex
     * @returns {UserBet}
     */
    getUserBetData(betIndex) {
        if (!this._userBetData) return null;
        return this._userBetData[betIndex];
    }

    /**
     * change bet game
     * @param {Number}bet
     * @param {Boolean}vector  false - backward, true - forward
     * @returns {Number}
     */
    changeBet(bet, vector = true) {
        let betPosition = this._possBets.indexOf(bet);
        if (betPosition === -1) {
            for (let i = 0; i < this._possBets.length - 1; i++) {
                if (bet > this._possBets[i] && bet < this._possBets[i + 1]) {
                    if (vector) betPosition = i + 1;
                    else betPosition = i;
                    break;
                }
            }
            if (betPosition === -1) betPosition = (vector) ? this._possBets.length : -1;
        } else {
            (vector) ? betPosition++ : betPosition--;
        }
        if (betPosition >= this._possBets.length)
            return this._maxBet;
        if (betPosition < 0)
            return this._minBet;
        return Number(this._possBets[betPosition]);
    }

    convertValue(value, currency) {
        if (currency === this._currencyName) {
            return value;
        }
        if (!this._euroRates.hasOwnProperty(currency)) {
            OMY.Omy.error('not have this currency for convert', currency);
            return value;
        }
        let result = (value * this._euroRates[currency]) / this._euroRates[this._currencyName];
        // this._console && OMY.Omy.warn('convert. was:', value, "new value:", result, "converted:", currency + ">>" + this._currencyName);
        return OMY.OMath.roundNumber(result, 100);
    }

    getRoundData(findId) {
        if (!findId) return null;
        for (let round of this._saveAllHistoryRounds) {
            if (Number(round.roundId) === Number(findId)) return round;
        }
        this.netManager.roundInfo(findId);
        this._console && OMY.Omy.log("Try to get round.");
        return null;
    }

    isUserHasCash(bet) {
        return OMY.OMath.roundNumber(this.playerBalance, 100) >= OMY.OMath.roundNumber(bet, 100);
    }

//---------------------------------------
/// ACCESSOR
    get playerBalance() {
        return this._playerBalance - this._currBet;
    }

    set playerBalance(value) {
        this._playerBalance = value;
        AppG.emit.emit(AppConst.APP_EMIT_ON_CREDIT);
    }

    get currBet() {
        return this._currBet;
    }

    set currBet(value) {
        this._currBet = value;
    }

    set totalBet(value) {
        this._totalBet = value;
        AppG.emit.emit(AppConst.APP_EMIT_ON_BET);
    }

    get totalBet() {
        return this._totalBet;
    }

    get maxBet() {
        return this._maxBet;
    }

    get minBet() {
        return this._minBet;
    }

    get creditType() {
        return this._creditType;
    }

    get totalWinInGame() {
        return this._totalWinInGame;
    }

    get totalWinInRound() {
        return this._totalWinInRound;
    }

    get userName() {
        return this._userName;
    }

    get currentState() {
        return this._currentState;
    }

    get nextState() {
        return this._nextState;
    }

    get timeForBet() {
        return this._timeForBet;
    }

    get endTime() {
        return this._endTime;
    }

    get time() {
        return this._time;
    }

    get isBetState() {
        return this._currentState === TickState.ROUND_BET_STATE;
    }

    get userBets() {
        return this._userBets;
    }

    get historyData() {
        return this._historyData;
    }

    get historyTopData() {
        return this._historyTopData;
    }

    get betsTopData() {
        return this._betsTopData;
    }

    get userBetsData() {
        return this._userBetsData.concat(this._userBets);
    }

    get bets() {
        if (this._bets.length > CrashConst.COUNT_ON_BET_TABLE)
            this._bets.length = CrashConst.COUNT_ON_BET_TABLE;
        return this._bets.concat(this._userBets);
    }

    get roundMulti() {
        return this._roundMulti;
    }

    get defaultBet() {
        return this._defaultBet;
    }

    get playerCount() {
        return this._playerCount;
    }

    get TOURNAMENT_UPDATE() {
        return "update_tournament_data";
    }

    get TOURNAMENT_WIN() {
        return "win_tournament_data";
    }
}
