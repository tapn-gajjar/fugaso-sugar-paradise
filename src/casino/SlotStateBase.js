import {AppG} from "./AppG";
import {AppConst} from "./AppConst";
import {GameConstStatic} from "../app/GameConstStatic";
import {TStaticConst} from "./tournament/TStaticConst";

export class SlotStateBase {
    constructor() {
        this._state = SlotStateBase.STATE_BET;
        /*@type {MainView|MainDropView} */
        this._mainView = null;
        this._holdSession = true;
        this._winEvent = false;
        this._clearWinEffOnEnd = AppG.gameConst.getData("clearWinEffOnEnd");
        this._noJPChecking = false;
        this._gameCycle = 0;
        this._inCycle = false;
        this._gameRoundId = AppG.gameRoundId;
        OMY.Omy.debugMode && this._registerConsoleMethods();

        this._gameWithFree = AppG.gameHaveFree;
        this._showWinAfterCollect = AppG.gameConst.getData("showWinAfterCollect");
        this._showWinOnGamble = AppG.gameConst.showWinOnGamble;
        this._haveLoopAnimation = AppG.gameConst.getData("haveLoopAnimation");

        this._timeAutoCollect = AppG.gameConst.getData("timeAutoCollect");
        this._haveAutoCollect = AppG.gameConst.getData("haveAutoCollect");
        this._timerCollect = null;

        this._lowVolumeOnWin = AppG.gameConst.lowVolumeOnWin;

        AppG.serverWork.on(AppConst.EMITSERVER_SEND_SPIN, this.spinGame, this);
        AppG.serverWork.on(AppConst.EMITSERVER_ON_SPIN, this.onSendSpin, this);
        // AppG.serverWork.on(AppConst.EMITSERVER_COLLECT, this.startNewSession, this);
        AppG.autoGameRules.addOnStopHandler(this._onAutoStop, this, false);
    }

    showGame() {
        OMY.Omy.viewManager.showView(AppConst.P_VIEW_MAIN);

        if (AppG.isRichSpinBegin && (AppG.isFreeGame || AppG.beginFreeGame || AppG.isRespin || AppG.isBeginRespin)) {
            AppG.isRichSpinBegin = false;
            AppG.isRichSpin = true;
            AppG.emit.emit(AppConst.APP_EMIT_FORCE_START);
        }

        this._gameRoundId = AppG.gameRoundId;
        if (AppG.needCollect) AppG.serverWork.sendCollect();
        if (AppG.gameConst.gameHaveIntroInformation) return;
        if (!AppG.gameConst.gameHaveIntro)
            this.startNewSession();
    }

    // region start spin session:
    //-------------------------------------------------------------------------
    startNewSession() {
        if (this._inCycle) {
            OMY.Omy.error('game cycle is not end');
            throw  new Error("game cycle is not end");
        }
        OMY.Omy.warn("===========game cycle:" + String(this._gameCycle) + " ===========");
        if (AppG.jacpotIsShowing) {
            return;
        }

        AppG.emit.emit(AppConst.APP_EMIT_ON_CREDIT);

        if (AppG.isRichSpinBegin && AppG.serverWork.nextAct === AppConst.API_BET) {
            AppG.isRichSpinBegin = false;
            AppG.isRichSpin = true;
            AppG.autoStart = false;
            if (AppG.isAutoGame) {
                AppG.autoGameRules.stopAutoGame();
            }
            AppG.emit.emit(AppConst.APP_EMIT_RICH_START);
            return;
        }
        if (AppG.isRichSpin)
            AppG.emit.emit(AppConst.APP_EMIT_RICH_UPDATE);

        AppG.autoGameRules.updateRule4();
        AppG.autoGameRules.updateRule5();

        if (this._winEvent) {
            this._winEvent = false;
        }
        this._mainView.resetGame();

        if (AppG.isWarning) {
            if (!this._warningOnScreen) {
                this._warningOnScreen = true;
                OMY.Omy.viewManager.addCloseWindow(AppConst.W_WARNING, this._onCloseWarning, this, true);
            }
            return;
        }

        if (AppG.gameHaveRespin) {
            if (AppG.isBeginRespin) {
                if (this._mainView.startRespinGame(true)) return;
            } else if (AppG.isRespin) {
                if (AppG.isEndRespin) {
                    if (this._mainView.finishRespinGame()) return;
                } else {
                    if (this._mainView.nextRespinGame()) return;
                }
            }
        }
        if (AppG.gameHaveFree && !AppG.isPLayReSpins) {
            if (AppG.beginFreeGame) {
                this._mainView.startFreeGame();
                return;
            } else if (AppG.isEndFree) {
                AppG.isFreeGame = false;
                this._mainView.finishFreeGame();
                return;
            } else if (AppG.isFreeGame) {
                AppG.emit.emit(AppConst.EMIT_NEXT_FREE);
            }
            if (AppG.isMoreFreeGame) {
                if (OMY.Omy.viewManager.isViewExist(AppConst.W_FREE_IN_FREE)) {
                    this._showFreeInFree();
                } else {
                    AppG.serverWork.updateTotalFreeGame();
                    this.startNewSession();
                }
                return;
            }
        }

        if (AppG.isRichSpinEnd
            && (AppG.serverWork.nextAct === AppConst.API_BET || AppG.serverWork.nextActionTake)
            && !AppG.isPLayFreeSpins) {
            AppG.isRichSpinEnd = false;
            AppG.isRichSpin = false;

            OMY.Omy.navigateBtn.blockingScreen();
            AppG.emit.emit(AppConst.APP_EMIT_RICH_END);
            return;
        }

        this.continueNewSession();
    }

