import {AppConst} from "../../../../AppConst";
import {SlotButton} from "../../../SlotButton";
import {GameConstStatic} from "../../../../../app/GameConstStatic";
import {AppG} from "../../../../AppG";

export class BtnMenuDesktop extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;

        this.updateState(this._btnManager.state);

        AppG.emit.on(AppConst.APP_MENU_DESK_TOGGLE, this._checkState, this);
        this._isMenuClose = true;

        this.addOtherStates(this._graphic.json["states"]);
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

    _destroy() {
        AppG.emit.off(AppConst.APP_MENU_DESK_TOGGLE, this._checkState, this);
        super._destroy();
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
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        this._isMenuClose = !this._isMenuClose;
        AppG.emit.emit(AppConst.APP_MENU_DESK_TOGGLE, !this._isMenuClose);
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _checkState() {
        if (this._isMenuClose) {
            this._changeState("off");
        } else {
            this._changeState("on");
        }
    }

    _changeState(stateKey) {
        let state = this._states[stateKey] || this._states["default"];
        this._graphic.changeTextures(state["out"], state["over"], state["down"], state["block"]);
    }
}
