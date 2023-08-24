import {AppG} from "../../../AppG";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class RichEnd {
    constructor(graphic, onComplete) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._onComplete = onComplete;

        /** @type {OMY.OButton} */
        this._btnStart = this._graphic.getChildByName("b_ok");
        this._btnStart.externalMethod(this._finishRichGame.bind(this));

        /** @type {OMY.OTextFont} */
        this._tCurrency = this._graphic.getChildByName("t_currency");
        this._tCurrency.text = (AppG.gameConst.coinSystem) ? OMY.Omy.loc.getText("rSpins_game_3") : AppG.currency;
        if (AppG.gameConst.coinSystem)
            OMY.Omy.loc.addUpdate(this._updateText, this);

        /** @type {OMY.OTextNumberFont} */
        this._tWin = this._graphic.getChildByName("t_cash");
        this._tWin.showCent = !AppG.gameConst.coinSystem;
    }

    show() {
        this._graphic.revive();
        this._tWin.setNumbers((AppG.gameConst.coinSystem) ?
            AppG.serverWork.richSpinCash :
            OMY.OMath.roundNumber(AppG.serverWork.richSpinCash / AppG.creditType, 100));
        if (AppG.gameConst.coinSystem) this._updateText();
    }

    /**     * @private     */
    _finishRichGame() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._graphic.kill();
        this._onComplete();
        OMY.Omy.navigateBtn.unBlockingScreen();
        AppG.state.startNewSession();
    }

    /**     * @private     */
    _updateText() {
        if (this._tCurrency.active)
            this._tCurrency.text = OMY.Omy.loc.getText("rSpins_game_3");
    }
}