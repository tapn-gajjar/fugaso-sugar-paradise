import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {Reel} from "../../../app/display/reels/Reel";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class ReelBlockBase extends OMY.OContainer {
    constructor() {
        super();

        this._totalStarted = 0;
        this._totalComplete = 0;

        this._stopDelayed = false;

        this._stopSpinTimeout = null;
        this._desiredTime = 0;

        this.startSpinTime = null;
        this._countActive = 0;
        this.interactChild = false;

        this._startDebugReels = AppG.gameConst.getData("debug_start_symbols");
        this._useOn1stReel = AppG.gameConst.useOn1stReel;
        this._isWaitEffect = AppG.gameConst.isWaitEffect;

        this._configBlock();
        this._createReels();
        this._addEmit();

        this._updateGameSize = () => AppG.updateGameSize(this);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

    _configBlock() {
        this._reelClass = Reel;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDReels");
        this.setXY(
            this._gdConf.x,
            this._gdConf.y,
        );
        if (this._gdConf["debug"])
            OMY.Omy.add.regDebugMode(this);

        this._totalReel = AppG.totalReel;
        this._defaultDesiredTime = AppG.gameConst.getData("defaultDesiredTime");
        this._countSlot = AppG.gameConst.getData("countSlot");
        this._countDown = AppG.gameConst.getData("countDown");
        this._countUp = AppG.gameConst.getData("countUp");
        this._delaySpinReel = AppG.gameConst.getData("delaySpinReel");
        this._delayStartSpinTime = AppG.gameConst.getData("delayStartSpinTime");
        this._delayDelayBetweenReelsTime = AppG.gameConst.getData("delayDelayBetweenReelsTime");
        this._delayDelayBetweenReelsTimeCoef = AppG.gameConst.delayDelayBetweenReelsTimeCoef;
        this._change2LongSpeed = AppG.gameConst.getData("change2LongSpeed");
        this._timeForLongReel = AppG.gameConst.getData("timeForLongReel");
        this._innerFinish = AppG.gameConst.getData("innerFinish");

        this._delaySpinMap = AppG.gameConst.delaySpinMap;
    }

    _createReels() {
        this._reelBgList = [];
        this._reelAnimList = [];

        let n = this._totalReel;
        let i;

        this._reelStops = AppG.serverWork.reelStop;
        if (!this._reelStops) {
            this._reelStops = [];
            for (i = 0; i < n; i++) {
                this._reelStops.push(0);
            }
        }

        this._wins = [];
        /** @type {Array.<ReelBase>} */
        this._reelList = [];

        this._activeList = [];

        let buffer;
        for (i = 0; i < n; i++) {
            this._wins.push([]);
            this._activeList.push([]);

            let combination = this.getCombination(i);
            buffer = new this._reelClass(this._gdConf, i, (this._startDebugReels) ? this._startDebugReels[i] : combination);
            if (this._gdConf["r_debug"][i])
                OMY.Omy.add.regDebugMode(buffer);
            this._reelList.push(buffer);
            buffer.name = "reel-" + String(i);
            buffer.on(AppConst.REEL_COMPLETE, this.onCompleteSpin, this);
            buffer.on(AppConst.REEL_INNER_END, this.onReelPreEase, this);
            buffer.on(AppConst.REEL_SPIN, this._onReelSpin, this);
            this.addChild(buffer);
        }
        buffer = null;

        this._createActiveList();

    }

    _addEmit() {
        AppG.emit.on(AppConst.C_REEL_ONE_STOP, this._onSkipOneReel, this);
    }

    canStop() {
        if (this._totalStarted != this._countActive) {
            if (!this._stopDelayed)
                this._stopDelayed = true;
            return;
        }
        this._haveSymbolData = true;

        this._desiredTime = this._defaultDesiredTime;

        if (AppG.isTurbo) {
            if (AppG.isGameDrop) {
                this._desiredTime = this._desiredTime * this._turboModeTimeCoef;
            } else {
                this.stopSpinning();
                return;
            }
        }

        let endSpinTime = new Date();
        let elapsedTime = endSpinTime - this.startSpinTime;
        let delayTime = this._desiredTime - elapsedTime;

        if (delayTime > 0 && !AppG.skipped) {
            this._stopSpinTimeout = OMY.Omy.add.timer(delayTime / 1000, this.stopSpinning, this);
        } else {
            this.stopSpinning();
        }
    }

    start() {
        this._reelWaitMatrix = null;
        this._isOnWaitEffect = false
        this._oneSoundStop = AppG.isTurbo;
        this._reelsMoving = true;
        for (let i = 0; i < this._totalReel; i++) {
            this._reelList[i].saveSymbolPos();
            if (this._reelList[i].timerCallEnd) {
                this._reelList[i].timerCallEnd.destroy();
                this._reelList[i].timerCallEnd = null;
            }
        }

        for (let i = 0; i < this._reelList.length; i++) {
            this._reelList[i].symbols.map((a, index, array) => array[index].isFocus = true);
        }

        this._scatterInReal = false;

        this._catchSymbol = NaN;
        this._totalStarted = 0;
        this._totalComplete = 0;
        this._totalStopComplete = 0;
        this._stopDelayed = false;
        AppG.skipped = false;
        this._countScatters = 0;
        this._haveSymbolData = false;
        this._stopingReels = false;
        this._isOneStart = false;

        if (this._delaySpinMap && !AppG.isTurbo) {
            let timeDelay = this._delaySpinReel;
            this._countActive = 0;
            const countReel = this._delaySpinMap["delayVector"].length;
            for (let i = 0; i < countReel; i++) {
                const reelId = this._delaySpinMap["delayVector"][i];
                if (!this._reelList[reelId].isBlock) {
                    this._countActive++;
                    OMY.Omy.add.timer(timeDelay, this.delayedStart, this, 0, false, true, 0, [this._reelList[reelId]]);
                    timeDelay += this._delaySpinMap["delayTime"][i];
                }
            }
        } else {
            let timeDelay = this._delaySpinReel;
            this._countActive = 0;
            for (let i = 0; i < this._totalReel; i++) {
                if (!this._reelList[i].isBlock) {
                    this._countActive++;
                    if (AppG.isTurbo) {
                        this._reelList[i].startSpinning();
                    } else {
                        OMY.Omy.add.timer(timeDelay, this.delayedStart, this, 0, false, true, 0, [this._reelList[i]]);
                        timeDelay += this._delayStartSpinTime;
                    }
                }
            }
        }

        AppG.emit.emit(AppConst.APP_REELBLOCK_START);
        this.spinTime = Date.now();
    }

    delayedStart(reel) {
        reel.startSpinning();
    }

    /**     * @private     */
    _onReelSpin(index) {
        this._totalStarted++;
        if (!this._isOneStart) {
            this._isOneStart = true;
            this.startSpinTime = new Date();
        }
        if (this._totalStarted >= this._countActive && this._stopDelayed) {
            this._stopDelayed = false;
            this.canStop();
        }
    }

    onReelPreEase(reelId) {
        this._totalStopComplete++;
        this._createActiveList();
        this._checkSymbolForEffect(reelId);
        if (!AppG.skipped && this._isWaitEffect && this._reelWaitMatrix) {
            this._checkReelForWait(reelId);
        }
        if (AppG.isTurbo) {
            this._onTurboPreEase(reelId);
        } else {
            if (!AppG.skipped) {
                this._onNormalPreEase(reelId);
            } else {
                this._onNormalSkipPreEase(reelId);
            }
        }
        AppG.emit.emit(AppConst.APP_EMIT_STOP_EASE_REEL, reelId);
        if (this._totalStopComplete === this._countActive) AppG.emit.emit(AppConst.APP_EMIT_STOP_ALL_EASE_REEL);
    }

    _onTurboPreEase(reelId) {
        if (this._oneSoundStop && this._totalStopComplete === this._countActive) {
            OMY.Omy.sound.play(GameConstStatic.S_reel_stop_all);
        }
        this._checkScatterPreEase(reelId);
    }

    _onNormalPreEase(reelId) {
        OMY.Omy.sound.play(GameConstStatic.S_reel_stop);
        this._checkScatterPreEase(reelId);
    }

    _onNormalSkipPreEase(reelId) {
        if (this._oneSoundStop && this._totalStopComplete === this._countActive) {
            OMY.Omy.sound.play(GameConstStatic.S_reel_stop_all);
        }
    }

    _checkScatterPreEase(reelId) {
        if (this._checkReelBySymbol(reelId, AppG.gameConst.getData("scatterSymbol"))) {
            this._countScatters++;
            AppG.emit.emit(AppConst.APP_EMIT_CATCH_SCATTER, this._countScatters, reelId);
            this._scatterInReal = true;
        }
    }

    _checkSymbolForEffect(reelId) {
        if (!AppG.skipped) {
            if ((reelId + 1) < this._totalReel && this._reelList[reelId + 1].longSpin) {
                AppG.emit.emit(AppConst.APP_WAIT_REEL, reelId + 1, this._reelList[reelId + 1].waitSymbol);
            }
        }
    }

    _checkScatter(reelId) {
        if (this._checkReelBySymbol(reelId, AppG.gameConst.getData("scatterSymbol"))) {
            this._countScatters++;
            AppG.emit.emit(AppConst.APP_EMIT_CATCH_SCATTER, this._countScatters, reelId);
            this._scatterInReal = true;
        }
    }

    stopSpinning() {
        if (this._stopSpinTimeout) {
            this._stopSpinTimeout = null;
        }
        this._stopingReels = true;

        if (!AppG.skipped) {
            this._checkLongReelCase();
        }

        if (AppG.skipped) {
            for (let i = 0; i < this._totalReel; i++) {
                if (!this._reelList[i].isBlock)
                    this._reelList[i].stopSpinning(this.getCombination(i).reverse());
            }
        } else if (AppG.isTurbo) {
            for (let i = 0; i < this._totalReel; i++) {
                if (!this._reelList[i].isBlock)
                    this._reelList[i].stopSpinning(this.getCombination(i).reverse());
            }
        } else {
            let timeDelay = 0;
            let delayDelayBetweenReelsTime = (this._useOn1stReel) ? this._delayDelayBetweenReelsTime : 0;
            for (let i = 0; i < this._totalReel; i++) {
                if (!this._reelList[i].isBlock) {
                    timeDelay += delayDelayBetweenReelsTime *
                        ((AppG.isTurbo) ? this._delayDelayBetweenReelsTimeCoef : 1);
                    this._reelList[i].timerCallEnd = OMY.Omy.add.timer(
                        timeDelay, this._delayCallEndSpin, this, 0, false, true, 0,
                        [this._reelList[i], this.getCombination(i).reverse()],
                    );
                    delayDelayBetweenReelsTime = this._delayDelayBetweenReelsTime;
                }
            }
        }
    }

    _checkLongReelCase() {
        if (this._isWaitEffect) {
            this._checkWaitEffect();
            return;
        }
        //не враховується декілька символів для перевірки
        if (AppG.gameConst.longReelSymbol.length) {
            for (let i = 0; i < AppG.gameConst.longReelSymbol.length; i++) {
                let checkSymbol = AppG.gameConst.longReelSymbol[i];
                let n = this._totalReel;
                let countFind = 0;
                let longEffectOn = false;
                let timeForLongReel = this._timeForLongReel;
                for (let j = 0; j < n; j++) {
                    if (!longEffectOn) {
                        if (OMY.OMath.inArray(this.getCombination(j), checkSymbol)) {
                            countFind++;
                            if (countFind >= AppG.gameConst.longReelSymbolMap[String(checkSymbol)] && j !== n - 1) {
                                longEffectOn = true;
                            }
                        }
                    } else {
                        this._reelList[j].longReel(timeForLongReel, this._change2LongSpeed, checkSymbol);
                        timeForLongReel += this._timeForLongReel;
                    }
                }
            }
        }
    }

    _delayCallEndSpin(reel, combo) {
        reel.stopSpinning(combo);
        reel.timerCallEnd = null;
    }

    /**     * @private     */
    _onSkipOneReel(indexReel) {
        if (!AppG.skipped) {
            OMY.Omy.sound.play(GameConstStatic.S_reel_stop_all);

            if (!this._reelList[indexReel]._skipped) {
                this._reelList[indexReel].setSkip();
                if (this._stopSpinTimeout) {
                    if (!this._reelList[indexReel].isBlock)
                        this._reelList[indexReel].stopSpinning(this.getCombination(indexReel).reverse());
                } else if (this._stopingReels) {
                    if (this._reelList[indexReel].timerCallEnd) {
                        this._reelList[indexReel]
                            .stopSpinning(this._reelList[indexReel].timerCallEnd.completeParams[1]);
                        this._reelList[indexReel].timerCallEnd.destroy();
                        this._reelList[indexReel].timerCallEnd = null;
                    } else {
                        this._reelList[indexReel].forceSkip();
                    }
                }
            }
        }
    }

    skipSpin() {
        if (!AppG.skipped) {
            OMY.Omy.info('reels. skip spin');
            AppG.emit.emit(AppConst.APP_EMIT_SKIP_REEL);
            this._oneSoundStop = Boolean(GameConstStatic.S_reel_stop_all);
            AppG.skipped = true;
            for (let i = 0; i < this._totalReel; i++) {
                this._reelList[i].setSkip();
            }
            if (this._stopSpinTimeout) {
                this._stopSpinTimeout.destroy();
                this._stopSpinTimeout = null;
                this.stopSpinning();
            } else if (this._stopingReels) {
                for (let i = 0; i < this._totalReel; i++) {
                    if (this._reelList[i].timerCallEnd) {
                        this._reelList[i]
                            .stopSpinning(this._reelList[i].timerCallEnd.completeParams[1]);
                        this._reelList[i].timerCallEnd.destroy();
                        this._reelList[i].timerCallEnd = null;
                    } else {
                        this._reelList[i].forceSkip();
                    }
                }
            }
        }
    }

    getCombination(index) {
        let cstr = AppG.serverWork.currentReels[index];
        let pstr = cstr.substr(AppG.serverWork.reelStop[index], this._countSlot);
        if (pstr.length < this._countSlot) pstr += cstr.substr(0, this._countSlot - pstr.length);
        let arr = [];
        for (let i = 0; i < this._countSlot; i++) {
            arr.push(pstr.charAt(i));
        }
        return arr;
    }

    onCompleteSpin(reelId) {
        // OMY.Omy.log('onCompleteSpin', reelId);
        this._createActiveList();
        this._totalComplete++;
        this._checkScatter(reelId);
        if (!this._innerFinish) this._checkSymbolForEffect(reelId);

        AppG.emit.emit(AppConst.APP_EMIT_STOP_REEL, reelId);
        if (this._totalComplete !== this._countActive)
            return false;
        OMY.Omy.info("reels. end move. Spin time is", Date.now() - this.spinTime);
        this._onFinishSpins();

        if (!isNaN(this._catchSymbol)) {
            AppG.emit.emit(AppConst.WAIT_REEL_WAIT_SKIP);
            this._catchSymbol = NaN;
        }

        // OMY.Omy.info('symbol in reels');
        // OMY.Omy.info('==================================================================');
        // let n = this._totalReel;
        // let m = AppG.gameConst.countSlot;
        // for (let i = 0; i < n; i++) {
        //     OMY.Omy.info('reel id', i);
        //     for (let j = 0; j < m; j++) {
        //         OMY.Omy.info('symbol id', j, 'symbol', this._activeList[i][j].symbolName);
        //     }
        // }
        // OMY.Omy.info('==================================================================');
        AppG.moveReels = false;
        this._logWinSymbols();
        OMY.Omy.add.timer(((AppG.isWin) ? .2 : .1), this.finishedSpin, this);
        AppG.emit.emit(AppConst.APP_REELBLOCK_END);
        return true;
    }

    _onFinishSpins() {

    }

    getSymbolsByChar(char) {
        let result = [];
        let n = this._totalReel;
        let m = this._countSlot;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (char.indexOf(this._activeList[i][j].symbolName) !== -1) {
                    result.push(this._activeList[i][j]);
                }
            }
        }
        return result;
    }

    getCharAt(pos, str) {
        pos -= str.length * OMY.OMath.int(pos / str.length);
        return str.charAt(pos);
    }

    _logWinSymbols() {
        let startIndex;
        let n = this._totalReel;
        let m = this._countSlot;
        for (let i = 0; i < n; i++) {
            this._wins[i].length = 0;
            startIndex = AppG.serverWork.reelStop[i];
            for (let j = 0; j < m; j++) {
                this._wins[i].push(this.getCharAt(startIndex + j, AppG.serverWork.currentReels[i]));
            }
        }
        // AntG.warn('Win symbols', this._wins);
    }

    _createActiveList() {
        let n = this._totalReel;
        let m = this._countSlot + this._countUp;

        for (let i = 0; i < n; i++) {
            this._activeList[i].length = 0;
            for (let j = this._countUp; j < m; j++) {
                this._activeList[i].push(this._reelList[i].symbolsList[j]);
            }
        }
    }

    finishedSpin() {
        AppG.state.gameOver();
    }

    /**     * @public     */
    updateWinState(allowAr) {
        /**
         * @type {WinSymbolD}
         */
        let buf;
        for (let i = 0; i < allowAr.length; i++) {
            buf = allowAr[i];
            if (buf) {
                this._activeList[buf.reelId][buf.symbolId].updateStateImg(buf.type);

            }
        }
        buf = null;
    }

    updateToState(symbolState, allowAr = null) {
        if (allowAr) {
            /**
             * @type {WinSymbolD}
             */
            let buf;
            for (let i = 0; i < allowAr.length; i++) {
                buf = allowAr[i];
                if (buf)
                    this._activeList[buf.reelId][buf.symbolId].updateStateImg(symbolState);
            }
            buf = null;
        } else {
            let n = this._totalReel;
            let m = this._countSlot;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    this._activeList[i][j].updateStateImg(symbolState);
                }
            }
        }
    }

    updateReelToState(symbolState, reelId) {
        let m = this._countSlot;
        for (let j = 0; j < m; j++) {
            this._activeList[reelId][j].updateStateImg(symbolState);
        }
    }

    getSymbolForReel(reelId, symbolId) {
        return this._activeList[reelId][symbolId].symbolName;
    }

    getSlotSymbol(reelId, symbolId) {
        return this._activeList[reelId][symbolId];
    }

    getSymbolByMatrix(matrixPos) {
        const reelId = Math.floor(matrixPos / this._countSlot);
        const symbolId = this._countSlot - 1 - (matrixPos - reelId * this._countSlot);
        return this._activeList[reelId][symbolId];
    }

    unBlockReels() {
        let n = this._totalReel;
        let i;
        for (i = 0; i < n; i++) {
            this._reelList[i].unBlockReel();
        }
    }

    blockReel(id) {
        if (id < this._reelList.length)
            this._reelList[id].blockReel();
    }

    _checkReelBySymbol(reelID, find) {
        let m = this._countSlot;
        for (let j = 0; j < m; j++) {
            if (find.indexOf(this._activeList[reelID][j].symbolName) !== -1) {
                return true;
            }
        }
        return false;
    }

    /**     * @public     */
    tryFindSymbol(symbols) {
        for (let i = 0; i < this._reelList.length; i++) {
            if (this._checkReelBySymbol(i, symbols))
                return true;
        }
        return false;
    }

    /**
     * @param reelId
     * @returns {Reel}
     */
    getReel(reelId) {
        if (reelId < 0 || reelId >= this._reelList.length)
            OMY.Omy.error("this reel not exists", reelId);
        return this._reelList[reelId];
    }

    _checkWaitEffect() {
        const waitSymbols = AppG.gameConst.waitSymbols;
        const waitSymbolMap = AppG.gameConst.waitSymbolMap;
        this._reelWaitMatrix = null;
        for (let i = 0; i < waitSymbols.length; i++) {
            let checkSymbol = waitSymbols[i];
            let n = this._totalReel;
            let countFind = 0;
            let longEffectOn = false;
            const setting = waitSymbolMap[String(checkSymbol)];
            let symbolMap = null;
            for (let j = 0; j < n; j++) {
                if (!Boolean(setting.checkReels[j]) && !longEffectOn) continue;
                const reel = this.getCombination(j);
                if (!longEffectOn) {
                    if (OMY.OMath.inArray(reel, checkSymbol)) {
                        symbolMap = [];
                        for (let k = 0; k < reel.length; k++) {
                            if (reel[k] === checkSymbol) {
                                countFind++;
                                symbolMap.push([j, k]);
                            }
                        }
                        if (countFind >= setting.count && j !== n - 1) longEffectOn = true;
                        if (j + 1 === n - 1 && !Boolean(setting.effectReels[j + 1]))
                            longEffectOn = false;
                    }
                } else {
                    if (!this._reelWaitMatrix) this._reelWaitMatrix = [];
                    if (!this._reelWaitMatrix[j]) this._reelWaitMatrix[j] = {
                        symbols: {
                            list: []
                        }
                    };
                    this._reelWaitMatrix[j].effect = Boolean(setting.effectReels[j]);
                    this._reelWaitMatrix[j].symbols.list.push(checkSymbol);
                    this._reelWaitMatrix[j].symbols[checkSymbol] = {symbolMap: symbolMap?.concat(), countFind}
                    if (!this._reelList[j].isBlock)
                        this._reelList[j].longReel(0, false);

                    if (OMY.OMath.inArray(reel, checkSymbol)) {
                        const newSymbols = [];
                        for (let k = 0; k < reel.length; k++) {
                            if (reel[k] === checkSymbol) {
                                countFind++;
                                newSymbols.push([j, k]);
                            }
                        }
                        this._reelWaitMatrix[j].symbols[checkSymbol]["newSymbols"] = newSymbols;
                        symbolMap = symbolMap?.concat(newSymbols);
                    }
                }
            }
        }
    }

    /**     * @private     */
    _checkReelForWait(reelId) {
        if (this._isOnWaitEffect) {
            if (reelId + 1 < this._reelWaitMatrix.length) {
                let timeDelayBtwReels = this._delayDelayBetweenReelsTime *
                    ((AppG.isTurbo) ? this._delayDelayBetweenReelsTimeCoef : 1);
                const timeForLongReel = (this._reelWaitMatrix[reelId + 1].effect) ? AppG.gameConst.timeWaitReel : timeDelayBtwReels;
                this._reelList[reelId + 1].longReel(timeForLongReel, false);

                this._getActiveSymbolForWait(this._reelWaitMatrix[reelId + 1].symbols);
                AppG.emit.emit(AppConst.EMIT_REEL_WAIT, reelId + 1, reelId, false,
                    this._reelWaitMatrix[reelId + 1].symbols, this._reelWaitMatrix[reelId + 1].effect);

                if (this._reelWaitMatrix[reelId + 1].effect) {
                    const slowSpeedOnWaitForAll = AppG.gameConst.slowSpeedOnWaitForAll;
                    const noBlurActiveReel = AppG.gameConst.noBlurActiveReel;
                    if (!slowSpeedOnWaitForAll) this._reelList[reelId + 1].waitRollSpeed();
                    if (noBlurActiveReel) this._reelList[reelId + 1].offBlurForSymbols();
                }
            } else {
                AppG.emit.emit(AppConst.EMIT_REEL_WAIT_OFF, reelId);
            }
        } else {
            if (reelId + 1 < this._reelWaitMatrix.length && this._reelWaitMatrix[reelId + 1] &&
                this._reelWaitMatrix[reelId + 1].effect) {
                this._reelList[reelId + 1].longReel(AppG.gameConst.timeWaitReel, false);
                this._isOnWaitEffect = true;
                const effectOnWaitForAll = AppG.gameConst.effectOnWaitForAll;
                const slowSpeedOnWaitForAll = AppG.gameConst.slowSpeedOnWaitForAll;
                const noBlurActiveReel = AppG.gameConst.noBlurActiveReel;

                this._getActiveSymbolForWait(this._reelWaitMatrix[reelId + 1].symbols);
                AppG.emit.emit(AppConst.EMIT_REEL_WAIT, reelId + 1, reelId, true,
                    this._reelWaitMatrix[reelId + 1].symbols, effectOnWaitForAll || this._reelWaitMatrix[reelId + 1].effect);

                if (slowSpeedOnWaitForAll) {
                    for (let i = reelId + 1; i < this._reelList.length; i++) {
                        this._reelList[i].waitRollSpeed();
                    }
                } else {
                    this._reelList[reelId + 1].waitRollSpeed();
                }
                if (noBlurActiveReel) this._reelList[reelId + 1].offBlurForSymbols();
            }
        }
    }

    /**     * @private     */
    _getActiveSymbolForWait(setting) {
        for (let i = 0; i < setting.list.length; i++) {
            const symbol = setting.list[i];
            if (setting[symbol].symbolMap) {
                const spriteSymbolMap = [];
                for (let j = 0; j < setting[symbol].symbolMap.length; j++) {
                    spriteSymbolMap.push(this._activeList[setting[symbol].symbolMap[j][0]][setting[symbol].symbolMap[j][1]]);
                }
                setting[symbol]["spriteSymbolMap"] = spriteSymbolMap;
            }
            if (setting[symbol].newSymbols) {
                const spriteNewSymbols = [];
                for (let j = 0; j < setting[symbol].newSymbols.length; j++) {
                    spriteNewSymbols.push(this._activeList[setting[symbol].newSymbols[j][0]][setting[symbol].newSymbols[j][1]]);
                }
                setting[symbol]["spriteNewSymbols"] = spriteNewSymbols;
            }
        }
    }

    //---------------------------------------
    /// ACCESSOR
    //---------------------------------------

    get activeList() {
        return this._activeList;
    }
}
