import {AppG} from "../../AppG";
import {SlotSymbol} from "../../../app/display/reels/SlotSymbol";
import {AppConst} from "../../AppConst";

export class ReelBase extends OMY.OContainer {
    constructor(conf, index, initCombination) {
        super();
        this.setXY(conf["r1_x"][index], conf["r1_y"]);
        this._gdConf = conf;

        this.index = index;
        this.symbols = [];
        this.stopSymbols = null;
        this._slotSymbolClass = SlotSymbol;
        this._symbolHeight = AppG.gameConst.symbolHeight;

        this._configReel();
        this.speed = this.minSpeed;
        this.accelerationTween = null;
        this.deaccelerationTween = null;
        this.stops = false;
        this.spinning = false;
        this._forceStartSpin = false;

        this.symbolsCount = this._countSymb + this._countDownSymb + this._countUpSymb;
        this.moveLimit = this._symbolHeight * this.symbolsCount;
        this._isHardSkip = AppG.gameConst.hardSkip;
        this._hardSkipCoef = AppG.gameConst.hardSkipCoef;
        this._hardSkipBackCoef = AppG.gameConst.hardSkipBackCoef;

        this.initCombination = initCombination;

        this.createSymbols();

        this.isUpdate = true;
        this._otherVector = 1;
    }

    _configReel() {
        this.minSpeed = AppG.gameConst.getData("minSpeed");
        this.minSkipSpeed = AppG.gameConst.getData("minSkipSpeed");
        this.maxSpeed = AppG.gameConst.getData("maxSpeed");
        this.startSpeed = AppG.gameConst.getData("startReelSpeed") || this.maxSpeed;
        this.longSpinSpeed = AppG.gameConst.longReelSpeed;

        this._countSymb = AppG.gameConst.getData("countSlot");
        this._countDownSymb = AppG.gameConst.getData("countDown");
        this._countUpSymb = AppG.gameConst.getData("countUp");

        this._startBackInSpeed = AppG.gameConst.getData("startBackInSpeed");
        this._startBackInTime = AppG.gameConst.getData("startBackInTime");
        this._innerFinish = AppG.gameConst.getData("innerFinish");
        this._timeDownStartSpeed = AppG.gameConst.getData("timeDownStartSpeed");

        this._oneStopOnSkip = AppG.gameConst.getData("oneStopOnSkip");

        this._change2LongSpeedOnEnd = AppG.gameConst.change2LongSpeedOnEnd;
        this._longSpinEndSpeed = AppG.gameConst.longSpinEndSpeed;
        this._longSpinEndTime = AppG.gameConst.longSpinEndTime;
    }

    createSymbols() {
        for (let i = 0; i < this.symbolsCount; i++) {
            let symbol = new this._slotSymbolClass(this.index, this, i);
            if (i > (this._countUpSymb - 1) && i < this.symbolsCount - this._countDownSymb) {
                symbol.isFocus = true;
                symbol.setSymbol(this.initCombination[i - this._countUpSymb]);
            } else {
                symbol.setSymbol();
                symbol.isFocus = false;
            }
            this.addChild(symbol);
            this.symbols.push(symbol);
            symbol.y = i * this._symbolHeight;
            symbol.update();
        }
    }

    /** @public */
    saveSymbolPos() {
        for (let i = 0; i < this.symbolsCount; i++) {
            this.symbols[i].finalY = this.symbols[i].y;
        }
    }

    startSpinning(turbo = false) {
        this._innerStart = (AppG.isSuperTurbo) ? false : AppG.gameConst.getData("innerStart");
        this._skipped = false;
        this.stopSymbols = null;
        this.speed = this.otherVector * this.startSpeed;
        this.stops = this.spinning = false;
        this._callStopSpining = false;
        this._longSpin = false;
        this._onCompleteEmit = false;
        this._isStartStopReel = false;

        this._endBackInTime = AppG.gameConst.getData("endBackInTime");
        this._endBackInTime2 = AppG.gameConst.getData("endBackInTime2");
        this._endBackInTime3 = AppG.gameConst.getData("endBackInTime3") || 0;
        this._endBackCoef = AppG.gameConst.getData("endBackCoef");

        if (this._forceStartSpin) {
            this.spinning = true;
            let timeDelayStart = 0;
            for (let i = this._countSymb + this._countUpSymb - 1; i >= this._countUpSymb; i--) {
                OMY.Omy.add.timer(timeDelayStart, this.symbols[i].startSpin, this.symbols[i]);
                timeDelayStart += 0.1;
            }
            this.emit(AppConst.REEL_SPIN, this.index);
        } else if (this._innerStart) {
            this._countIner = 0;
            for (let i = 0; i < this.symbolsCount; i++) {
                OMY.Omy.add.tween(this.symbols[i],
                    {y: this.symbols[i].y - this.otherVector * this._symbolHeight * .25},
                    this._startBackInTime, this._startBackIn.bind(this));
            }
            this.emit(AppConst.REEL_INNER_START, this.index);
        } else {
            this.spinning = true;
            let accelerationTime = (AppG.isTurbo ? 0.5 : 1) * this._timeDownStartSpeed;
            this.accelerationTween = OMY.Omy.add.tween(this,
                {speed: this.otherVector * this.maxSpeed}, accelerationTime, this._onStartSpinning.bind(this));
            this.emit(AppConst.REEL_SPIN, this.index);
        }
    }

