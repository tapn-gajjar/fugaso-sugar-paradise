import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";

export class RichGame {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = graphic.json;

        /** @type {OMY.OTextFont} */
        this._tMulti = this._graphic.getChildByName("t_multi");
        /** @type {OMY.OTextFont} */
        this._tCount = this._graphic.getChildByName("t_count");

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
        AppG.emit.on(AppConst.APP_DEFAULT_STATE, this._onUpdateCountSpin, this);
        AppG.emit.on(AppConst.APP_EMIT_RICH_UPDATE, this._onUpdateWin, this);
        this._tCount.text = String(AppG.serverWork.countRichSpins);
        this._tWin.setNumbers((AppG.gameConst.coinSystem) ?
            AppG.serverWork.richSpinCash :
            OMY.OMath.roundNumber(AppG.serverWork.richSpinCash / AppG.creditType, 100));
        this._tMulti.text = String(AppG.serverWork.multyRichSpins);
        if (AppG.gameConst.coinSystem) this._updateText();
    }

    hide() {
        AppG.emit.off(AppConst.APP_DEFAULT_STATE, this._onUpdateCountSpin, this);
        AppG.emit.off(AppConst.APP_EMIT_RICH_UPDATE, this._onUpdateWin, this);
        this._graphic.kill();
    }

    /**     * @private     */
    _updateText() {
        if (this._tCurrency.active)
            this._tCurrency.text = OMY.Omy.loc.getText("rSpins_game_3");
    }

    /**     * @private     */
    _onUpdateCountSpin() {
        if (!this._graphic.active) return;
        if (AppG.isPLayFreeSpins || AppG.isPLayReSpins) return;
        this._tCount.text = String(AppG.serverWork.countRichSpins);
    }

    /**     * @private     */
    _onUpdateWin() {
        this._tWin.setNumbers((AppG.gameConst.coinSystem) ?
            AppG.serverWork.richSpinCash :
            OMY.OMath.roundNumber(AppG.serverWork.richSpinCash / AppG.creditType, 100));
    }
}