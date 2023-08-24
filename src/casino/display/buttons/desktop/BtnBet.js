import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {SlotButton} from "../../SlotButton";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class BtnBet extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
            AppConst.C_PAYTABLE,
            AppConst.C_BET_SETTINGS
        );
        this._regNoActiveStates(
            AppConst.C_GIFT_SPIN,
            AppConst.C_PAYTABLE,
            AppConst.C_WIN,
            AppConst.C_COLLECT,
            AppConst.C_PLAY,
            AppConst.C_BLOCK,
            AppConst.C_AUTO_GAME,
            AppConst.C_START_FREE_GAME,
            AppConst.C_END_FREE_GAME,
            AppConst.C_PLAY_GAMBLE,
            AppConst.C_PLAY_GAMBLE_WAIT,
            AppConst.C_BONUS_GAME,
            AppConst.C_FREE_GAME
        );

        this._betValue = this._graphic.getChildByName('t_bet');
        this._betValue.setNumbers(AppG.serverWork.totalBet);

        this.updateState(this._btnManager.state);
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.onUpdateBet, this);
    }

    onUpdateBet() {
        if (this._activeStateList.indexOf(this._btnGameState) != -1) {
            this.onActive();
        }
        this._betValue.setNumbers(AppG.serverWork.totalBet);
    }

    onHide() {
        super.onHide();
    }

    onBlock() {
        if (this.graphic.label)
            this.graphic.label.tint = this.graphic.label.json["block"];
        super.onBlock();
    }

    onActive() {
        if (AppG.isAutoGame || AppG.isFreeGame || AppG.isRichSpin) {
            this.onBlock();
        } else {
            super.onActive();
            if (this.graphic.label)
                this.graphic.label.tint = this.graphic.label.json['active'];
        }
    }

    onDoAction() {
        const currBet = AppG.serverWork.totalBet;
        AppG.serverWork.changeBet();
        if (AppG.serverWork.totalBet === AppG.serverWork.maxBet * AppG.serverWork.lineForBet)
            OMY.Omy.sound.play(GameConstStatic.S_btn_bet_max);
        else
            OMY.Omy.sound.play(AppG.serverWork.totalBet > currBet ? GameConstStatic.S_btn_bet_plus : GameConstStatic.S_btn_bet_minus);
        this._betValue.setNumbers(AppG.serverWork.totalBet);
    }
}
