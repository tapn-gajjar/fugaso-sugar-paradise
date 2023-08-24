import {AppG} from "../../../AppG";
import {CrashConst} from "../../CrashConst";
import {AppConst} from "../../../AppConst";
import {HistoryElement} from "./HistoryElement";

export class HistoryLineBase {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._isEditMode = Boolean(this._gdConf["edit"]);
        this._isAnimateNow = false;

        this._createElements();
        this._dataCreate();
    }

    _createElements() {
        /** @type {OMY.OContainer} */
        this._canvas = this._graphic.getChildByName("canvas");
        /** @type {OMY.OButtonTween} */
        let btn = this._canvas.children[0];
        btn.externalMethod(this._onUpHandler.bind(this));
        btn.name += "0";
        this._btnJson = btn.json;
        let max = this._gdConf["max"];
        for (let i = 0; i < max; i++) {
            const btn = OMY.Omy.add.buttonJson(this._canvas, this._btnJson);
            btn.x = (i + 1) * this._gdConf["step"];
            btn.name += String(i + 1);
            btn.externalMethod(this._onUpHandler.bind(this));
        }
        /** @type {Array.<OMY.OButtonTween>} */
        this._elements = this._canvas.children.concat();

        this._addEl = OMY.Omy.add.buttonJson(this._canvas, this._btnJson);
        this._addEl.externalMethod(this._onUpHandler.bind(this));
        this._addEl.x = this._addEl.saveX = -this._addEl.width * 2;

        let mask = this._graphic.getChildByName("r_mask");
        if (!mask.json.debug)
            this._canvas.mask = mask;
    }

    /**     * @private     */
    _dataCreate() {
        this._newData = false;
        this._historyData = AppG.serverWork.historyData;
        AppG.emit.on(CrashConst.EMIT_ON_HISTORY_UPDATE, this._onHistoryUpdate, this);
        this._updateHistoryData();
    }

    /**     * @private     */
    _updateHistoryData() {
        if (this._isEditMode) return;
        this._updatePositions();

        if (OMY.Omy.game.gamePaused || this._force) {
            this._updateData();
        } else {
            if (this._newData) {
                this._newData = false;
                let m = this._historyData.length;
                this._addEl.label.text = OMY.OMath.getCashString(this._historyData[m - 1].multiplier, true) + "x";
                this._addEl.json["out"] = (this._historyData[m - 1].isWin) ? this._addEl.json["win_out"] : this._addEl.json["lose_out"];
                this._addEl.userData = this._historyData[m - 1];
                this._addEl.changeTextures(this._addEl.json["out"]);
                OMY.Omy.add.tween(this._addEl, {
                    x: this._gdConf["tween_x"],
                    ease: "none",
                    onCompleteParams: [this._addEl]
                }, this._gdConf["time_1"], (target) => {
                    OMY.Omy.add.tween(target, {
                        x: 0, ease: "none",
                    }, this._gdConf["time_2"]);
                });
                /** @type {OMY.OButton} */
                let element;
                this._isAnimateNow = true;
                m--;
                for (let i = 0; i < this._elements.length; i++) {
                    element = this._elements[i];
                    if (i < m) {
                        element.label.text = OMY.OMath.getCashString(this._historyData[m - 1 - i].multiplier, true) + "x";
                        element.visible = true;
                        element.userData = this._historyData[m - 1 - i];
                        element.json["out"] = (this._historyData[m - 1 - i].isWin) ? element.json["win_out"] : element.json["lose_out"];
                        element.changeTextures(element.json["out"]);
                    } else {
                        element.visible = false;
                        element.userData = null;
                    }
                    let last = i === (this._elements.length - 1);
                    OMY.Omy.add.tween(element, {
                        x: element.x + this._gdConf["step"] * 2,
                        ease: "none",
                        delay: this._gdConf["time_1"],
                        onCompleteParams: [element, last]
                    }, this._gdConf["time_1"], this._onEndTween.bind(this));
                }
            } else {
                this._updateData();
            }
        }
    }

    /**     * @private     */
    _onEndTween(target, destroy) {
        if (destroy) {
            this._isAnimateNow = false;
        } else {
            OMY.Omy.add.tween(target, {
                x: target.x - this._gdConf["step"],
                ease: "none"
            }, this._gdConf["time_2"]);
        }
    }

    /**     * @private     */
    _onHistoryUpdate(force = false) {
        this._newData = true;
        this._force = force;
        this._historyData = AppG.serverWork.historyData;
        this._updateHistoryData();
    }

    /**     * @private     */
    _updatePositions() {
        for (let i = 0; i < this._elements.length; i++) {
            this._elements[i].x = i * this._gdConf["step"];
            OMY.Omy.remove.tween(this._elements[i]);
        }
        this._addEl.x = this._addEl.saveX;
        OMY.Omy.remove.tween(this._addEl);
    }

    /**     * @private     */
    _updateData() {
        const m = this._historyData.length;
        /** @type {OMY.OButton} */
        let element;
        for (let i = 0; i < this._elements.length; i++) {
            element = this._elements[i];
            if (i < m) {
                element.label.text = OMY.OMath.getCashString(this._historyData[m - 1 - i].multiplier, true) + "x";
                element.visible = true;
                element.userData = this._historyData[m - 1 - i];
                element.json["out"] = (this._historyData[m - 1 - i].isWin) ? element.json["win_out"] : element.json["lose_out"];
                element.changeTextures(element.json["out"]);
            } else {
                element.visible = false;
                element.userData = null;
            }
        }
    }

    /**     * @private     */
    _onUpHandler(btn) {
        if (btn.userData) {
            OMY.Omy.viewManager.getView(AppConst.W_HISTORY)
                .updateData(btn.userData, CrashConst.formatRoundTime(btn.userData.timeOn));
            HistoryElement.open_round_id = btn.userData.roundId;
            OMY.Omy.viewManager.showWindow(AppConst.W_HISTORY, false,
                OMY.Omy.viewManager.gameUI.getWindowLayer());
        }
    }

    destroy() {
        this._graphic = null;
        this._gdConf = null;
        this._canvas = null;
        this._btnJson = null;
        for (let i = 0; i < this._elements.length; i++) {
            OMY.Omy.remove.tween(this._elements[i]);
        }
        this._elements = null;
        OMY.Omy.remove.tween(this._addEl);
        this._addEl = null;
        this._historyData = null;
        AppG.emit.off(CrashConst.EMIT_ON_HISTORY_UPDATE, this._onHistoryUpdate, this);
    }
}
