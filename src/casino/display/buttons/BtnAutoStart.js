import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class BtnAutoStart extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._regActiveStates(
            AppConst.C_NONE,
        );
        /*this._regNoActiveStates(
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
        );*/

        this.updateState(this._btnManager.state);
        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this.onUpdateBet, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_CREDIT, this.onUpdateCredit, this);
        if (this._graphic.label)
            AppG.emit.on(AppConst.APP_AUTO_COUNT_SPIN, this._checkLabel, this);
        this._checkLabel();
    }

    /**     * @private     */
    _checkLabel(_checkLabel) {
        if (this._graphic.label) {
            this._graphic.getChildByName("s_infinity").visible = AppG.autoGameRules.ruleCountPlay === -1;
            this._graphic.label.visible = AppG.autoGameRules.ruleCountPlay !== -1;
            this._graphic.label.text = (AppG.autoGameRules.ruleCountPlay > 0) ? AppG.autoGameRules.ruleCountPlay : "";
        }
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
        super.onHide();
    }

    onBlock() {
        if (AppG.isAutoGame || AppG.isFreeGame) {
            this.onHide();
        } else {
            super.onBlock();
        }
    }

    onActive() {
        if (AppG.isAutoGame || AppG.isFreeGame) {
            this.onHide();
        } else if (/*!AppG.serverWork.isUserHasCash || */AppG.isRichSpin) {
            this.onBlock();
        } else {
            super.onActive();
        }
    }

    onDoAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_auto_on);
        if (AppG.curacao) {
            AppG.autoGameRules.setCountOfPlay(-1);
            AppG.state.startAutoGame();
        } else {
            if (OMY.Omy.isDesktop) {
                AppG.state.checkWinAnimations();
                AppG.emit.emit(AppConst.APP_AUTO_TOGGLE_BLOCK);
            } else {
                if (AppG.autoGameRules.ruleCountPlay === 0) {
                    OMY.Omy.viewManager.getView(AppConst.W_MENU).showAuto();
                    return;
                }
                if (!AppG.autoGameRules.ruleIfCashDecByValue && AppG.optionallyDecByValue) {
                    OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_AUTO_GAME);
                    return;
                }
                AppG.state.startAutoGame();
            }
        }
    }
}
