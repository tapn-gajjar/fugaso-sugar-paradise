import {AppG} from "../AppG";
import {AppConst} from "../AppConst";
import {PayTableData} from "../../app/data/PayTableData";
import {Packets} from "../../unicorn-net-lib/packets/Packets";
import {HistoryData} from "../../app/data/HistoryData";
import {JackpotsData} from "../../app/data/JackpotsData";
import {JackpotsWinData} from "../../app/data/JackpotsWinData";
import {JackpotsWinFakeData} from "../../app/data/JackpotsWinFakeData";
import {JackpotsLoseData} from "../../app/data/JackpotsLoseData";
import {SimplexNetworkManager} from "../../unicorn-net-lib/SimplexNetworkManager";
import {TStaticConst} from "../tournament/TStaticConst";

const md5 = require("md5");

export class ServerWorkBase extends PIXI.utils.EventEmitter {
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

        this._reels = null;
        this._currentCat = 0;
        this._currentReels = null;
        this._lines = null;
        this._reelStop = null;
        this._currBet = 0;
        /** @type {PayTableData} */
        this._paytable = null;
        this._possBets = null;
        this._currLines = 0;
        this._playerBalance = 0;
        this._holdReelsList = null;
        this._isGameConnect = false;
        this._totalReel = 0;
        this._reelFreeCat = 0;
        this._freeBonusSymbol = "";
        this._countFreeGame = 0;
        this._totalFreeGame = 0;
        this._creditType = 1;
        this._lastCards = null;
        this._jackpotsData = null;
        this._jackpotsWinData = null;
        this._isSendSpin = false;
        this._isSendCollect = false;
        this._delaySendSpin = false;
        this._isWinSpin = false;
        this._betCounter = 100;
        this._defBetCounter = 1;

