import {SlotButton} from "../../../SlotButton";
import {GameConstStatic} from "../../../../../app/GameConstStatic";

export class BtnWithIco extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;

        this.updateState(this._btnManager.state);
    }

    _destroy() {
        super._destroy();
    }

    onDoAction() {
        if (!this._graphic.renderable) return;
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    get stateName() {
        return this._stateName;
    }
}
