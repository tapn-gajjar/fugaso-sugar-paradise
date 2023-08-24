import {WindowsBase} from "../WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class BonusWindowBase extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_BONUS;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDBonus");

        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._isOpen = false;
        this._winTotal = 0;
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        this._gdConf["debug"] && OMY.Omy.add.regDebugMode(this);
        this._gdConf["show_debug"] && OMY.Omy.add.timer(0.5, this._showDebug, this);
    }

    /**     * @private     */
    _updateGameSize(dx, dy, isScreenPortrait) {
        if (!this._isOpen) return;
        AppG.updateGameSize(this);
        /*if (this._bonusTint) {
            this._bonusTint.x = -this.x * (1 / this.scale.x);
            this._bonusTint.y = -this.y * (1 / this.scale.y);
            this._bonusTint.width = OMY.Omy.WIDTH * (1 / this.scale.x);
            this._bonusTint.height = OMY.Omy.HEIGHT * (1 / this.scale.y);
        }*/
    }

    //-------------------------------------------------------------------------
    // OVERRIDE
    //-------------------------------------------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);
        if (!this._isOpen)
            this._createGraphic();
        OMY.Omy.navigateBtn.updateState(AppConst.C_BONUS_GAME);
        this._winTotal = 0;

        OMY.Omy.loc.addUpdate(this._updateLoc, this);
        this._updateLoc();

        this._updateGameSize();
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        OMY.Omy.loc.removeUpdate(this._updateLoc, this);
        if (this._isOpen)
            this._clearGraphic();
        super.kill(onComplete);
        this.callAll("destroy");
    }

    _onKill() {
        super._onKill();
    }

    _updateLoc() {

    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _createGraphic() {
        this._isOpen = true;
        OMY.Omy.add.createEntities(this, this._gdConf);
    }

    _clearGraphic() {
        this._isOpen = false;
    }

    _endShowBonus() {
        if (!this._gdConf["show_debug"])
            OMY.Omy.add.timer(this._gdConf["delay_win_message_hide_sec"], this._hideWindow, this);
    }

    _hideWindow() {
        AppG.isBonusGame = false;
        this._hideMe();
        AppG.state.startNewSession();
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------

    get isOpen() {
        return this._isOpen;
    }
}
