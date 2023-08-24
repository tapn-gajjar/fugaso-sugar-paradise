import {ReelBase} from "../ReelBase";
import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";
import {DropSymbol} from "../../../../app/display/dropType/reels/DropSymbol";

export class ReelDropBase extends ReelBase {
    constructor(conf, index, initCombination) {
        super(conf, index, initCombination);
    }

    createSymbols() {
        super.createSymbols();
        for (let i = 0; i < this.symbolsCount; i++) {
            let symbol = this.symbols[i];
            symbol.finalY = i * this._symbolHeight;
            symbol.isFocus = i >= this._countUpSymb && i < (this.symbols.length - this._countDownSymb);
            symbol.symbolIndex = i;
        }
    }

    _configReel() {
        this._slotSymbolClass = DropSymbol;
        this._countSymb = AppG.gameConst.getData("countSlot");
        this._countDownSymb = 0;
        this._countUpSymb = 0;
        this._totalDropped = 0;

        this.minSkipSpeed = AppG.gameConst.getData("minSkipSpeed");
        this.minSpeed = AppG.gameConst.getData("minSpeed");
        this.maxSpeed = AppG.gameConst.getData("maxSpeed");
        this.startSpeed = AppG.gameConst.getData("startReelSpeed") || this.maxSpeed;
        this._dropBetweenSymb = AppG.gameConst.getData("dropBetweenSymb");

        this._innerFinish = AppG.gameConst.getData("innerFinish");
        this._timeDownStartSpeed = AppG.gameConst.getData("timeDownStartSpeed");
        AppG.emit.on(AppConst.DROP_E_REEL_CRASH, this._onStartCrashMove, this);
    }

    startSkipSpinning(turbo = false) {
        this._configReelOnStart(turbo);
        for (let i = this._countSymb - 1; i >= 0; i--) {
            this.symbols[i].resetDropConfig();
            this.symbols[i].dropSpin();
            this.symbols[i].speed = this.otherVector * this.maxSpeed;
        }
    }

    /**     * @private     */
    _configReelOnStart(turbo) {
        this._isTurbo = turbo;
        this._dropBetweenSymbCoef = (turbo) ? AppG.gameConst.getData("dropBetweenSymbCoef") : 1;
        this._turboSpeedCoef = ((turbo) ? (AppG.gameConst.getData("turboSpeedCoef") || 2) : 1);
        if (AppG.isSuperTurbo) {
            this._dropBetweenSymbCoef = AppG.gameConst.getData("dropBetweenSymbCoefSuperTurbo") || .2;
            this._turboSpeedCoef = AppG.gameConst.getData("superTurboSpeedCoef") || 1.5;
        }

        this.minSpeed = this._turboSpeedCoef * AppG.gameConst.getData("minSpeed");
        this.maxSpeed = this._turboSpeedCoef * AppG.gameConst.getData("maxSpeed");
        this.startSpeed = this._turboSpeedCoef * (AppG.gameConst.getData("startReelSpeed") || this.maxSpeed);

        this._fallBetweenSymb = (turbo) ? 0 : AppG.gameConst.getData("fallBetweenSymb");

        this._isHardSkip = AppG.gameConst.hardSkip;
        this._skipped = false;
        this.stopSymbols = null;
        this.speed = this.otherVector * this.startSpeed;
        this.stops = this.spinning = false;
        this._callStopSpining = false;
        this._longSpin = false;
        this._onCompleteEmit = false;
        this._isStartStopReel = false;
        this._totalDropped = 0;
        this._crashMode = false;

        this._endBackInTime = AppG.gameConst.getData("endBackInTime");
        this._endBackInTime2 = AppG.gameConst.getData("endBackInTime2");
        this._endBackInTime3 = AppG.gameConst.getData("endBackInTime3") || 0;
        this._endBackCoef = AppG.gameConst.getData("endBackCoef");
        if (AppG.isSuperTurbo) {
            this._endBackInTime *= .7;
            this._endBackInTime2 *= .7;
            this._endBackInTime3 *= .7;
        }

        this.spinning = true;
    }

