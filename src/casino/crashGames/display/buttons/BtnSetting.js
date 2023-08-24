import {AppConst} from "../../../AppConst";
import {SlotButton} from "../../../display/SlotButton";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class BtnSetting extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;

        this.updateState(this._btnManager.state);
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        if (OMY.Omy.viewManager.getView(AppConst.W_LOCALISATION).isOpen) {
            OMY.Omy.viewManager.hideWindow(AppConst.W_LOCALISATION);
        } else {
            OMY.Omy.viewManager.showWindow(AppConst.W_LOCALISATION, false,
                OMY.Omy.viewManager.gameUI.getWindowLayer("c_setting_layer"));
        }
    }
}
