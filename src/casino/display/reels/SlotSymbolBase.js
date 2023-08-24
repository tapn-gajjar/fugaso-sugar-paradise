import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class SlotSymbolBase extends OMY.OContainer {
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

        if (!SlotSymbolBase.RAND_SYMB[this._reelIndex])
            SlotSymbolBase.RAND_SYMB[this._reelIndex] = OMY.OMath.randomRangeInt(1, AppG.serverWork.currentReels[this._reelIndex].length - 5);

        this._symbolS = OMY.Omy.add.sprite(this, 0, 0, this._textureName);
        this._symbolS.setAnchor(.5, .5);

        this._symbState = 0;
        this._imageName = null;
        this._stateName = this._symbName;
        this._isFocus = false;
        this._alwaysUpdateState = false;

        this._scaleTarget = this.scale;

        this._reelParent.on(AppConst.REEL_SPIN, this._startSpin, this);
        this._reelParent.on(AppConst.REEL_INNER_START, this._innerSpin, this);
        this._reelParent.on(AppConst.REEL_INNER_END, this._innerEndSpin, this);
        this._reelParent.on(AppConst.REEL_COMPLETE, this._stopSpin, this);
        this._reelParent.on(AppConst.REEL_BLUR, this._blurOffState, this);
        this._spinning = false;
        this._blurInReelAnimation = AppG.gameConst.getData("blurInReelAnimation");
        this._blurYScale = AppG.gameConst.getData("blurYScale") || 1;
        this._startBlurTime = AppG.gameConst.getData("startBlurTime") || 0;
        this._blurScaleTimeOn = AppG.gameConst.getData("blurScaleTimeOn") || 0;
        this._blurScaleTimeOff = AppG.gameConst.getData("blurScaleTimeOff") || 0;
        this._useConfigBlur = AppG.gameConst.useConfigBlur;

        this._turboCoef = AppG.gameConst.getData("turboModeTimeCoef") || 0.5;

        this._blurImg = AppG.gameConst.getData("blurImg") || false;
        this._alphaNormalImg = AppG.gameConst.getData("alphaNormalImg") || false;
        this._blurImgAlpha = AppG.gameConst.getData("blurImgAlpha") || 0.8;
        this._blurImgStartAlpha = AppG.gameConst.getData("blurImgStartAlpha") || 0.4;
        this._blurImgTimeOn = AppG.gameConst.getData("blurImgTimeOn") || 0;
        this._blurImgTimeOff = AppG.gameConst.getData("blurImgTimeOff") || 0;
        if (this._blurImg) {
            this._blurS = OMY.Omy.add.sprite(this, 0, 0, this._textureName);
            this._blurS.setAnchor(.5, .5);
            this._blurS.visible = false;
            this._scaleTarget = this._blurS.scale;
        }
        this._blurIgnoreList = AppG.gameConst.blurIgnoreList;

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
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _startSpin() {
        if (!this._spinning) {
            if (this._blurInReelAnimation) {
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
        if (this._blurInReelAnimation) {
            if (this._blurImg && this._blurS?.visible) {
                OMY.Omy.remove.tween(this._blurS);
                this._blurS.alpha = this._blurImgStartAlpha;
                this._blurS.visible = false;
                OMY.Omy.remove.tween(this._symbolS);
                this._symbolS.alpha = 1;
            }
            this.updateStateImg(AppConst.SLOT_SYMBOL_NONE);
        }
        this._playStopEffect();
    }

    _playStopEffect() {
        if (this._gdConf[this._imageName]) {
            this._symbolS.visible = false;
            /** @type {OMY.OActor} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf[this._imageName]);
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
        if (this._blurInReelAnimation) {
            this.updateStateImg(AppConst.SLOT_SYMBOL_NONE);
        }
        this._spinning = false;
    }

    _winEffect() {
        this.updateImg();
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
        this._startTimerBlur?.destroy();
        this._startTimerBlur = null;
        if (this._useConfigBlur && this._blurYScale !== 1 && this.needBlur) {
            if (this._blurScaleTimeOn)
                OMY.Omy.add.tween(this._scaleTarget, {y: this._blurYScale}, this._blurScaleTimeOn * this._turboCoef);
            else
                this._scaleTarget.y = this._blurYScale;
        }
    }

    /**     * @private     */
    _blurOffState() {
        if (this._symbState !== AppConst.SLOT_SYMBOL_NONE) {
            if (this._blurS?.visible) {
                if (this._blurImgTimeOff) {
                    OMY.Omy.remove.tween(this._blurS);
                    OMY.Omy.add.tween(this._blurS, {
                        alpha: this._blurImgStartAlpha,
                        onCompleteParams: [this._blurS],
                    }, this._blurImgTimeOff * this._turboCoef, (target) => {
                        target.visible = false;
                    });
                    if (this._alphaNormalImg)
                        OMY.Omy.add.tween(this._symbolS, {alpha: 1}, this._blurImgTimeOff * this._turboCoef);
                } else {
                    this._blurS.visible = false;
                }
            }
            this.updateStateImg(AppConst.SLOT_SYMBOL_NONE);
        }
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    setSymbol(sName = null) {
        // if (this._imageName === sName && sName != null) return false;

        if (sName != null) {
            this._imageName = AppG.gameConst.convertChar(sName);
        } else {
            this._imageName = AppG.gameConst.convertChar(this.randomSymbol);
        }
        if (this._symbState === AppConst.SLOT_SYMBOL_BLUR) {
            if (!this.needBlur) {
                if (this._blurS) {
                    if (this._blurS.visible) this._blurS.visible = false;
                } else if (this._stateName === this.blurSymbName) {
                    this._stateName = this._symbName;
                }
                if (this._useConfigBlur && this._blurYScale !== 1) {
                    this._scaleTarget.y = 1;
                }
            } else {
                if (this._blurS) {
                    if (!this._blurS.visible) this._blurS.visible = true;
                } else if (this._stateName !== this.blurSymbName) {
                    this._stateName = this.blurSymbName;
                }
                if (this._useConfigBlur && this._blurYScale !== this._blurYScale) {
                    this._scaleTarget.y = this._blurYScale;
                }
            }
        }

        this.updateImg();
        return true;
    }

    updateStateImg(st) {
        if (!this._alwaysUpdateState && this._symbState === st) return;

        if (!this.visible)
            this.visible = true;
        if (this._useConfigBlur && this._scaleTarget.y !== 1) {
            if (this._blurScaleTimeOff) {
                OMY.Omy.remove.tween(this._scaleTarget);
                OMY.Omy.add.tween(this._scaleTarget, {y: 1}, this._blurScaleTimeOff * this._turboCoef);
            } else {
                this._scaleTarget.y = 1;
            }
        }

        switch (st) {
            case AppConst.SLOT_SYMBOL_NONE:
                this._stateName = this._symbName;
                this._defeatState();
                break;

            case AppConst.SLOT_SYMBOL_NO_WIN:
                this._noWinState();
                break;

            case AppConst.SLOT_SYMBOL_WIN:
                this._stateName = this._symbName;
                this._winEffect();
                break;

            case AppConst.SLOT_SYMBOL_HIDE:
                break;

            case AppConst.SLOT_SYMBOL_BLUR:
                if (this._blurS && this.needBlur) {
                    this._blurS.visible = true;
                    this._blurS.texture = this.blurSymbName + AppG.gameConst.symbolID(this._imageName);
                    if (this._blurImgTimeOn) {
                        this._blurS.alpha = 0;
                        OMY.Omy.add.tween(this._blurS, {alpha: this._blurImgAlpha}, this._blurImgTimeOn * this._turboCoef);
                        if (this._alphaNormalImg)
                            OMY.Omy.add.tween(this._symbolS, {alpha: 0}, this._blurImgTimeOn * this._turboCoef);
                    }
                } else {
                    this._stateName = this.blurSymbName;
                }
                this._blurState();
                break;

            default:
                OMY.Omy.warn("Not have this state", st);
                break;
        }

        this._symbState = st;
        this.updateImg();
    }

    updateImg() {
        let newTextureName = null;
        newTextureName = this._stateName + AppG.gameConst.symbolID(this._imageName);

        if (this._textureName === newTextureName) return;
        this._textureName = newTextureName;

        this._symbolS.texture = this._textureName;
        if (this._blurS?.visible)
            this._blurS.texture = this.blurSymbName + AppG.gameConst.symbolID(this._imageName);

    }

    update() {
        super.update();
        this._realSlotMachine && this._checkX();
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
        return this._imageName;
    }

    set isFocus(value) {
        this._symbolS.visible = this._isFocus = value;
    }

    get isFocus() {
        return this._isFocus;
    }

    get textureName() {
        return this._textureName;
    }

    get randomSymbol() {
        let index = SlotSymbolBase.RAND_SYMB[this._reelIndex] + 1;
        if (index >= AppG.serverWork.currentReels[this._reelIndex].length)
            index = 0;
        let symb = AppG.serverWork.currentReels[this._reelIndex].charAt(index);
        SlotSymbolBase.RAND_SYMB[this._reelIndex] = index;
        return symb;
    }

    get needBlur() {
        return !OMY.OMath.inArray(this._blurIgnoreList, this._imageName);
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

SlotSymbolBase.RAND_SYMB = [];
