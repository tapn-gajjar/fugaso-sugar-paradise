import {SlotButton} from "../../../display/SlotButton";
import {AppConst} from "../../../AppConst";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class BtnPayTable extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
        );
        this._regNoActiveStates(
            AppConst.C_PAYTABLE,
            AppConst.C_BLOCK,
        );

        this.updateState(this._btnManager.state);
    }

    onHide() {
        super.onHide();
    }

    onBlock() {
        super.onBlock();
    }

    onActive() {
        super.onActive();
    }

    onDoAction() {
        if (!this._graphic.renderable) return;
        OMY.Omy.sound.play(this._buttonSound || GameConstStatic.S_button_menu);
        if (OMY.Omy.viewManager.getView(AppConst.W_PAY).isOpen) {
            OMY.Omy.viewManager.hideWindow(AppConst.W_PAY);
        } else {
            OMY.Omy.viewManager.showWindow(AppConst.W_PAY, true, OMY.Omy.viewManager.gameUI.getWindowLayer("c_pay_layer"));
        }
    }
}
