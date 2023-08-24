import {AppG} from "../../../AppG";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {AppConst} from "../../../AppConst";
import {CrashConst} from "../../CrashConst";
import {HistoryElement} from "../history/HistoryElement";

export class BetElement {
    constructor(graphic, emit, editMode) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        /** @type {PIXI.utils.EventEmitter} */
        this._emit = emit;
        this._emit.on("open_new", this._onOpenNewList, this);
        this._emit.on("force_close", this._forceCloseInfo, this);
        this._editMode = editMode;
        this._bigConf = AppG.gameConst.game_const["win_limit"];

        /** @type {OMY.OTextFont} */
        this._tUser = this._graphic.getChildByName("t_user");
        /** @type {OMY.OTextFont} */
        this._tBet = this._graphic.getChildByName("t_bet");
        /** @type {OMY.OTextBitmap} */
        this._tMulti = this._graphic.getChildByName("t_multi");
        /** @type {OMY.OTextFont} */
        this._tWin = this._graphic.getChildByName("t_win");
        /** @type {OMY.OSprite} */
        this._sWin = this._graphic.getChildByName("s_coef_type");
        /** @type {OMY.OSprite} */
        this._sBg = this._graphic.getChildByName("s_bg_win");
        /** @type {OMY.OButton} */
        this._bOpenMore = this._graphic.getChildByName("b_open");
        this._bOpenMore.externalMethod(this._buttonHandler.bind(this), [true]);
        this._bOpenMore.isBlock = true;
        this._bOpenMore.visible = false;
        /** @type {OMY.OButton} */
        this._bCloseMore = this._graphic.getChildByName("b_close");
        this._bCloseMore.externalMethod(this._buttonHandler.bind(this), [false]);
        this._bCloseMore.isBlock = true;
        this._bCloseMore.visible = false;
        /** @type {OMY.OContainer} */
        this._cMoreCanvas = this._graphic.getChildByName("c_more_canvas");
        /** @type {OMY.OContainer} */
        this._cWinCanvas = this._graphic.getChildByName("c_win_canvas");
        this._isOpenMoreInfo = false;
        this._openId = 0;
        AppG.serverWork.on(CrashConst.EMIT_ON_GET_ROUND, this._setOpenHistoryW, this);
        if (this._editMode) {
            Boolean(this._gdConf["more_bet"]["editMode"]) && OMY.Omy.add.containerJson(this._cMoreCanvas, this._gdConf["more_bet"]);
            Boolean(this._gdConf["more_win"]["editMode"]) && OMY.Omy.add.containerJson(this._cWinCanvas, this._gdConf["more_win"]);
        }
    }

    updateData(data, activeWinField = false, haveMoreInfo = false, haveWinInfo = false) {
        this._graphic.visible = true;
        this._data = data;
        this._haveWinInfo = haveWinInfo;
        if (haveMoreInfo && !data.hasOwnProperty("bid")) data.bid = OMY.OMath.uniqueID();
        this._userId = data.userId;
        this._currencyOn = data.currencyCode;
        const isWin = data.gain !== 0;
        this._sBg.visible = activeWinField && isWin;
        this._sWin.visible = isWin;
        let str = (isWin) ? OMY.OMath.getCashString(data.multiplierAuto, true) + "x" : "--";
        this._tMulti.text = str;
        this._tMulti.setColor((isWin) ? this._tMulti.json["tint"] : this._tMulti.json["block"]);
        this._tUser.text = data.username;
        this._tBet.text = OMY.OMath.getCashString(AppG.serverWork.convertValue(data.bet, this._currencyOn), true)
            + AppG.currency;
        str = (isWin) ? OMY.OMath.getCashString(AppG.serverWork.convertValue(data.gain, this._currencyOn), true)
            : "0.00";
        this._tWin.text = str + AppG.currency;
        this._tWin.x = (haveMoreInfo) ? this._tWin.json["user_x"] : this._tWin.json.x;
        this._openId = this._data.bid;
        if (OMY.OMath.inArray(BetElement.openList, data.bid) && !this._isOpenMoreInfo) {
            this._openMoreInfo();
        } else if (!OMY.OMath.inArray(BetElement.openList, data.bid) && this._isOpenMoreInfo) {
            this._closeMoreInfo();
        }
        if (!this._isOpenMoreInfo) {
            this._bOpenMore.visible = haveMoreInfo;
            this._bOpenMore.isBlock = !haveMoreInfo || Number(this._data.roundId) === Number(AppG.gameRoundId);
        } else {
            this._sBg.visible = true;
            this._updateMoreInfoData();
        }
    }

    /**     * @private     */
    _updateMoreInfoData() {
        if (!this._cMore) return;
        if (this._tBalance)
            this._tBalance.text = OMY.OMath.getCashString(this._data.balanceOn, true) + AppG.currency;

        if (this._tRoundId)
            this._tRoundId.text = this._data.roundId;
        if (this._tRoundMulti)
            this._tRoundMulti.text = OMY.OMath.getCashString(this._data.roundMultiplier, true) + "x";
        /** @type {Date} */
        let date = new Date(this._data.timeBet);
        this._tDate.text = date.toLocaleString("en-GB");
        if (this._tWinField)
            this._tWinField.text = OMY.OMath.getCashString(
                    AppG.serverWork.convertValue(this._data.gain, this._currencyOn), true)
                + AppG.currency;
        if (this._tWinBet)
            this._tWinBet.text = OMY.OMath.getCashString(
                    AppG.serverWork.convertValue(this._data.bet, this._currencyOn), true)
                + AppG.currency;
        if (this._tWinMulti)
            this._tWinMulti.text = OMY.OMath.getCashString(this._data.multiplierAuto, true) + "x";
        if (this._tWinUser)
            this._tWinUser.text = this._data.username;
        if (this._tType) {
            this._tType.visible = true;
            if (this._data.multiplierAuto >= this._bigConf["gui_win_super"])
                this._tType.text = "gui_win_super";
            else if (this._data.multiplierAuto >= this._bigConf["gui_win_mega"])
                this._tType.text = "gui_win_mega";
            else if (this._data.multiplierAuto >= this._bigConf["gui_win_big"])
                this._tType.text = "gui_win_big";
            else
                this._tType.visible = false;
        }
    }

    clear() {
        this._onOpenNewList();
        this._graphic.visible = false;
        this._data = null;
        this._openId = 0;
    }

    /**     * @private     */
    _onOpenNewList() {
        if (this._isOpenMoreInfo)
            this._emit.emit("update_element_size");
        this._isOpenMoreInfo = false;
        this._clearBetMore();
        this._bOpenMore.isBlock = true;
        this._bOpenMore.visible = false;
        this._bCloseMore.isBlock = true;
        this._bCloseMore.visible = false;
    }

    /**     * @private     */
    _openMoreInfo() {
        if (!this._isOpenMoreInfo) {
            this._isOpenMoreInfo = true;
            this._bOpenMore.isBlock = true;
            this._bOpenMore.visible = false;
            this._bCloseMore.isBlock = false;
            this._bCloseMore.visible = true;
            this._sBg.visible = true;
            if (this._haveWinInfo) this._createWinMore();
            else this._createBetMore();
            this._updateMoreInfoData();
            this._emit.emit("update_element_size");
        }
    }

    /**     * @private     */
    _forceCloseInfo(id) {
        if (this._openId === id) this._closeMoreInfo();
    }

    /**     * @private     */
    _closeMoreInfo() {
        if (this._isOpenMoreInfo) {
            this._isOpenMoreInfo = false;
            this._bCloseMore.isBlock = true;
            this._bCloseMore.visible = false;
            this._bOpenMore.isBlock = false;
            this._bOpenMore.visible = true;
            this._sBg.visible = false;
            this._clearBetMore();
            this._emit.emit("update_element_size");
        }
    }

    /**     * @private     */
    _buttonHandler(btn, action) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        if (action) {
            this._openMoreInfo();
            if (!OMY.OMath.inArray(BetElement.openList, this._openId)) BetElement.openList.push(this._openId);
            if (BetElement.openList.length > BetElement.HISTORY_LIMIT)
                this._emit.emit("force_close", BetElement.openList.shift());
        } else {
            if (OMY.OMath.inArray(BetElement.openList, this._openId))
                BetElement.openList.splice(BetElement.openList.indexOf(this._openId), 1);
            this._closeMoreInfo();
        }
    }

    /**     * @private     */
    _onOpenRoundHistory() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        let historyData = AppG.serverWork.getRoundData(this._data.roundId);
        if (historyData)
            this._setOpenHistoryW(historyData);
    }

    /**     * @private     */
    _setOpenHistoryW(historyData) {
        if (historyData.roundId !== this._data?.roundId) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_HISTORY).active) return;
        OMY.Omy.viewManager.getView(AppConst.W_HISTORY)
            .updateData(historyData, CrashConst.formatRoundTime(historyData.timeOn));
        HistoryElement.open_round_id = historyData.roundId;
        OMY.Omy.viewManager.showWindow(AppConst.W_HISTORY, false,
            OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    /**     * @private     */
    _createBetMore() {
        this._cMore?.destroy();
        /** @type {OMY.OContainer} */
        this._cMore = OMY.Omy.add.containerJson(this._cMoreCanvas, this._gdConf["more_bet"]);
        /** @type {OMY.OTextBitmap} */
        this._tRoundMulti = this._cMore.getChildByName("t_multi");
        /** @type {OMY.OTextBitmap} */
        this._tRoundId = this._cMore.getChildByName("t_round");
        this._tRoundId.externalMethod(this._onOpenRoundHistory.bind(this));
        this._tRoundId.buttonMode = true;
        /** @type {OMY.OTextFont} */
        this._tBalance = this._cMore.getChildByName("t_balance");
        /** @type {OMY.OTextFont} */
        this._tDate = this._cMore.getChildByName("t_date");
    }

    /**     * @private     */
    _clearBetMore() {
        this._cMore?.destroy();
        this._cMore = null;
        this._tRoundMulti = null;
        this._tRoundId = null;
        this._tBalance = null;
        this._tDate = null;
        this._tWinMulti = null;
        this._tWinBet = null;
        this._tWinField = null;
        this._tType = null;
        this._tWinUser = null;
    }

    /**     * @private     */
    _createWinMore() {
        this._cMore?.destroy();
        /** @type {OMY.OContainer} */
        this._cMore = OMY.Omy.add.containerJson(this._cWinCanvas, this._gdConf["more_win"]);
        /** @type {OMY.OTextBitmap} */
        this._tWinMulti = this._cMore.getChildByName("t_multi");
        /** @type {OMY.OTextFont} */
        this._tWinBet = this._cMore.getChildByName("t_bet");
        /** @type {OMY.OTextFont} */
        this._tWinField = this._cMore.getChildByName("t_win");
        /** @type {OMY.OTextFont} */
        this._tDate = this._cMore.getChildByName("t_date");
        /** @type {OMY.OTextFont} */
        this._tType = this._cMore.getChildByName("t_type");
        /** @type {OMY.OTextFont} */
        this._tWinUser = this._cMore.getChildByName("t_user");
    }

    destroy() {
        this._graphic = null;
        this._gdConf = null;
        this._emit.off("open_new", this._onOpenNewList, this);
        this._emit.off("force_close", this._forceCloseInfo, this);
        this._emit = null;
        this._tUser = null;
        this._tBet = null;
        this._tMulti = null;
        this._tWin = null;
        this._sWin = null;
        this._sBg = null;
        this._bOpenMore = null;
        this._bCloseMore = null;
        this._cMore = null;
        this._cMoreCanvas = null;
        this._cWinCanvas = null;
        this._tRoundMulti = null;
        this._tRoundId = null;
        this._tBalance = null;
        this._tDate = null;
        this._tWinMulti = null;
        this._tWinBet = null;
        this._tWinField = null;
        this._tType = null;
        this._tWinUser = null;
        AppG.serverWork.off(CrashConst.EMIT_ON_GET_ROUND, this._setOpenHistoryW, this);
        this._data = null;
        this._bigConf = null;
    }
}
BetElement.openList = [];
BetElement.HISTORY_LIMIT = 5;
