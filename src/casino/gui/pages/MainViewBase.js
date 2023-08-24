import {PageBase} from "../PageBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {ReelBlock} from "../../../app/display/ReelBlock";
import {WinEffect} from "../../../app/display/effects/WinEffect";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {LogoGame} from "../../../app/display/LogoGame";
import {FreeCounter} from "../../../app/display/FreeCounter";
import {HintArea} from "../../display/hint/HintArea";
import {JackpotsPanel} from "../../display/jackpot/JackpotsPanel";
import {ReelDropBlock} from "../../../app/display/dropType/ReelDropBlock";
import {TStaticConst} from "../../tournament/TStaticConst";

export class MainViewBase extends PageBase {
    constructor() {
        super();
        this._wName = AppConst.P_VIEW_MAIN;
        this._nameGD = "GDMain";

        this._playWinAnimation = false;

        /** @type {WildSystem} */
        this._wildSystem = AppG.wildSystem;

        this._totalReel = AppG.totalReel;
        this._rowTotal = AppG.gameConst.getData("countSlot");
        /** @type {GameWinData} */
        this._dataWin = AppG.dataWins;
        this._totalCountLines = AppG.serverWork.maxLines;

        this._timeForLineValue = AppG.gameConst.getData("timeShowWinLine");
        this._timeForSkipLineValue = AppG.gameConst.getData("timeShowSkipLine");
        this._timeShowBonus = AppG.gameConst.getData("timeShowBonus");
        this._timeShowScatters = AppG.gameConst.getData("timeShowScatters");
        this._timeShowLoopLine = AppG.gameConst.getData("timeShowLoopLine");
        this._oneLineWin = AppG.gameConst.oneLineWin;
        this._clearReelsOnWin = AppG.gameConst.getData("clearReelsOnWin");
        this._clearLinesOnWin = AppG.gameConst.getData("clearLinesOnWin");
        this._clearLinesOnWinLoop = AppG.gameConst.clearLinesOnWinLoop;
        this._incWinByLine = AppG.gameConst.getData("incWinByLine");
        this._startLoopAfterLines = AppG.gameConst.getData("startLoopAfterLines");
        this._timeMessageOnScreen = AppG.gameConst.getData("timeMessageOnScreen");
        this._showLoopNoWinSymbols = AppG.gameConst.showLoopNoWinSymbols;
        this._showOnWinNoWinSymbols = AppG.gameConst.showOnWinNoWinSymbols;
        this._lowVolumeOnWin = AppG.gameConst.lowVolumeOnWin;
        this._winAllScattersOnReels = AppG.gameConst.winAllScattersOnReels;

        this._winSoundMax = 0;
        this._playWinAnimation = false;
        this._isShowingWinLines = false;
        this._isAnimationsSkiped = false;
        this._playLoopAnimations = false;

        /** @type {ReelBlock|ReelDropBlock} */
        this._reelBlock = null;
        this._winEffect = null;
        this._lineInGame = null;
        this._arrayWinData = [];
        this._activeList = null;

        OMY.Omy.viewManager.addCreateWindow(this._onCreateWindow, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onRemoveWindow, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.hideWin, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_COINS, this.hideWin, this);

        AppG.emit.on(AppConst.APP_EMIT_SKIP_WIN, this._skipWinAnimations, this);

        this.json = this._gdConf = OMY.Omy.assets.getJSON(this._nameGD);
        if (this._gdConf["entities"]) {
            for (let i = 0; i < this._gdConf["entities"].length; i++) {
                let conf = this._gdConf["entities"][i];
                if (!AppG.isHaveJackpot && conf.hasOwnProperty("jpContent")
                    && conf["jpContent"] === true) conf["active"] = false;
            }
        }
        OMY.Omy.add.createEntities(this, this._gdConf);

        this.bg = this._bgGraphic = this.getChildByName("c_game_bg");
        this._reelGraphic = this.getChildByName("reels");
    }

