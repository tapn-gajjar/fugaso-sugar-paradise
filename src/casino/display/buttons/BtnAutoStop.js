import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {SlotButton} from "../SlotButton";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class BtnAutoStop extends SlotButton {
    constructor(graphic, onClick = null, param = null) {
        super(graphic, onClick, param);

        this._ignoreAutoGame = true;
        this._regActiveStates(
            AppConst.C_AUTO_GAME,
        );
        this._regNoActiveStates(
            // AppConst.C_MENU
        );

        AppG.autoGameRules.addOnCountUpdateHandler(this._onAutoSpinsCountUpdate, this, false);
        this.updateState(this._btnManager.state);
    }

    _onAutoSpinsCountUpdate(value) {
        this.graphic.getChildByName("s_infinity").visible = value === -1;
        this.graphic.label.visible = value !== -1;
        this.graphic.label.text = value.toString();
    }

    updateState(state) {
        if (AppG.isFreeGame) {
            this.onHide();
        } else if (AppG.autoGameRules.isShowAutoGamePanel) {
            this.onHide();
        } else if (AppG.autoGameRules.isAutoPause) {
            super.onBlock();
        } else if (AppG.autoGameRules.isAutoGame && !AppG.autoGameRules.isBonusGame) {
            this.onActive();
        } else {
            super.updateState(state);
        }
    }

    onHide() {
        if (AppG.isAutoGame && AppG.autoGameRules.isAutoGameActive) {
            this.onActive();
        } else {
            super.onHide();
        }
    }

    onBlock() {
        if (AppG.isAutoGame && AppG.autoGameRules.isAutoGameActive) {
            this.onActive();
        } else {
            this.graphic.label.tint = this.graphic.label.json["block"];
            super.onBlock();
        }
    }

    onActive() {
        super.onActive();
        this.graphic.label.tint = this.graphic.label.json["active"];
    }

    onDoAction() {
        this.isBlock = true;
        OMY.Omy.sound.play(GameConstStatic.S_btn_auto_off);
        AppG.autoGameRules.stopAutoGame();
        this.onBlock();
    }

    set isBlock(value) {
        if (!AppG.isAutoGame || AppG.autoGameRules.isAutoPause) {
            super.isBlock = value;
        } else {
            super.isBlock = false;
        }
    }

}
