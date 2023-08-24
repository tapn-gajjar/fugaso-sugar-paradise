import {SlotButton} from "../../../casino/display/SlotButton";
import {AppConst} from "../../../casino/AppConst";
import {AppG} from "../../../casino/AppG";
import {GameConstStatic} from "../../GameConstStatic";

export class BtnLocalization extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
            AppConst.C_BONUS_GAME,
            AppConst.C_PAYTABLE,
            AppConst.C_WIN,
            AppConst.C_COLLECT,
            AppConst.C_PLAY,
            AppConst.C_AUTO_GAME,
            AppConst.C_FREE_GAME,
            AppConst.C_MENU_MOBILE,
            AppConst.C_START_FREE_GAME,
            AppConst.C_END_FREE_GAME,
            AppConst.C_PLAY_GAMBLE,
            AppConst.C_PLAY_GAMBLE_WAIT,
            AppConst.C_BET_SETTINGS,
            AppConst.C_BLOCK,
        );
        this._regNoActiveStates(
        );

        this.updateState(this._btnManager.state);

        OMY.Omy.loc.addUpdate(this._checkState, this);
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
        if (!this._graphic.renderable) return;
        if (this._btnManager.state === AppConst.C_NONE)
            AppG.state.checkWinAnimations();
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        OMY.Omy.viewManager.showWindow(AppConst.W_LOCALISATION, true, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    _checkState() {
        this._changeState(OMY.Omy.language);
    }

    _changeState(stateKey) {
        let state = this._states[stateKey] || this._states["default"];
        this._graphic.changeTextures(state["out"], state["over"], state["down"], state["block"]);
    }
}
