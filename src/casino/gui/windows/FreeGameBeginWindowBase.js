import {WindowsBase} from "../WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";

export class FreeGameBeginWindowBase extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_FREE_GAME_BEGIN;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDFreeGameBegin");

        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._isOpen = false;
        this._isEditMode = this._gdConf["debug"] || this._gdConf["show_debug"];
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        this._gdConf["debug"] && OMY.Omy.add.regDebugMode(this);
        this._isEditMode && OMY.Omy.add.timer(0.5, this._showDebug, this);
    }

    _updateGameSize() {
        if (!this._isOpen) return;
        AppG.updateGameSize(this);
        if (this._bonusTint) {
            this._bonusTint.x = -this.x * (1 / this.scale.x);
            this._bonusTint.y = -this.y * (1 / this.scale.y);
            this._bonusTint.width = OMY.Omy.WIDTH * (1 / this.scale.x);
            this._bonusTint.height = OMY.Omy.HEIGHT * (1 / this.scale.y);
        }
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);

        AppG.emit.emit(AppConst.EMIT_FREE_GAME_BEGIN);

        if (!this._isOpen)
            this._createGraphic();
        this._activateWindow();

        OMY.Omy.loc.addUpdate(this._updateLoc, this);
        this._updateLoc();

        this._updateGameSize();
    }

    _createGraphic() {
        OMY.Omy.add.createEntities(this, this._gdConf);
        this._isOpen = true;

        this._bonusTint = this.getChildByName("r_bonus_tint");
    }

    kill(onComplete = null) {
        OMY.Omy.loc.removeUpdate(this._updateLoc, this);

        if (this._isOpen)
            this._clearGraphic();

        super.kill(onComplete);
        this.callAll("destroy");
    }

    _clearGraphic() {
        this._isOpen = false;
        this._bonusTint = null;
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _updateLoc() {
    }

    _activateWindow() {
        AppG.emit.emit(AppConst.EMIT_FREE_GAME_CONTINUE);
        if (this._gdConf["window_auto_hide"] && !this._gdConf["show_debug"]) {
            this._timerShow = OMY.Omy.add.timer(this._gdConf["window_show_sec"], this._hideWindow, this);
        }
    }

    _hideWindow() {
        this._closeWindow();
    }

    _closeWindow() {
        this._hideMe();
        AppG.state.startNewSession();
    }

    get isOpen() {
        return this._isOpen;
    }

    get isEditMode() {
        return this._isEditMode;
    }
}
