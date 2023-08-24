import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import CounterAnimate from "./CounterAnimate";

export class MultiCounter {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;

        /** @type {OMY.OTextBitmap} */
        this._tField = this._graphic.getChildByName("c_number").getChildByName("t_value");
        this._tField.text = String(AppG.serverWork.multi);
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

    _sendSpin() {
        this._countReel = AppG.gameConst.countReel;
        if (this._aSpine.visible) {
            OMY.Omy.add.tween(this._aSpine, {alpha: 0, onCompleteParams: [this._aSpine]}, 0.2,
                (target) => {
                    target.visible = false;
                    target.stop();
                });
        }
        if (!AppG.isFreeGame) this._animate.start();
    }

    /**     * @private     */
    _endSpins() {
        if (--this._countReel > 0) return;
        if (!AppG.isFreeGame) this._animate.end();
        this._tField.text = String(AppG.serverWork.multi);
    }

    winInGame() {
        this._aSpine.visible = true;
        this._aSpine.alpha = 0;
        OMY.Omy.add.tween(this._aSpine, {alpha: 1}, 0.2);
        this._aSpine.play(true);
    }
}