    revive() {
        super.revive();

        this._createGraphic();

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

    _createGraphic() {
        let container = this._reelGraphic;
        switch (AppG.gameType) {
            case AppConst.T_GAME_DROP: {
                this._reelBlock = new ReelDropBlock();
                break;
            }

            default: {
                this._reelBlock = new ReelBlock();
                break;
            }
        }
        AppG.activeSymbolList = this._activeList = this._reelBlock.activeList;
        this._reelBlock.interactChild = false;
        container.addChild(this._reelBlock);
        this._createArrayWinData();
        AppG.emit.on(AppConst.APP_REELBLOCK_END, this._spinEnd, this);

        this._reelBlock.mask = OMY.Omy.add.maskRectJson(container, this._gdConf["reelMask"]);
        AppG.emit.on(AppConst.APP_EMIT_STOP_REEL, this._onReelStops, this);
        AppG.emit.on(AppConst.APP_EMIT_STOP_EASE_REEL, this._onReelEaseStops, this);

        if (this.getChildByName("reels").getChildByName("a_wait_server")) {
            /** @type {OMY.OActorSpine} */
            this._aWaitSpin = this.getChildByName("reels").getChildByName("a_wait_server");
            this._aWaitSpin.visible = false;
            this._timeWaitSpinRequest = AppG.gameConst.timeWaitSpinRequest;
        }

        this._winEffect = new WinEffect(this._reelBlock.activeList);
        this.getChildByName("c_win_effect").addChild(this._winEffect);
        this._winEffect.interactChild = false;

        if (this.getChildByName("c_logo")) {
            this._logo = new LogoGame(this.getChildByName("c_logo"));
        }

        if (this.getChildByName("c_free_counts")) {
            this._freeCounter = new FreeCounter(this.getChildByName("c_free_counts"));
        }

        this._gameHaveBigMess = AppG.gameConst.getData("gameHaveBigMess");

        if (this.getChildByName("c_jackpot")) {
            if (AppG.isHaveJackpot) {
                new JackpotsPanel(this.getChildByName("c_jackpot"));
            } else {
                this.getChildByName("c_jackpot").destroy();
            }
        }

        if (this.getChildByName("c_hint_area"))
            this._hintArea = new HintArea(this.getChildByName("c_hint_area"), this._reelBlock.activeList);
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        AppG.updateGameSize(this);
        if (this.bg?._updateGameSize)
            this.bg._updateGameSize(dx, dy, isScreenPortrait);
        this._winEffect.updateGameSize();
        if (this.getChildByName("c_logo"))
            AppG.updateGameSize(this.getChildByName("c_logo"));

        this._hintArea && this._hintArea.updateGameSize();
    }

    /**     * @public     */
    resetGame() {
        if (!AppG.isPLayFreeSpins && !AppG.isPLayReSpins)
            AppG.tournament.emit(TStaticConst.E_SHOW_START_WINDOW);
    }

    // region spin:
    //-------------------------------------------------------------------------
    sendSpin() {
        AppG.isMoveReels = true;
        this._lineInGame.hide();
        this.hideWin();
        this._timerWaitRequest?.destroy();
        this._timerWaitRequest = OMY.Omy.add.timer(this._timeWaitSpinRequest,
            this._onWaitSpinEffect, this);
        this._reelBlock.start();
    }

    onSendSpin() {
        //get spin from server
        this._offWaitSpinEffect();
        this._reelBlock.canStop();
    }

    _onReelStops(slotId) {

    }

    _onReelEaseStops(reelId) {

    }

    _spinEnd() {
        AppG.isMoveReels = false;
    }

    skipSpin() {
        if (AppG.isMoveReels) {
            this._reelBlock.skipSpin();
            AppG.isMoveReels = false;
            AppG.emit.emit(AppConst.APP_EMIT_SKIP_SPIN);
        }
    }

    /**     * @private     */
    _onWaitSpinEffect() {
        this._timerWaitRequest = null;
        if (this._aWaitSpin) {
            this._aWaitSpin.visible = true;
            this._aWaitSpin.play(true);
        }
    }

    /**     * @private     */
    _offWaitSpinEffect() {
        this._timerWaitRequest?.destroy();
        this._timerWaitRequest = null;
        if (this._aWaitSpin) {
            this._aWaitSpin.visible = false;
            this._aWaitSpin.stop();
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    // region BONUS GAME:
    //-------------------------------------------------------------------------

    _startBonusGame() {
        OMY.Omy.info('view. start bonus game');
        this._timerStartBonusGame && this._timerStartBonusGame.destroy();
        this._timerStartBonusGame = null;

        this.hideWin();

        OMY.Omy.navigateBtn.updateState(AppConst.C_START_BONUS_GAME);
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);

        AppG.skippedWin = false;
        AppG.beginBonusGame = false;
        AppG.isBonusGame = true;

        this._continueShowBonus();
    }

    _continueShowBonus() {
        OMY.Omy.viewManager.showWindow(AppConst.W_BONUS, true, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    //-------------------------------------------------------------------------
    //endregion

    // region FREE GAME
    //-------------------------------------------------------------------------

    startFreeGame() {
        OMY.Omy.info('view. start free game');
        AppG.autoGameRules.bonusGameOn();
        if (!AppG.serverWork.haveFreeOnStart) {
            AppG.autoGameRules.updateRule2();
            /*if (this._autospinBlock && this._autospinBlock.isShowing)
                this.closeAutoplayBlock();*/
        }

        this._timerStartFreeGame && this._timerStartFreeGame.destroy();
        this._timerStartFreeGame = null;

        AppG.beginFreeGame = false;
        AppG.isFreeGame = true;

        OMY.Omy.navigateBtn.updateState(AppConst.C_START_FREE_GAME);
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        this.hideWin();

        this._continueStartFree();
    }

    _continueStartFree() {
        OMY.Omy.viewManager.showWindow(AppConst.W_FREE_GAME_BEGIN, false, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    finishFreeGame() {
        OMY.Omy.info('view. finish free game');
        AppG.autoGameRules.bonusGameOff();
        if (AppG.autoGameRules.isAutoPause) {
            AppG.autoGameRules.continueAutoGame();
        }
        AppG.autoStart = false;
        AppG.isFreeGame = false;
        OMY.Omy.navigateBtn.updateState(AppConst.C_END_FREE_GAME);
        this.hideWin();
        this._continueEndFree();
    }

    _continueEndFree() {
        OMY.Omy.viewManager.showWindow(AppConst.W_FREE_GAME_END, false, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    //-------------------------------------------------------------------------
    //endregion

    // region RE-SPIN:
    //-------------------------------------------------------------------------
    startRespinGame(onStart = false) {
        OMY.Omy.info('view. start respin');
        AppG.isBeginRespin = false;
        AppG.isRespin = true;
        if (AppG.autoStart) {
            AppG.autoStart = false;
        }

        AppG.autoGameRules.bonusGameOn();
        AppG.emit.emit(AppConst.EMIT_RE_SPIN_BEGIN);
        OMY.Omy.navigateBtn.updateState(AppConst.C_START_FREE_GAME);
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        return false;
    }

    finishRespinGame() {
        OMY.Omy.info('view. end respin');
        AppG.isRespin = false;
        AppG.isEndRespin = false;

        AppG.emit.emit(AppConst.EMIT_RE_SPIN_END);
        if (!AppG.isFreeGame)
            AppG.autoGameRules.bonusGameOff();
        if (AppG.autoGameRules.isAutoPause) {
            AppG.autoGameRules.continueAutoGame();
        }
        AppG.autoStart = false;
        return false;
    }

    nextRespinGame() {
        OMY.Omy.info('view. new respin cycle');
        return false;
    }

    //-------------------------------------------------------------------------
    //endregion

    // region Win logic:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _createArrayWinData() {
        /**
         * @type {WinSymbolD}
         */
        let winSymbolData = null;
        for (let i = 0; i < this._totalReel; i++) {
            for (let j = 0; j < this._rowTotal; j++) {
                let reelId = i;
                let symbolId = j;
                let index = AppG.convertID(reelId, symbolId);

                winSymbolData = AppG.getWinSymbolD();
                winSymbolData.reelId = reelId;
                winSymbolData.symbolId = symbolId;

                this._arrayWinData[index] = winSymbolData;
            }
        }
    }

    _resetArrayWinData(state = AppConst.SLOT_SYMBOL_NO_WIN) {
        for (let i = 0; i < this._arrayWinData.length; i++) {
            if (this._arrayWinData[i]) {
                this._arrayWinData[i].clear();
                this._arrayWinData[i].type = state;
            }
        }
    }

    showWinCombo() {
        OMY.Omy.info('view. show win combo');
        AppG.emit.emit(AppConst.EMIT_WIN);
        OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
        this._playWinAnimation = true;
        this._isShowingWinLines = true;
        this._isAnimationsSkiped = false;
        this._playLoopAnimations = false;
        this._configShowLine();

        if (!this._incWinByLine) {
            this._calcAutoRulesWin(AppG.serverWork.spinWin);
            this._calcAllSpinWin(AppG.serverWork.spinWin);
        }
        this._calcWinTime();
        if (!this._incWinByLine) {
            if (this._gameHaveBigMess) {
                this._checkWinMessageEffect();
            } else {
                AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit);
            }
        }

        if (this._oneLineWin) {
            this._showOneLineWinAnimations();
        } else {
            this._showAllWinLines();
        }
        this._showingWinTimer = OMY.Omy.add.timer(AppG.showWinTime, this._endShowWinLines, this);
    }

    _calcWinTime() {
        let allLinesTime = 0;
        this._dataWin.repeatWins();
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();
            allLinesTime += this._settingNextLineTime();
        }

        this._dataWin.repeatWins();
        AppG.showWinTime = Math.max(allLinesTime, AppG.incTimeTake + this._timeMessageOnScreen);
        OMY.Omy.info('view. calc win time', AppG.showWinTime);
    }

    _configShowLine() {
        OMY.Omy.info('view. prepare config win line');
        this._winEffect.show();
        this._lineInGame.showWinAnimation();
        this._lineInGame._clearLines();
        if (this._lowVolumeOnWin && OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg)) {
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.3, 1, 0.3);
        }
        this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        this._timeForLineValue = AppG.gameConst.getData("timeShowWinLine");
    }

    _calcAutoRulesWin(winValue) {
        AppG.autoGameRules.updateRule1();
        AppG.autoGameRules.updateRule3(winValue / AppG.creditType);
        AppG.autoGameRules.updateWins(winValue / AppG.creditType);
    }

    _calcAllSpinWin(winValue) {
        OMY.Omy.info('view. calc win value', winValue);
        //почати нараховувати виграш весь зразу
        AppG.winCredit = winValue;
        AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_inc_conf"), true);
        this._showWinParticles();
    }

    _showWinParticles() {
        OMY.Omy.info('view. show win particles');
        AppG.emit.emit(AppConst.APP_WIN_PARTICLES, AppG.winCredit);
    }

    _checkWinMessageEffect() {
        OMY.Omy.info('view. win coef:', AppG.winCoef);
        if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN, AppG.winCredit);
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN, AppG.winCredit);
        }
        // const sec = AppG.gameConst.getData("win_message_sec") + AppG.gameConst.getData("before_lines_sec");
        // this._lineTimer = OMY.Omy.add.timer(sec, this._endShowWinLines, this);
    }

