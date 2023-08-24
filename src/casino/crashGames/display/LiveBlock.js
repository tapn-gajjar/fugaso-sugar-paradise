import {AppG} from "../../AppG";
import {CrashConst} from "../CrashConst";

export class LiveBlock {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._isEditMode = Boolean(this._gdConf["edit"]);
        /** @type {OMY.OTextBitmap} */
        this._tField = this._graphic.getChildByName("t_users");
        this._onUpdateCount();
        AppG.emit.on(CrashConst.EMIT_ON_COUNT_PLAYER, this._onUpdateCount, this);
    }

    /**     * @private     */
    _onUpdateCount() {
        this._tField.text = String(AppG.serverWork.playerCount);
    }

    destroy() {
        this._graphic = null;
        this._gdConf = null;
        this._tField = null;
        AppG.emit.off(CrashConst.EMIT_ON_COUNT_PLAYER, this._onUpdateCount, this);
    }
}
