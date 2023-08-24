import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import CounterAnimate from "./CounterAnimate";

export class FreeCounter {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;

        /** @type {OMY.OTextBitmap} */
        this._tField = this._graphic.getChildByName("c_number").getChildByName("t_field");
        this._updateText();
        if (!this._graphic.getChildByName("r_mask").json["debug"])
            this._graphic.getChildByName("c_number").mask = this._graphic.getChildByName("r_mask");
        /** @type {CounterAnimate} */
        this._animate = new CounterAnimate(this._graphic.getChildByName("c_number"), this._gdConf["config"]);

        /** @type {OMY.OActorSpine} */
        this._aSpine = graphic.getChildByName("a_effect");
        this._aSpine.gotoAndStop(0);
        this._aSpine.visible = false;

        AppG.serverWork.on(AppConst.EMITSERVER_SEND_SPIN, this._sendSpin, this);
        AppG.emit.on(AppConst.APP_EMIT_STOP_EASE_REEL, this._endSpins, this);
    }

    _updateText(countFreeGame) {
        if (!AppG.isFreeGame) {
            if (AppG.beginFreeGame)
                this._tField.text = String(AppG.totalFreeGame - AppG.countFreeGame);
            else
                this._tField.text = "X";
        } else {
            countFreeGame = countFreeGame || AppG.countFreeGame;
            this._tField.text = String(AppG.totalFreeGame - countFreeGame);
            if (Number(this._tField.text) === 0) {
                this._tField.visible = false;
                OMY.Omy.add.tween(this._aSpine, {alpha: 0}, 0.2);
            }
        }
    }

    /** @public */
    startFree() {
        this._updateText();
        this._aSpine.visible = true;
        this._aSpine.alpha = 0;
        OMY.Omy.add.tween(this._aSpine, {alpha: 1}, 0.2);
        this._aSpine.play(true);
    }

    _sendSpin() {
        this._countReel = AppG.gameConst.countReel;
        if (AppG.isFreeGame) {
            this._updateText(AppG.countFreeGame + 1);
        } else {
            if (!this._tField.visible) {
                this._tField.visible = true;
                this._updateText();
            }
            this._animate.start();
        }
    }

    /**     * @private     */
    _endSpins() {
        if (--this._countReel > 0) return;
        if (!AppG.isFreeGame) {
            this._animate.end();
            this._updateText();
        }
    }

    /** @public */
    endFree() {
        this._aSpine.stop();
        this._aSpine.visible = false;
    }
}
