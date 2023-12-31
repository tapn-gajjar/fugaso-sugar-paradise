import {AppG} from "../../casino/AppG";
import {InfoLineBase} from "./InfoLineBase";
import {AppConst} from "../../casino/AppConst";

export class InfoLineV extends InfoLineBase {
    /**
     * @param {OMY.OContainer} container
     */
    constructor(container) {
        super(container);

        this._freeText = "";
        /** @type {OMY.OTextBitmap} */
        this._tSkipField = this._graphic.getChildByName("t_skip");
        this._tSkipField.visible = false;
        /** @type {OMY.OTextBitmap} */
        this._tWinField = this._graphic.getChildByName("t_win");
        /** @type {OMY.OSprite} */
        this._sWinBg = this._graphic.getChildByName("s_panel_win");
        this._sWinBg.visible = false;

        AppG.emit.on(AppConst.APP_SHOW_WIN, this._updateOnWin, this);

        AppG.emit.on(AppConst.APP_START_INC_WIN, this._onStartIncWin, this);
        /** @type {OMY.OTextNumberBitmap} */
        this._fakeTxt = OMY.Omy.add.textJson(null, this._graphic.json["txt_inc"]);
        this._fakeTxt.onStepInc = this._textIncUpdate.bind(this);
        this._isClearFake = true;
        this._startWithBonus = AppG.isBeginRespin;

        this._startGame();
        if (this._graphic.json.hasOwnProperty("debug_text") && this._graphic.json["debug_text"]) {
            this._updateWinFreeValue(this._graphic.json["debug_value"]);
            this._freeText = this._getText("gui_total_win_title") + ": " + this._freeWinValue;
            this._sWinBg.visible = true;
            this._stateUpdate();
        }
    }

    _updateWinFreeValue(value = NaN) {
        value = value || AppG.totalWinInSpin || this._totalWin;
        this._freeWinValue = String(value);
        let split = this._freeWinValue.split(".");
        if (split.length === 1) {
            this._freeWinValue += ".00";
        } else if (split.length === 2 && split[1].length === 1) {
            this._freeWinValue += "0";
        }
    }

    _onLocChanged() {
        if (this._freeText.length) {
            this._freeText = this._getText("gui_total_win_title") + ": " + this._freeWinValue + AppG.currency + "'";
        }
        super._onLocChanged();
    }

    _stateUpdate(state) {
        super._stateUpdate(state);
        if (this._tWinField.text !== this._freeText)
            this._tWinField.text = this._freeText;
    }

    _updateDefaultState() {
        super._updateDefaultState();
        this._tSkipField.visible = false;
    }

    _updateSkipState() {
        if (AppG.isGameDrop && (AppG.isTurbo || AppG.isPLayReSpins)) {
            return;
        }
        if (!AppG.isHaveSkip) return;
        super._updateSkipState();
        this._tSkipField.visible = !AppG.isRespin && !AppG.isTurbo;
        if (this._tSkipField.visible && this._sWinBg.visible) {
            this._sWinBg.visible = false;
            this._tWinField.text = this._freeText = "";
        }
    }

    _startGame() {
        if (AppG.isRespin) {
            if (this._totalWin !== 0) {
                this._updateWinFreeValue();
                this._freeText = this._getText("gui_total_win_title") + ": " + this._freeWinValue + AppG.currency + "'";
                this._sWinBg.visible = true;
            }
        }
        super._startGame();
    }

    _updateOnEndSpin() {
        if (this._tSkipField.visible) this._tSkipField.visible = false;
    }

    /**     * @private     */
    _updateOnWin() {
        if (AppG.isRespin || AppG.isBeginRespin) {
            this._fakeTxt.stopInctAnimation();
            this._fakeTxt.setNumbers(this._fakeTxt.value);
            this._updateWinFreeValue();
            this._freeText = this._getText("gui_total_win_title") + ": " + this._freeWinValue + AppG.currency + "'";
            if (!this._sWinBg.visible) this._sWinBg.visible = true;
            this._stateUpdate();
        }
    }

    /**     * @private     */
    _checkClearFake() {
        if (this._isClearFake) {
            this._isClearFake = false;
            this._fakeTxt.setNumbers(0);
            this._totalWin = 0;
        }
    }

    _onFreeGameBegin() {
        this._checkClearFake();
        if (this._startWithBonus) {
            this._startWithBonus = false;
            this._totalWin = AppG.totalRespinWin;
            this._updateWinFreeValue(this._totalWin);

            this._freeText = this._getText("gui_total_win_title") + ": " + this._freeWinValue + AppG.currency + "'";
            this._sWinBg.visible = true;
            this._stateUpdate(this.C_DEFAULT);
            this._fakeTxt.setNumbers(this._totalWin);
        }
    }

    _onFreeGameEnd() {
        this._isClearFake = true;
        OMY.Omy.add.timer((AppG.isAutoGame) ? 0 : 0.5, () => {
            this._freeText = "";
            this._sWinBg.visible = false;
            this._stateUpdate(this.C_DEFAULT);
        }, this);
    }

    /**     * @private     */
    _onStartIncWin(winValue, icnTime) {
        if (!AppG.isRespin && !AppG.isBeginRespin) return;
        this._checkClearFake();
        this._updateWinFreeValue(this._totalWin);

        this._freeText = this._getText("gui_total_win_title") + ": " + this._freeWinValue + AppG.currency + "'";
        this._sWinBg.visible = true;
        this._stateUpdate(this.C_DEFAULT);
        this._fakeTxt.setNumbers(this._totalWin);

        this._totalWin = AppG.totalWinInSpin;
        this._fakeTxt.incSecond = icnTime;
        this._fakeTxt.setNumbers(AppG.totalWinInSpin, true);
    }

    /**     * @private     */
    _textIncUpdate(value) {
        this._updateWinFreeValue(value);
        this._freeText = this._getText("gui_total_win_title") + ": " + this._freeWinValue + AppG.currency + "'";
        if (this._tWinField.text !== this._freeText) {
            if (!this._sWinBg.visible) this._sWinBg.visible = true;
            this._tWinField.text = this._freeText;
        }
    }
}
