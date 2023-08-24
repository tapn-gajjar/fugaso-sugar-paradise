import {GameConstStatic} from "../../GameConstStatic";
import {Background} from "../../display/Background";
import {MainViewBase} from "../../../casino/gui/pages/MainViewBase";
import {LineInGame} from "../../display/LineInGame";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {WinGroup} from "../../display/winGroup/WinGroup";
import {BuyFreeButton} from "../../display/buyFree/BuyFreeButton";

export class MainDropView extends MainViewBase {
    constructor() {
        super();
        /** @type {ReelDropBlock} */
        this._reelBlock = null;
        AppG.emit.on(AppConst.APP_HIDE_WIN_EFFECT, this._cleanWinEffect, this);

        this._timeCrashWinLine = AppG.gameConst.getData("timeCrashWinLine");
    }

    revive() {
        this._bgGraphic = this.getChildByName("c_game_bg");

        this._reelGraphic = this.getChildByName("reels").getChildByName("reel_canvas");
        if (this.getChildByName("reels").getChildByName("r_win_tint")) {
            /** @type {OMY.OGraphic} */
            this._reelWinTint = this.getChildByName("reels").getChildByName("r_win_tint");
            this._reelWinTint.alpha = 0;
        }

        super.revive();

        OMY.Omy.sound.play(GameConstStatic.S_bg_rs, true);
        if (AppG.gameConst.gameHaveIntroInformation) {
            AppG.emit.emit(GameConstStatic.HIDE_GUI);
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            /*if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.3, 0, 0.1);*/
            this._startIntroInfo();
        } else if (AppG.gameConst.gameHaveIntro) {
            AppG.emit.emit(GameConstStatic.HIDE_GUI);
            OMY.Omy.add.timer(AppG.gameConst.getData("game_const")["intro_delay_time"], this._startIntro, this);

            this._logo.startIntroAnim();
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            /*if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.3, 0, 0.1);*/
        } else {
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);

            OMY.Omy.sound.pauseAll();
            OMY.Omy.sound.resumeAll();
        }
    }

    /**     * @private     */
    _startIntro() {
        this._reelsCanvas.alpha = 1;
        if (this.getChildByName("c_jackpot"))
            this.getChildByName("c_jackpot").alpha = 0;
        OMY.Omy.viewManager.showWindow(AppConst.W_INTRO, true);

    }

    /**     * @private     */
    _startIntroInfo() {
        /*this._reelsCanvas.alpha = 1;
        if (this.getChildByName("c_jackpot"))
            this.getChildByName("c_jackpot").alpha = 1;*/
        OMY.Omy.viewManager.showWindow(AppConst.W_INTRO_INFO, true);

    }

    _createGraphic() {
        this.bg = new Background(this._bgGraphic);
        super._createGraphic();

        /** @type {LineInGameParticle} */
        this._lineInGame = new LineInGame(this.getChildByName("c_numbers"), this._reelBlock.activeList);
        this._lineInGame.linesGraphic = this.getChildByName("c_lines");
        // this._lineInGame.hide();

        /* /!** @type {OMY.OContainer} *!/
         this._freeInFreeMess = this.getChildByName("c_free_in_free").getChildByName("c_free_info");
         this._freeInFreeMess.visible = false;
         if (this._freeInFreeMess.json.test)
             OMY.Omy.add.timer(this._freeInFreeMess.json.test,
                 this.freeInFree, this);*/
        /** @type {OMY.OContainer} */
        this._reelsCanvas = this.getChildByName("reels");

        /** @type {WinGroup} */
        this._winBlock = new WinGroup(this.getChildByName("c_win_group"));
        /** @type {BuyFreeButton} */
        this._buyFreeButton = new BuyFreeButton(this.getChildByName("c_button_buy"));

        if (AppG.serverWork.recoverMode) {
            this._reelBlock.recover();
        }

        // AppG.emit.on(AppConst.APP_SHOW_BIG_WIN, this._onShowBigWin, this);

        OMY.Omy.navigateBtn.addUpdateState(this._onUpdateBtnState, this);

        // OMY.Omy.add.timer(2, this.startFreeGame, this);
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        super._updateGameSize(dx, dy, isScreenPortrait);
    }

    // region spin:
    //-------------------------------------------------------------------------
    sendSpin() {
        OMY.Omy.sound.play(GameConstStatic.S_reel_bg, true);
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_intro))
            OMY.Omy.sound.stop(GameConstStatic.S_intro);
        if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
            OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);

        if (!AppG.isRespin)
            this._winBlock.clear();
        this._respinBool = true;
        super.sendSpin();
    }

    onSendSpin() {
        super.onSendSpin();
    }

    skipSpin() {
        // this._clearWaitEffect();
        if (AppG.isMoveReels) {
            this._needOnWildWait = false;
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg)) {
                OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
            }
        }
        super.skipSpin();
    }

    _spinEnd() {
        super._spinEnd();
        this._clearWaitEffect();
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait))
            OMY.Omy.sound.stop(GameConstStatic.S_wild_wait);

        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg)) {
            OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
        }
    }

    _onReelStops(reelId) {
        super._onReelStops(reelId);
        /*if (AppG.isBeginRespin || AppG.isRespin) {
            /!*if (Boolean(AppG.serverWork.newHoldReel[reelId])) {
                for (let j = 0; j < this._activeList[reelId].length; j++) {
                    if (this._activeList[reelId][j].symbolName === "H") {
                        this._activeList[reelId][j].playWildWaitEffect();
                        break;
                    }
                }
            }*!/
            /!*if (this._needOnWildWait && this._reelBlock.getReel(reelId).effectIndex !== -1) {
                this._stopWaitSymbolReel(this._reelBlock.getReel(reelId).effectIndex);
            }*!/
        }*/
    }

    /**     * @private     */
    _onReelEaseStops(reelId) {
        super._onReelEaseStops(reelId);
    }

