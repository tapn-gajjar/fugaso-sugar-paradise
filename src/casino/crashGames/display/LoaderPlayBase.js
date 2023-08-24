import {AppG} from "../../AppG";
import {CrashConst} from "../CrashConst";

export class LoaderPlayBase {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._isEditMode = Boolean(this._gdConf["edit"]);

        let barColor = this._graphic.getChildByName("s_progress_back");
        let bar = this._graphic.getChildByName("s_progress");

        this._maskProgress = OMY.Omy.add.maskRectJson(this._graphic, {
            x: barColor.x, y: barColor.y,
            width: barColor.width, height: barColor.height,
            type: "rect", name: "r_progress_mask", debug: 0,
        });
        this._maskProgress.scale.x = 0.01;
        this._animateLoader = false;
        if (this._isEditMode) {
            this._createStatic();
            return;
        }
        if (AppG.serverWork.currentState === CrashConst.ROUND_BET_STATE) {
            this._startWorkLoader();
        } else {
            this._graphic.kill();
        }
        AppG.emit.on(CrashConst.S_GAME_STATE_UPDATE, this._onServerStateUpdate, this);
    }

    /**     * @private     */
    _onServerStateUpdate(currentState, nextState) {
        if (currentState === CrashConst.ROUND_BET_STATE) {
            this._startWorkLoader();
        } else {
            if (this._animateLoader) {
                OMY.Omy.remove.tween(this._maskProgress.scale);
                this._onCompleteLoad();
            }
        }
    }

    /**     * @private     */
    _createStatic() {
        this._graphic.revive();
        this._maskProgress.scale.x = 0;
    }

    _startWorkLoader() {
        if (!this._graphic.active) this._graphic.revive();
        this._graphic.getChildByName("s_progress").mask = null;
        this._graphic.getChildByName("s_progress").mask = this._maskProgress;
        let timeLeft = AppG.serverWork.endTime - AppG.serverWork.time;
        this._progress = (AppG.serverWork.timeForBet - timeLeft) / AppG.serverWork.timeForBet;
        this._progress = (this._progress > 1) ? 1 : this._progress;

        OMY.Omy.remove.tween(this._maskProgress.scale);
        this._maskProgress.scale.x = this._progress;
        this._animateLoader = true;
        OMY.Omy.add.tween(this._maskProgress.scale, {x: 1}, Math.abs(timeLeft));
    }

    /**     * @private     */
    _onCompleteLoad() {
        this._animateLoader = false;
        this._graphic.kill();
    }

    destroy() {
        this._graphic = null;
        this._gdConf = null;
        OMY.Omy.remove.tween(this._maskProgress.scale);
        this._maskProgress = null;
        AppG.emit.off(CrashConst.S_GAME_STATE_UPDATE, this._onServerStateUpdate, this);
    }
}
