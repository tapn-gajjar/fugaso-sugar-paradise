import {AppConst} from "../../AppConst";
import {SlotButton} from "../../display/SlotButton";

export class BTRulesWindow extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
        );

        this.updateState(this._btnManager.state);
    }

    onHide() {
        super.onBlock();
    }
}