//-------------------------------------------------------------------------
    //endregion

    // region scatter wait:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _stopWaitSymbolReel(reelId, waitSymbol) {
        /*if (!this._isWaitEffect) {
            this._isWaitEffect = true;
            /!*for (let i = 0; i < reelId; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].holdSymbol();
                }
            }*!/
        } /!*else {
             for (let j = 0; j < this._reelBlock.activeList[reelId - 1].length; j++) {
                 this._reelBlock.activeList[reelId - 1][j].holdSymbol();
             }
         }*!/
        this._offWaitEffect();
        this._onWaitEffect(reelId);*/

    }

    /**     * @private     */
    _offWaitEffect() {
        /*if (this._activeWaitEffect) {
            OMY.Omy.remove.tween(this._activeWaitEffect);
            OMY.Omy.add.tween(this._activeWaitEffect, {alpha: 0, onCompleteParams: [this._activeWaitEffect]},
                this._reelWaitCanvas.json["alpha_time"], (spine) => {
                    spine.stop();
                    spine.visible = false;
                });
            this._activeWaitEffect = null;
        }*/
    }

    /**     * @private     */
    _onWaitEffect(reelId) {
        /*if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait))
            OMY.Omy.sound.play(GameConstStatic.S_wild_wait, true);
        this._activeWaitReelIndex = reelId;
        this._reelBlock._reelList[reelId].stopMoveSpeed();
        this._activeWaitEffect = this._reelWaitCanvas.getChildByName("reel_" + String(reelId));
        OMY.Omy.remove.tween(this._activeWaitEffect);
        this._activeWaitEffect.visible = true;
        this._activeWaitEffect.alpha = 0;
        this._activeWaitEffect.gotoAndPlay(0, true);
        OMY.Omy.add.tween(this._activeWaitEffect, {alpha: 1},
            this._reelWaitCanvas.json["alpha_time"]);*/
    }

    /**     * @private     */
    _clearWaitEffect() {
        /*if (this._isWaitEffect) {
            OMY.Omy.sound.stop(GameConstStatic.S_scatter_wait);
            for (let i = 0; i < this._reelBlock.activeList.length; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].unHoldSymbol();
                }
            }
            this._isWaitEffect = false;
            this._needOnWildWait = false;
            this._activeWaitReelIndex = -1;
            this._offWaitEffect();
        }*/
    }

    //-------------------------------------------------------------------------
    //endregion

    // region BONUS GAME: WHEEL
    //-------------------------------------------------------------------------

    /*_startBonusGame() {
        AppG.emit.once(AppConst.APP_BONUS_CLOSE, this._onEndBonusGame, this);

        super._startBonusGame();
        this._logo.startBonusGame();
        OMY.Omy.add.tween(this.getChildByName("reels"), {alpha: 0, delay: 1}, this._gdConf["time_hide_reel"], null);
    }

    _continueShowBonus() {
        OMY.Omy.viewManager.showWindow(AppConst.W_BONUS, true, OMY.Omy.viewManager.gameUI.getWindowLayer("c_wheel_layer"));
        // super._continueShowBonus();
    }

    /!**     * @private     *!/
    _onEndBonusGame() {
        this._logo.endBonusGame();
        OMY.Omy.add.tween(this.getChildByName("reels"), {alpha: 1}, this._gdConf["time_hide_reel"], null);
    }*/

