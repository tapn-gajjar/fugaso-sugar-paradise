import {SlotSymbolBase} from "../../../casino/display/reels/SlotSymbolBase";
import {AppConst} from "../../../casino/AppConst";
import {AppG} from "../../../casino/AppG";
import {GameConstStatic} from "../../GameConstStatic";

export class SlotSymbol extends SlotSymbolBase {
    constructor(reelIndex, reelParent, symbolIndex) {
        super(reelIndex, reelParent, symbolIndex);
        this.blockSymbName = this._gdConf["blockSymbName"];
        this.blockAlpha = this._gdConf["block_alpha"];
        this._checkSymbolPos = false;
        this.isUpdate = true;
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------
    playWildWaitEffect() {
        this._symbolS.visible = false;
        const onActiveWait = this._reelIndex === AppG.state.mainView.activeWaitReelIndex;
        OMY.Omy.sound.play((onActiveWait) ? GameConstStatic.S_wild_coins : GameConstStatic.S_wild_drop);
        // const effect = (onActiveWait) ?
        //     this._gdConf["wild_second"] : this._gdConf["wild"];
        const effect =  this._gdConf["wild"];
        /** @type {OMY.OActorSpine} */
        this._effect = OMY.Omy.add.actorJson(this, effect);
        this._effect.gotoAndPlay(0);
        this._effect.addComplete(this._playWin, this, true);
    }

    /**     * @private     */
    _playWin() {
        if (this._effect) {
            this._effect.gotoAndPlay(0, true, this._effect.json["cannon_win"]);
        }
    }

    holdSymbol() {
        this.updateStateImg(AppConst.SLOT_SYMBOL_NO_WIN);
        this._isHold = true;
        if (OMY.OMath.inArray(AppG.gameConst.getData("longReelSymbol"), this._imageName)) {
            this._symbolS.visible = false;
            /** @type {OMY.OActorSpine} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf["wait"]);
            this._effect.play(true);
        }
    }

    unHoldSymbol() {
        this._isHold = false;
        this._removeEffect();
        this.updateStateImg(AppConst.SLOT_SYMBOL_NONE);
    }

    /**     * @private     */
    _removeEffect() {
        if (this._effect) {
            this._effect.stop();
            this._effect.kill();
            this._effect = null;
            this._symbolS.visible = true;
        }
    }

    respinSymbol(spine) {
        this._removeEffect();
        this._isRespinHold = true;
        /** @type {OMY.OActorSpine} */
        this._respinSpine = spine;
        // this.updateStateImg(AppConst.SLOT_SYMBOL_NO_WIN);
        // this._symbolS.visible = false;
        // /** @type {OMY.OActorSpine} */
        // this._effect = OMY.Omy.add.actorJson(this, this._gdConf["wild"]);
        // this._effect.play(true);
        this.visible = false;
    }

    restartAnimation() {
        // this._effect.gotoAndPlay(0, true);
    }

    unRespinSymbol() {
        if (this._isRespinHold) {
            this._respinSpine = null;
            if (this.alpha !== 1) {
                this._symbState = AppConst.SLOT_SYMBOL_WIN;
            }
            this._isRespinHold = false;
            this.visible = true;
            this._symbolS.visible = true;
            // this.updateStateImg(AppConst.SLOT_SYMBOL_NONE);
        }
    }

    _noWinState() {
        super._noWinState();
        if (this._respinSpine && this._respinSpine.alpha === 1) {
            OMY.Omy.remove.tween(this._respinSpine);
            OMY.Omy.add.tween(this._respinSpine, {alpha: this.blockAlpha}, 0.3);
        }
        if (this.alpha === 1) {
            OMY.Omy.remove.tween(this);
            OMY.Omy.add.tween(this, {alpha: this.blockAlpha}, 0.3);
        }
        // this._stateName = this.blockSymbName;
    }

    _defeatState() {
        if (this._respinSpine) {
            OMY.Omy.remove.tween(this._respinSpine);
            if (this._respinSpine.alpha !== 1)
                OMY.Omy.add.tween(this._respinSpine, {alpha: 1}, 0.3);
        }
        if (this.alpha !== 1) {
            OMY.Omy.remove.tween(this);
            OMY.Omy.add.tween(this, {alpha: 1}, 0.3);
        }
        if (this._effect) {
            this._effect.stop();
            this._effect.kill();
            this._effect = null;
            this._symbolS.visible = true;
        }
        if (this._symbolBg) {
            this._symbolBg.destroy();
            this._symbolBg = null;
        }
        super._defeatState();
    }

    updateStateImg(st) {
        if (this._isHold || this._isRespinHold) {
            if (st === AppConst.SLOT_SYMBOL_NO_WIN)
                this._noWinState();
            if (st === AppConst.SLOT_SYMBOL_NONE || st === AppConst.SLOT_SYMBOL_WIN) {
                this._defeatState();
            }
            return;
        }
        return super.updateStateImg(st);
    }

    scatterFree(loop = false) {
        if (AppG.gameConst.isScatterSymbol(this._imageName)) {
            this._symbolS.visible = false;
            /** @type {OMY.OActorSpine} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf["scatter"]);
            if (!loop)
                this._effect.totalLoop = 2;
            this._effect.gotoAndPlay(0, true);
        }
    }

    /*updateImg() {
        let result = super.updateImg();
        if (this._imageName === "A" && !this._debugImg) {
            this._debugImg = OMY.Omy.add.actorJson(this, this._gdConf["wild"]);
            this._debugImg.play(true);
        }
        return result;
    }*/

    setSymbol(sName = null) {
        this._checkSymbolPos = false;
        if (this._reelIndex === AppG.state.mainView.activeWaitReelIndex && !sName) {
            if (--SlotSymbol.countNotWild[this._reelIndex] <= 0) {
                sName = "A";
                SlotSymbol.countNotWild[this._reelIndex] = OMY.OMath.randomRangeInt(
                    AppG.gameConst.game_const["count_not_wild"][0],
                    AppG.gameConst.game_const["count_not_wild"][1]);
            }
        }
        let result = super.setSymbol(sName);
        if (AppG.isMoveReels && this._imageName === "A") {
            this._checkSymbolPos = true;
        }
        return result;
    }

//-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    update() {
        super.update();
        if (this._checkSymbolPos && this.y > 100) {
            this._checkSymbolPos = false;
            AppG.emit.emit(GameConstStatic.SYMBOL_ON_REEL, this._reelIndex);
        }
    }
}