    continueNewSession() {
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active || AppG.not_connection) {
            this._timerContinueNewSession = OMY.Omy.add.timer(0.1, this.continueNewSession, this);
            return;
        }
        OMY.Omy.info('continue start cycle');

        /*if(AntG.serverWork.isUserHasCash)
            AntG.navigateBtn.unBlockingScreen();
        else
            AntG.navigateBtn.blockingScreen();*/

        AppG.emit.emit(AppConst.APP_DEFAULT_STATE);

        if (AppG.isAutoGame || AppG.autoStart) {
            AppG.autoStart = false;
            this._sendAutoSpin();
            AppG.autoGameRules.setCanStartAutoGame(false);
        } else {
            this._state = SlotStateBase.STATE_BET;
            AppG.autoGameRules.setCanStartAutoGame(true);
            if (AppG.isFreeGame || AppG.isRespin) {
                OMY.Omy.navigateBtn.updateState(AppConst.C_FREE_GAME);
            } else {
                OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
            }
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    // region spin:
    //-------------------------------------------------------------------------
    _sendAutoSpin() {
        this._timerAutoSpin?.destroy();
        AppG.serverWork.sendSpin();
    }

    onSendSpin() {
        OMY.Omy.info('game round id:', AppG.gameRoundId);
        if (this._gameRoundId !== AppG.gameRoundId) this._gameRoundId = AppG.gameRoundId;
        AppG.autoGameRules.setCanStartAutoGame(false);
        this._mainView.onSendSpin();
    }

    spinGame() {
        this._state = SlotStateBase.STATE_SPIN;
        OMY.Omy.info('start reel move');
        this._inCycle = true;
        AppG.skippedWin = false;
        this._timerAutoSpin?.destroy();
        if (this._timerContinueNewSession) {
            OMY.Omy.remove.timer(this._timerContinueNewSession);
            this._timerContinueNewSession = null;
        }
        if (this._timerAutoSpin) this._timerAutoSpin = null;
        if (!AppG.isFreeGame) AppG.winCredit = 0;

        AppG.emit.emit(AppConst.APP_EMIT_SPIN_REEL);
        OMY.Omy.navigateBtn.updateState(AppConst.C_PLAY);
        this._mainView.sendSpin();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region end spin session:
    //-------------------------------------------------------------------------
    gameOver() {
        this._state = SlotStateBase.STATE_GAME_OVER;
        this._winEvent = AppG.isWin;
        OMY.Omy.info('end reel move. Have win:', this._winEvent);

        if (AppG.isHaveJackpot) {
            if (AppG.serverWork.winJackpot &&
                ((!AppG.isFreeGame && !AppG.beginFreeGame && !AppG.isRespin && !AppG.isBeginRespin) || AppG.isEndRespin)) {
                if (AppG.serverWork.jackpotsWinData) {
                    AppG.autoGameRules.updateRule6();
                    AppG.emit.once(AppConst.APP_EMIT_END_JACKPOT, this.gameOver, this);
                    AppG.emit.emit(AppConst.APP_EMIT_WIN_JACKPOT);
                    return;
                }
            }
        }
        if (AppG.tournament.isTournamentWinner) {
            AppG.tournament.showUserWin();
            AppG.emit.once(TStaticConst.E_END_WINNER, this.continueGameOver, this);
            return;
        }

        this.continueGameOver();
    }

    continueGameOver() {
        if (AppG.serverWork.nextActionTake || AppG.serverWork.nextActionSpin) {
            this._gameCycle++;
        }
        if (AppG.isWin) {
            (AppG.offWinEffect) ? this.showAllWinCombo() : this.win();
        } else {
            if (AppG.isFreeGame && !AppG.isTurbo) {
                OMY.Omy.add.timer(0.5, this.lose, this);
            } else {
                this.lose();
            }
        }
    }

    lose() {
        OMY.Omy.info('lose. end game cycle');
        this._inCycle = false;
        this.startNewSession();
    }

    win() {
        this._state = SlotStateBase.STATE_WIN;
        OMY.Omy.info('win. Prepare to show');
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        this._haveWin = true;
        this._mainView.showWinCombo();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region show win lines:
    //-------------------------------------------------------------------------
    showAllWinCombo() {
        OMY.Omy.info('show all game win. end game cycle');
        this._inCycle = false;
        if (this._lowVolumeOnWin && OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.5, 0.3, 1);
        if (this._haveLoopAnimation) {
            if (AppG.isEndRespin || (!AppG.isAutoGame && !AppG.isFreeGame && !AppG.autoStart && !AppG.beginFreeGame)) {
                this._mainView.startLoopAnimation();
            }
        } else {
            if (this._clearWinEffOnEnd) this._mainView.hideWin();
        }

        if (AppG.needCollect) {
            if (AppG.gameHaveGamble && !AppG.isAutoGame) {
                OMY.Omy.navigateBtn.updateState(AppConst.C_COLLECT);
                if (this._haveAutoCollect) {
                    this._timerCollect = OMY.Omy.add.timer(this._timeAutoCollect, this.collectWin, this);
                }
            } else {
                this.collectWin();
            }
        } else {
            OMY.Omy.add.timer((AppG.isAutoGame && !AppG.isGameDrop) ? 0.5 : 0, this.startNewSession, this);
        }
    }

    collectWin(fast = false) {
        OMY.Omy.info('take win');
        this._timerCollect?.destroy();
        this._timerCollect = null;
        this._inCycle = false;

        AppG.serverWork.sendCollect();
        this.startNewSession();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region Gamble:
    //-------------------------------------------------------------------------
    showGamble() {
        if (this._haveAutoCollect && this._timerCollect) {
            this._timerCollect.destroy();
            this._timerCollect = null;
        }
        if (!this._showWinOnGamble)
            this._mainView.hideWin();
        AppG.autoGameRules.stopAutoGame();

        OMY.Omy.navigateBtn.updateState(AppConst.C_PLAY_GAMBLE_WAIT);
        OMY.Omy.viewManager.showWindow(AppConst.W_GAMBLE, false,
            OMY.Omy.viewManager.gameUI.getWindowLayer("gambleLayer"));
    }

    //-------------------------------------------------------------------------
    //endregion

    // region AUTO:
    //-------------------------------------------------------------------------
    startAutoGame() {
        if (AppG.autoGameRules.isAutoGame)
            return;

        if (!AppG.autoGameRules.getCanStartAutoGame()) {
            AppG.autoGameRules.startAutoGame(AppG.autoGameRules.ruleCountPlay);
            return;
        }

        OMY.Omy.navigateBtn.updateState(AppConst.C_AUTO_GAME);
        AppG.autoGameRules.startAutoGame(AppG.autoGameRules.ruleCountPlay);
        AppG.serverWork.sendSpin();
    }

    stopAutoGame() {
        throw  new Error("not use this");
        /*AppG.isAutoGame = false;
        if (this._timerAutoSpin) {
            this._timerAutoSpin.destroy();
            this._timerAutoSpin = null;
            if (AppG.isFreeGame) {
                OMY.Omy.navigateBtn.updateState(AppConst.C_FREE_GAME);
            } else {
                OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
            }
        } else {
            OMY.Omy.navigateBtn.updateLastState();
        }
        AppG.emit.emit(AppConst.APP_EMIT_ON_AUTO_GAME, AppG.isAutoGame);*/
    }

    /**     * @public     */
    pauseAuto() {
        throw  new Error("not use this");
        /*if (AppG.isAutoGame) {
            this._saveAutoState = AppG.isAutoGame;
            AppG.isAutoGame = false;
        }*/
    }

    /**     * @public     */
    continueAuto() {
        throw  new Error("not use this");
        /*if (this._saveAutoState) {
            OMY.Omy.navigateBtn.updateState(AppConst.C_AUTO_GAME);
            AppG.isAutoGame = this._saveAutoState;
            this._saveAutoState = false;
        }*/

    }

    /**     * @private     */
    _onAutoStop() {
        if (AppG.serverWork.isWinSpin && this._haveLoopAnimation) {
            if (AppG.isEndRespin || (!AppG.isAutoGame && !AppG.isFreeGame && !AppG.autoStart && !AppG.beginFreeGame)) {
                if (this._state === SlotStateBase.STATE_SPIN) return;
                if (AppG.isMoveReels || this._mainView.playLoopAnimations || this._mainView.isShowingWinLines) return;
                if (this._mainView.playLoopAnimations || this._mainView.isShowingWinLines) return;
                this._mainView.startLoopAnimation();
            }
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    checkWinAnimations() {
        this._mainView.hideWin();
    }

    _showFreeInFree() {
        OMY.Omy.viewManager.showWindow(AppConst.W_FREE_IN_FREE, false, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    /**     * @private     */
    _onCloseWarning() {
        this._warningOnScreen = false;
        this.startNewSession();
    }

//---------------------------------------
// ACCESSOR
//---------------------------------------/**     * @private     */
    _registerConsoleMethods() {
        SlotStateBase.json_list = {
            W_GAMBLE: "GDGamble",
            W_BONUS: "GDBonus",
            W_FREE_GAME_BEGIN: "GDFreeGameBegin",
            W_FREE_GAME_END: "GDFreeGameEnd",
            W_FREE_IN_FREE: "GDFreeInFree",
            W_BUY_FREE: "GDFreeBuy",
            W_INTRO: "GDIntro"
        };
        window.debug_getWindowNames = () => {
            for (let /** @type {String} */appConstKey in AppConst) {
                if ((appConstKey[0] + appConstKey[1]) === "W_")
                    OMY.Omy.info('window name:', "\"" + appConstKey + "\"");
            }
        }
        window.debug_openWindow = (name, debug = false) => {
            if (AppConst.hasOwnProperty(name)) {
                if (debug && OMY.Omy.assets.getJSON(SlotStateBase.json_list[name])) {
                    let json = OMY.Omy.assets.getJSON(SlotStateBase.json_list[name]);
                    if (json.hasOwnProperty("show_debug")) json["show_debug"] = true;
                    else if (json.hasOwnProperty("edit")) json["edit"] = true;
                    else if (json.hasOwnProperty("visible")) json["visible"] = true;
                }
                OMY.Omy.viewManager.showWindow(name, true, OMY.Omy.viewManager.gameUI.getWindowLayer());
            }
        }
        window.debug_closeWindow = (name) => {
            if (AppConst.hasOwnProperty(name) && OMY.Omy.viewManager.getView(name).active) {
                OMY.Omy.viewManager.hideWindow(name);
            }
        }
    }

    /**
     * @returns {MainView|MainDropView}
     */
    get mainView() {
        return this._mainView;
    }
}

SlotStateBase.json_list = null;
SlotStateBase.STATE_BET = 0;
SlotStateBase.STATE_SPIN = 1;
SlotStateBase.STATE_WIN = 2;
SlotStateBase.STATE_GAME_OVER = 3;