//-------------------------------------------------------------------------
    //endregion

    // region FREE GAME
    //-------------------------------------------------------------------------

    startFreeGame() {
        super.startFreeGame();
        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        GameConstStatic.S_game_bg = GameConstStatic.S_bg_fg;
    }

    _continueStartFree() {
        if (AppG.serverWork.recoverMode || AppG.serverWork.haveFreeOnStart) {
            AppG.emit.once(GameConstStatic.E_CHANGE_BG, this._onChangeBg, this);
            OMY.Omy.viewManager.showWindow(AppConst.W_FREE_GAME_BEGIN,
                false, OMY.Omy.viewManager.gameUI.getWindowLayer("c_free_layer"));
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_scatter_active);
            this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
            this._activeList.map((a, index, array) => a.map((b, index, array) => b.scatterFree()));
            OMY.Omy.add.timer(AppG.gameConst.game_const["timer_start_free"], this._onLightScatter, this);
        }
    }

    /**     * @private     */
    _onLightScatter() {
        AppG.emit.once(GameConstStatic.E_CHANGE_BG, this._onChangeBg, this);
        AppG.emit.emit(GameConstStatic.E_STOP_SCATTER_EFFECT);
        OMY.Omy.viewManager.showWindow(AppConst.W_FREE_GAME_BEGIN,
            false, OMY.Omy.viewManager.gameUI.getWindowLayer("c_free_layer"));
    }

    /**     * @private     */
    _onChangeBg() {
        /** @type {OMY.OSprite} */
        let sprite;
        sprite = this.getChildByName("reels").getChildByName("s_reel_grid");
        sprite.texture = sprite.json["free"];

        /** @type {OMY.OSprite} */
        let sprite2 = this.getChildByName("c_game_bg").getChildByName("s_background");
        sprite = OMY.Omy.add.spriteJson(null, sprite2.json);
        sprite.texture = sprite.json["free"];
        this.getChildByName("c_game_bg").addChildAt(sprite, 1);
        AppG.updateGameSize(sprite);
        sprite.alpha = 0;
        OMY.Omy.add.tween(sprite, {alpha: 1}, 0.5,
            (oldBg, newBg) => {
                newBg.destroy();
                oldBg.texture = oldBg.json["free"];
            },
            {
                onCompleteParams: [sprite2, sprite]
            });
        sprite = this.getChildByName("c_logo");
        OMY.OMath.objectCopy(sprite.json, sprite.json["free_pos"]);
        AppG.updateGameSize(sprite);

        OMY.OMath.objectCopy(this._winBlock.graphic.json, this._winBlock.graphic.json["free_pos"]);
        this._winBlock.startFree();
        AppG.updateGameSize(this._winBlock.graphic);
        this._buyFreeButton.startFree();
    }

    finishFreeGame() {
        super.finishFreeGame();
    }

    _continueEndFree() {
        AppG.emit.once(GameConstStatic.E_CHANGE_BG, this._onChangeBgNormal, this);
        OMY.Omy.viewManager.showWindow(AppConst.W_FREE_GAME_END,
            false, OMY.Omy.viewManager.gameUI.getWindowLayer("c_free_layer"));
    }

    /**     * @private     */
    _onChangeBgNormal() {
        /** @type {OMY.OSprite} */
        let sprite;
        sprite = this.getChildByName("reels").getChildByName("s_reel_grid");
        sprite.texture = sprite.json["main"];

        /** @type {OMY.OSprite} */
        let sprite2 = this.getChildByName("c_game_bg").getChildByName("s_background");
        sprite = OMY.Omy.add.spriteJson(null, sprite2.json);
        this.getChildByName("c_game_bg").addChildAt(sprite, 1);
        AppG.updateGameSize(sprite);
        sprite.alpha = 0;
        OMY.Omy.add.tween(sprite, {alpha: 1}, 0.5,
            (oldBg, newBg) => {
                newBg.destroy();
                oldBg.texture = oldBg.json["texture"];
            },
            {
                onCompleteParams: [sprite2, sprite]
            });
        sprite = this.getChildByName("c_logo");
        OMY.OMath.objectCopy(sprite.json, sprite.json["normal_pos"]);
        AppG.updateGameSize(sprite);

        OMY.OMath.objectCopy(this._winBlock.graphic.json, this._winBlock.graphic.json["normal_pos"]);
        this._winBlock.endFree();
        AppG.updateGameSize(this._winBlock.graphic);
        this._buyFreeButton.endFree();
    }

    freeInFree() {
        this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        OMY.Omy.sound.play(GameConstStatic.S_scatter_active);
        this._activeList.map((a, index, array) => a.map((b, index, array) => b.scatterFree()));
        OMY.Omy.add.timer(AppG.gameConst.game_const["timer_start_free"], this._showFreeInFreeWindow, this);
    }

    /**     * @private     */
    _showFreeInFreeWindow() {
        AppG.emit.emit(GameConstStatic.E_STOP_SCATTER_EFFECT);
        OMY.Omy.viewManager.showWindow(AppConst.W_FREE_IN_FREE,
            false, OMY.Omy.viewManager.gameUI.getWindowLayer("c_free_layer"));
        OMY.Omy.sound.play(GameConstStatic.S_fg_in_free);
    }