        this._totalWinInGame = 0;
        this._totalWinInSpin = 0;
        this._spinWin = 0;
        this._totalFreeWin = 0;
        this._totalRespinWin = 0;
        this._haveFreeOnStart = false;
        this._holdReelsList = [];
        this._coinSystem = AppG.gameConst.coinSystem;
        this._defaultCat = AppG.gameConst.defaultCat;
        this._gameIsClose = false;
        this._currencyO = {};
        this._totalWinJP = 0;
        this._totalWinTournament = 0;
        this._useTotalBetForLimit = AppG.gameConst.useTotalBetForLimit;
        this._betDenomination = 0;
    }

    connectToServer(onCompleteHandler) {
        this._onCompleteHandler = onCompleteHandler;
        this._debugData = OMY.Omy.assets.getJSON("DebugRequest")?.requests;
        this._isHasDebugData = Boolean(this._debugData);
        if (this._isHasDebugData)
            /** @type {Array} */
            this._requests = this._debugData.concat();

        let o = {};
        o.userName = this._playerId;
        o.sessionId = this._sessionId;
        o.operatorId = this._operatorId;
        o.mode = this._mode;
        o.gameName = this._gameName;
        let session = JSON.stringify(o);

        this.netManager = new SimplexNetworkManager(this._domain, session, this._password, 0, AppG.country);

        this.netManager.addListener(Packets.PKT_LOGIN_RS.name, e => {
            // OMY.Omy.log('LOGIN RESPONSE: ', e.data);
        });
        this.netManager.addListener(Packets.PKT_CURRENCY_RS.name, this._onGameCurrencyGet.bind(this));

        this.netManager.addListener(Packets.PKT_JOIN_RS.name, this.handleJoinResponse.bind(this));
        this.netManager.addListener(Packets.PKT_JOIN_DATA_RS.name, e => {
            // OMY.Omy.log('JOIN DATA: ', e.data);
        });

        this.netManager.addListener(Packets.PKT_GAME_DATA_RS.name, this.onGetServerData.bind(this));
        this.netManager.addListener(Packets.PKT_HISTORY_RS.name, this.onGetHistory.bind(this));

        if (AppG.isHaveJackpot) {
            this.netManager.addListener(Packets.PKT_JACKPOTS_RS.name, this.onJackpots.bind(this));
            this.netManager.addListener(Packets.PKT_JACKPOTS_WIN_RS.name, this.onJackpotsWin.bind(this));
        }

        this.netManager.addListener(Packets.PKT_ERROR_RS.name, this._onServerError.bind(this));
        this.netManager.addListener(Packets.PKT_TOURNAMENT_INFO.name, this._onGetTournament.bind(this));

        this.netManager.connect(this.onError.bind(this), this.onSuccess.bind(this));
    }

    onError(xhr, textStatus, errorThrown) {
        AppG.not_connection = true;
        if (textStatus === "critical")
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_NO_INET_CLOSE, null, null, 0, true);
        else
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_NO_INET);
    }

    onSuccess() {
        AppG.not_connection = false;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active &&
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).wType === AppConst.WARNING_NO_INET) {
            OMY.Omy.viewManager.hideWindow(AppConst.W_WARNING);
        }
    }

    _onServerError(e) {
        OMY.Omy.error("ON ERROR", e);
        this._gameIsClose = true;
        OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_CUSTOM_WARNING, e.data.message, null, e.data.code);
    }

    onGetServerData(e) {
        let packet = e.data;
        this._nextAct = packet.nextAct;
        this._subType = packet.subType;
        this._roundType = packet.roundType;
        AppG.gameRoundId = packet.roundId;

        AppG.serverConsole && OMY.Omy.warn("get data from server. SubType:", this._subType, "nextAct:", this._nextAct, "Round:", packet.roundId,
            "round type:", this._roundType);
        AppG.serverConsole && OMY.Omy.log("data:", packet);

        switch (this._subType) {
            case AppConst.API_INIT: {
                this.gameConfHandler(e); //обработка пакета подтипа Начальной инициализации
                this._checkRichSpins(e);
                AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.TYPE_PAYIN");
                this.payInHandler(e); //обработка пакета подтипа Начальной инициализации
                break;
            }
            case AppConst.API_RESPIN: {
                this._checkRichSpins(e);
                AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.RESPIN.");
                this.spinHandler(e);
                break;
            }
            case AppConst.API_SPIN:
            case AppConst.API_FREE_SPIN: {
                this._checkRichSpins(e);
                AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.SPIN.");
                this.spinHandler(e);
                break;
            }
            case AppConst.API_COLLECT:
            case AppConst.API_FREE_COLLECT: {
                AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.COLLECT.");
                this.collectHandler(e);
                break;
            }
            case AppConst.API_GAMBLE_PLAY: {
                AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.TYPE_GAMBLE");
                this.gambleHandler(e);
                break;
            }
        }
    }

    /**     * @private     */
    _checkRichSpins(e) {
        let packet = e.data;
        if (packet.promo) {
            this._countRichSpins = packet.promo.amount;
            this._multyRichSpins = packet.promo.multi;

            if ((this._countRichSpins > 0 || (this._roundType === "RICH" && (AppG.isPLayFreeSpins || AppG.isPLayReSpins)))
                && !AppG.isRichSpin) {
                AppG.isRichSpinBegin = true;
                this._richSpinCash = this._richSpinsCashBuffer = 0;
                if (AppG.isPLayFreeSpins || AppG.isPLayReSpins) this._countRichSpins++;
            } else if (this._countRichSpins === 0 && AppG.isRichSpin) {
                AppG.isRichSpinEnd = true;
            }
            if (AppG.isRichSpin && this.nextActionTake) {
                this._richSpinsCashBuffer = this._richSpinCash;
                this._richSpinCash += packet.result.total;
            }
        }
    }

    onGetHistory(response) {
        let packet = response.data;
        let data = new HistoryData(packet);
        AppG.serverConsole && OMY.Omy.log("History packet:", packet);
        this.emit(this.HISTORY_UPDATE, data);
    }

    clearWinJPValue() {
        this._totalWinJP = 0;
    }

    onJackpots(response) {
        let packet = response.data;
        this._jackpotsData = new JackpotsData(packet);
        this.emit(this.JACKPOT_UPDATE);
    }

    onHaveJackPot() {
        this.netManager.checkJackpots();
        AppG.serverConsole && OMY.Omy.log("on check Jackpots packet:");
    }

    onJackpotsWin(response) {
        let packet = response._data;
        // OMY.Omy.log('Jackpots win packet:', packet);

        this._winJackpot = false;
        let isHaveWin = false;
        for (let obj in packet.jackpots) {
            isHaveWin = true;
            break;
        }

        if (isHaveWin) {
            let data;
            if (response) {
                data = new JackpotsWinData(packet);
            } else {
                packet = "Used fake packet for jackpots win response";
                data = new JackpotsWinFakeData();
            }

            this._winJackpot = true;
            this._jackpotsWinData = data;

            OMY.Omy.log("********************Win jackpots packet********************:", packet);

            this._jackpotsWinData.jackpotBalans = response._data["balance"];
            this._totalWinJP = response._data["balance"] - this._playerBalance;
        }

        if (packet.collected) {
            this._jackpotsLoseData = new JackpotsLoseData(packet);
            this.emit(this.JACKPOT_LOSE);
        }

        if (!this._winJackpot)
            this.getJackpots();
    }

    clearWinTournament() {
        this._totalWinTournament = 0;
        this.playerBalance = this._tournamentBalance;
    }

    checkTournament() {
        if (AppG.tournament.debugTour) {
            OMY.Omy.add.timer(.1, this._onGetTournament, this,
                0, false, true, 0, [TStaticConst.t_debug_data]);
            return;
        }
        this.netManager.tournamentInfo();
        AppG.serverConsole && OMY.Omy.log("on check Tournament packet:");
    }

    _onGetTournament(e) {
        AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.PKT_TOURNAMENT_INFO");
        let packet = e.data;
        AppG.serverConsole && OMY.Omy.log("data:", packet);
        this.emit(this.TOURNAMENT_UPDATE, packet.tournament);
        if (!this._isGameConnect) {
            this.netManager.addListener(Packets.PKT_TOURNAMENT_WIN.name, this._tournamentWinHandler.bind(this));
            AppG.tournament.checkActivated(packet.tournament);
            this._isGameConnect = true;
            this._onCompleteHandler();
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
    }

    gameConfHandler(e) {
        AppG.serverConsole && OMY.Omy.log("net", "PacketGameData.TYPE_INITIAL");
        let packet = e.data;
        this.convertReels(packet.reels);

        this.currentCat = packet.category;
        this._totalReel = this._currentReels.length;
        this._lines = packet.lines;
        this._reelStop = packet.result.stops;
        this._reelGrid = packet.result.grid;
        AppG.serverConsole && OMY.Omy.log("reel stops ", this._reelStop);
        this.currBet = Number(packet.currBet);
        if (this._isGameConnect) return;

        AppG.needCollect = this._nextAct === AppConst.API_FREE_COLLECT
            || this._nextAct === AppConst.API_COLLECT
            || this._nextAct === AppConst.API_GAMBLE_END
            || this._nextAct === AppConst.API_GAMBLE_FREE_END;

        this._paytable = new PayTableData(packet.wins);

        while (this._holdReelsList.length !== this._currentReels.length) {
            this._holdReelsList.push(0);
        }
        if (AppG.isHaveJackpot) this.netManager.pingJackpot(AppG.gameConst.getData("jpPingInterval") * 1000);
        this.netManager.ping(AppG.gameConst.getData("pingInterval") * 1000);

        if (AppG.gameHaveFree) {
            if (this._nextAct === AppConst.API_FREE_SPIN) {
                let freeSpins = packet.free;
                this._freeCatch = freeSpins.catch;
                this._freeLastGame = freeSpins.last;
                this._freeLeft = freeSpins.left;
                this._reelFreeCat = freeSpins.category;
                this._freeBonusSymbol = freeSpins.symbol;
                this._countFreeGame = freeSpins.done;
                this._totalFreeGame = freeSpins.initial;
                this._totalFreeWin = freeSpins.totalWin;
                AppG.beginFreeGame = this._countFreeGame <= this._totalFreeGame;
                this._haveFreeOnStart = true;
            }
        }
        if (AppG.gameConst.gameHaveRespin) {
            if (this._nextAct === AppConst.API_RESPIN) {
                this._oldHoldReel = this._holdMatrix = packet.result?.holds;
                this._newHoldReel = this._holdMatrix.concat();
                this._totalRespinWin = packet.result.total;
                AppG.isBeginRespin = true;
                AppG.serverConsole && OMY.Omy.log("respin game");
            }
        }
    }

    convertReels(reels) {
        /*for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 5; j++) {
                reels[i][j] = reels[i][j].replace(/CCC/g, "CVB");
                reels[i][j] = reels[i][j].replace(/DDD/g, "DQS");
                reels[i][j] = reels[i][j].replace(/EEE/g, "ELZ");
            }
        }*/
        this._reels = reels;
    }

    payInHandler(e) {
        OMY.Omy.navigateBtn.unBlockingScreen();
        if (this._isGameConnect) {
            OMY.Omy.navigateBtn.updateLastState();
            return;
        }

        let packet = e.data;
        this._creditType = packet.creditType;
        if (this._isGameConnect && this._playerBalance !== packet.balance) {
            // AntG.sounds.play("autoPayIn");
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).hide(AppConst.WARNING_NO_CASH);
        }
        this.playerBalance = packet.balance - ((AppG.isFreeGame) ? this._totalFreeWin : 0);

        if (this._isGameConnect) {
            OMY.Omy.navigateBtn.updateLastState();
            return;
        }

        if (AppG.winCredit !== 0)
            AppG.winCredit /= this._creditType;

        this._coinValue = packet.possDenoms;
        this._currentCoin = packet.currDenom;
        this._betDenomination = (AppG.gameConst.betWithDenomination) ? this.currDenom : 0;

        this._possBets = packet.possBets;
        // AntG.warn('packet.possBets', packet.possBets);

        if (this._possBets.indexOf(this._currBet) === -1) {
            this.currBet = this._possBets[0];
        }
        if (this._currBet < this._possBets[0]) {
            this.currBet = this._possBets[0];
        }
        this.currLines = OMY.OMath.int(packet.currLines);

        this._saveBet = this.currBet;
        this._saveCurBet = this._currBet;
        this._saveCurCoin = this._currentCoin;

        this._lastCards = packet.result.cards;
        this.checkTournament();
    }

    _onGameCurrencyGet(e) {
        this._currencyO[e.data.code] = {code: e.data.code, id: e.data.id, kind: e.data.kind, symbol: e.data.symbol};
    }

    handleJoinResponse(e) {
        AppG.serverConsole && OMY.Omy.log("JOIN RESPONSE ");
        AppG.currency = AppG.customCurrency || this._currencyO[e.data.realcurrency].symbol;
        this._userName = e.data.nickname;
    }

    gambleHandler(e) {
        let packet = e.data;

        if (AppG.gameHaveFree) {
            if (packet.free.initial) {
                let freeSpins = packet.free;
                this._freeCatch = freeSpins.catch;
                this._freeLastGame = freeSpins.last;
                this._freeLeft = freeSpins.left;
                this._reelFreeCat = freeSpins.category;
                this._freeBonusSymbol = freeSpins.symbol;
                this._countFreeGame = freeSpins.done;
                this._totalFreeGame = freeSpins.initial;
                this._totalFreeWin = (freeSpins.totalWin);
                AppG.isEndFree = this._countFreeGame >= this._totalFreeGame;
            }
        }

        this._lastCards = packet.result.cards;
        this._isWinGamble = packet.result.choice === this.onlyLastCard.color;
        this._gambleCount = packet.result.gambleCount;

        AppG.winCredit = packet.result.total;
        if (AppG.isRichSpin) {
            this._richSpinCash = this._richSpinsCashBuffer;
            this._richSpinCash += packet.result.total;
        }
        this.emit(AppConst.EMITSERVER_GAMBLE);
    }

    gambleLose() {
        this._totalWinInSpin = this._spinWin = 0;
        AppG.winCredit = 0;
        AppG.emit.emit(AppConst.APP_GAMBLE_LOSE);
    }

    collectHandler(e) {
        if (this._isHasDebugData) {
            if (!this._requests.length)
                this._requests = this._debugData.concat();
        }
        this.playerBalance = e.data.balance;
        this._isSendCollect = false;

        this.emit(AppConst.EMITSERVER_SEND_COLLECT);
        if (this._delaySendSpin) {
            this.sendSpin();
        }
    }

    getCharAt(pos, str) {
        pos -= str.length * Math.floor((pos / str.length));
        return str.charAt(pos);
    }

    _updateUserSpinData(packet) {
        if (this._haveFreeOnStart) this._haveFreeOnStart = false;
        this.currentCoin = packet.currDenom;
        this.currBet = packet.currBet;
        this.playerBalance = packet.balance - this._totalWinJP - this._totalWinTournament;
        this._saveBet = this.currBet;
        this._saveCurBet = this._currBet;
        this._saveCurCoin = this._currentCoin;
        this._saveServerSpinBalance = packet.balance;
    }

    _updateSpinData(packet) {
        this.currLines = packet.currLines;
        this.currentCat = packet.category;
        OMY.Omy.log("reel stops ", packet.result.stops);
        this._reelStop = packet.result.stops;
        this._reelGrid = packet.result.grid;
        //********************************************************************************************
        // let n = this._totalReel;
        // let m = AntG.gameConst.countSlot;
        // let startIndex;
        // AntG.info('==================================================================');
        // for (let i = 0; i < n; i++) {
        //     AntG.info('reel id', i);
        //     startIndex = this._reelStop[i];
        //     for (let j = 0; j < m; j++) {
        //         AntG.info('symbol id', j, 'symbol', this.getCharAt(startIndex + j, this._currentReels[i]));
        //     }
        // }
        // AntG.info('==================================================================');
        //********************************************************************************************
    }

    _updateFreeData(packet) {
        if (packet.free) this._totalFreeWin = packet.free.totalWin;
        if (this._nextAct === AppConst.API_FREE_SPIN
            || this._nextAct === AppConst.API_FREE_COLLECT
            || this._subType === AppConst.API_FREE_SPIN
            || packet.free?.catch) {
            let freeSpins = packet.free;
            this._freeCatch = freeSpins.catch;
            this._freeLastGame = freeSpins.last;
            this._freeLeft = freeSpins.left;
            this._reelFreeCat = freeSpins.category;
            this._freeBonusSymbol = freeSpins.symbol;
            this._countFreeGame = freeSpins.done;
            this._totalFreeWin = freeSpins.totalWin;

            if (this._countFreeGame === 0) {
                AppG.beginFreeGame = true;
                AppG.isEndFree = false;
                AppG.isMoreFreeGame = false;
                this._totalFreeGame = freeSpins.initial;
                this._addFreeGame = 0;
            } else {
                this._addFreeGame = freeSpins.initial - this._totalFreeGame;
                AppG.isMoreFreeGame = Boolean(this._addFreeGame);
                this._totalFreeGame = freeSpins.initial;

                AppG.isEndFree = this._countFreeGame >= this._totalFreeGame;
            }

            AppG.serverConsole && OMY.Omy.log("free game. count free spin: ", this._countFreeGame,
                ", total free spin: ", this._totalFreeGame, ", free spin ", packet.free);
            this._totalFreeGame -= this._addFreeGame;
        }
    }

    _updateRespinData(packet) {
        if (AppG.isRespin || this._nextAct === AppConst.API_RESPIN) {
            this._oldHoldReel = this._holdMatrix;
            this._holdMatrix = packet.result?.holds;
            this._totalRespinWin = packet.result.total;

            if (this._nextAct === AppConst.API_RESPIN) {
                if (!AppG.isRespin) {
                    AppG.isBeginRespin = true;
                    this._newHoldReel = this._holdMatrix.concat();
                    AppG.serverConsole && OMY.Omy.log("begin respin game");
                } else {
                    this._holdMatrix.map((a, index, array) => {
                        this._newHoldReel[index] = (this._holdMatrix[index] === this._oldHoldReel[index]) ? 0 : 1;
                    });
                    AppG.serverConsole && OMY.Omy.log("next respin game");
                }
            } else {
                this._holdMatrix.map((a, index, array) => {
                    this._newHoldReel[index] = (this._holdMatrix[index] === this._oldHoldReel[index]) ? 0 : 1;
                });
                if (this._nextAct === AppConst.API_COLLECT
                    || this._nextAct === AppConst.API_FREE_COLLECT
                    || this._nextAct === AppConst.API_BET) {
                    AppG.isEndRespin = true;
                    AppG.serverConsole && OMY.Omy.log("end respin game");
                } else {
                    AppG.serverConsole && OMY.Omy.error("not nextAcation is take. Cann`t finish respin!!!");
                }
            }
        }
    }

    _updateWinData(packet) {
        AppG.needCollect = this.nextActionTake;

        this._winLines = packet.result.wons;
        this._isWinSpin = AppG.isWin = (this._winLines.length !== 0);
        if (AppG.isWin) {
            this._spinWin = 0;
            packet.result.wons.map((a, index, array) => this._spinWin += a.amount);
            this._totalWinInSpin = packet.result.total;
            AppG.serverConsole && OMY.Omy.log("win *******************************");
            AppG.serverConsole && OMY.Omy.log("spinWin", this._spinWin, "totalWinInSpin", this._totalWinInSpin, "totalFreeWin", this._totalFreeWin, "totalRespinWin", this._totalRespinWin);
            AppG.serverConsole && OMY.Omy.log(packet.result.wons);
            AppG.serverConsole && OMY.Omy.log("*******************************");
            if (Boolean(AppG.debugWin)) this._totalWinInSpin = this._spinWin = AppG.debugWin;

            this._totalWinInGame += this._totalWinInSpin;
            AppG.dataWins.serverData(this._winLines);
        } else {
            this._totalWinInSpin = this._spinWin = 0;
        }
    }

    spinHandler(e) {
        if (this._isHasDebugData) {
            if (!this._requests.length)
                this._requests = this._debugData.concat();
        }
        this._isSendSpin = false;
        let packet = e.data;

        this._updateUserSpinData(packet);
        this._updateSpinData(packet);

        AppG.serverConsole && OMY.Omy.log("finish Spin. current line ", this._currLines, ", current cat ", this._currentCat,
            ", is win ", Boolean(packet.result.wons.length),
            ", lines win ", packet.result.wons);

        if (AppG.gameHaveFree) {
            this._updateFreeData(packet);
        }
        if (AppG.gameHaveRespin) {
            this._updateRespinData(packet);
        }

        this._updateWinData(packet);

        /*if (this._nextAct === AntG.SERVER_FREE_COLLECT || this._nextAct === AntG.SERVER_COLLECT) {
            AntG.log('send collect', this._nextAct);
            if (this._nextAct === AntG.SERVER_FREE_COLLECT || this._nextAct === AntG.SERVER_GAMBLE_FREE_END) {
                this.netManager.freeCollect();
            } else {
                this.netManager.collect();
            }
        }*/

        this.emit(AppConst.EMITSERVER_ON_SPIN);
        packet = null;
    }

    getLine(lineId) {
        return this._lines[lineId];
    }

    /**     * @public     */
    setToMinBet() {
        this._currLines = this.maxLines;
        if (!this._coinSystem)
            this.netManager.betLine(this._possBets[0], this._currLines);
        else
            this._currentCoin = Number(this._coinValue[0]);

        this.currBet = this._possBets[0];
    }

    /**     * @public     */
    return2PrevBet() {
        this._currentCoin = this._saveCurCoin;
        this.currBet = this._saveCurBet;
    }

    changeLines(minLineCount = 1, up = true, count = 1) {
        if (up) {
            this._currLines += count;
            if (this._currLines > this.maxLines) {
                this._currLines = minLineCount;
            }
        } else {
            this._currLines -= count;
            if (this._currLines < 1) {
                this._currLines = this.maxLines;
            }
        }

        if (!this._coinSystem)
            this.netManager.betLine(this._currBet, this._currLines);
        this.currBet = this._currBet;
    }

    /**
     * change bet game
     * @param way  0 - backward, 1 - forward
     * @param numLines
     */
    changeBet(way = 1, numLines = 0) {
        numLines = numLines || this._currLines;
        let betPosition = this._possBets.indexOf(this._currBet);
        if (way === 1) {
            betPosition++;
            if (betPosition >= this._possBets.length)
                betPosition = 0;
            /* else if ((this._possBets[betPosition] / this._creditType * numLines) > this.playerBalance)
                 betPosition = 0;*/
        } else {
            betPosition--;
            if (betPosition < 0)
                betPosition = this._possBets.length - 1;
        }
        let newBet = Number(this._possBets[betPosition]);

        if (!this._coinSystem)
            this.netManager.betLine(newBet, this._currLines);
        this.currBet = newBet;
    }

    changeCoin(way = 1) {
        let coinPosition = this._coinValue.indexOf(this._currentCoin);
        if (way === 1) {
            coinPosition++;
            if (coinPosition >= this._coinValue.length)
                coinPosition = 0;
            else if ((this._currBet * this._coinValue[coinPosition] / this._creditType) > this.playerBalance)
                coinPosition = 0;
        } else {
            coinPosition--;
            if (coinPosition < 0)
                coinPosition = this._coinValue.length - 1;
        }
        this._currentCoin = Number(this._coinValue[coinPosition]);
        AppG.emit.emit(AppConst.APP_EMIT_ON_BET);
    }

    checkBet(setBet, save = false) {
        setBet = OMY.OMath.roundNumber(setBet, 1);
        if (setBet >= this._possBets.length)
            setBet = this._possBets.length - 1;
        else if (setBet < 0) {
            setBet = 0;
        }
        let newBet = Number(this._possBets[setBet]);
        if (save) {
            /*if ((newBet / this._creditType) > this.playerBalance) {
                let betPosition = 0;
                for (let i = 0; i < this._possBets.length; i++) {
                    if ((this._possBets[i] / this._creditType) <= this.playerBalance)
                        betPosition = i;
                }
                newBet = Number(this._possBets[betPosition]);
            }*/

            if (!this._coinSystem)
                this.netManager.betLine(newBet, this._currLines);
        }
        this.currBet = newBet;
    }

    checkCoins(setCoin, save = false) {
        setCoin = OMY.OMath.roundNumber(setCoin, 1);
        if (setCoin >= this._coinValue.length)
            setCoin = this._coinValue.length - 1;
        else if (setCoin < 0) {
            setCoin = 0;
        }
        let newCoin = Number(this._coinValue[setCoin]);
        if (save) {
            if ((newCoin / this._creditType * this._currLines) > this.playerBalance) {
                let betPosition = 0;
                for (let i = 0; i < this._coinValue.length; i++) {
                    if ((this._coinValue[i] / this._creditType * this._currLines) <= this.playerBalance)
                        betPosition = i;
                }
                newCoin = Number(this._coinValue[betPosition]);
            }
        }

        this._currentCoin = newCoin;
        AppG.emit.emit(AppConst.APP_EMIT_ON_BET);
    }

    setLines(value) {
        this._currLines = value;
        if (!this._coinSystem)
            this.netManager.betLine(this._currBet, this._currLines);
        this.currBet = this._currBet;
    }

    changeMaxBet() {
        this._currLines = this.maxLines;
        let newBet = 0;
        for (let i = this._possBets.length - 1; i >= 0; i--) {
            if (this._coinSystem)
                newBet = this._possBets[i] * this.currentCoin;
            else
                newBet = this._possBets[i] / this._creditType;
            if (this.playerBalance >= newBet) {
                if (!this._coinSystem)
                    this.netManager.betLine(this._possBets[i], this._currLines);
                this.currBet = this._possBets[i];
                this.sendSpin();
                break;
            }
        }
    }

    getBetPos() {
        return this._possBets.indexOf(this._currBet);
    }

    getCoinsPos() {
        return this._coinValue.indexOf(this._currentCoin);
    }

    sendSpin(buyFreeSpin = false) {
        if (this._isSendSpin)
            return;
        if (AppG.moveReels && !this._delaySendSpin)
            return;

        if (!AppG.isFreeGame && !AppG.isRespin && !AppG.isBeginRespin && !AppG.beginFreeGame &&
            !AppG.isRichSpin) {
            if (AppG.serverWork.playerBalance === 0) {
                if (AppG.isAutoGame) {
                    AppG.autoGameRules.stopAutoGame();
                    AppG.autoGameRules.setCanStartAutoGame(true);
                    OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
                }
                OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_NO_CASH);
                return;
            } else if (!AppG.serverWork.isUserHasCash) {
                if (AppG.isAutoGame) {
                    AppG.autoGameRules.stopAutoGame();
                    AppG.autoGameRules.setCanStartAutoGame(true);
                    OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
                }
                OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_NO_CASH_FOR_BET);
                return;
            }
        }
        if (this._nextAct !== AppConst.API_FREE_SPIN && this._nextAct !== AppConst.API_RESPIN)
            this.currentCat = this._defaultCat;

        if (this._isSendCollect) {
            this.emit(AppConst.EMITSERVER_SEND_SPIN);
            AppG.moveReels = true;
            this._delaySendSpin = true;
            return;
        }

        if (this.nextActionTake) {
            this.sendCollect();
            return;
        }

        this._delaySendSpin = false;
        this._isSendSpin = true;
        this._isWinSpin = false;
        AppG.serverConsole && OMY.Omy.log("send spin", this._nextAct);
        if (!AppG.moveReels) {
            this.emit(AppConst.EMITSERVER_SEND_SPIN);
            AppG.moveReels = true;
        }

        if (this._isHasDebugData) {
            OMY.Omy.error('use debug request data');
            let request = {
                data: this._requests.shift()
            };
            this.onGetServerData(request);
            return;
        }

        if (this._nextAct === AppConst.API_FREE_SPIN) {
            AppG.autoGameRules.freeSpin(true);
            this.netManager.freeSpin();
        } else if (this._coinSystem) {
            if (this._nextAct === AppConst.API_RESPIN) {
                AppG.autoGameRules.freeSpin(true);
                this.netManager.respin();
            } else {
                AppG.autoGameRules.freeSpin(false);
                this.netManager.betSpin(this._currBet, this._currLines, this._currentCoin);
            }
        } else if (this._nextAct === AppConst.API_RESPIN) {
            AppG.autoGameRules.freeSpin(true);
            this.netManager.respin();
        } else {
            AppG.autoGameRules.freeSpin(false);
            if (buyFreeSpin)
                this.netManager.betSpin(this._currBet, this._currLines, this._currentCoin, this._betCounter);
            else
                this.netManager.betSpin(this._currBet, this._currLines, this._currentCoin, this._defBetCounter);
        }

        AppG.autoGameRules.updateRule0();
        AppG.autoGameRules.updateBets(this.totalBet);
    }

    _sendRespin() {
        throw  new Error("check!!!");
        // AppG.respin = true;
        // this.netManager.respin();
    }

    sendCollect() {
        if (this._isSendCollect) return;
        AppG.needCollect = false;

        if (this.nextActionTake) {
            AppG.isWin = false;
            AppG.winCredit = 0;
            this._isSendCollect = true;
            this.emit(AppConst.EMITSERVER_PRESS_COLLECT);
            if (this._isHasDebugData) {
                OMY.Omy.error('use debug request data');
                let request = {
                    data: this._requests.shift()
                };
                this.onGetServerData(request);
                return;
            }
            if (this._nextAct === AppConst.API_FREE_COLLECT || this._nextAct === AppConst.API_GAMBLE_FREE_END) {
                this.netManager.freeCollect();
            } else {
                this.netManager.collect();
            }
        }
    }

    /**
     * Get game history
     * @param {int} limit - how many games returns from server
     */
    getHistory(limit = 10) {
        this.netManager.getHistory(limit);
    }

    getJackpots() {
        this.netManager.getJackpots();
    }

    collectJackpots(balance) {
        this.playerBalance = balance;
        this._jackpotsWinData = null;
    }

    /**
     * Get different reels data depending from category
     * @param {int} category
     * @returns {array}
     */
    getReelsByCategory(category) {
        return this._reels[category];
    }

    sendBlack() {
        // OMY.Omy.navigateBtn.blockingScreen();
        this.netManager.gambleBlack();
    }

    sendRed() {
        // OMY.Omy.navigateBtn.blockingScreen();
        this.netManager.gambleRed();
    }

    sendReelChoise(x, y) {
        OMY.Omy.navigateBtn.blockingScreen();
        // this._netManager.packetHandler.addEventListener(PacketKind.PKT_REEL_CHOICE_DATA.name, handleReelChoise);
        // this._netManager.sendReelChoice(x, y);
    }

    handleReelChoise(e) {
        // this._netManager.packetHandler.removeEventListener(PacketKind.PKT_REEL_CHOICE_DATA.name, handleReelChoise);
        // var packet = /*PacketReelChoiceData(e.packet)*/e;
        //
        // this.currBet = packet.currBet;
        // this.currLines = packet.currLines;
        // this.playerBalance = packet.balance;
        //
        // packet = null;
    }

    sendReelHold() {
        // this.netManager.sendReelHold(this._holdReelsList);
    }

    setHoldReel(reelId, save = true) {
        // this._holdReelsList[reelId] = this._holdReelsList[reelId] == 0 ? 1 : 0;
        // if (save)
        //     this.sendReelHold();
    }

    isReelHold(reelId) {
        return this._holdReelsList[reelId] === 1;
    }

    clearHoldReels() {
        // let n = this._holdReelsList.length;
        // let i;
        //
        // for (i = 0; i < n; i++) {
        //     this._holdReelsList[i] = 0;
        // }
        // this.sendReelHold();
    }

    updateTotalFreeGame() {
        if (!AppG.isMoreFreeGame) return;
        AppG.isMoreFreeGame = false;
        this._totalFreeGame += this._addFreeGame;
        AppG.emit.emit(AppConst.EMIT_MORE_FREE, this._addFreeGame);
    }

    addOnGetHistory(method, context, once) {
        if (once)
            this.once(this.HISTORY_UPDATE, method, context);
        else
            this.on(this.HISTORY_UPDATE, method, context);
    }

    addOnJackpots(method, context, once) {
        if (once)
            this.once(this.JACKPOT_UPDATE, method, context);
        else
            this.on(this.JACKPOT_UPDATE, method, context);
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------
    get onGetHistorySignal() {
        throw  new Error("user addOnGetHistory");
    }

    get onJackpotsSignal() {
        throw  new Error("use addOnJackpots");
    }

    get isLastBet() {
        let isLast = this._possBets.indexOf(this._currBet) === this._possBets.length - 1;
        if (isLast)
            return isLast;
        /*if (this._coinSystem)
            return (this._possBets[this._possBets.indexOf(this._currBet) + 1]
                * this.currentCoin) > this.playerBalance;
        else
            return (this._possBets[this._possBets.indexOf(this._currBet) + 1]
                / this._creditType * this._currLines) > this.playerBalance;*/
    }

    get isFirstBet() {
        return this._possBets.indexOf(this._currBet) === 0;
    }

    get isLastCoin() {
        let isLast = this._coinValue.indexOf(this._currentCoin) === this._coinValue.length - 1;
        if (isLast)
            return isLast;

        return (this._coinValue[this._coinValue.indexOf(this._currentCoin) + 1] *
            this._currBet / this._creditType) > this.playerBalance;
    }

    get isFirstCoin() {
        return this._coinValue.indexOf(this._currentCoin) === 0;
    }

    get currentCat() {
        return this._currentCat;
    }

    set currentCat(value) {
        this._currentCat = value;
        this._currentReels = this._reels[this._currentCat];
    }

    get currLines() {
        return this._currLines;
    }

    set currLines(value) {
        this._currLines = value;
    }

    set currentCoin(value) {
        this._currentCoin = value;
    }

    get playerBalance() {
        return this._playerBalance / this._creditType;
    }

    set playerBalance(value) {
        this._playerBalance = value;
        AppG.emit.emit(AppConst.APP_EMIT_ON_CREDIT);
    }

    get isUserHasCash() {
        let isUserHas = this.playerBalance >= this.totalBet || AppG.isRichSpinBegin || AppG.isRichSpin || this._nextAct !== AppConst.API_BET;
        return isUserHas;
    }

    get isUserHasCashForBuy() {
        let isUserHas = this.playerBalance >= this.costBuyFree;
        return isUserHas;
    }

    get currBet() {
        if (this._coinSystem)
            return this._currBet * this.currentCoin;
        else if (AppG.isGameDrop)
            return (this._currBet / this._creditType) * this._currentCoin;
        else
            return this._currBet / this._creditType;
    }

    get currBetCoins() {
        return this._currBet;
    }

    set currBet(value) {
        this._currBet = value;
        AppG.emit.emit(AppConst.APP_EMIT_ON_BET);
    }

    get totalBet() {
        return this.currBet * (this._betDenomination || this.currLines);
    }

    get costBuyFree() {
        return this.totalBet * this._betCounter;
    }

    get reelStop() {
        return this._reelStop;
    }

    get currentReels() {
        return this._currentReels;
    }

    /**
     * @return {PayTableData}
     */
    get paytable() {
        return this._paytable;
    }

    get isHaveBet() {
        return this.playerBalance >= this.minBet;
    }

    get maxBet() {
        if (this._coinSystem)
            return this._possBets[this._possBets.length - 1] * this.currentCoin;
        else
            return this._possBets[this._possBets.length - 1] / this._creditType;
    }

    get minBet() {
        if (this._coinSystem)
            return this._possBets[0] * this.currentCoin;
        else
            return this._possBets[0] / this._creditType;
    }

    get maxBetCoins() {
        return this._possBets[this._possBets.length - 1];
    }

    get minBetCoins() {
        return this._possBets[0];
    }

    get maxCoins() {
        return this._coinValue[this._coinValue.length - 1] / this._creditType;
    }

    get minCoins() {
        return this._coinValue[0] / this._creditType;
    }

    get maxLines() {
        return this._lines.length;
    }

    get lines() {
        return this._lines;
    }

    get totalReel() {
        return this._totalReel;
    }

    get countFreeGame() {
        return this._countFreeGame;
    }

    get totalFreeGame() {
        return this._totalFreeGame;
    }

    get reelFreeCat() {
        return this._reelFreeCat;
    }

    get freeBonusSymbol() {
        return this._freeBonusSymbol;
    }

    get creditType() {
        return this._creditType;
    }

    get lastCards() {
        return this._lastCards;
    }

    get onlyLastCard() {
        return this._lastCards[this._lastCards.length - 1];
    }

    get totalFreeCoins() {
        return this._totalFreeCredit / this._currentCoin;
    }

    get countBets() {
        return this._possBets.length;
    }

    get countCoins() {
        return this._coinValue.length;
    }

    get possBets() {
        return this._possBets;
    }

    get minBetIndex() {
        return this._possBets.indexOf(20) + 1;
    }

    get maxBetIndex() {
        return this._possBets.length;
    }

    get betIndex() {
        return this._possBets.indexOf(this._currBet) + 1;
    }

    get currentCoin() {
        return this._currentCoin / this._creditType;
    }

    get currDenom() {
        return this._currentCoin;
    }

    get nextAct() {
        return this._nextAct;
    }

    get isWinGamble() {
        return this._isWinGamble;
    }

    get gambleCount() {
        return this._gambleCount;
    }

    get freeCatch() {
        return this._freeCatch;
    }

    get freeLastGame() {
        return this._freeLastGame;
    }

    get freeLeft() {
        return this._freeLeft;
    }

    get jackpotsData() {
        return this._jackpotsData;
    }

    set winJackpot(value) {
        this._winJackpot = value;
    }

    get winJackpot() {
        return this._winJackpot;
    }

    get jackpotsWinData() {
        return this._jackpotsWinData;
    }

    get jackpotsLoseData() {
        let result = this._jackpotsLoseData;
        this._jackpotsLoseData = null;
        return result;
    }

    get richSpinCash() {
        return this._richSpinCash || 0;
    }

    get countRichSpins() {
        return this._countRichSpins;
    }

    get multyRichSpins() {
        return this._multyRichSpins;
    }

    get catchMoreFree() {
        return this._catchMoreFree;
    }

    get holdMatrix() {
        return this._holdMatrix || [];
    }

    get newHoldReel() {
        return this._newHoldReel;
    }

    get totalWinInGame() {
        return this._totalWinInGame/* / this._creditType*/;
    }

    get totalWinInSpin() {
        return this._totalWinInSpin/* / this._creditType*/;
    }

    get spinWin() {
        return this._spinWin/* / this._creditType*/;
    }

    get totalFreeWin() {
        return this._totalFreeWin/* / this._creditType*/;
    }

    get totalRespinWin() {
        return this._totalRespinWin;
    }

    get haveFreeOnStart() {
        return this._haveFreeOnStart;
    }

    get HISTORY_UPDATE() {
        return "update_history_api";
    }

    get JACKPOT_UPDATE() {
        return "update_jackpot_api";
    }

    get JACKPOT_LOSE() {
        return "lose_jackpot_api";
    }

    get TOURNAMENT_UPDATE() {
        return "update_tournament_data";
    }

    get TOURNAMENT_WIN() {
        return "win_tournament_data";
    }

    get nextActionTake() {
        return (this._nextAct === AppConst.API_FREE_COLLECT
            || this._nextAct === AppConst.API_COLLECT
            || this._nextAct === AppConst.API_GAMBLE_END
            || this._nextAct === AppConst.API_GAMBLE_FREE_END);
    }

    get nextActionSpin() {
        return (this._nextAct === AppConst.API_BET
            || this._nextAct === AppConst.API_FREE_SPIN);
    }

    get nextActionCostSpin() {
        return this._nextAct === AppConst.API_BET;
    }

    get betForLimit() {
        return (this._useTotalBetForLimit) ? this.totalBet : this.currBet;
    }

    get isWinSpin() {
        return this._isWinSpin;
    }

    get reelGrid() {
        return this._reelGrid;
    }

    get betCounter() {
        return this._betCounter;
    }

    get userName() {
        return this._userName;
    }
}
