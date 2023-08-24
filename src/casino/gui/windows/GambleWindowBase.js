import {WindowsBase} from "../WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class GambleWindowBase extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_GAMBLE;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDGamble");

        this._timeCollectWin = this._gdConf["timeCollectWin"] || 0;

        this._isGraphic = false;
        this._isOpen = false;

        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._debugMode = this._gdConf["debug"] || this._gdConf["visible"];
        if (this._debugMode) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    /**     * @private     */
    _updateGameSize(dx, dy, isScreenPortrait) {
        if (!this.active) return;
        AppG.updateGameSize(this);
        // const m = AppG.isScreenPortrait ? "v_" : "m_";
        // const scaleBGx = OMY.Omy.WIDTH / this._bg.json[m + "i_width"];
        // const scaleBGy = OMY.Omy.HEIGHT / this._bg.json[m + "i_height"];
        // this._bg.scale.set(Math.max(scaleBGx, scaleBGy));
        if (this._tint) {
            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }
    }

    //-------------------------------------------------------------------------
    // OVERRIDE
    //-------------------------------------------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);
        if (!this._isGraphic) this._createGraphic();
        this._isOpen = true;
    }

    _onRevive() {
        super._onRevive();
        if (!this._debugMode) this.startNewSession();
    }

    kill(onComplete = null) {
        if (this._isGraphic) {
            this._isOpen = false;
            this._clearGraphic();
        }
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _createGraphic() {
        this._isGraphic = true;
        AppG.serverWork.on(AppConst.EMITSERVER_GAMBLE, this.getServerResponce, this);
        AppG.serverWork.on(AppConst.EMITSERVER_PRESS_COLLECT, this._onSendCollect, this);

        OMY.Omy.add.createEntities(this, this._gdConf);

        if (this.getChildByName("c_game_bg")) {
            /** @type {OMY.OContainer} */
            this._bg = this.getChildByName("c_game_bg");
            this._bg.input = true;
            this._bg.alpha = 0;
        }
        if (this.getChildByName("r_tint")) {
            this._tint = this.getChildByName("r_tint");
            this._tint.interactive = true;
        }

        this._countGambleGame = AppG.serverWork.gambleCount;

        this._updateGameSize();
    }

    _clearGraphic() {
        this._isGraphic = false;
        AppG.serverWork.off(AppConst.EMITSERVER_GAMBLE, this.getServerResponce, this);
        AppG.serverWork.off(AppConst.EMITSERVER_PRESS_COLLECT, this._onSendCollect, this);
        this._bg = null;
        this._tint = null;
        this._startNewSessionTimer?.destroy();
        this._startNewSessionTimer = null;
        this.callAll("destroy");
    }

    _hideWindow() {
        if (!AppG.serverWork.isWinGamble) AppG.state.startNewSession();
        this._hideMe();
    }

    _onSendCollect() {
        OMY.Omy.add.timer(this._timeCollectWin, this._hideWindow, this);
    }

    startNewSession() {
        OMY.Omy.navigateBtn.updateState(AppConst.C_PLAY_GAMBLE);
    }

    getServerResponce() {
        this._countGambleGame = AppG.serverWork.gambleCount;
        this.checkGambleState();
    }

    checkGambleState() {
        if (AppG.serverWork.isWinGamble) {
            this.win();
            if (AppG.serverWork.nextAct === AppConst.API_GAMBLE_END || AppG.serverWork.nextAct === AppConst.API_GAMBLE_FREE_END) {
                this._finalDouble();
            }
        } else {
            this.lose();
        }
    }

    win() {
        AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit, true);
        this._startNewSessionTimer = OMY.Omy.add.timer(this._gdConf["time_wait_on_win"], this.startNewSession, this);
    }

    lose() {
        AppG.serverWork.gambleLose();
    }

    _finalDouble() {
        this._startNewSessionTimer?.destroy();
        this._startNewSessionTimer = null;
        this._startNewSessionTimer = OMY.Omy.add.timer(this._gdConf["time_wait_finally_win"], AppG.state.collectWin, AppG.state);
    }

    _onClickRed() {
        this.onChangeColor();
        AppG.serverWork.sendRed();
    }

    _onClickBlack() {
        this.onChangeColor();
        AppG.serverWork.sendBlack();
    }

    onChangeColor() {
        OMY.Omy.navigateBtn.updateState(AppConst.C_PLAY_GAMBLE_WAIT);
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = false;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = true;
        }
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------

    get isOpen() {
        return this._isOpen;
    }
}