//-------------------------------------------------------------------------
    //endregion

    // region Re-Spin:
    //-------------------------------------------------------------------------

    startRespinGame(onStart = false) {
        if (AppG.serverWork.recoverMode) {
            if (AppG.beginFreeGame) {
                this.startFreeGame();
                return true;
            }
            super.startRespinGame(onStart);
            AppG.emit.emit(GameConstStatic.E_RECOVER_RESPINE);
            return false;
        }
        if (AppG.serverWork.spinWithWild && this._respinBool) {
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
            this._respinBool = false;
            OMY.Omy.add.timer(AppG.gameConst.game_const["time_show_wild"],
                AppG.state.startNewSession, AppG.state);
            let countTop = 0;
            for (let i = 0; i < AppG.serverWork.winMulti.length; i++) {
                for (let j = 0; j < AppG.serverWork.winMulti[i].length; j++) {
                    if ((!Boolean(AppG.serverWork.positionsMulti.length) && Boolean(AppG.serverWork.winMulti[i][j]))
                        || (Boolean(AppG.serverWork.positionsMulti.length) && Boolean(AppG.serverWork.winMulti[i][j])
                            && AppG.serverWork.winMulti[i][j] !== AppG.serverWork.positionsMulti[i][j])) {
                        AppG.emit.emit(GameConstStatic.E_CATCH_WILD, i, j, AppG.serverWork.winMulti[i][j]);
                        if (AppG.serverWork.winMulti[i][j] > 1) countTop++;
                    }
                }
            }
            OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
            if (countTop > 2) OMY.Omy.sound.play(GameConstStatic.S_wild_big);
            return true;
        } else {
            super.startRespinGame(onStart);
            return false;
        }
    }

    nextRespinGame() {
        if (AppG.serverWork.spinWithWild && this._respinBool) {
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
            this._respinBool = false;
            OMY.Omy.add.timer(AppG.gameConst.game_const["time_show_wild"],
                AppG.state.startNewSession, AppG.state);
            let countTop = 0;
            for (let i = 0; i < AppG.serverWork.winMulti.length; i++) {
                for (let j = 0; j < AppG.serverWork.winMulti[i].length; j++) {
                    if ((!Boolean(AppG.serverWork.positionsMulti.length) && Boolean(AppG.serverWork.winMulti[i][j]))
                        || (Boolean(AppG.serverWork.positionsMulti.length) && Boolean(AppG.serverWork.winMulti[i][j])
                            && AppG.serverWork.winMulti[i][j] !== AppG.serverWork.positionsMulti[i][j])) {
                        AppG.emit.emit(GameConstStatic.E_CATCH_WILD, i, j, AppG.serverWork.winMulti[i][j]);
                        if (AppG.serverWork.winMulti[i][j] > 1) countTop++;
                    }
                }
            }
            OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
            if (countTop > 2) OMY.Omy.sound.play(GameConstStatic.S_wild_big);
            return true;
        } else {
            super.nextRespinGame();
            return false;
        }
    }

    finishRespinGame(onWin = false) {
        super.finishRespinGame();

        AppG.winCredit = AppG.serverWork.totalRespinWin;
        AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_inc_conf"), true);
        if (AppG.serverWork.isMaxWin)
            AppG.emit.emit(GameConstStatic.WIN_MAX_VALUE, AppG.winCredit);
        if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate")) {
            OMY.Omy.sound.play(GameConstStatic.S_start_big_win);
            this._showWinParticles();
            AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._continueEndRespin, this);
            OMY.Omy.info('view. win coef:', AppG.winCoef, "winCredit", AppG.winCredit);
            if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN, AppG.winCredit);
            }/* else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN, AppG.winCredit);
            } else {
                AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN, AppG.winCredit);
            }*/
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_WIN, (AppG.isRespin) ? AppG.totalWinInSpin : AppG.winCredit, true);
            OMY.Omy.add.timer(0.1, this._continueEndRespin, this);
        }
        /*this._showWinParticles();
        AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._continueEndRespin, this);
        OMY.Omy.info('view. win coef:', AppG.winCoef, "winCredit", AppG.winCredit);
        if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN, AppG.winCredit);
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN, AppG.winCredit);
        }*/
        return true;
    }

    /**     * @private     */
    _continueEndRespin() {
        if (AppG.needCollect) AppG.state.collectWin();
        else AppG.state.startNewSession();
    }

