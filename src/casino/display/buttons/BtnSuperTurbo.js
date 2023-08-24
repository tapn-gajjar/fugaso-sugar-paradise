import {SlotButton} from "../SlotButton";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class BtnSuperTurbo extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;
        this._alwaysBlock = !AppG.isHaveTurbo;

        this.updateState(this._btnManager.state);
        AppG.emit.on(AppConst.APP_ON_TURBO, this._checkState, this);
        AppG.emit.on(AppConst.APP_ON_SUPER_TURBO, this._checkState, this);

        this.addOtherStates(this._graphic.json["states"]);
        if (this._alwaysBlock) {
            this.isBlock = true;
            this._graphic.renderable = false;
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
        if (AppG.isSuperTurbo) {
            AppG.isSuperTurbo = false;
            AppG.isTurbo = false;
        } else if (AppG.isTurbo) {
            AppG.isSuperTurbo = true;
        } else {
            AppG.isTurbo = true;
        }
    }

    onActive() {
        if (this._alwaysBlock) {
            this.isBlock = true;
            this._graphic.renderable = false;
            return;
        }
        super.onActive();
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _checkState() {
        if (AppG.isSuperTurbo) this._changeState("super");
        else if (AppG.isTurbo) this._changeState("turbo");
        else this._changeState("off");
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
