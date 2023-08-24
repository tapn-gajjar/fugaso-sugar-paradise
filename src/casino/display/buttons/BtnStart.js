import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class BtnStart extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
        );
        this._regNoActiveStates(
            /*AppConst.C_PAYTABLE,
            AppConst.C_START_FREE_GAME,
            AppConst.C_END_FREE_GAME,
            AppConst.C_BONUS_GAME,
            AppConst.C_FREE_GAME,*/
        );

        this.updateState(this._btnManager.state);
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.onUpdateBet, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_CREDIT, this.onUpdateCredit, this);
    }

    onUpdateCredit() {
        if (this._activeStateList.indexOf(this._btnGameState) != -1) {
            this.onActive();
        }
    }

    onUpdateBet() {
        if (this._activeStateList.indexOf(this._btnGameState) != -1) {
            this.onActive();
        }
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
        if (AppG.isAutoGame) {
            this.onHide();
        } else {
            OMY.Omy.keys.registerFunction(OMY.Key.ENTER, this.onKeyHandler, this);
            OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this.onKeyHandler, this);
            super.onActive();
        }
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_reveal);
        AppG.serverWork.sendSpin();
    }
}