//-------------------------------------------------------------------------
    //endregion

    showWinCombo() {
        if (this._dataWin.hasScatterWin) {
            OMY.Omy.sound.play(GameConstStatic.S_win_scatter);
        } else if (AppG.isFreeGame) {
            OMY.Omy.sound.play(GameConstStatic.S_show_win_free);
            this._timerCrash = OMY.Omy.add.timer(this._timeCrashWinLine, this._crashSymbols, this);
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_show_win());
            this._timerCrash = OMY.Omy.add.timer(this._timeCrashWinLine, this._crashSymbols, this);
        }
        super.showWinCombo();
        // if (AppG.winCoef > 100) OMY.Omy.sound.play(GameConstStatic.S_show_win_5);
        // else if (AppG.winCoef > 30) OMY.Omy.sound.play(GameConstStatic.S_show_win_4);
        // else if (AppG.winCoef > 10) OMY.Omy.sound.play(GameConstStatic.S_show_win_3);
        if (this._reelWinTint && !AppG.serverWork.isMaxWin) {
            OMY.Omy.remove.tween(this._reelWinTint);
            OMY.Omy.add.tween(this._reelWinTint, {alpha: 1}, 0.2);
        }
        if (AppG.serverWork.isMaxWin) {
            this._showingWinTimer?.destroy();
            AppG.skippedWin = true;
            AppG.emit.emit(AppConst.APP_EMIT_SKIP_WIN);
        }
    }

    _showAllWinLines() {
        if (AppG.serverWork.isMaxWin) return;
        super._showAllWinLines();
    }

    /**     * @private     */
    _crashSymbols() {
        OMY.Omy.sound.play(GameConstStatic.S_crash_symb);
    }

    _checkWinMessageEffect() {
        AppG.emit.emit(AppConst.APP_START_INC_WIN, AppG.winCredit, AppG.showWinTime);
    }

    _calcWinTime() {
        /*let allLinesTime = 0;
        this._dataWin.repeatWins();
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();
            allLinesTime += this._settingNextLineTime();
        }

        this._dataWin.repeatWins();*/
        AppG.showWinTime = this._timeForLineValue;
        OMY.Omy.info('view. calc win time', AppG.showWinTime);
    }

    _configShowLine() {
        super._configShowLine();
    }

    _animateWinLine() {
        super._animateWinLine();

        /*if (!this._isAnimationsSkiped || this._dataWin.isBonusWin || this._dataWin.isScatter) {
            if (this._winSymbolSound)
                OMY.Omy.sound.stop(this._winSymbolSound);
            this._winSymbolSound = null;
            switch (this._dataWin.winSymbol) {
                default: {
                    this._winSymbolSound = GameConstStatic["S_symbol_" + String(this._dataWin.winSymbol)];
                    break;
                }
            }
            OMY.Omy.sound.play(this._winSymbolSound);
        }*/
    }

    _skipWinAnimations() {
        if (!this._isShowingWinLines) return;
        if (this._isAnimationsSkiped) return;
        super._skipWinAnimations();
        this._timerCrash?.destroy();
        this._timerCrash = null;
        if (this._reelWinTint) {
            OMY.Omy.remove.tween(this._reelWinTint);
            OMY.Omy.add.tween(this._reelWinTint, {alpha: 0}, 0.1);
        }
    }

    _calcAllSpinWin(winValue) {
        OMY.Omy.info('view. calc win value', winValue);
        //почати нараховувати виграш весь зразу
        AppG.winCredit = winValue;
        AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        // AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_inc_conf"), true);
        // this._showWinParticles();

        /*if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate")) {
            AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_big_win_inc_conf"), true);
        }*/
    }

    _showWinParticles() {
        OMY.Omy.info('view. show win particles');
        AppG.emit.emit(AppConst.APP_WIN_PARTICLES, AppG.winCredit);
    }

    _endShowWinLines() {
        /*AppG.emit.emit(AppConst.APP_WIN_PARTICLES, AppG.winCredit);

        this._checkEndShowLines();
        AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._onHideWinMessage, this);
        this._showingWinTimer?.destroy();
        if (this._lineTimer) {
            this._lineTimer.destroy();
            this._lineTimer = null;
        }
        this._isShowingWinLines = false;*/
        super._endShowWinLines();
    }

    _settingNextLineTime() {
        // if (AppG.isAutoGame) {
        //     return AppG.incTimeTake / this._dataWin.countLinesWin;
        // } else {
        return super._settingNextLineTime();
        // }
    }

    _showWinLine() {
        if (this._dataWin.endLines) {
            // this._checkEndShowLines();
            return;
        }
        return super._showWinLine();
    }

    /**     * @private     */
    _checkEndShowLines() {
        /*if (WinMessage.incAnim) {
            return;
        }*/
        this._dataWin.repeatWins();
        this._lineInGame.hideWinEffect();
        this._winEffect.hide();
        this._winEffect.show();

        if (this._clearReelsOnWin) {
            // this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
            this._resetArrayWinData();
        } else {
            this._resetArrayWinData(AppConst.SLOT_SYMBOL_NONE);
        }
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();

            let allowArray = this.findWinSymbols(this._dataWin, false, false, this._showOnWinNoWinSymbols);
            this._winEffect.showWinSymbol(allowArray,
                this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter,
                false);
            for (let i = 0; i < allowArray.length; i++) {
                let index = AppG.convertID(allowArray[i].reelId, allowArray[i].symbolId);
                if (this._arrayWinData[index].type !== AppConst.SLOT_SYMBOL_WIN && allowArray[i].type === AppConst.SLOT_SYMBOL_WIN) {
                    AppG.setWinSymbolD(this._arrayWinData[index]);
                    this._arrayWinData[index] = allowArray[i];
                }
            }
            /*if (this._dataWin.isScatter)
                this._lineInGame.showWinLineScatter();
            else
                this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWin, !this._dataWin.isScatter);

            this._animateWinLine();*/
        }
        this._reelBlock.updateWinState(this._arrayWinData);
    }

    findWinSymbols(dataWin, playSound = true, dispatch = true, noWin = false) {
        dispatch = true;
        return super.findWinDrop(dataWin, playSound, dispatch, noWin);
    }

    hideWin() {
        this._delayLoopTimer?.destroy();
        if (this._reelWinTint) {
            OMY.Omy.remove.tween(this._reelWinTint);
            OMY.Omy.add.tween(this._reelWinTint, {alpha: 0}, 0.1);
        }
        AppG.emit.emit(GameConstStatic.E_HIDE_WIN_EFFECT);
        return super.hideWin();
    }

    /**     * @private     */
    _onWaitDelayLoop() {
        this._delayLoopTimer = null;
        super.startLoopAnimation();
    }

    /**     * @private     */
    _cleanWinEffect() {

    }

    _onIntroWindowClose() {
        if (!AppG.beginFreeGame && !AppG.isFreeGame) {
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            // if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
            //     OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        }

        OMY.Omy.sound.pauseAll();
        OMY.Omy.sound.resumeAll();
        this._logo.continueIntroAnim();
        super._onIntroWindowClose();
    }

    _onIntroInfoClose() {
        super._onIntroInfoClose();
        if (AppG.gameConst.gameHaveIntro) {
            this._logo.startIntroAnim();
            OMY.Omy.viewManager.showWindow(AppConst.W_INTRO, true);
        } else {
            if (!AppG.beginFreeGame && !AppG.isFreeGame) {
                GameConstStatic.S_game_bg = GameConstStatic.S_bg;
                // if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                //     OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            }

            OMY.Omy.sound.pauseAll();
            OMY.Omy.sound.resumeAll();
        }
    }

    /**     * @private     */
    _onShowBigWin() {
    }

    /**     * @private     */
    _onUpdateBtnState(btnState) {
        /*switch (btnState) {
            case AppConst.C_COLLECT: {
                if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_gamble_wait))
                    OMY.Omy.sound.play(GameConstStatic.S_gamble_wait, true);
                break;
            }
        }*/
    }
}
