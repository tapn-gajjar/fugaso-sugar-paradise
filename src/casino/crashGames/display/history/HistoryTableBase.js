import {TableBase} from "../TableBase";
import {HistoryElement} from "./HistoryElement";
import {AppG} from "../../../AppG";
import {CrashConst} from "../../CrashConst";

export class HistoryTableBase extends TableBase {
    constructor(graphic) {
        super(graphic);
    }

    _createGraphic() {
        this._tableType = CrashConst.T_HISTORY;
        this._newElements = false;
        this._countActive = 0;
        this._isTop = false;
        super._createGraphic();
        /** @type {OMY.OTextFont} */
        this._timeLabel = this._graphic.getChildByName("t_time_label");
    }

    _createElements() {
        if (!super._createElements()) return false;
        /** @type {Array.<HistoryElement>} */
        this._elements = [];
        for (let i = 0; i < this._cPageContent.numChildren; i++) {
            this._elements.push(new HistoryElement(this._cPageContent.children[i], this._isEditMode));
        }
        this._activeDataList = null;
        AppG.emit.on(CrashConst.EMIT_ON_HISTORY_UPDATE, this._onHistoryUpdate, this);
        AppG.emit.on(CrashConst.EMIT_ON_HISTORY_TOP_UPDATE, this._onHistoryTopUpdate, this);
    }

    /**     * @private     */
    _onHistoryTopUpdate() {
        if (this._isTop) this._onHistoryUpdate();
    }

    /**     * @private     */
    _updateHistoryData() {
        if (this._isEditMode || !this._graphic.active) return;
        switch (this._listId) {
            case 0: {
                this._activeDataList = AppG.serverWork.historyData;
                break;
            }
            case 1: {
                this._activeDataList = AppG.serverWork.historyTopData;
                break;
            }
        }
        const m = this._activeDataList.length;
        /** @type {OMY.OContainer} */
        let element;
        for (let i = 0; i < m; i++) {
            if (i >= this._cPageContent.numChildren) {
                element = OMY.Omy.add.containerJson(this._cPageContent, this._elJson);
                element.y = i * this._gdConf["step"];
                element.name += String(i);
                this._elements.push(new HistoryElement(element));
            }
            this._elements[i].updateData(this._activeDataList[m - 1 - i], this._isTop);
        }
        if (this._elements.length > this._activeDataList.length) {
            for (let i = this._activeDataList.length; i < this._elements.length; i++) {
                this._elements[i].clear();
            }
        }
        let activeEl = 0;
        for (let i = 0; i < this._cPageContent.numChildren; i++) {
            if (this._cPageContent.children[i].visible) activeEl++
        }
        if (activeEl !== this._countActive) {
            this._countActive = activeEl;
            this._newElements = true;
        }
    }

    /**     * @private     */
    _onHistoryUpdate(force = false) {
        this._updateHistoryData();
        if (this._newElements || force) {
            this._newElements = false;
            this._windowSizeUpdate();
        }
    }

    _onFilterOpen(btnId) {
        super._onFilterOpen(btnId);
    }

    _openList(listId) {
        super._openList(listId);
        this._listId = listId;
        switch (this._listId) {
            case 0: {
                this._isTop = false;
                this._timeLabel.json["locConst"] = this._timeLabel.json["loc_time"];
                this._timeLabel.text = this._timeLabel.json["loc_time"];
                this._activeDataList = AppG.serverWork.historyData;
                break;
            }
            case 1: {
                this._isTop = true;
                this._timeLabel.json["locConst"] = this._timeLabel.json["loc_date"];
                this._timeLabel.text = this._timeLabel.json["loc_date"];
                this._activeDataList = AppG.serverWork.historyTopData;
                break;
            }
        }
        this._timerUpdate?.destroy();
        this._onHistoryUpdate(true);
        if (this._isTop) {
            this._isDateLabel = true;
            this._updateTableDate();
        }
    }

    _kill() {
        this._timerUpdate?.destroy();
        super._kill();
    }

    /**     * @private     */
    _updateTableDate() {
        for (let i = 0; i < this._elements.length; i++) {
            this._elements[i].updateTime(this._isDateLabel);
        }
        this._timerUpdate = OMY.Omy.add.timer((this._isDateLabel) ? 12 : 4,
            this._updateTableDate, this);
        this._isDateLabel = !this._isDateLabel;
    }

    destroy() {
        this._timeLabel = null;
        for (let i = 0; i < this._elements.length; i++) {
            this._elements[i].destroy();
        }
        this._elements.length = 0;
        this._elements = null;
        this._activeDataList = null;
        AppG.emit.off(CrashConst.EMIT_ON_HISTORY_UPDATE, this._onHistoryUpdate, this);
        AppG.emit.off(CrashConst.EMIT_ON_HISTORY_TOP_UPDATE, this._onHistoryTopUpdate, this);
        this._timerUpdate?.destroy();
        this._timerUpdate = null;
        super.destroy();
    }
}
