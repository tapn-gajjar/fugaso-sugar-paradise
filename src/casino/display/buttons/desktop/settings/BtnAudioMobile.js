import {SlotButton} from "../../../SlotButton";
import {AppG} from "../../../../AppG";
import {AppConst} from "../../../../AppConst";
import {GameConstStatic} from "../../../../../app/GameConstStatic";

export class BtnAudioMobile extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._alwaysAvailable = true;
        this._ignoreAutoGame = true;

        this._stateName = "";
        this.updateState(this._btnManager.state);

        let curVolume = OMY.OMath.roundNumber(OMY.Omy.sound.curVolume, 2);
        this._values = [0, 1];
        let index = this._values.indexOf(curVolume);
        this._curIndex = index == -1 ? 0 : ((OMY.Omy.sound.isMute) ? 0 : index);
        OMY.Omy.sound.volume(this._values[this._curIndex]);

        this.addOtherStates(this._graphic.json["states"]);
        AppG.emit.on(AppConst.APP_TOGGLE_SOUND, this._checkState, this);
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
        AppG.emit.off(AppConst.APP_TOGGLE_SOUND, this._checkState, this);
        super._destroy();
    }

    onDoAction() {
        if (!this._graphic.renderable) return;
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);

        this._toggleMute();
        AppG.emit.emit(AppConst.APP_TOGGLE_SOUND);
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _checkState() {
        let curVolume = OMY.OMath.roundNumber(OMY.Omy.sound.curVolume, 2);
        this._curIndex = this._values.indexOf(curVolume);
        this._curIndex = ((this._curIndex === -1) ? 0 : this._curIndex);
        if (OMY.Omy.sound.isMute) {
            this._changeState("off");
        } else if (curVolume === 0.5) {
            this._changeState("half");
        } else if (curVolume === 1) {
            this._changeState("on");
        }
    }

    _changeState(stateKey) {
        this._stateName = stateKey;
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

    _toggleMute() {
        this._curIndex++;
        this._curIndex = this._curIndex >= this._values.length ? 0 : this._curIndex;
        let newVolume = this._values[this._curIndex];
        if (newVolume > 0) {
            OMY.Omy.sound.unmute();
        } else {
            OMY.Omy.sound.mute();
        }
        OMY.Omy.sound.volume(newVolume);
    }

    get stateName() {
        return this._stateName;
    }
}
