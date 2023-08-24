import {AppG} from "../../../../AppG";
import {SlotButton} from "../../../SlotButton";
import {GameConstStatic} from "../../../../../app/GameConstStatic";
import {AppConst} from "../../../../AppConst";

export class BtnSetting extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
        );
        this._regNoActiveStates(
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

        this.updateState(this._btnManager.state);
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
        AppG.state.checkWinAnimations();
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        OMY.Omy.viewManager.showWindow(AppConst.W_SETTING,true, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }
}
