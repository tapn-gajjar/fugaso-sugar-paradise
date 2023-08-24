import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {SlotButton} from "../../SlotButton";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class BtnCoin extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
            AppConst.C_BET_SETTINGS
        );
        this._regNoActiveStates(
            AppConst.C_GIFT_SPIN,
            AppConst.C_WIN,
            AppConst.C_COLLECT,
            AppConst.C_PLAY,
            AppConst.C_BLOCK,
            AppConst.C_AUTO_GAME,
            AppConst.C_START_FREE_GAME,
            AppConst.C_PAYTABLE,
            AppConst.C_END_FREE_GAME,
            AppConst.C_BONUS_GAME,
            AppConst.C_FREE_GAME,
            AppConst.C_PLAY_GAMBLE,
            AppConst.C_PLAY_GAMBLE_WAIT
        );

        this._coinValue = this._graphic.getChildByName('t_coins');
        this._coinValue.text = String(AppG.serverWork.currCoins);

        if (this._graphic.getChildByName("t_curr")) {
            this._tCurrency = this._graphic.getChildByName('t_curr');
            this._tCurrency.text = String(AppG.serverWork.currency);
        }

        AppG.emit.on(AppConst.APP_EMIT_ON_COINS, this.onUpdateCoins, this);
        this.updateState(this._btnManager.state);
    }

    onUpdateCoins() {
        this._coinValue.text = String(AppG.serverWork.currCoins);
    }

    onHide() {
        super.onHide();
    }

    onBlock() {
        if (this._tCurrency)
            this._tCurrency.tint = this._tCurrency.json["block"];
        super.onBlock();
    }

    onActive() {
        if (AppG.isAutoGame || AppG.isFreeGame || AppG.isRichSpin) {
            this.onBlock();
        } else {
            super.onActive();
            if (this._tCurrency)
                this._tCurrency.tint = this._tCurrency.json['active'];
        }
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        AppG.serverWork.changeCoins();
        this._coinValue.text = String(AppG.serverWork.currCoins);
    }
}
