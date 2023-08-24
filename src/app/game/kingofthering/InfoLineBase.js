import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

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

        this._isFreespin = false;

        if (this._graphic.getChildByName("t_skip")) {
            /** @type {OMY.OTextBitmap} */
            this._tSkip = this._graphic.getChildByName("t_skip");
        }

        /** @type {OMY.OTextBitmap} */
        this._tFree = this._graphic.getChildByName("t_free");
        if (!this._editMode) this._tFree.kill();

        AppG.emit.on(AppConst.APP_DEFAULT_STATE, this._startGame, this);
        AppG.emit.on(AppConst.APP_EMIT_SKIP_REEL, this._skipSpin, this);
        AppG.emit.on(AppConst.APP_EMIT_SPIN_REEL, this._updateOnStartSpin, this);
        AppG.emit.on(AppConst.APP_REELBLOCK_END, this._updateOnEndSpin, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_BEGIN, this._onFreeGameBegin, this);
        AppG.emit.on(AppConst.EMIT_FREE_GAME_END, this._onFreeGameEnd, this);

        // OMY.Omy.loc.addUpdate(this._onLocChanged, this);

        this._create();
        this._clear();
        // if (this._editMode) {
        //     this._tFree.text = this._getText("gui_info_1");
        // }
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
            default: {
                break;
            }
        }
    }

    _updateDefaultState() {
    }

    _updateSkipState() {
    }

    //-------------------------------------------------------------------------
    //endregion

    // region emitters:
    //-------------------------------------------------------------------------
    _startGame() {
        if (this._isFreespin) return;
        this._stateUpdate(this.C_DEFAULT);
        this._clear();
    }

    _skipSpin() {
        if (this._isFreespin) return;
        this._stateUpdate(this.C_DEFAULT);
        this._clear();
    }

    _updateOnStartSpin() {
        if (this._isFreespin) return;
        if (!AppG.isHaveSkip) return;
        this._stateUpdate(this.C_SKIP);
        this._clear();
        this._tSkip?.revive();
        this._updateInfo();
    }

    _updateOnEndSpin() {
        if (this._isFreespin) return;
        this._clear();
    }

    _onFreeGameBegin() {
        this._isFreespin = true;
        this._tFree.revive();
        if (AppG.serverWork.haveFreeOnStart) this._clear();
    }

    _onFreeGameEnd() {
        this._isFreespin = false;
        this._tFree.kill();
        this._clear();
        this._stateUpdate(this.C_DEFAULT);
    }

    //-------------------------------------------------------------------------
    //endregion

    _getText(locConst) {
        return OMY.Omy.loc.getText(locConst);
    }
}
