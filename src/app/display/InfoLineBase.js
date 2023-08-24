import {AppG} from "../../casino/AppG";
import {AppConst} from "../../casino/AppConst";

export class InfoLineBase {
    /**
     * @param {OMY.OContainer} container
     */
    constructor(container) {
        /** @type {OMY.OContainer} */
        this._graphic = container;
        this._state = null;
        this.C_DEFAULT = "deff";
        this.C_SKIP = "skip";

        AppG.emit.on(AppConst.APP_DEFAULT_STATE, this._startGame, this);
        AppG.emit.on(AppConst.APP_EMIT_SKIP_REEL, this._skipSpin, this);
        AppG.emit.on(AppConst.APP_EMIT_SPIN_REEL, this._updateOnStartSpin, this);
        AppG.emit.on(AppConst.APP_REELBLOCK_END, this._updateOnEndSpin, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_BEGIN, this._onFreeGameBegin, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_END, this._onFreeGameEnd, this);

        AppG.emit.on(AppConst.EMIT_RE_SPIN_BEGIN, this._onFreeGameBegin, this);
        AppG.emit.on(AppConst.EMIT_RE_SPIN_END, this._onFreeGameEnd, this);

        OMY.Omy.loc.addUpdate(this._onLocChanged, this);

        // AppG.emit.on(AppConst.APP_LAST_WIN, this._lastWin, this);
        // AppG.emit.on(AppConst.APP_SHOW_WIN, this._updateOnWin, this);
        // AppG.emit.on(AppConst.EMIT_MORE_FREE, this._onFreeGameMore, this);
    }

    _onLocChanged() {
        this._stateUpdate();
    }

    _stateUpdate(state) {
        state = state || this._state;
        switch (state) {
            case this.C_DEFAULT: {
                this._updateDefaultState();
                break;
            }
            case this.C_SKIP: {
                this._updateSkipState();
                break;
            }
            default: {
                break;
            }
        }
        this._state = state;
    }

    _updateDefaultState() {

    }

    _updateSkipState() {

    }

    _startGame() {
        this._stateUpdate(this.C_DEFAULT);
    }

    _skipSpin() {
        this._stateUpdate(this.C_DEFAULT);
    }

    _updateOnStartSpin() {
        this._stateUpdate(this.C_SKIP);
    }

    _updateOnEndSpin() {

    }

    _updateWinFreeValue() {
        this._freeWinValue = String(OMY.OMath.roundNumber(AppG.serverWork.totalFreeWin / AppG.serverWork.creditType, 100));
        let split = this._freeWinValue.split(".");
        if (split.length === 1) {
            this._freeWinValue += ".00";
        } else if (split.length === 2 && split[1].length === 1) {
            this._freeWinValue += "0";
        }
    }

    _onFreeGameBegin() {
        this._updateWinFreeValue();
    }

    _onFreeGameEnd() {
        this._stateUpdate(this.C_DEFAULT);
    }

    _onFreeGameMore() {
        this._isFreeGameMore = true;
    }

    _getText(locConst) {
        return OMY.Omy.loc.getText(locConst);
    }
}