    _settingCrashReel() {

    }

    _onStartCrashMove() {
        if (!this.isBlock) {
            this._crashMode = true;
            this._settingCrashReel();
        }
    }

    startSpinning(turbo = false, crashMode = false) {
        this._configReelOnStart(turbo);
        if (crashMode) {
            this.emit(AppConst.REEL_SPIN, this.index);
            return;
        }
        let timeDelayStart = 0;
        for (let i = this._countSymb - 1; i >= 0; i--) {
            this.symbols[i].resetDropConfig();
            this.symbols[i].speed = this.startSpeed;
            this.symbols[i].userData = OMY.Omy.add.timer(timeDelayStart, this._startMoveSymbol, this,
                0, false, true, 0, [this.symbols[i]]);
            timeDelayStart += this._dropBetweenSymb * this._dropBetweenSymbCoef;
        }

        this.emit(AppConst.REEL_SPIN, this.index);
    }

    /**     * @private     */
    _startMoveSymbol(symbol) {
        symbol.dropSpin();
        let accelerationTime = (this._isTurbo ? 0.5 : 1) * this._timeDownStartSpeed;
        symbol.accelerationTween = OMY.Omy.add.tween(symbol,
            {
                speed: this.otherVector * this.maxSpeed,
                onCompleteParams: [symbol]
            },
            accelerationTime, this._onStartSpinning.bind(this));
    }

    _onStartSpinning(symbol) {
        symbol.accelerationTween = null;
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
        this._emitInnerEnd = false;
        this.stopSymbols = symbols.concat();
        this.stopSymbols.reverse();
        let countLock = 0;
        let timeDelayStart = 0;
        for (let i = this._countSymb - 1; i >= 0; i--) {
            if (this.symbols[i].isLock) countLock++;
            this.symbols[i].setStopSymbol(this.stopSymbols[i]);
            if (this._skipped) {
                this.symbols[i].fallSpin();
            } else {
                this.symbols[i].fallUserData = OMY.Omy.add.timer(timeDelayStart, this.symbols[i].fallSpin, this.symbols[i]);
                timeDelayStart += this._fallBetweenSymb * this._dropBetweenSymbCoef;
            }
        }
        this._countIner = countLock;
        while (countLock-- > 0) {
            this.stopSymbols.shift();
        }
        if (this._skipped && this._isHardSkip) this.setHardSkip();
    }

    update() {
        if (!this.spinning || this._isBlock) return;
        if (this.stopSymbols && !this.stopSymbols.length) {
            if (this.stops) {
                return;
            }
            this.stops = true;
            this.stopSymbols = null;
            this.spinning = false;
            if (!this._innerFinish) this._onCompleteSpin();
            return;
        }

        let symbol;
        for (let i = 0; i < this.symbolsCount; i++) {
            symbol = this.symbols[i];
            if (!symbol.isMove) continue;
            symbol.y += symbol.speed;
            if (this.otherVector === -1) {
                if (symbol.y < -this._symbolHeight * this._countUpSymb) {
                    if (symbol.isDrop) {
                        symbol.isDrop = false;
                        this.totalDropped++;
                        symbol.y = this.moveLimit + this._symbolHeight * i;
                        symbol.stopLimit = this._symbolHeight * i;
                        symbol.checkFallSymbol();
                    }
                } else if (symbol.y < symbol.stopLimit) {
                    if (this.stopSymbols) this.stopSymbols.pop();
                    symbol.isFall = false;
                    symbol.y = symbol.stopLimit;
                    this._symbolEndSpin(symbol, i);
                }
            } else {
                if (symbol.y > this.moveLimit) {
                    if (symbol.isDrop) {
                        symbol.isDrop = false;
                        this.totalDropped++;
                        symbol.y = -this._symbolHeight * (this.symbolsCount - i);
                        symbol.stopLimit = this._symbolHeight * i;
                        symbol.checkFallSymbol();
                    }
                } else if (symbol.y > symbol.stopLimit) {
                    if (this.stopSymbols) this.stopSymbols.shift();
                    symbol.isFall = false;
                    symbol.y = symbol.stopLimit;
                    this._symbolEndSpin(symbol, i);
                }
            }
        }
    }

