import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {GameConstStatic} from "../../GameConstStatic";

export class InfoLineBase {
    /**
     * @param {OMY.OContainer} container
     */
    constructor(container) {
        /** @type {OMY.OContainer} */
        this._graphic = container;
        this._gdConf = this._graphic.json;
        this._editMode = this._gdConf["debug_text"];

        this._state = null;
        this.C_DEFAULT = "deff";
        this.C_SKIP = "skip";
        this.C_WIN = "win";

        this._isFreespin = false;
        /** @type {GameWinData} */
        this._winData = AppG.dataWins
        this._endFreeMes = false;

        this._winTitle = "";
        /** @type {OMY.OTextBitmap} */
        this._tField = this._graphic.getChildByName("t_value");
        if (this._graphic.getChildByName("t_skip")) {
            /** @type {OMY.OTextBitmap} */
            this._tSkip = this._graphic.getChildByName("t_skip");
        }
        /** @type {OMY.OTextNumberBitmap} */
        this._fakeTxt = OMY.Omy.add.textJson(null, this._graphic.json["txt_inc"]);
        this._fakeTxt.onStepInc = this._textIncUpdate.bind(this);

        /** @type {OMY.OContainer} */
        this._canvas = this._graphic.getChildByName("c_wins");
        /** @type {OMY.OTextBitmap} */
        this._tCount = this._canvas.canvas.getChildByName("t_count");
        /** @type {OMY.OTextBitmap} */
        this._tWin = this._canvas.canvas.getChildByName("t_value");
        /** @type {OMY.OSprite} */
        this._symbol = this._canvas.canvas.getChildByName("s_symb");

        /** @type {OMY.OTextBitmap} */
        this._tWinner = this._graphic.getChildByName("t_winner");
        /** @type {OMY.OTextBitmap} */
        this._tFree = this._graphic.getChildByName("t_free");
        if (!this._editMode) this._tFree.kill();

        AppG.emit.on(AppConst.APP_DEFAULT_STATE, this._startGame, this);
        AppG.emit.on(AppConst.APP_EMIT_SKIP_REEL, this._skipSpin, this);
        AppG.emit.on(AppConst.APP_EMIT_SPIN_REEL, this._updateOnStartSpin, this);
        AppG.emit.on(AppConst.APP_REELBLOCK_END, this._updateOnEndSpin, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_BEGIN, this._onFreeGameBegin, this);
        OMY.Omy.viewManager.addCloseWindow(AppConst.W_FREE_GAME_END, this._onFreeEndClose, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_END, this._onFreeGameEnd, this);

        AppG.emit.on(AppConst.APP_SHOW_WIN, this._updateOnWin, this);
        AppG.emit.on(AppConst.APP_START_INC_WIN, this._onStartIncWin, this);
        AppG.emit.on(GameConstStatic.E_HIDE_WIN_EFFECT, this._onHideWinEffect, this);
        AppG.emit.on(GameConstStatic.E_RECOVER_RESPINE, this._onRecoverRespine, this);

        OMY.Omy.loc.addUpdate(this._onLocChanged, this);

        // AppG.emit.on(AppConst.EMIT_MORE_FREE, this._onFreeGameMore, this);

        this._create();
        this._clear();
        if (this._editMode){
            let str = this._getText("gui_info_free_1");
            this._tFree.text = OMY.StringUtils.sprintf(str, this._freeLeft);
            this._tWin.text += OMY.OMath.getCashString(123654, true) + String(AppG.currency)
                + " X " + String(100) + " = " + OMY.OMath.getCashString(126779, true) + String(AppG.currency);
            this._tCount.text = String(10) + "X";
            this._tField.text = this._getText("gui_winTitle") + ": " +
                OMY.OMath.getCashString(13798, true) + String(AppG.currency);
            this._canvas.alignContainer();
        }

    }

    _create() {

    }

    _onLocChanged() {
        this._updateInfo();
    }

    // region state work:
    //-------------------------------------------------------------------------
    _stateUpdate(state) {
        this._prevState = this._state;
        this._state = state || this._state;
    }

    _clear() {
        if (this._editMode) return;
        this._tField.kill();
        this._canvas.kill();
        this._tWinner.kill();
        this._tSkip?.kill();
    }

    _updateInfo() {
        switch (this._state) {
            case this.C_DEFAULT: {
                this._updateDefaultState();
                break;
            }
            case this.C_SKIP: {
                this._updateSkipState();
                break;
            }
            case this.C_WIN: {
                this._updateWinState();
                break;
            }
            default: {
                break;
            }
        }
    }

    _updateDefaultState() {
        if (this._isFreespin) {
            this._tFree.revive();
            let str = this._getText("gui_info_free_1");
            this._tFree.text = OMY.StringUtils.sprintf(str, this._freeLeft);
        }
        if (this._endFreeMes)
            this._tFree.text = this._getText("gui_info_free_2");

    }

    _updateSkipState() {
    }

