import {ReelBlockBase} from "../ReelBlockBase";
import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";
import {ReelDrop} from "../../../../app/display/dropType/reels/ReelDrop";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class ReelBlockDropBase extends ReelBlockBase {
    constructor() {
        super();
        this._state = this.S_WAIT;
    }

    _configBlock() {
        this._reelClass = ReelDrop;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDReels");
        this.setXY(
            this._gdConf.x,
            this._gdConf.y,
        );
        if (this._gdConf["debug"])
            OMY.Omy.add.regDebugMode(this);

        this._totalReel = AppG.totalReel;
        this._countSlot = AppG.gameConst.getData("countSlot");
        this._countDown = 0;
        this._countUp = 0;

        this._delayDelayBetweenReelsTime = AppG.gameConst.getData("delayDelayBetweenReelsTime");
        this._delayDelayBetweenReelsTimeCoef = AppG.gameConst.delayDelayBetweenReelsTimeCoef;
        this._innerFinish = AppG.gameConst.getData("innerFinish");
    }

    _createReels() {
        super._createReels();

        for (let i = 0; i < this._reelList.length; i++) {
            this._reelList[i].symbols.map((a, index, array) => array[index].isFocus = true);
            this._reelList[i].on(AppConst.REEL_ALL_DROP, this._onAllSymbolsDrop, this);
        }
    }

    start() {
        this._delaySpinReel = AppG.gameConst.getData("delaySpinReel");
        this._delaySpinMap = AppG.gameConst.delaySpinMap;
        this._defaultDesiredTime = AppG.gameConst.getData("defaultDesiredTime");
        this._delayStartSpinTime = AppG.gameConst.getData("delayStartSpinTime");
        this._turboModeTimeCoef = (AppG.isSuperTurbo) ? AppG.gameConst.superTurboModeTimeCoef : AppG.gameConst.getData("turboModeTimeCoef");

        this._oneSoundStop = AppG.isTurbo;
        this._reelsMoving = true;
        for (let i = 0; i < this._totalReel; i++) {
            this._reelList[i].saveSymbolPos();
            if (this._reelList[i].timerCallEnd) {
                this._reelList[i].timerCallEnd.destroy();
                this._reelList[i].timerCallEnd = null;
            }
        }

        this._scatterInReal = false;
        this._turboCoef = (AppG.isTurbo) ? 0 : 1;

        this._catchSymbol = NaN;
        this._totalStarted = 0;
        this._totalDroped = 0;
        this._totalComplete = 0;
        this._totalStopComplete = 0;
        this._stopDelayed = false;
        AppG.skipped = false;
        this._countScatters = 0;
        this._haveSymbolData = false;
        this._stopingReels = false;
        this._isOneStart = false;

        if (AppG.isPLayReSpins) {
            this._delaySpinMap = null;
            this._delaySpinReel = 0;
            this._delayStartSpinTime = 0;
            this._defaultDesiredTime = 0;
            for (let i = 0; i < this._totalReel; i++) {
                if (!Boolean(AppG.serverWork.reelsLock[i]))
                    this._reelList[i].blockReel();
            }
            this._state = this.S_CRASH;
            AppG.emit.emit(AppConst.DROP_E_REEL_CRASH);
        } else {
            this._state = this.S_DROP;
            AppG.emit.emit(AppConst.DROP_E_REEL_DROP);
        }

        if (this._delaySpinMap) {
            let timeDelay = this._delaySpinReel;
            this._countActive = 0;
            const countReel = this._delaySpinMap["delayVector"].length;
            for (let i = 0; i < countReel; i++) {
                const reelId = this._delaySpinMap["delayVector"][i];
                if (!this._reelList[reelId].isBlock) {
                    this._countActive++;
                    this._reelList[reelId].timerDelayStart = OMY.Omy.add.timer(timeDelay, this.delayedStart,
                        this, 0, false, true, 0, [this._reelList[reelId]]);
                    timeDelay += this._turboCoef * this._delaySpinMap["delayTime"][i];
                }
            }
        } else {
            let timeDelay = this._delaySpinReel;
            this._countActive = 0;
            for (let i = 0; i < this._totalReel; i++) {
                if (!this._reelList[i].isBlock) {
                    this._countActive++;
                    this._reelList[i].timerDelayStart = OMY.Omy.add.timer(timeDelay, this.delayedStart,
                        this, 0, false, true, 0, [this._reelList[i]]);
                    timeDelay += this._turboCoef * this._delayStartSpinTime;
                }
            }
        }

        AppG.emit.emit(AppConst.APP_REELBLOCK_START);
        this.spinTime = Date.now();
    }

    delayedStart(reel) {
        reel.timerDelayStart = null;
        reel.startSpinning(AppG.isTurbo, this._state === this.S_CRASH);
    }

    onReelPreEase(reelId, symbolId, first) {
        if (first) super.onReelPreEase(reelId);
    }

    stopSpinning() {
        if (this._stopSpinTimeout) {
            this._stopSpinTimeout = null;
        }
        this._stopingReels = true;
        if (this._state === this.S_CRASH) {
            this._state = this.S_FALL;
            AppG.emit.emit(AppConst.DROP_E_REEL_FALL);
        }

        if (AppG.skipped) {
            for (let i = 0; i < this._totalReel; i++) {
                if (!this._reelList[i].isBlock)
                    this._reelList[i].stopSpinning(this.getCombination(i).reverse());
            }
        } else {
            let timeDelay = 0;

            for (let i = 0; i < this._totalReel; i++) {
                if (!this._reelList[i].isBlock) {
                    timeDelay += this._delayDelayBetweenReelsTime * this._turboCoef;
                    this._reelList[i].timerCallEnd = OMY.Omy.add.timer(
                        timeDelay, this._delayCallEndSpin, this, 0, false, true, 0,
                        [this._reelList[i], this.getCombination(i).reverse()],
                    );
                }
            }
        }

    }

    getCombination(index) {
        if (AppG.serverWork.reelGrid && AppG.serverWork.reelGrid[index]) {
            return AppG.serverWork.reelGrid[index].concat();
        } else {
            let cstr = AppG.serverWork.currentReels[index];
            let pstr = cstr.substr(AppG.serverWork.reelStop[index], this._countSlot);
            if (pstr.length < this._countSlot) pstr += cstr.substr(0, this._countSlot - pstr.length);
            let arr = [];
            for (let i = 0; i < this._countSlot; i++) {
                arr.push(pstr.charAt(i));
            }
            return arr;
        }
    }

    skipSpin() {
        if (!AppG.skipped) {
            OMY.Omy.info('reels. skip spin');
            AppG.emit.emit(AppConst.APP_EMIT_SKIP_REEL);
            this._oneSoundStop = Boolean(GameConstStatic.S_reel_stop_all);
            AppG.skipped = true;
            for (let i = 0; i < this._totalReel; i++) {
                if (this._reelList[i].timerDelayStart) {
                    this._reelList[i].timerDelayStart.destroy();
                    this._reelList[i].timerDelayStart = null;
                    this._reelList[i].startSkipSpinning(AppG.isTurbo);
                    this._totalStarted++;
                }
                this._reelList[i].setSkip(this._state === this.S_DROP);
            }
            if (this._totalStarted >= this._countActive && this._stopDelayed) {
                this._stopDelayed = false;
                this.canStop();
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

    _onFinishSpins() {
        super._onFinishSpins();
        for (let i = 0; i < this._totalReel; i++) {
            if (this._reelList[i].isBlock)
                this._reelList[i].unBlockReel();
        }
        this._state = this.S_WAIT;
    }

    /**     * @private     */
    _onAllSymbolsDrop(index) {
        this._totalDroped++;
        if (this._totalDroped >= this._countActive) {
            if (this._state !== this.S_FALL) {
                this._state = this.S_FALL;
                AppG.emit.emit(AppConst.DROP_E_REEL_FALL);
            }
        }
    }

    get S_WAIT() {
        return 0;
    }

    get S_DROP() {
        return 1;
    }

    get S_FALL() {
        return 2;
    }

    get S_CRASH() {
        return 3;
    }
}
