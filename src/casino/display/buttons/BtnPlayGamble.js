import {AppConst} from "../../AppConst";
import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {AppG} from "../../AppG";

export class BtnPlayGamble extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._ignoreAutoGame = true;
        this._regActiveStates(
            AppConst.C_COLLECT,
        );
        this._regNoActiveStates(
            // AppConst.C_PLAY_GAMBLE,
            // AppConst.C_PLAY_GAMBLE_WAIT,
        );

        this._limit = AppG.gameConst.gambleWinLimit;
        this.updateState(this._btnManager.state);
    }

    onHide() {
        super.onHide();
    }

    onBlock() {
        super.onBlock();
    }

    onActive() {
        let winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        if (winCoef > this._limit) {
            this.onBlock();
            return;
        }
        super.onActive();
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this.isBlock = true;
        AppG.state.showGamble();
    }
}
