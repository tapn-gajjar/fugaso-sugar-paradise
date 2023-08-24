import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {SlotButton} from "../../SlotButton";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class BtnBetDown extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
            AppConst.C_PAYTABLE,
            AppConst.C_BET_SETTINGS
        );
        this._regNoActiveStates(
            AppConst.C_WIN,
            AppConst.C_COLLECT,
            AppConst.C_PLAY,
            AppConst.C_BLOCK,
            AppConst.C_AUTO_GAME,
            AppConst.C_START_FREE_GAME,
            AppConst.C_END_FREE_GAME,
            AppConst.C_PLAY_GAMBLE,
            AppConst.C_PLAY_GAMBLE_WAIT,
            AppConst.C_START_BONUS_GAME,
            AppConst.C_BONUS_GAME,
            AppConst.C_END_BONUS_GAME,
            AppConst.C_FREE_GAME
        );

        this.updateState(this._btnManager.state);
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.onUpdateBet, this);
    }

    onUpdateBet() {
        if (this._activeStateList.indexOf(this._btnGameState) !== -1) {
            this.onActive();
        }
    }

    onHide() {
        super.onHide();
    }

    onBlock() {
        super.onBlock();
    }

    onActive() {
        if (AppG.isAutoGame || AppG.isFreeGame || AppG.serverWork.isFirstBet || AppG.isRichSpin) {
            this.onBlock();
        } else {
            super.onActive();
        }
    }

    onDoAction() {
        /*if (AppG.autoGameRules.isShowAutoGamePanel)
            return;*/
        OMY.Omy.sound.play(GameConstStatic.S_btn_bet_minus);
        AppG.serverWork.changeBet(0);
        AppG.state.checkWinAnimations();
    }
}