    _startBackIn() {
        if (++this._countIner < this.symbolsCount) return;
        this.spinning = true;
        this.speed = 0;
        let accelerationTime = (AppG.isTurbo ? 0.5 : 1) * this._timeDownStartSpeed;
        this.accelerationTween = OMY.Omy.add.tween(this,
            {speed: this.otherVector * this.maxSpeed}, accelerationTime, this._onStartSpinning.bind(this));
        this.emit(AppConst.REEL_SPIN, this.index);
    }

    _onStartSpinning() {
        this.accelerationTween = null;
    }

    stopSpinning(symbols) {
        if (this._callStopSpining) return;
        this._callStopSpining = true;
        this.final = [];
        for (let i = 0; i < symbols.length; i++) {
            this.final.push(symbols[i]);
        }

        if (this.stops || this.stopSymbols) {
            return;
        }

        let nullArray = [];
        if (this.otherVector === -1) {
            for (let i = 0; i < this._countDownSymb; i++) {
                nullArray.push(null);
            }
            this.stopSymbols = nullArray.concat(symbols);
        } else {
            for (let i = 0; i < this._countUpSymb; i++) {
                nullArray.push(null);
            }
            this.stopSymbols = symbols.concat(nullArray);
        }

        if (this.accelerationTween) {
            this.accelerationTween.kill();
            this.accelerationTween = null;
            if (this._longSpin && this._change2WaitSpeed)
                this.speed = this.otherVector * this.longSpinSpeed;
            else
                this.speed = this.otherVector * this.maxSpeed;
        }
        if (!this.deaccelerationTween) {
            if (this._longSpin && this._change2WaitSpeed)
                this.deaccelerationTween = OMY.Omy.add.tween(this, {speed: this.otherVector * this.longSpinSpeed}, 0.05);
            else if (!this._skipped)
                this.deaccelerationTween = OMY.Omy.add.tween(this, {speed: this.otherVector * this.minSpeed}, 0.05);
            else
                this.deaccelerationTween = OMY.Omy.add.tween(this, {speed: this.otherVector * this.minSkipSpeed}, 0.05);
        }
        if ((this._skipped && this._isHardSkip) || AppG.isSuperTurbo) {
            if (this.deaccelerationTween) {
                this.deaccelerationTween.kill();
                this.deaccelerationTween = null;
            }
            this.setHardSkip();
        }
    }

    offBlurForSymbols() {
        this.emit(AppConst.REEL_BLUR);
    }

    waitRollSpeed() {
        this.longSpinSpeed = AppG.gameConst.waitSpinSpeed;
        this._change2LongSpeedOnEnd = AppG.gameConst.changeWaitSpeedOnEnd;
        this._longSpinEndSpeed = AppG.gameConst.waitSpinEndSpeed;
        this._longSpinEndTime = AppG.gameConst.waitSpinEndTime;

        this.deaccelerationTween = OMY.Omy.add.tween(this, {speed: this.otherVector * this.longSpinSpeed}, 0.05);
        this._change2WaitSpeed = true;
    }

    /**     * @public     */
    longReel(time, changeSpeed = true, waitSymbol = null) {
        if (changeSpeed)
            this.speed = this.otherVector * this.longSpinSpeed;
        this._longSpin = true;
        this._waitSymbol = waitSymbol;
        this._change2WaitSpeed = changeSpeed;
        OMY.Omy.remove.timer(this._longSpinTimer);
        if (AppG.isTurbo) time *= 0.3;
        if (time > 0) this._longSpinTimer = OMY.Omy.add.timer(time, this._ofLongSpin, this);
    }

    /**     * @private     */
    _ofLongSpin() {
        this._longSpinTimer = null;
        OMY.Omy.remove.timer(this._longSpinTimer);

        this._longSpin = false;
        if (this._change2LongSpeedOnEnd) {
            if (this.deaccelerationTween) {
                this.deaccelerationTween.kill();
                this.deaccelerationTween = null;
            }
            for (let i = 0; i < this.symbols.length; i++) {
                this.symbols[i].updateStateImg(AppConst.SLOT_SYMBOL_NONE);
            }
            this.deaccelerationTween = OMY.Omy.add.tween(this,
                {speed: this.otherVector * this._longSpinEndSpeed}, this._longSpinEndTime);
        }
    }