    _updateWinState() {
        this._tField.text = this._getText(this._winTitle) + ": " +
            OMY.OMath.getCashString(this._fakeTxt.value, true) + String(AppG.currency);
        if (this._canvas.active) {
            this._multi = this._winData.multi;
            this._winValue = this._winData.credit;

            this._tCount.text = String(this._countWin) + "X";
            this._symbol.texture = this._symbol.json["t_name"] + String(AppG.gameConst.symbolID(this._nameSymbol));
            this._tWin.text = this._getText("gui_info_win_1") + " ";
            if (this._multi > 1) {
                this._tWin.text += OMY.OMath.getCashString(this._winValue / this._multi, true) + String(AppG.currency)
                    + " X " + String(this._multi) + " = " + OMY.OMath.getCashString(this._winValue, true) + String(AppG.currency);
            } else {
                this._tWin.text += OMY.OMath.getCashString(this._winValue, true) + String(AppG.currency);
            }
            this._canvas.alignContainer();
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    // region emitters:
    //-------------------------------------------------------------------------
    _startGame() {
        if (AppG.isPLayReSpins) return;
        if (this._isFreespin) {
            this._stateUpdate(this.C_DEFAULT);
            this._freeLeft = AppG.serverWork.totalFreeGame - AppG.serverWork.countFreeGame;
            this._updateInfo();
            return;
        }
        this._stateUpdate(this.C_DEFAULT);
        this._clear();
    }

    _skipSpin() {
        if (AppG.isPLayReSpins && !AppG.isBeginRespin) return;
        if (this._isFreespin) return;
        this._stateUpdate(this.C_DEFAULT);
        this._clear();
    }

    _updateOnStartSpin() {
        if (this._endFreeMes) {
            this._endFreeMes = false;
            this._tFree.kill();
        }
        if (AppG.isPLayReSpins && !AppG.isBeginRespin) return;
        if (this._isFreespin) {
            this._freeLeft--;
            this._updateInfo();
            return;
        }
        if (AppG.isGameDrop && (AppG.isTurbo || AppG.isPLayReSpins)) {
            return;
        }
        if (!AppG.isHaveSkip) return;
        this._stateUpdate(this.C_SKIP);
        this._clear();
        this._tSkip?.revive();
        this._updateInfo();
    }

    _updateOnEndSpin() {
        if (AppG.isPLayReSpins && !AppG.isBeginRespin) return;
        if (this._isFreespin) return;
        this._clear();
    }

    _onFreeGameBegin() {
        this._isFreespin = true;
        this._freeLeft = AppG.serverWork.totalFreeGame - AppG.serverWork.countFreeGame;
        if (AppG.serverWork.haveFreeOnStart) this._clear();
    }

    _onFreeGameEnd() {
        this._isFreespin = false;
        this._clear();
    }

    /**     * @private     */
    _onFreeEndClose() {
        this._tFree.revive();
        this._endFreeMes = true;
        this._stateUpdate(this.C_DEFAULT);
        this._updateInfo();
    }

    /**     * @private     */
    _updateOnWin(value, skip = false) {
        this._fakeTxt.stopInctAnimation();
        this._fakeTxt.setNumbers(this._fakeTxt.value);
        this._updateInfo();
        if (!AppG.isPLayReSpins)
            this._clear();
    }

    /**     * @private     */
    _onStartIncWin(winValue, icnTime) {
        if (!this._tField.active) {
            this._tField.revive();
            this._winTitle = "gui_winTitle";
            this._totalWin = 0;
        }
        this._stateUpdate(this.C_WIN);
        this._tFree.kill();
        this._tSkip?.kill();

        this._fakeTxt.setNumbers(this._totalWin);
        this._totalWin = AppG.serverWork.totalRespinWin / AppG.serverWork.creditType;
        this._fakeTxt.incSecond = icnTime;
        this._fakeTxt.setNumbers(this._totalWin, true);

        this._canvas.kill();
        this._tWinner.kill();
        const moreWins = this._winData.countLinesWin > 1;
        if (moreWins) {
            this._tWinner.revive();
        } else {
            this._canvas.revive();
            this._winData.repeatWins();
            this._winData.nextLine();
            this._countWin = this._winData.countSymbol;
            this._nameSymbol = this._winData.winSymbol;
            this._multi = this._winData.multi;
            this._winValue = this._winData.credit;
        }

        this._updateInfo();
    }

    /**     * @private     */
    _onHideWinEffect() {
        this._canvas.kill();
        this._tWinner.kill();
    }

    /**     * @private     */
    _onRecoverRespine() {
        this._clear();
        if (!this._tField.active) {
            this._tField.revive();
            this._winTitle = "gui_winTitle";
        }
        this._stateUpdate(this.C_WIN);
        this._tFree.kill();

        this._totalWin = AppG.serverWork.totalRespinWin / AppG.serverWork.creditType;
        this._fakeTxt.setNumbers(this._totalWin);
        this._updateInfo();
    }

    //-------------------------------------------------------------------------
    //endregion

    _onFreeGameMore() {
        this._isFreeGameMore = true;
    }

    _getText(locConst) {
        return OMY.Omy.loc.getText(locConst);
    }

    /**     * @private     */
    _textIncUpdate() {
        this._updateInfo();
    }
}
