import {SymbolEffectBase} from "../../../casino/display/win/SymbolEffectBase";
import {AppG} from "../../../casino/AppG";

export class SymbolEffect extends SymbolEffectBase {
    constructor() {
        super();
        if (this._gdConf["bg"])
            this._bg = OMY.Omy.add.spriteJson(this, this._gdConf["bg"]);
        this._animLayer = OMY.Omy.add.container(this);
        this._frameLayer = OMY.Omy.add.container(this);
        if (this._gdConf["frame_stat"])
            this._frame = OMY.Omy.add.spriteJson(this, this._gdConf["frame_stat"]);
        // this._tValue = OMY.Omy.add.textJson(this, this._gdConf["t_value"]);
    }

    kill() {
        if (this._particle) {
            this._particle.destroy();
            this._particle = null;
        }
        OMY.Omy.remove.tween(this._bg);
        if (this._actor) {
            OMY.Omy.remove.tween(this._actor);
            this._actor = null;
        }
        if (this._animFrame) {
            OMY.Omy.remove.tween(this._animFrame);
            this._animFrame = null;
        }
        if (this._img) {
            this._img.destroy();
            this._img = null;
        }
        // if (this._tValue.active)
        //     OMY.Omy.remove.tween(this._tValue);
        super.kill();
    }

    /**
     * @param {WinSymbolD}winData
     * @param {Number}id
     * @param {Boolean}isSkiped
     * @param {Boolean}isLoop
     */
    showSymbol(winData, id, isSkiped, isLoop) {
        if (winData.symbol === "A" && !isLoop) return;
        super.showSymbol(winData, id, isSkiped, isLoop);
        const reelId = winData.reelId;
        const symbolId = winData.symbolId;
        const symbolChar = winData.symbol;
        const isScatter = winData.isScatter;
        const lineNumber = winData.lineNumber;
        const countSymbol = winData.countSymbol;
        const isWin = winData.isWin;

        // if (this._bg)
        //     this._bg.texture = OMY.StringUtils.sprintf(this._bg.json.texture_str, (reelId + 1), this._gdConf["s_poss_" + String(symbolId + 1)]);
        // this._particle = OMY.Omy.add.revoltParticleEmitter(this._animLayer, this._gdConf["particle"]);
        // this._particle.start();
        if (!isWin) {
            this._img = OMY.Omy.add.spriteJson(this._animLayer, this._gdConf["s_symbol"]);
            this._img.texture = this._gdConf["symbol_texture"] + String(AppG.gameConst.symbolID(symbolChar));
            this._img.alpha = this._gdConf["no_win_alpha"];
        } else {
            this._actor = OMY.Omy.add.actorJson(this._animLayer, this._gdConf[symbolChar]);
            this._actor.gotoAndPlay(0, !isLoop);
        }

        // if (this._frame)
        //     this._frame.texture = OMY.StringUtils.sprintf(this._frame.json.texture_str, String(lineNumber + 1));
        /*if (isLoop) {
            this._animFrame = OMY.Omy.add.actorJson(this._frameLayer, this._gdConf["frame"]);
            this._animFrame.gotoAndPlay(0, true);
        }*/

        // if (winData.credit && id === 0) {
        //     this._tValue.revive();
        //     this._tValue.text = String(winData.credit);
        //     this._animate(this._tValue);
        // }
    }

    /**     * @private
     * @param {DisplayObject}graphic
     * */
    _animate(graphic) {
        graphic.scale.set(0);
        graphic.angle = 0;

        OMY.Omy.add.tween(graphic, {
            scaleX: 1, scaleY: 1,
            ease: "elastic.out(1, 0.3)",
        }, 0.9);
        OMY.Omy.add.tween(graphic, {
            scaleX: 2, scaleY: 2,
            delay: 1.3,
        }, 0.02);
        OMY.Omy.add.tween(graphic, {
            scaleX: 0, scaleY: 0,
            delay: 1.35,
        }, 0.2);
        OMY.Omy.add.tween(graphic, {
            delay: 1.35,
            angle: 180,
        }, 0.5);
    }
}