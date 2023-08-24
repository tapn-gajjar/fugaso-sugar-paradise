import {SlotButton} from "../SlotButton";

export class BtnSimple extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);
        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;

        this.updateState(this._btnManager.state);
    }
}
