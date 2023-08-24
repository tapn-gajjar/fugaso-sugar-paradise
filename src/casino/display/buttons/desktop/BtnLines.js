import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {SlotButton} from "../../SlotButton";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class BtnLines extends SlotButton {
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

        this._linesValue = this._graphic.getChildByName('t_lines');
        this._linesValue.setNumbers(AppG.serverWork.currLines);

        this.updateState(this._btnManager.state);
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.onUpdateBet, this);
    }

    onUpdateBet() {
        if (this._activeStateList.indexOf(this._btnGameState) != -1) {
            this.onActive();
        }
        this._linesValue.setNumbers(AppG.serverWork.currLines);
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
        if (AppG.isAutoGame || AppG.isFreeGame || AppG.isRichSpin || AppG.gameConst.getData("lineFixed")) {
            this.onBlock();
        } else {
            super.onActive();
            if (this.graphic.label)
                this.graphic.label.tint = this.graphic.label.json['active'];
        }
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_bet_plus);
        AppG.serverWork.changeLines();
        this._linesValue.setNumbers(AppG.serverWork.currLines);
    }
}
