import {AppG} from "../AppG";
import {AppConst} from "../AppConst";
import {GameConstStatic} from "../../app/GameConstStatic";

export class SlotStateBase {
    constructor() {
        /*@type {MainView} */
        this._mainView = null;
        this._holdSession = true;
        this._winEvent = false;
        this._clearWinEffOnEnd = AppG.gameConst.getData("clearWinEffOnEnd");
        this._noJPChecking = false;
        this._gameCycle = 0;
        this._gameRoundId = AppG.gameRoundId;

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
    }

    get mainView() {
        return this._mainView;
    }

    // region start spin session:

    showGame() {
        OMY.Omy.viewManager.showView(AppConst.P_VIEW_MAIN);

        this._gameRoundId = AppG.gameRoundId;
        this.startNewSession();
    }

    //-------------------------------------------------------------------------
    startNewSession() {
        OMY.Omy.warn("===========game cycle:" + String(this._gameCycle) + " ===========");

        AppG.emit.emit(AppConst.APP_EMIT_ON_CREDIT);

        AppG.autoGameRules.updateRule4();
        AppG.autoGameRules.updateRule5();

        this._mainView.resetGame();

        this._timerRepeatWaring?.destroy();
        if (AppG.isWarning) {
            this._timerRepeatWaring = OMY.Omy.add.timer(.1, this.startNewSession, this);
            return;
        }
        if (this._timerRepeatWaring) this._timerRepeatWaring = null;

        this.continueNewSession();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region spin:

    continueNewSession() {
        OMY.Omy.info('continue start cycle');
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active || AppG.not_connection) {
            this._timerContinueNewSession = OMY.Omy.add.timer(0.1, this.continueNewSession, this);
            return;
        }
        if (this._timerRepeatWaring) {
            this._timerRepeatWaring.destroy();
            this._timerRepeatWaring = null;
        }

        AppG.emit.emit(AppConst.APP_DEFAULT_STATE);

        if (AppG.isAutoGame || AppG.autoStart) {
            AppG.autoStart = false;
            this._timerAutoSpin = OMY.Omy.add.timer(AppG.gameConst.getData("delay_auto_start"),
                this._sendAutoSpin, this);
            AppG.autoGameRules.setCanStartAutoGame(false);
        } else {
            AppG.autoGameRules.setCanStartAutoGame(true);
            if (AppG.isFreeGame || AppG.isRespin) {
                OMY.Omy.navigateBtn.updateState(AppConst.C_FREE_GAME);
            } else {
                OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
            }
        }
    }

    //-------------------------------------------------------------------------
    _sendAutoSpin() {
        this._timerAutoSpin?.destroy();
        AppG.serverWork.sendSpin();
    }

    onSendSpin() {
        OMY.Omy.info('game round id:', AppG.gameRoundId);
        if (this._gameRoundId !== AppG.gameRoundId) {
            this._gameRoundId = AppG.gameRoundId;
            this._gameCycle++;
        }
        AppG.autoGameRules.setCanStartAutoGame(false);
        this._mainView.onSendSpin();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region end spin session:

    spinGame() {
        OMY.Omy.info('start reel move');
        AppG.skippedWin = false;
        this._timerAutoSpin?.destroy();
        if (this._timerContinueNewSession) {
            OMY.Omy.remove.timer(this._timerContinueNewSession);
            this._timerContinueNewSession = null;
        }
        if (this._timerRepeatWaring) {
            this._timerRepeatWaring.destroy();
            this._timerRepeatWaring = null;
        }
        if (this._timerAutoSpin) this._timerAutoSpin = null;
        if (!AppG.isFreeGame) AppG.winCredit = 0;

        AppG.emit.emit(AppConst.APP_EMIT_SPIN_REEL);
        OMY.Omy.navigateBtn.updateState(AppConst.C_PLAY);
        this._mainView.sendSpin();
    }

    //-------------------------------------------------------------------------
    gameOver() {
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

        this.continueGameOver();
    }

    continueGameOver() {
        if (AppG.isWin) {
            this.win();
        } else {
            if (AppG.isFreeGame) {
                OMY.Omy.add.timer(0.5, this.lose, this);
            } else {
                this.lose();
            }
        }
    }

    lose() {
        OMY.Omy.info('lose. end game cycle');
        this.startNewSession();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region show win lines:

    win() {
        OMY.Omy.info('win. Prepare to show');
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        this._haveWin = true;
        this._mainView.showWinCombo();
    }

    showAllWinCombo() {
        OMY.Omy.info('show all game win. end game cycle');
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
            OMY.Omy.add.timer((AppG.isAutoGame) ? 0.5 : 0, this.startNewSession, this);
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    collectWin(fast = false) {
        OMY.Omy.info('take win');
        this._timerCollect?.destroy();
        this._timerCollect = null;

        AppG.serverWork.sendCollect();
        OMY.Omy.add.timer((AppG.isAutoGame) ? 0.5 : 0, this.startNewSession, this);
    }

    // region AUTO:
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

    //-------------------------------------------------------------------------
    //endregion

}
