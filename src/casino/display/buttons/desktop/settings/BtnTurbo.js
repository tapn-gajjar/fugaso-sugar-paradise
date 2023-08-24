import {AppConst} from "../../../../AppConst";
import {AppG} from "../../../../AppG";
import {SlotButton} from "../../../SlotButton";
import {GameConstStatic} from "../../../../../app/GameConstStatic";

export class BtnTurbo extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;
        this._alwaysBlock = !AppG.isHaveTurbo;

        this.updateState(this._btnManager.state);
        AppG.emit.on(AppConst.APP_ON_TURBO, this._checkState, this);

        this.addOtherStates(this._graphic.json["states"]);
        if (this._alwaysBlock) {
            this.isBlock = true;
            this._graphic.tint = "0x3F4040";
        }
    }

    /** @public */
    addOtherStates(states) {
        this._states = states || {};
        this._states["default"] = {
            out: this._outTexture,
            over: this._overTexture,
            down: this._downTexture,
            block: this._blockrTexture,
        };

        this._checkState();
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        AppG.isTurbo = !AppG.isTurbo;
    }

    onActive() {
        if (this._alwaysBlock) {
            this.isBlock = true;
            this._graphic.tint = "0x3F4040";
            return;
        }
        super.onActive();
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _checkState() {
        if (AppG.isTurbo) {
            this._changeState("on");
        } else {
            this._changeState("off");
        }
    }

    _changeState(stateKey) {
        let state = this._states[stateKey] || this._states["default"];
        if (this._ico) {
            this._ico.json["out"] = state["out"];
            this._ico.json["over"] = state["over"];
            this._ico.json["down"] = state["down"];
            this._ico.json["block"] = state["block"];
            this._ico.texture = this._ico.json["out"];
        } else {
            this._graphic.changeTextures(state["out"], state["over"], state["down"], state["block"]);
        }
    }
}
