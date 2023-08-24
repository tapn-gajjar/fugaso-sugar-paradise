import {AppConst} from "../../AppConst";
import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {AppG} from "../../AppG";

export class BtnTake extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._ignoreAutoGame = true;
        this._regActiveStates(
            AppConst.C_END_FREE_GAME,
            AppConst.C_COLLECT,
            AppConst.C_PLAY_GAMBLE
        );

        this._regNoActiveStates(
            AppConst.C_PLAY_GAMBLE_WAIT,
        );

        this.updateState(this._btnManager.state);
    }

    onHide() {
        OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this.onKeyHandler, this);
        OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        super.onHide();
    }

    onBlock() {
        OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this.onKeyHandler, this);
        OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        super.onBlock();
    }

    onActive() {
        OMY.Omy.keys.registerFunction(OMY.Key.ENTER, this.onKeyHandler, this);
        OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this.onKeyHandler, this);
        super.onActive();
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        AppG.state.collectWin();
        this.isBlock = true;
    }
}
