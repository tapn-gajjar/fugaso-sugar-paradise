import {SlotSymbolBase} from "../../../../casino/display/reels/SlotSymbolBase";
import {AppG} from "../../../../casino/AppG";
import {GameConstStatic} from "../../../GameConstStatic";
import {AppConst} from "../../../../casino/AppConst";

export class DropSymbol extends SlotSymbolBase {
    constructor(reelIndex, reelParent, symbolIndex) {
        super(reelIndex, reelParent, symbolIndex);
        this.blockSymbName = this._gdConf["blockSymbName"];

        this._alphaNotWin = Boolean(this._gdConf["alpha_not_win"]);
        this.blockAlpha = this._gdConf["block_alpha"];

        this._textureNotWin = (this._gdConf["tint_sprite"]) ? this._gdConf["tint_sprite"] : null;
        this._tintSprite = Boolean(this._gdConf["tint_not_win"]);
        if (this._tintSprite) {
            /** @type {OMY.OSprite} */
            this._blockS = OMY.Omy.add.sprite(this, 0, 0, this._textureName);
            this._blockS.setAnchor(.5, .5);
            this._blockS.tint = this._gdConf["tint_color"];
            this._blockS.kill();
        }

        this._isFall = false;
        this._isDrop = false;
        this._stopLimit = NaN;
        this._crashSymbol = false;
        this._isFallingSymbol = false;
        AppG.emit.on(GameConstStatic.E_STOP_SCATTER_EFFECT, this._onStopScatterWin, this);
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _startSpin() {
        if (this._crashSymbol) {
            this._crashSymbol = false;
            this.updateStateImg(this._saveState);
            this._saveState = null;
        }
        if (this._wild) {
            this._wild.destroy();
            this._wild = null;
            this._symbolS.renderable = true;
            if (!this._multi && this._imageName === "B") {
                this._multi = OMY.Omy.add.spriteJson(this, this._gdConf["multi"]);
                this._multi.getChildByName("t_multi").text = "x" + String(this._multiValue);
            }
        }

        this._removeEffect();
        super._startSpin();
    }

    _innerEndSpin(reelIndex, symbolIndex) {
        if (this._symbolIndex === symbolIndex) super._innerEndSpin();
    }

    _playStopEffect() {
        if (this._isLock) return;
        if (this._gdConf[this._imageName] && this._isFocus) {
            if (this._imageName === "A" && this._isFallingSymbol) {
                if (++DropSymbol.countScatter > 5) DropSymbol.countScatter = 5;
                OMY.Omy.sound.play(GameConstStatic["S_reel_scatter" + String(DropSymbol.countScatter)]);
            }
            // if (this._imageName === "B")
            //     OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
            this._symbolS.visible = false;
            this._effect?.destroy();
            /** @type {OMY.OActorSpine} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf[this._imageName]);
            this._effect.gotoAndPlay(0);
            if (this._multi) this.addChild(this._multi);
        }
        this._isFallingSymbol = false;
    }

    /**     * @private     */

    /* _onPlayIdle() {
         if (this._effect) {
             const conf = this._effect.json["idle"];
             this._effect.gotoAndPlay(0, true, conf["custom_a_name"]);
             // this._effect.x = conf.dx;
             // this._effect.y = conf.dy;
             // this._effect.scale.set(conf.scale);
             // this._effect.speed = conf.speed;
         }
     }*/

    /**     * @private     */
    _removeEffect() {
        if (this._effect) {
            this._effect.stop();
            this._effect.kill();
            this._effect = null;
            this._symbolS.visible = true;
        }
    }

    _winEffect() {
        if (this._alphaNotWin) {
            OMY.Omy.remove.tween(this);
            this.alpha = 1;
        }
        this._checkBlockState();
        super._winEffect();
        if (AppG.gameConst.isScatterSymbol(this.symbolName)) {
            return;
        }
        this._crashSymbol = true;
        if (this._multi) {
            OMY.Omy.remove.tween(this._multi);
            this._multi.destroy();
            this._multi = null;
        }
    }

    _noWinState() {
        super._noWinState();
        this._removeEffect();
        if (this._alphaNotWin && this.alpha === 1) {
            OMY.Omy.remove.tween(this);
            OMY.Omy.add.tween(this, {alpha: this.blockAlpha}, 0.3);
        }
        // this._stateName = this.blockSymbName;
        if (this._tintSprite && !this._blockS.active) {
            this._blockS.revive();
            this._blockS.alpha = 0;
            const texture = (this._textureNotWin) ? this._textureNotWin : this.blockSymbName;
            this._blockS.texture = texture + AppG.gameConst.symbolID(this._imageName);
            OMY.Omy.add.tween(this._blockS, {alpha: 1}, this._gdConf["block_tween"]);
        }
    }

    /**     * @private     */
    _checkBlockState() {
        if (!this._tintSprite) return;
        if (this._blockS.active) {
            OMY.Omy.add.tween(this._blockS, {alpha: 0}, this._gdConf["block_tween_end"], this._blockS.kill.bind(this._blockS));
        }
    }

    _defeatState() {
        if (this._alphaNotWin && this.alpha !== 1) {
            OMY.Omy.remove.tween(this);
            OMY.Omy.add.tween(this, {alpha: 1}, 0.3);
        }
        this._checkBlockState();
        this._removeEffect();
        if (this._symbolBg) {
            this._symbolBg.destroy();
            this._symbolBg = null;
        }
        super._defeatState();
    }

    updateStateImg(st) {
        if (this._crashSymbol) {
            this._saveState = st;
            return;
        }
        return super.updateStateImg(st);
    }

    setSymbol(sName = null, reelIndex, symbolIndex) {
        let result = super.setSymbol(sName);
        return result;
    }

    hardSetSymbol(sName = null, multi) {
        sName = (sName === "?") ? "I" : sName;
        super.setSymbol(sName);
        if (sName === "B") {
            this._multiValue = multi;
            if (!this._multi) this._multi = OMY.Omy.add.spriteJson(this, this._gdConf["multi"]);
            this._multi.getChildByName("t_multi").text = "x" + String(this._multiValue);
        }
    }

    resetSymbol() {
        this._isFallingSymbol = true;
        this.setSymbol("I");
    }

    clearForAll() {
        this.resetDropConfig();
        if (this._multi) {
            OMY.Omy.remove.tween(this._multi);
            this._multi.destroy();
            this._multi = null;
        }
    }

    resetDropConfig() {
        this.userData = null;
        this._isDrop = false;
        this._isFall = false;
        this._isLock = false;
        this._stopLimit = NaN;
        this._fallSName = null;
    }

    dropSpin(reset = false) {
        this._removeEffect();
        if (this._crashSymbol) {
            this._crashSymbol = false;
            this._saveState = this._saveState || AppConst.SLOT_SYMBOL_NONE;
            this.updateStateImg(this._saveState);
            this._saveState = null;
        }
        this.userData = null;
        this._isDrop = true;
        this._stopLimit = NaN;
    }

    setStopSymbol(sName) {
        this._bufferSName = sName;
    }

    fallSpin() {
        this.fallUserData = null;
        if (!this._isLock)
            this._isFall = true;
        if (!this._isDrop)
            this.setSymbol(this._bufferSName);
        else
            this._fallSName = this._bufferSName;
    }

    checkFallSymbol() {
        if (this._fallSName) {
            this.setSymbol(this._fallSName);
            this._fallSName = null;
        } else if (this._imageName === "B") {
            this.resetSymbol();
        }
        this._isFallingSymbol = true;
        if (this._multi) {
            OMY.Omy.remove.tween(this._multi);
            this._multi.destroy();
            this._multi = null;
        }
    }

    lock() {
        this._isLock = true;
    }

    unlock() {
        this._isLock = false;
    }

    setMulti(multi) {
        this._crashSymbol = false;
        this.updateStateImg(this._saveState);
        this._saveState = null;
        this.setSymbol("B");
        this._removeEffect();

        this._multiValue = multi;
        this._symbolS.renderable = false;
        this._wild?.destroy();
        /** @type {OMY.OActorSpine} */
        this._wild = OMY.Omy.add.actorJson(this, this._gdConf["B"]);
        this._wild.gotoAndPlay(0, false, this._wild.json["show"]);
        this._wild.addComplete(this._onPlayIdleWild, this, true);
        this._wild.addSpineEvent(this._onShowMulti, this, true);
        this._wild.removeOnEnd = true;
    }

    /**     * @private     */
    _onPlayIdleWild() {
        this._wild = null;
        this._symbolS.renderable = true;
    }

    /**     * @private     */
    _onShowMulti(spine, event) {
        if (event.data.name === "multi") {
            if (this._multiValue > 1 && !OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_multi))
                OMY.Omy.sound.play(GameConstStatic.S_wild_multi);
            this._multi?.destroy();
            this._multi = OMY.Omy.add.spriteJson(this, this._gdConf["multi"]);
            this._multi.getChildByName("t_multi").text = "x" + String(this._multiValue);
            this._multi.scale.set(0);
            this._multi.y = this._multi.json["tween_start"];
            OMY.Omy.add.tween(this._multi,
                {
                    y: this._multi.json["y"],
                    scaleX: 1,
                    scaleY: 1,
                    ease: this._multi.json["tween_ease"]
                },
                this._multi.json["tween_time"]);
        }
    }

    scatterFree() {
        if (AppG.gameConst.isScatterSymbol(this.symbolName)) {
            this._symbolS.visible = false;
            this._effect?.destroy();
            /** @type {OMY.OActorSpine} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf["A"]);
            this._effect.gotoAndPlay(0, true, this._effect.json["a_win"]);
        }
    }

    /**     * @private     */
    _onStopScatterWin() {
        if (AppG.gameConst.isScatterSymbol(this.symbolName)) this._removeEffect();
    }

    recoverWin() {
        this.updateStateImg(AppConst.SLOT_SYMBOL_WIN);
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------

    get isFall() {
        return this._isFall;
    }

    set isFall(value) {
        this._isFall = value;
    }

    get isDrop() {
        return this._isDrop;
    }

    set isDrop(value) {
        this._isDrop = value;
    }

    get isMove() {
        return this._isDrop || this._isFall;
    }

    set stopLimit(value) {
        this._stopLimit = value;
    }

    get stopLimit() {
        return this._stopLimit;
    }

    get isLock() {
        return this._isLock;
    }
}

DropSymbol.countScatter = 0;
