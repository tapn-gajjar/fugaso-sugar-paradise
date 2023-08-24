import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class BtnToggle extends SlotButton {
    constructor(graphic, onClick = null, param = null, defaultSOund = true) {
        super(graphic, onClick, param);
        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;
        this._defaultSOund = defaultSOund;

        this._toggle = false;

        this.updateState(this._btnManager.state);

        this.addOtherStates(this._graphic.json["states"]);
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

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
        this._defaultSOund  && OMY.Omy.sound.play(GameConstStatic.S_btn_any);
       
        this._toggle = !this._toggle;

        this._checkState();
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _destroy() {
        this._states = null;
        super._destroy();
    }

    _checkState() {
        if (this._toggle) {
            this._changeState("on");
        } else {
            this._changeState("off");
        }
    }

    _changeState(stateKey) {
        let state = this._states[stateKey] || this._states["default"];
        this._graphic.changeTextures(state["out"], state["over"], state["down"], state["block"]);
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------

    get toggle() {
        return this._toggle;
    }

    set toggle(value) {
        this._toggle = value;
        this._checkState();
    }
}
