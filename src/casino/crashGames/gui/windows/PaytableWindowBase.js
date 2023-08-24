import {AppConst} from "../../../AppConst";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {CrashWBase} from "../CrashWBase";

export class PaytableWindowBase extends CrashWBase {
    constructor() {
        super();
    }

    _settingWindow() {
        this._wName = AppConst.W_PAY;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDPaytable");
        super._settingWindow();
    }

    _windowSizeUpdate() {
        super._windowSizeUpdate();
    }

    _createElements() {
        super._createElements();
        OMY.Omy.navigateBtn.updateState(AppConst.C_PAYTABLE);
    }

    _clearElements() {
        super._clearElements();
        OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
    }

    _onClose() {
        OMY.Omy.sound.play(GameConstStatic.S_help_close || GameConstStatic.S_btn_any);
    }
}
