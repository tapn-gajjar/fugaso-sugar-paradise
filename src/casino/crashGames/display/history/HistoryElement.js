import {AppConst} from "../../../AppConst";
import {CrashConst} from "../../CrashConst";

export class HistoryElement {
    constructor(graphic, editMode) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._editMode = editMode;

        /** @type {OMY.OTextBitmap} */
        this._tTime = this._graphic.getChildByName("t_time");
        /** @type {OMY.OTextBitmap} */
        this._tMulti = this._graphic.getChildByName("t_multi");
        /** @type {OMY.OButton} */
        this._arrow = this._graphic.getChildByName("s_ui_arrow");
        this._arrow.externalMethod(this._onUpHandler.bind(this));
        OMY.Omy.viewManager.addCloseWindow(AppConst.W_HISTORY, this._onCloseHistoryW, this, false);
        OMY.Omy.viewManager.addOpenWindow(AppConst.W_HISTORY, this._onOpenHistoryW, this, false);
    }

    updateTime(isDate) {
        if (!this._graphic.visible) return;
        this._isDate = isDate;
        this._dataTime = (isDate) ? CrashConst.formatRoundDate(this._data.timeOn) :
            CrashConst.formatRoundTime(this._data.timeOn);
        this._tTime.text = this._dataTime;
    }

    updateData(data, isTop) {
        this._graphic.visible = true;
        this._arrow.angle = (HistoryElement.open_round_id === data.roundId) ? 90 : 0;
        this._data = data;
        this._tMulti.text = OMY.OMath.getCashString(data.multiplier, true) + "x";
        if (isTop)
            this.updateTime(this._isDate);
        else
            this._dataTime = CrashConst.formatRoundTime(data.timeOn);
        this._tTime.text = this._dataTime;
    }

    clear() {
        this._graphic.visible = false;
        this._data = null;
    }

    /**     * @private     */
    _onUpHandler() {
        if (!this._data) return;
        OMY.Omy.viewManager.getView(AppConst.W_HISTORY).updateData(this._data, this._dataTime);
        HistoryElement.open_round_id = this._data.roundId;
        this._arrow.angle = 90;
        OMY.Omy.viewManager.showWindow(AppConst.W_HISTORY, false,
            OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    /**     * @private     */
    _onCloseHistoryW() {
        if (!this._data) return;
        if (this._arrow?.angle !== 0) this._arrow.angle = 0;
    }

    /**     * @private     */
    _onOpenHistoryW() {
        if (!this._data) return;
        if (HistoryElement.open_round_id === this._data.roundId) this._arrow.angle = 90;
    }

    destroy() {
        this._graphic = null;
        this._gdConf = null;
        this._tTime = null;
        this._tMulti = null;
        this._arrow = null;
        OMY.Omy.viewManager.removeCloseWindow(AppConst.W_HISTORY, this._onCloseHistoryW, this);
        OMY.Omy.viewManager.removeOpenWindow(AppConst.W_HISTORY, this._onOpenHistoryW, this);
        this._data = null;
    }
}
HistoryElement.open_round_id = 0;