    update() {
        if (!this.spinning || this._isBlock) return;

        if (this.stopSymbols && !this.stopSymbols.length) {
            if (this.stops) {
                return;
            }
            this.stops = true;
            this.stopSymbols = null;
            if (this.deaccelerationTween) {
                this.deaccelerationTween.kill();
                this.deaccelerationTween = null;
                this.speed = this.otherVector * this.minSpeed;
            }
            this.setFinalSymbolsLocation();
            for (let i = 0; i < this.symbolsCount; i++) {
                this.symbols[i].y = this.symbols[i].finalY;
            }

            if (!this._longSpin && !this._isStartStopReel) {
                this._isStartStopReel = true;
                this.emit(AppConst.REEL_BLUR);
            }
            this.emit(AppConst.REEL_INNER_END, this.index);
            if ((this._innerFinish && !this._skipped) || (this._skipped && !this._oneStopOnSkip)) {
                this.spinning = false;

                this._countIner = 0;

                let needY = Math.abs(this.otherVector * this.innerEdnPos);
                let beY = 0;
                for (let i = 0; i < this.symbolsCount; i++) {
                    beY += Math.abs(this.symbols[i].y - this.symbols[i].finalY);
                }
                beY = beY / this.symbolsCount;

                const needTween = needY > beY;
                const dy = 1 - (beY / needY);

                for (let i = 0; i < this.symbolsCount; i++) {
                    if (needTween) {
                        needY = this.otherVector * this.innerEdnPos;
                        OMY.Omy.add.tween(this.symbols[i],
                            {y: this.symbols[i].y + needY * dy},
                            this._endBackInTime * dy, this._onInnerEnd.bind(this),
                            {onCompleteParams: [this.symbols[i], this.symbols[i].finalY, this._endBackInTime3, dy, needY]});
                    } else {
                        this._onInnerEnd(this.symbols[i], this.symbols[i].finalY);
                    }
                }
            } else {
                for (let i = 0; i < this.symbolsCount; i++) {
                    this.symbols[i].y = this.symbols[i].finalY;
                }
                this.spinning = false;
                if (!this._onCompleteEmit) {
                    this._onCompleteEmit = true;
                    this.emit(AppConst.REEL_COMPLETE, this.index);
                }
            }
            return;
        }

        if (!AppG.isTurbo && this.stopSymbols && !this._longSpin && !this._isStartStopReel) {
            this._isStartStopReel = true;
            this.emit(AppConst.REEL_BLUR);
        }
        let symbol;
        for (let i = 0; i < this.symbolsCount; i++) {
            symbol = this.symbols[i];
            symbol.y += this.speed;
            if (this.otherVector === -1) {
                if (symbol.y < -this._symbolHeight * this._countUpSymb) {
                    symbol.y += this.moveLimit;
                    if (this.stopSymbols && !this._longSpin) {
                        const char = this.stopSymbols.pop();
                        symbol.setSymbol(char);
                        if (char) symbol.onReel = this._countSymb - (this.stopSymbols.length - this._countDownSymb);
                    } else {
                        symbol.setSymbol();
                    }
                }
            } else {
                if (symbol.y > this.moveLimit) {
                    symbol.y -= this.moveLimit;
                    if (this.stopSymbols && !this._longSpin) {
                        const char = this.stopSymbols.shift();
                        symbol.setSymbol(char);
                        if (char) symbol.onReel = this.stopSymbols.length - this._countUpSymb + 1;
                    } else {
                        symbol.setSymbol();
                    }
                }
            }
        }

    }

    _onInnerEnd(s, pos, innerUpY = 0, dy, needY) {
        if (innerUpY) {
            s.tweenInnerFinish = OMY.Omy.add.tween(s,
                {y: pos - (needY * dy) * 0.5},
                innerUpY * dy, this._onInnerFinally.bind(this),
                {onCompleteParams: [s, pos]});
        } else {
            this._onInnerFinally(s, pos);
        }
    }

    /**     * @private     */
    _onInnerFinally(s, pos) {
        s.tweenInnerFinish = OMY.Omy.add.tween(s,
            {y: pos},
            this._endBackInTime2, this._onInnerEndFinish.bind(this),
            {onCompleteParams: [s]});
    }

    /**     * @private     */
    _onInnerEndFinish(s) {
        s.tweenInnerFinish = null;
        if (++this._countIner >= this.symbolsCount) {
            for (let i = 0; i < this.symbolsCount; i++) {
                this.symbols[i].y = this.symbols[i].finalY;
            }
            if (!this._onCompleteEmit) {
                this._onCompleteEmit = true;
                this.emit(AppConst.REEL_COMPLETE, this.index);
            }
        }
    }

