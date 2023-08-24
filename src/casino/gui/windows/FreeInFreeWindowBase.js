import {WindowsBase} from "../WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";

export class FreeInFreeWindowBase extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_FREE_IN_FREE;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDFreeInFree");
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._isOpen = false;
        this._isEditMode = this._gdConf["debug"] || this._gdConf["show_debug"];

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        this._gdConf["debug"] && OMY.Omy.add.regDebugMode(this);
        this._isEditMode && OMY.Omy.add.timer(0.5, this._showDebug, this);

        AppG.emit.on(AppConst.EMIT_MORE_FREE, this._catchFreeInFree, this);
        this._countMoreFree = 0;
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

//---------------------------------------
// PUBLIC
//---------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);

        if (!this._isOpen)
            this._createGraphic();

        OMY.Omy.loc.addUpdate(this._updateLoc, this);
        this._updateLoc();

        this._updateGameSize();

        this._activateWindow();
    }

    _activateWindow() {
        AppG.serverWork.updateTotalFreeGame();

        if (this._gdConf["window_auto_hide"] && !this._gdConf["show_debug"]) {
            OMY.Omy.add.timer(this._gdConf["window_show_sec"], this._hideWindow, this);
        }
    }

    _createGraphic() {
        OMY.Omy.add.createEntities(this, this._gdConf);
        this._isOpen = true;
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

        this._countFreeText = null;
        this._bonusTint = null;
    }

//---------------------------------------
// PRIVATE
//---------------------------------------
    _updateLoc() {
    }

    /**     * @private     */
    _catchFreeInFree(countMoreFree) {
        this._countMoreFree = countMoreFree;
    }

    _hideWindow() {
        this._closeWindow();
    }

    /**     * @private     */
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
