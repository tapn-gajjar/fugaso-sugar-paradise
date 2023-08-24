import {GambleWindowBase} from "../../../../casino/gui/windows/GambleWindowBase";
import {GameConstStatic} from "../../../GameConstStatic";
import {AppG} from "../../../../casino/AppG";
import {CardHistory} from "./CardHistory";
import {GameCard} from "./GameCard";

export class GambleWindow extends GambleWindowBase {
    constructor() {
        super();
    }

    _createGraphic() {
        super._createGraphic();

        OMY.Omy.sound.stop(GameConstStatic.S_gamble_wait);

        /** @type {OMY.OTextNumberBitmap} */
        this._tAmmount = this.getChildByName("t_amount");
        this._tAmmount.showCent = true;
        this._tAmmount.setNumbers(AppG.winCredit);

        /** @type {OMY.OTextNumberBitmap} */
        this._tWin = this.getChildByName("t_win");
        this._tWin.showCent = true;
        this._tWin.setNumbers(AppG.winCredit * 2);
        this._tWin.visible = true;

        /** @type {OMY.OButton} */
        this._bRed = this.getChildByName("b_red");
        this._bRed.externalMethod(this._onButtonHandler.bind(this));
        /** @type {OMY.OButton} */
        this._bBlack = this.getChildByName("b_black");
        this._bBlack.externalMethod(this._onButtonHandler.bind(this));

        /** @type {CardHistory} */
        this._cardHistory = new CardHistory(this.getChildByName("c_history"));
        this._cardHistory.updateData();
        const cardMask = this.getChildByName("r_card_mask");
        if (cardMask && !cardMask.json["debug"])
            this.getChildByName("c_history").mask = cardMask;

        /** @type {GameCard} */
        this._gameCard = new GameCard(this.getChildByName("c_playCard"));
        this._gameCard.emit.on(this._gameCard.C_MOVE_UP, this._onCompleteAnimation, this);
        this._gameCard.emit.on(this._gameCard.C_ON_POSITION, this._onResetHistoryPos, this);
        !this._debugMode && this._gameCard.closeCard();
    }

    _clearGraphic() {
        this._tAmmount = null;
        this._tWin = null;
        this._bRed = null;
        this._bBlack = null;
        this._cardHistory = null;
        this._gameCard?.stopWaitAnimation();
        this._gameCard = null;
        this._closeTimer?.destroy();
        this._closeTimer = null;

        this._startNewSessionTimer?.destroy();
        this._startNewSessionTimer = null;

        super._clearGraphic();
    }

    _hideWindow() {
        OMY.Omy.sound.stop(GameConstStatic.S_gamble_choice);
        super._hideWindow();
    }

    _onSendCollect() {
        this._bRed.isBlock = true;
        this._bBlack.isBlock = true;

        super._onSendCollect();
    }

    startNewSession() {
        this._bRed.isBlock = false;
        this._bBlack.isBlock = false;
        this._gameCard.startWaitAnimation();
        if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_gamble_choice))
            OMY.Omy.sound.play(GameConstStatic.S_gamble_choice, true);

        if (AppG.serverWork.gambleCount !== 0)
            this._tWin.setNumbers(AppG.winCredit * 2);
        super.startNewSession();
    }

    getServerResponce() {
        this._gameCard.showCard();
        this._countGambleGame = AppG.serverWork.gambleCount;
        // super.getServerResponce();
    }

    win() {
        OMY.Omy.sound.play(GameConstStatic.S_gamble_win);

        if (AppG.serverWork.gambleCount != 0)
            this._tWin.setNumbers(AppG.winCredit * 2);
        else
            this._tWin.setNumbers(0);

        this._tAmmount.setNumbers(AppG.winCredit);

        super.win();
    }

    lose() {
        super.lose();
        OMY.Omy.sound.play(GameConstStatic.S_gamble_lose);
        this._tWin.setNumbers(0);
        this._tWin.visible = false;
        this._tAmmount.setNumbers(0);
        this._closeTimer = OMY.Omy.add.timer(0.5, this._hideWindow, this);

    }

    _finalDouble() {
        // this._startNewSessionTimer = OMY.Omy.add.timer(0.8, this.startNewSession, this);
        this._tWin.visible = false;
        this.getChildByName("c_playCard").visible = false;
        this.getChildByName("t_4").visible = false;
        super._finalDouble();
    }

    _onCompleteAnimation() {
        if (AppG.serverWork.isWinGamble) {
            this._cardHistory.startMoveAnimation();
        }
        this.checkGambleState();
    }

    /**     * @private     */
    _onResetHistoryPos() {
        this._cardHistory.onUpdateHistory();
    }

    _onButtonHandler(b) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._bRed.isBlock = true;
        this._bBlack.isBlock = true;
        switch (b.name) {
            case "b_red": {
                this._onClickRed();
                break;
            }

            case "b_black": {
                this._onClickBlack();
                break;
            }
        }
    }

    onChangeColor() {
        this._gameCard.startShowCard();
        OMY.Omy.sound.stop(GameConstStatic.S_gamble_choice);

        super.onChangeColor();
    }
}