    /**     * @public     */
    setHardSkip() {
        if (this.stopSymbols) this.stopSymbols.length = 0;
        this._endBackInTime *= this._hardSkipCoef;
        this._endBackInTime2 *= this._hardSkipCoef;
        this._endBackInTime3 *= this._hardSkipCoef;
        this._endBackCoef *= this._hardSkipBackCoef;
    }

    /**     * @public     */
    setSkip() {
        if (this._longSpin) {
            this._longSpin = false;
            if (this._longSpinTimer) {
                this._longSpinTimer.destroy();
                this._longSpinTimer = null;
            }
        }
        this._skipped = true;

        if (this._isHardSkip) return;
        if (!this.spinning) {
            let haveOne = false;
            for (let i = 0; i < this.symbolsCount; i++) {
                if (this.symbols[i].tweenInnerFinish) {
                    haveOne = true;
                    this.symbols[i].tweenInnerFinish.kill();
                    this.symbols[i].tweenInnerFinish = null;
                    this.symbols[i].y = this.symbols[i].finalY;
                }
            }
            if (haveOne) {
                if (!this._onCompleteEmit) {
                    this._onCompleteEmit = true;
                    this.emit(AppConst.REEL_COMPLETE, this.index);
                }
            }
        }
    }

    /**     * @public     */
    forceSkip() {
        if (this._isBlock) return;
        if (this._isHardSkip) {
            this.setHardSkip();
            if (!this.spinning) {
                for (let i = 0; i < this.symbolsCount; i++) {
                    if (this.symbols[i].tweenInnerFinish) {
                        this.symbols[i].tweenInnerFinish.kill();
                        this.symbols[i].tweenInnerFinish = null;
                    }
                    OMY.Omy.remove.tween(this.symbols[i]);
                    this._onInnerEnd(this.symbols[i], this.symbols[i].finalY);
                }
            }
            return;
        }
        if (this.spinning) {
            if (!this._skipped) this.setSkip();
            if (this.deaccelerationTween) {
                this.deaccelerationTween.kill();
                this.deaccelerationTween = null;
            }
            this.speed = this.otherVector * this.maxSpeed;
        } else {
            for (let i = 0; i < this.symbolsCount; i++) {
                this.symbols[i].y = this.symbols[i].finalY;
                OMY.Omy.remove.tween(this.symbols[i]);
            }
            if (!this._onCompleteEmit) {
                this._onCompleteEmit = true;
                this.emit(AppConst.REEL_COMPLETE, this.index);
            }
        }
    }

    allReelsComplete() {
    }

    setFinalSymbolsLocation() {
        if (this.otherVector === -1) {
            for (let i = 0; i < this.symbolsCount; i++) {
                let symbol = this.symbols[i];
                if (symbol.y < -this._symbolHeight * this._countUpSymb) {
                    symbol.y += this.moveLimit;
                }
            }
        } else {
            for (let i = 0; i < this.symbolsCount; i++) {
                let symbol = this.symbols[i];
                if (symbol.y > this.moveLimit) {
                    symbol.y -= this.moveLimit;
                }
            }
        }
        OMY.OMath.sortNumber(this.symbols, "y");
        for (let i = 0; i < this.symbolsCount; i++) {
            let symbol = this.symbols[i];
            symbol.finalY = i * this._symbolHeight;
            symbol.isFocus = i >= this._countUpSymb && i < (this.symbols.length - this._countDownSymb);
            symbol.symbolIndex = i;
        }

        this.final.reverse();
        for (let i = this._countUpSymb; i < this.symbols.length - this._countDownSymb; i++) {
            this.symbols[i].setSymbol(this.final[i - this._countUpSymb]);
        }
    }

    unBlockReel() {
        if (this._isBlock) {
            this._isBlock = false;
        }
    }

    blockReel() {
        if (!this._isBlock) {
            this._isBlock = true;
        }
    }

    get symbolsList() {
        return this.symbols;
    }

    get isBlock() {
        return this._isBlock;
    }

    get isSkip() {
        return this._skipped;
    }

    get isTurbo() {
        return AppG.isTurbo;
    }

    get otherVector() {
        /*if (AppG.isFreeGame)
            return (this.index % 2) ? 1 : -1;
        else*/
        return this._otherVector;
    }

    set spinning(value) {
        this._spinning = value;
    }

    get spinning() {
        return this._spinning;
    }

    set speed(value) {
        this._speed = value;
    }

    get speed() {
        return this._speed;
    }

    get longSpin() {
        return this._longSpin;
    }

    get waitSymbol() {
        return this._waitSymbol;
    }

    get innerEdnPos() {
        return this._symbolHeight * this._endBackCoef;
    }
}