    /**
     * @param {DropSymbol}symbol
     * @param {Number}index
     * @private
     */
    _symbolEndSpin(symbol, index) {
        this.emit(AppConst.REEL_INNER_END, this.index, index, !this._emitInnerEnd);
        if (!this._emitInnerEnd) this._emitInnerEnd = true;
        if (this._innerFinish) {
            let needY = this.otherVector * this.innerEdnPos;
            OMY.Omy.add.tween(symbol,
                {y: symbol.y + needY},
                this._endBackInTime, this._onInnerFinally.bind(this),
                {onCompleteParams: [symbol]});
        }
    }

    /**
     * @param {DropSymbol}symbol
     * @private
     */
    _onInnerFinally(symbol) {
        symbol.tweenInnerFinish = OMY.Omy.add.tween(symbol,
            {y: symbol.finalY},
            this._endBackInTime2, this._onInnerEndFinish.bind(this),
            {onCompleteParams: [symbol]});
    }

    /**     * @private     */
    _onInnerEndFinish(s) {
        s.tweenInnerFinish = null;
        if (++this._countIner >= this.symbolsCount) this._onCompleteSpin();
    }

    /**     * @public     */
    setSkip(isDropState) {
        this._skipped = true;
        if (isDropState)
            this._isHardSkip = false;
        if (this.spinning) {
            let symbol;
            for (let i = 0; i < this.symbolsCount; i++) {
                symbol = this.symbols[i];
                symbol.speed = this.otherVector * this.minSkipSpeed;
                if (symbol.accelerationTween) {
                    symbol.accelerationTween.kill();
                    symbol.accelerationTween = null;
                }
                if (symbol.userData) {
                    symbol.userData.destroy();
                    symbol.userData = null;
                    symbol.dropSpin();
                }
                if (symbol.fallUserData) {
                    symbol.fallUserData.destroy();
                    symbol.fallUserData = null;
                    symbol.fallSpin();
                }
                if (symbol.isDrop) {
                    symbol.isDrop = false;
                    this.totalDropped++;
                    if (this.otherVector === -1) {
                        symbol.y = this.moveLimit + this._symbolHeight * i;
                        symbol.stopLimit = this._symbolHeight * i;
                    } else {
                        symbol.y = -this._symbolHeight * (this.symbolsCount - i);
                        symbol.stopLimit = this._symbolHeight * i;
                    }
                    symbol.checkFallSymbol();
                }
            }
        }

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
            if (haveOne) this._onCompleteSpin();
        }
    }

    /**     * @public     */
    setHardSkip() {
        super.setHardSkip();
        let symbol;
        for (let i = 0; i < this.symbolsCount; i++) {
            symbol = this.symbols[i];
            symbol.isFall = false;
            symbol.y = symbol.stopLimit;
            this._symbolEndSpin(symbol, i);
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
        } else {
            for (let i = 0; i < this.symbolsCount; i++) {
                this.symbols[i].y = this.symbols[i].finalY;
                OMY.Omy.remove.tween(this.symbols[i]);
            }
            this._onCompleteSpin();
        }
    }

    /**     * @private     */
    _onCompleteSpin() {
        if (!this._onCompleteEmit) {
            this._onCompleteEmit = true;
            if (this._crashMode) {
                for (let i = 0; i < this.symbolsCount; i++) {
                    this.symbols[i].unlock();
                }
            }
            this.emit(AppConst.REEL_COMPLETE, this.index);
        }
    }

    setFinalSymbolsLocation() {
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

    get totalDropped() {
        return this._totalDropped;
    }

    set totalDropped(value) {
        this._totalDropped = value;
        if (this._totalDropped >= this.symbolsCount)
            this.emit(AppConst.REEL_ALL_DROP, this.index);
    }
}
