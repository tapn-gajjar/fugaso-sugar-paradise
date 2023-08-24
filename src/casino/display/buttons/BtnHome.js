import {AppG} from "../../AppG";
import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class BtnHome extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);
        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;

        this.updateState(this._btnManager.state);
    }

    onDoAction() {
        if (!this._graphic.renderable) return;
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        location.href = AppG.closeUrl;
    }
}
