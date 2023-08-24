import {AppG} from "../AppG";
import {AppConst} from "../AppConst";

export class WindowsBase extends OMY.OContainer {
    constructor() {
        super();
        this._wName = null;
        this._onComplete = null;
    }

    /**     * @public     */
    onActiveWindow(state) {

    }

    _showDebug() {
        OMY.Omy.viewManager.showWindow(this._wName, true, OMY.Omy.viewManager?.gameUI?.getWindowLayer());
    }

    _hideMe() {
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    kill(onComplete = null) {
        AppG.emit.emit(AppConst.E_START_HIDE_WINDOW, this._wName);
        this._onComplete = onComplete;
        if (this._onReviveTimer) {
            this._onReviveTimer.destroy();
            this._onReviveTimer = null;
        }
        this._onKillTimer = OMY.Omy.add.timer(0.01, this._onKill, this);
    }

    _onKill() {
        super.kill();
        this._onKillTimer = null;

        if (this._onComplete) {
            this._onComplete(this._wName);
            this._onComplete = null;
        }
    }

    revive(onComplete = null) {
        super.revive();
        AppG.emit.emit(AppConst.E_START_SHOW_WINDOW, this._wName);

        this._onComplete = onComplete;
        if (this._onKillTimer) {
            this._onKillTimer.destroy();
            this._onKillTimer = null;
        }
        this._onReviveTimer = OMY.Omy.add.timer(0.01, this._onRevive, this);
    }

    _onRevive() {
        this._onReviveTimer = null;
        if (this._onComplete) {
            this._onComplete(this._wName);
            this._onComplete = null;
        }

    }

    get wName() {
        return this._wName;
    }
}
