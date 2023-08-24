import {AppG} from "../AppG";
import {AppConst} from "../AppConst";

export class FreeCounterBase {
    constructor(graphic) {

        /** @type {OMY.OContainer} */
        this._graphic = graphic;

        this._gdConf = this._graphic.json;

        /** @type {OMY.OTextBitmap} */
        this._tField = this._graphic.getChildByName("t_field");
        this._updateText();
        this._graphic.visible = false;

        AppG.emit.on(AppConst.EMIT_MORE_FREE, this._onMoreFreeEmit, this);
    }

    _updateText(countFreeGame) {
        countFreeGame = countFreeGame || AppG.countFreeGame;
        this._tField.text = String(AppG.totalFreeGame - countFreeGame);
    }

    _onMoreFreeEmit() {
        this._updateText();
    }

    /** @public */
    startFree() {
        AppG.serverWork.on(AppConst.EMITSERVER_SEND_SPIN, this._sendSpin, this);
        this._updateText();

        this._graphic.visible = true;
    }

    _sendSpin() {
        this._updateText(AppG.countFreeGame + 1);
    }

    /** @public */
    endFree() {
        AppG.serverWork.off(AppConst.EMITSERVER_SEND_SPIN, this._sendSpin, this);
        this._graphic.visible = false;
    }
}
