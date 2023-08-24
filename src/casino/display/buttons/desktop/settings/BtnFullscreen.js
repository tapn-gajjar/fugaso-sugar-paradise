import {AppConst} from "../../../../AppConst";
import {SlotButton} from "../../../SlotButton";
import {GameConstStatic} from "../../../../../app/GameConstStatic";

export class BtnFullscreen extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;

        this.updateState(this._btnManager.state);
        OMY.Omy.scaleManager.addFullChange(this._checkState, this);

        this.addOtherStates(this._graphic.json["states"]);
    }

    /** @public */
    addOtherStates(states) {
        this._states = states || {};
        this._states["default"] = {
            out: this._outTexture,
            over: this._overTexture,
            down: this._downTexture,
            block: this._blockrTexture
        };

        this._checkState();
    }

    _destroy() {
        OMY.Omy.scaleManager.removeFullChange(this._checkState, this);
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
        if (OMY.Omy.scaleManager.isFullScreen) {
            OMY.Omy.scaleManager.stopFullScreen();
            OMY.Omy.add.timer(0.1, window.gameResize, window, 3);
        } else {
            OMY.Omy.scaleManager.startFullScreen(AppConst.GAME_CONTAINER);
        }

        this._checkState();
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _checkState() {
        if (OMY.Omy.scaleManager.isFullScreen) {
            this._changeState("off");
        }
        else {
            this._changeState("on");
        }
    }

    _changeState(stateKey) {
        let state = this._states[stateKey] || this._states["default"];
        this._graphic.changeTextures(state["out"], state["over"], state["down"], state["block"]);
    }
}
