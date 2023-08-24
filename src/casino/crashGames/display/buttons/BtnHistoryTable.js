import {AppConst} from "../../../AppConst";
import {SlotButton} from "../../../display/SlotButton";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {AppG} from "../../../AppG";
import {CrashConst} from "../../CrashConst";

export class BtnHistoryTable extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
        );
        this._regNoActiveStates(
            AppConst.C_PAYTABLE,
            AppConst.C_BLOCK,
        );

        AppG.emit.on(CrashConst.EMIT_TABLE_TOGGLE, this._toggle, this);
        this._isActive = false;
        this.updateState(this._btnManager.state);
        AppG.emit.on(CrashConst.G_START_RECONNECT, this._reConnectStart, this);
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        AppG.emit.emit(CrashConst.EMIT_TABLE_TOGGLE, CrashConst.T_HISTORY);
    }

    _toggle(state) {
        this._isActive = (state === CrashConst.T_HISTORY && !this._isActive);
        this._graphic.changeTextures(this._graphic.json[(this._isActive) ? "texture_active" : "texture_wait"],
            null, null, this._graphic.json["block"]);
    }

    /**     * @private     */
    _reConnectStart() {
        if (this._isActive) {
            this._isActive = false;
            this._graphic.changeTextures(this._graphic.json[(this._isActive) ? "texture_active" : "texture_wait"],
                null, null, this._graphic.json["block"]);
        }
    }
}
