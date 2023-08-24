import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class SlotSymbolActorBase extends OMY.OContainer {
    constructor(reelIndex, reelParent, symbolIndex) {
        super();

        this._gdConf = OMY.Omy.assets.getJSON("GDSlotSymbol");
        this._reelIndex = reelIndex;
        this._symbolIndex = symbolIndex;
        /** @type {Reel} */
        this._reelParent = reelParent;
        this._symbName = this._gdConf["symbName"];
        this.blurSymbName = this._gdConf["blurSymbName"];
        this._textureName = this._gdConf["textureName"];

        if (!SlotSymbolActorBase.RAND_SYMB[this._reelIndex])
            SlotSymbolActorBase.RAND_SYMB[this._reelIndex] = OMY.OMath.randomRangeInt(1, AppG.serverWork.currentReels[this._reelIndex].length - 5);

        if (this._gdConf["debug"]) {
            this._debugSymbol = OMY.Omy.add.sprite(this, 0, 0);
            this._debugSymbol.setAnchor(.5, .5);
            this._debugSymbol.tint = 0x5C5C5C;
        }
        /** @type {OMY.OActorSpine} */
        this._symbolS = OMY.Omy.add.actorJson(this, this._gdConf["spine_symbol"]);
        this._blurS = OMY.Omy.add.sprite(this, 0, 0, this._textureName);
        this._blurS.setAnchor(.5, .5);
        this._blurS.visible = false;

        this._symbState = 0;
        this._symbolName = null;
        this._stateName = this._symbName;
        this._isFocus = false;

        this._reelParent.on(AppConst.REEL_SPIN, this._startSpin, this);
        this._reelParent.on(AppConst.REEL_INNER_START, this._innerSpin, this);
        this._reelParent.on(AppConst.REEL_INNER_END, this._innerEndSpin, this);
        this._reelParent.on(AppConst.REEL_COMPLETE, this._stopSpin, this);
        this._reelParent.on(AppConst.REEL_BLUR, this._blurOffState, this);
        AppG.emit.on(AppConst.EMIT_IDLE_SYMBOL, this._onCheckIdleEffect, this);
        this._spinning = false;
        this._isBlurred = false;

        this._blurReelInSpin = AppG.gameConst.getData("blurInReelAnimation");
        this._turboCoef = AppG.gameConst.getData("turboModeTimeCoef") || 0.5;
        this._turboOffCoef = this._turboCoef * .2;
        this._startBlurTime = AppG.gameConst.getData("startBlurTime") || 0;

        this._blurYScale = AppG.gameConst.getData("blurYScale") || 1;
        this._blurScaleTimeOn = AppG.gameConst.getData("blurScaleTimeOn") || 0;
        this._blurScaleTimeOff = AppG.gameConst.getData("blurScaleTimeOff") || 0;
        this._useConfigBlur = AppG.gameConst.useConfigBlur;
        this._scaleTarget = this._blurS.scale;

        this._alphaNormalImg = AppG.gameConst.getData("alphaNormalImg") || false;
        this._blurImgAlpha = AppG.gameConst.getData("blurImgAlpha") || 0.8;
        this._blurImgStartAlpha = AppG.gameConst.getData("blurImgStartAlpha") || 0.4;
        this._blurImgTimeOn = AppG.gameConst.getData("blurImgTimeOn") || 0;
        this._blurImgTimeOff = AppG.gameConst.getData("blurImgTimeOff") || 0;

        if (this._gdConf["debug_rect"]) {
            OMY.Omy.add.rectJson(this,
                {
                    x: -AppG.gameConst.getData("symbolWidth") * .5,
                    y: -AppG.gameConst.getData("symbolHeight") * .5 + 1,
                    width: AppG.gameConst.getData("symbolWidth"),
                    height: AppG.gameConst.getData("symbolHeight") - 2,
                    alpha: 0.7,
                });
            OMY.Omy.add.rectJson(this,
                {
                    x: -AppG.gameConst.getData("symbolWidth") * .5,
                    y: -2,
                    width: AppG.gameConst.getData("symbolWidth"),
                    height: 4,
                    color: "0xff0015",
                });
        }

        this._realSlotMachine = AppG.gameConst.realSlotMachine;
        if (this._realSlotMachine) {
            this.isUpdate = true;
            this._yLimit = AppG.gameConst.slotMachineData("y_limit");
            this._dx = AppG.gameConst.slotMachineData("symbol_dx")[reelIndex];
            this._scaledy = AppG.gameConst.slotMachineData("symbol_scaleY");
            this._coefScaleX = AppG.gameConst.slotMachineData("scale_x_coef") || 1;
            this._coefScaleY = AppG.gameConst.slotMachineData("scale_y_coef") || 1;
            this._skewCheck = Boolean(AppG.gameConst.slotMachineData("skew_dx"));
            if (this._skewCheck)
                this._skewX = AppG.gameConst.slotMachineData("skew_dx")[reelIndex];
            this._saveY = -100;
            this._persent = 0;
            this._vector = 1;
        }

        this._checkSymbolPos = false;
        this.isUpdate = false;
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------
    _onCheckIdleEffect() {

    }

    _startSpin() {
        this._checkSymbolPos = false;
        if (!this._spinning) {
            if (this._blurReelInSpin) {
                if (!AppG.isSuperTurbo && this._startBlurTime)
                    this._startTimerBlur = OMY.Omy.add.timer(this._startBlurTime * this._turboCoef, this.updateStateImg, this, 0,
                        false, true, 0, [AppConst.SLOT_SYMBOL_BLUR]);
                else this.updateStateImg(AppConst.SLOT_SYMBOL_BLUR);
            }
            this._spinning = true;
        }
    }

    _innerSpin() {
    }

    _innerEndSpin() {
        this._blurOffState();
        this._playStopEffect();
    }

    _playStopEffect() {
        this._checkSymbolPos = false;
        if (this._gdConf[this._symbolName]) {
            this._symbolS.visible = false;
            /** @type {OMY.OActor} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf[this._symbolName]);
            this._effect.removeOnEnd = true;
            this._effect.play();
            this._effect.addComplete(this._showSymbol, this);
        }
    }

    _showSymbol() {
        this._effect = null;
        this._symbolS.visible = true;
    }

    /**     * @private     */
    _stopSpin() {
        this._blurOffState();
        this._spinning = false;
    }

    _winEffectState() {
        this.visible = false;
    }

    _defeatState() {
        if (this._startTimerBlur) {
            this._startTimerBlur.destroy();
            this._startTimerBlur = null;
        }
    }

    _noWinState() {
    }

    _blurState() {
        if (!this._isBlurred) {
            this._isBlurred = true;
            this._blurS.visible = true;
            this._startTimerBlur?.destroy();
            this._startTimerBlur = null;
            if (this._useConfigBlur && this._blurYScale !== 1) {
                if (this._blurScaleTimeOn) OMY.Omy.add.tween(this._scaleTarget, {y: this._blurYScale}, this._blurScaleTimeOn * this._turboCoef);
                else this._scaleTarget.y = this._blurYScale;
            }
            if (this.needBlur) {
                if (this._blurImgTimeOn) {
                    this._blurS.alpha = 0;
                    OMY.Omy.add.tween(this._blurS, {alpha: this._blurImgAlpha}, this._blurImgTimeOn * this._turboCoef);
                    OMY.Omy.add.tween(this._symbolS, {alpha: 0}, this._blurImgTimeOn * this._turboCoef);
                }
            } else {
                this._blurS.alpha = 0;
                this._symbolS.alpha = 1;
            }
        } else {
            if (this.needBlur) {
                this._blurS.alpha = 1;
                this._symbolS.alpha = 0;
            } else {
                this._blurS.alpha = 0;
                this._symbolS.alpha = 1;
            }
        }
        this._blurS.texture = this._gdConf["blur"][this._symbolName];
    }

    _blurOffState() {
        if (!this._isBlurred) return;
        this._isBlurred = false;

        if (this._blurImgTimeOn) {
            OMY.Omy.remove.tween(this._blurS);
            OMY.Omy.remove.tween(this._symbolS);
        }
        if (this._useConfigBlur) {
            OMY.Omy.remove.tween(this._scaleTarget);
            if (this._scaleTarget.y !== 1) {
                if (this._blurScaleTimeOff) OMY.Omy.add.tween(this._scaleTarget, {y: 1}, this._blurScaleTimeOff * this._turboOffCoef);
                else this._scaleTarget.y = 1;
            }
        }
        if (this._blurS.visible && this._blurS.alpha > 0) {
            if (this._blurImgTimeOff) {
                OMY.Omy.add.tween(this._blurS, {
                    alpha: this._blurImgStartAlpha,
                    onCompleteParams: [this._blurS],
                }, this._blurImgTimeOff * this._turboOffCoef, (target) => {
                    target.visible = false;
                });
                OMY.Omy.add.tween(this._symbolS, {alpha: 1}, this._blurImgTimeOff * this._turboOffCoef);
            } else {
                this._blurS.visible = false;
                this._symbolS.alpha = 1;
            }
        } else {
            this._blurS.visible = false;
        }

        this.updateStateImg(AppConst.SLOT_SYMBOL_NONE);
    }

    _hideState() {

    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    setSymbol(sName = null) {
        if (sName != null) this._symbolName = AppG.gameConst.convertChar(sName);
        else this._symbolName = AppG.gameConst.convertChar(this.randomSymbol);
        this._updateSymbolImg();
        this._isBlurred && this._blurState();
        if (this._debugSymbol) this._debugSymbol.texture = this._gdConf["symbol_sprite_textures"][this._symbolName];
    }

    _updateSymbolImg() {
    }

    updateStateImg(st) {
        if (this._symbState === st) return;
        if (!this.visible) this.visible = true;

        switch (st) {
            case AppConst.SLOT_SYMBOL_NONE:
                this._defeatState();
                break;

            case AppConst.SLOT_SYMBOL_NO_WIN:
                this._noWinState();
                break;

            case AppConst.SLOT_SYMBOL_WIN:
                this._winEffectState();
                break;

            case AppConst.SLOT_SYMBOL_HIDE:
                this._hideState();
                break;

            case AppConst.SLOT_SYMBOL_BLUR:
                this._blurState();
                break;

            default:
                OMY.Omy.warn("Not have this state", st);
                break;
        }
        this._symbState = st;
    }

    update() {
        super.update();
        this._realSlotMachine && this._checkX();
        if (this._checkSymbolPos && this.y > 100) {
            this._checkSymbolPos = false;
            AppG.emit.emit(GameConstStatic.SYMBOL_ON_REEL, this._reelIndex);
        }
    }

    /**     * @private     */
    _checkX() {
        this._saveY = this.y;
        let dy = Math.abs(this._yLimit - this.y) / this._yLimit;
        dy = (dy > 1) ? 1 : (dy < 0) ? 0 : dy;
        let newA = dy * this._dx;
        if (this.x !== newA) this.x = newA;
        if (this._scaledy) {
            newA = 1 - ((1 - this._scaledy) * dy) * this._coefScaleX
            if (this.scale.x !== newA) this.scale.x = newA;
            newA = 1 - ((1 - this._scaledy) * dy) * this._coefScaleY;
            if (this.scale.y !== newA) this.scale.y = newA;
        }
        if (this._skewCheck) {
            this._vector = (this.y < this._yLimit) ? -1 : 1;
            newA = this._vector * dy * this._skewX;
            if (this.skew.x !== newA) this.skew.x = newA;
        }
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------

    /**
     * @returns {String}
     */
    get symbolName() {
        return this._symbolName;
    }

    set isFocus(value) {
        this._symbolS.visible = this._isFocus = value;
    }

    get isFocus() {
        return this._isFocus;
    }

    get randomSymbol() {
        let index = SlotSymbolActorBase.RAND_SYMB[this._reelIndex] + 1;
        if (index >= AppG.serverWork.currentReels[this._reelIndex].length)
            index = 0;
        let symb = AppG.serverWork.currentReels[this._reelIndex].charAt(index);
        SlotSymbolActorBase.RAND_SYMB[this._reelIndex] = index;
        return symb;
    }

    get needBlur() {
        return true;
    }

    set symbolIndex(value) {
        this._symbolIndex = value;
    }

    get symbolIndex() {
        return this._symbolIndex;
    }

    set onReel(value) {
    }
}

SlotSymbolActorBase.RAND_SYMB = [];