    _checkWinMessageTurbo() {
        OMY.Omy.info('view. win coef in turbo:', AppG.winCoef);
        if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate")) {
            AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN_TURBO, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate")) {
            AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN_TURBO, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate")) {
            AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN_TURBO, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate")) {
            AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN_TURBO, AppG.winCredit);
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, AppG.winCredit);
        }
    }

    _animateWinLine() {

    }

    _endShowWinLines() {
        OMY.Omy.info('view. end show win line');
        if (this._winSymbolSound)
            OMY.Omy.sound.stop(this._winSymbolSound);
        this._winSymbolSound = null;
        this._showingWinTimer?.destroy();
        if (this._lineTimer) {
            this._lineTimer.destroy();
            this._lineTimer = null;
        }
        this._isShowingWinLines = false;
        AppG.state.showAllWinCombo();
    }

    /** @public */
    _skipWinAnimations() {
        if (!this._isShowingWinLines) return;
        if (this._isAnimationsSkiped) return;
        OMY.Omy.info('view. skip win');
        this._isAnimationsSkiped = true;
        this._lineTimer?.destroy();
        this._showingWinTimer?.destroy();
        if (/*this._oneLineWin*/false) {
            this._timeForLineValue = this._timeForSkipLineValue;
            this._showWinLine();
        } else {
            AppG.winCredit = AppG.serverWork.spinWin;
            AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit, true);
            AppG.emit.emit(AppConst.APP_WIN_PARTICLES, AppG.winCredit, true);
            this._endShowWinLines();
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    // region win on lines turbo:
    //-------------------------------------------------------------------------
    _showWinTurbo() {
        OMY.Omy.info('view. show win combo this turbo');
        AppG.emit.emit(AppConst.EMIT_WIN);
        OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
        this._playWinAnimation = true;
        this._isShowingWinLines = true;
        this._isAnimationsSkiped = false;
        this._playLoopAnimations = false;
        this._configShowLine();
        this._calcAutoRulesWin(AppG.serverWork.spinWin);
        this._calcAllSpinWin(AppG.serverWork.spinWin);
        AppG.showWinTime = AppG.incTimeTake;
        this._checkWinMessageTurbo();
        this._showAllWinLinesTurbo();
        AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._endShowWinLines, this);
    }

    //-------------------------------------------------------------------------
    //endregion

    // region show win by one line:
    //-------------------------------------------------------------------------
    _showOneLineWinAnimations() {
        OMY.Omy.info('view. show line by one');
        this._showWinLine();
    }

    _showWinLine() {
        OMY.Omy.info('view. show line. end show:', this._dataWin.endLines);
        if (this._dataWin.endLines) {
            if (AppG.beginBonusGame) {
                this._startBonusGame();
            } else if (this._startLoopAfterLines) {
                this.startLoopAnimation();
            }
            return;
        }

        if (this._clearReelsOnWin) this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
        this._winEffect.clearEffect();
        this._dataWin.nextLine();

        let allowArray = this.findWinSymbols(this._dataWin, false, true, this._showOnWinNoWinSymbols);
        this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter);
        this._reelBlock.updateWinState(allowArray);
        if (this._dataWin.isScatter)
            this._lineInGame.showWinLineScatter();
        else
            this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWin, !this._dataWin.isScatter);
        if (this._incWinByLine) AppG.winCredit += this._dataWin.credit;

        this._animateWinLine();

        if (this._incWinByLine) AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit);
        this._lineTimer?.destroy();
        this._lineTimer = OMY.Omy.add.timer(this._settingNextLineTime(), this._showWinLine, this);
    }

    _settingNextLineTime() {
        let lineTime = 0;
        if (this._dataWin.isBonusWin)
            lineTime = this._timeShowBonus;
        else if (this._dataWin.isScatter)
            lineTime = this._timeShowScatters;
        else
            lineTime = this._timeForLineValue;
        return lineTime;
    }

    //-------------------------------------------------------------------------
    //endregion

    // region show win in one moment:
    //-------------------------------------------------------------------------
    _showAllWinLines() {
        OMY.Omy.info('view. start show all win line in one');
        this._dataWin.repeatWins();

        if (this._clearReelsOnWin) {
            // this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
            this._resetArrayWinData();
        } else {
            this._resetArrayWinData(AppConst.SLOT_SYMBOL_NONE);
        }
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();

            let allowArray = this.findWinSymbols(this._dataWin, false, false, this._showOnWinNoWinSymbols);
            this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter);
            for (let i = 0; i < allowArray.length; i++) {
                let index = AppG.convertID(allowArray[i].reelId, allowArray[i].symbolId);
                if (this._arrayWinData[index].type !== AppConst.SLOT_SYMBOL_WIN && allowArray[i].type === AppConst.SLOT_SYMBOL_WIN) {
                    AppG.setWinSymbolD(this._arrayWinData[index]);
                    this._arrayWinData[index] = allowArray[i];
                }
            }
            // this._reelBlock.updateWinState(allowArray);
            if (this._dataWin.isScatter)
                this._lineInGame.showWinLineScatter();
            else
                this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWin, !this._dataWin.isScatter);

            this._animateWinLine();
        }
        this._reelBlock.updateWinState(this._arrayWinData);

        this._dataWin.repeatWins();
        this._lineTimer?.destroy();
        this._lineTimer = OMY.Omy.add.timer(this._timeForLineValue, this._onCompleteShowAllWins, this);
    }

    _showAllWinLinesTurbo() {
        OMY.Omy.info('view. start show all win line turbo');
        this._dataWin.repeatWins();
        this._resetArrayWinData();
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();

            let allowArray = this.findWinSymbols(this._dataWin, false, false, this._showOnWinNoWinSymbols);
            this._winEffect.showWinSymbol(allowArray, false);
            for (let i = 0; i < allowArray.length; i++) {
                let index = AppG.convertID(allowArray[i].reelId, allowArray[i].symbolId);
                if (this._arrayWinData[index].type !== AppConst.SLOT_SYMBOL_WIN && allowArray[i].type === AppConst.SLOT_SYMBOL_WIN) {
                    AppG.setWinSymbolD(this._arrayWinData[index]);
                    this._arrayWinData[index] = allowArray[i];
                }
            }
            if (this._dataWin.isScatter)
                this._lineInGame.showWinLineScatter();
            else
                this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWin, !this._dataWin.isScatter);

            this._animateWinLine();
        }
        this._reelBlock.updateWinState(this._arrayWinData);
        this._dataWin.repeatWins();
    }

    _onCompleteShowAllWins() {
        OMY.Omy.info('view. end show all win line in one');
        if (AppG.beginBonusGame) {
            this._startBonusGame();
        } else if (this._startLoopAfterLines) {
            this.startLoopAnimation();
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    // region loop win effect:
    //-------------------------------------------------------------------------
    startLoopAnimation() {
        OMY.Omy.info('view. start loop win effect');
        this._playWinAnimation = true;
        this._playLoopAnimations = true;
        this._winEffect.show();
        this._lineInGame.showWinAnimation();
        this._dataWin.repeatWins();
        this._showLoopLine();
    }

    _showLoopLine() {
        if (this._dataWin.endLines) {
            this.startLoopAnimation();
            return;
        }

        if (this._clearReelsOnWin) this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
        this._winEffect.clearEffect();
        this._dataWin.nextLine();
        this._animateLoopLine();

        let allowArray = this.findWinSymbols(this._dataWin, false, true, this._showLoopNoWinSymbols);
        this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter, true);
        this._reelBlock.updateWinState(allowArray);
        if (this._dataWin.isScatter)
            this._lineInGame.showWinLineScatter();
        else
            this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWinLoop, !this._dataWin.isScatter);
        this._lineTimer?.destroy();
        this._lineTimer = OMY.Omy.add.timer(this._timeShowLoopLine, this._showLoopLine, this);
    }

    _animateLoopLine() {

    }

    //-------------------------------------------------------------------------
    //endregion

    /**
     * @param {GameWinData}dataWin
     * @param {Boolean}playSound
     * @param {Boolean}dispatch
     * @param {Boolean}noWin
     * @returns {[]}
     */
    findWinSymbols(dataWin, playSound = true, dispatch = true, noWin = false) {
        let lineNumber = dataWin.line;
        let countWinsSymbols = dataWin.countSymbol;
        let isScatter = dataWin.isScatter;
        let winSymbol = dataWin.winSymbol;

        let allowArray = [];

        let n = this._rowTotal;
        let i;
        let totalWinReel, countWinReel;
        /**
         * @type {WinSymbolD}
         */
        let winSymbolData = null;
        let line = AppG.serverWork.getLine(lineNumber);
        if (!line) {
            OMY.Omy.error("no line", lineNumber);
        }

        let polar, j, m;
        if (this._dataWin.isLeftCheck) {
            j = 0;
            m = this._totalReel;
            polar = 1;
        } else {
            j = this._totalReel - 1;
            m = 1;
            polar = -1;
        }

        totalWinReel = countWinsSymbols;
        countWinReel = 0;
        if (isScatter) {
            while ((j * polar) < m) {
                if (AppG.gameConst.checkScatterByLine(winSymbol)) {
                    if (winSymbol === this._reelBlock.getSymbolForReel(j, line[j]) && countWinReel < totalWinReel) {
                        winSymbolData = AppG.getWinSymbolD();
                        winSymbolData.reelId = j;
                        winSymbolData.symbolId = line[j];
                        winSymbolData.symbol = this._reelBlock.getSymbolForReel(j, line[j]);
                        winSymbolData.isScatter = true;
                        winSymbolData.lineNumber = lineNumber;
                        winSymbolData.countSymbol = countWinsSymbols;
                        winSymbolData.isWin = true;
                        winSymbolData.type = AppConst.SLOT_SYMBOL_WIN;
                        winSymbolData.winSymbol = winSymbol;
                        winSymbolData.credit = dataWin.credit;

                        allowArray.push(winSymbolData);
                        countWinReel++;
                    } else if (noWin) {
                        winSymbolData = AppG.getWinSymbolD();
                        winSymbolData.reelId = j;
                        winSymbolData.symbolId = line[j];
                        winSymbolData.symbol = this._reelBlock.getSymbolForReel(j, line[j]);
                        winSymbolData.isScatter = false;
                        winSymbolData.lineNumber = lineNumber;
                        winSymbolData.countSymbol = countWinsSymbols;
                        winSymbolData.isWin = false;
                        winSymbolData.type = AppConst.SLOT_SYMBOL_NO_WIN;
                        winSymbolData.winSymbol = winSymbol;
                        winSymbolData.credit = dataWin.credit;
                        allowArray.push(winSymbolData);
                    }
                } else {
                    for (i = 0; i < n; i++) {
                        if (winSymbol === this._reelBlock.getSymbolForReel(j, i) && (countWinReel < totalWinReel || this._winAllScattersOnReels)) {
                            winSymbolData = AppG.getWinSymbolD();
                            winSymbolData.reelId = j;
                            winSymbolData.symbolId = i;
                            winSymbolData.symbol = winSymbol;
                            winSymbolData.isScatter = true;
                            winSymbolData.lineNumber = lineNumber;
                            winSymbolData.countSymbol = countWinsSymbols;
                            winSymbolData.isWin = true;
                            winSymbolData.type = AppConst.SLOT_SYMBOL_WIN;
                            winSymbolData.winSymbol = winSymbol;
                            winSymbolData.credit = dataWin.credit;

                            allowArray.push(winSymbolData);

                            if (!this._winAllScattersOnReels) {
                                countWinReel++;
                                break;
                            }
                        }
                    }
                }
                j += polar;
            }
        } else {
            while ((j * polar) < m) {

                if ((winSymbol === this._reelBlock.getSymbolForReel(j, line[j]) ||
                        this._wildSystem.inWild(this._reelBlock.getSymbolForReel(j, line[j]), winSymbol))
                    && countWinReel < totalWinReel) {
                    winSymbolData = AppG.getWinSymbolD();
                    winSymbolData.reelId = j;
                    winSymbolData.symbolId = line[j];
                    winSymbolData.symbol = this._reelBlock.getSymbolForReel(j, line[j]);
                    winSymbolData.isScatter = false;
                    winSymbolData.lineNumber = lineNumber;
                    winSymbolData.countSymbol = countWinsSymbols;
                    winSymbolData.isWin = true;
                    winSymbolData.type = AppConst.SLOT_SYMBOL_WIN;
                    winSymbolData.winSymbol = winSymbol;
                    winSymbolData.credit = dataWin.credit;

                    allowArray.push(winSymbolData);
                    countWinReel++;
                } else if (noWin) {
                    winSymbolData = AppG.getWinSymbolD();
                    winSymbolData.reelId = j;
                    winSymbolData.symbolId = line[j];
                    winSymbolData.symbol = this._reelBlock.getSymbolForReel(j, line[j]);
                    winSymbolData.isScatter = false;
                    winSymbolData.lineNumber = lineNumber;
                    winSymbolData.countSymbol = countWinsSymbols;
                    winSymbolData.isWin = false;
                    winSymbolData.type = AppConst.SLOT_SYMBOL_NO_WIN;
                    winSymbolData.winSymbol = winSymbol;
                    winSymbolData.credit = dataWin.credit;
                    allowArray.push(winSymbolData);
                }
                j += polar;
            }
        }

        if (dispatch) {
            const symbols = [];
            for (let i = 0; i < allowArray.length; i++) {
                symbols.push(allowArray[i].symbol);
            }
            AppG.emit.emit(AppConst.APP_SHOW_LINE, lineNumber, symbols, dataWin.credit, allowArray);
        }

        return allowArray;
    }

    /**
     * @param {GameWinData}dataWin
     * @param {Boolean}playSound
     * @param {Boolean}dispatch
     * @param {Boolean}noWin
     * @returns {[]}
     */
    findWinDrop(dataWin, playSound = true, dispatch = true, noWin = false) {
        let points = dataWin.points;
        let allowArray = [];
        /**
         * @type {WinSymbolD}
         */
        let winSymbolData = null;
        let line = null;

        for (let i = 0; i < points.length; i++) {
            line = points[i];
            winSymbolData = AppG.getWinSymbolD();
            winSymbolData.reelId = line.x;
            winSymbolData.symbolId = line.y;
            winSymbolData.symbol = this._reelBlock.getSymbolForReel(line.x, line.y);
            winSymbolData.isScatter = AppG.gameConst.isScatterSymbol(winSymbolData.symbol);
            winSymbolData.isWild = AppG.wildSystem.isWild(winSymbolData.symbol);
            winSymbolData.wildMulti = (winSymbolData.isWild && AppG.serverWork.positionsMulti.length) ? AppG.serverWork.positionsMulti[line.x][line.y] : 0;
            winSymbolData.countSymbol = dataWin.countSymbol;
            winSymbolData.isWin = true;
            winSymbolData.type = AppConst.SLOT_SYMBOL_WIN;
            winSymbolData.winSymbol = dataWin.winSymbol;
            winSymbolData.credit = dataWin.credit;
            winSymbolData.multi = dataWin.multi;

            allowArray.push(winSymbolData);
        }

        if (dispatch) {
            const symbols = [];
            for (let i = 0; i < allowArray.length; i++) {
                symbols.push(allowArray[i].symbol);
            }
            AppG.emit.emit(AppConst.APP_SHOW_LINE, dataWin.multi, symbols, dataWin.credit, allowArray);
        }

        return allowArray;
    }

    hideWin() {
        if (!this._playWinAnimation) return false;
        OMY.Omy.info('view. hide win effects');
        this._lineTimer?.destroy();
        this._showingWinTimer?.destroy();
        this._lineTimer = null;
        this._playWinAnimation = false;
        this._playLoopAnimations = false;
        this._lineInGame.hideWinEffect();
        this._winEffect.hide();
        this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        AppG.emit.emit(AppConst.APP_HIDE_WIN_EFFECT);
        return true;
    }

    changeBgMusic(oldM, newM, time = 2, loopForNew = true) {
        if (OMY.Omy.sound.isSoundExist(newM) && OMY.Omy.sound.isSoundPlay(oldM) && oldM !== newM) {
            OMY.Omy.sound.addFadeEvent(oldM, (a) => {
                OMY.Omy.sound.stopById(a);
            }, this, true);
            OMY.Omy.sound.fade(oldM, time, OMY.Omy.sound.getSoundVolume(oldM), 0);
            GameConstStatic.S_game_bg = newM;
            if (OMY.Omy.sound.isSoundPlay(newM)) OMY.Omy.sound.stop(newM);
            OMY.Omy.sound.play(newM, loopForNew);
            OMY.Omy.sound.fade(newM, time, 0, 1);
        }
    }

    _onPayWindowOpen() {

    }

    _onPayWindowClose() {

    }

    _onIntroWindowOpen() {

    }

    _onIntroWindowClose() {
    }

    _onGambleWindowOpen() {

    }

    _onGambleWindowClose() {

    }

    _onIntroInfoOpen() {

    }

    _onIntroInfoClose() {

    }

    /** @private */
    _onCreateWindow(wName) {
        switch (wName) {
            case AppConst.W_PAY: {
                this.hideWin();
                this._lineInGame.hide();
                this._onPayWindowOpen();
                break;
            }
            case AppConst.W_INTRO: {
                this._onIntroWindowOpen();
                break;
            }
            case AppConst.W_INTRO_INFO: {
                this._onIntroInfoOpen();
                break;
            }
            case AppConst.W_GAMBLE: {
                this._onGambleWindowOpen();
                break;
            }
        }
    }

    /** @private */
    _onRemoveWindow(wName) {
        switch (wName) {
            case AppConst.W_PAY: {
                this._onPayWindowClose();
                break;
            }
            case AppConst.W_INTRO: {
                this._onIntroWindowClose();
                break;
            }
            case AppConst.W_INTRO_INFO: {
                this._onIntroInfoClose();
                break;
            }
            case AppConst.W_GAMBLE: {
                this._onGambleWindowClose();
                break;
            }
        }
    }

    get playWinAnimation() {
        return this._playWinAnimation;
    }

    get playLoopAnimations() {
        return this._playLoopAnimations;
    }

    get isShowingWinLines() {
        return this._isShowingWinLines;
    }
}
