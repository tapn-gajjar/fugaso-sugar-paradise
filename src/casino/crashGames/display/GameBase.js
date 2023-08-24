import {AppG} from "../../AppG";
import {CrashConst} from "../CrashConst";

export class GameBase {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._createGraphic();
        this._multi = AppG.serverWork.roundMulti;
        if (AppG.serverWork.currentState === CrashConst.ROUND_CREATE_STATE) {
            this._beforeStart();
        } else {
            this._checkState(AppG.serverWork.currentState, AppG.serverWork.nextState);
        }
        AppG.emit.on(CrashConst.S_GAME_STATE_UPDATE, this._checkState, this);
        AppG.emit.on(CrashConst.S_MULTIPLIER, this._updateMulti, this);
        AppG.emit.on(CrashConst.S_ROUND_END, this._onRoundEnd, this);
    }

    _createGraphic() {
        /** @type {OMY.OTextBitmap} */
        this._txtMulti = this._graphic.getChildByName("t_multi");
    }

    _checkState(currentState, nextState) {
        switch (currentState) {
            case CrashConst.ROUND_BET_STATE: {
                this._waitForBet();
                break;
            }
            case CrashConst.ROUND_INCREASE_STATE: {
                this._prepareForPlay();
                break;
            }
        }
    }

    /**
     * Раунд закінчився. Персонаж полетів
     */
    _beforeStart() {
        const multi = OMY.OMath.getCashString(this._multi, true) + "x";
        this._txtMulti.text = multi;
    }

    _waitForBet() {
        this._txtMulti.kill();
    }

    _prepareForPlay() {
        this._txtMulti.revive();
    }

    _updateMulti(multi) {
        this._multi = multi;
        multi = OMY.OMath.getCashString(multi, true) + "x";
        this._txtMulti.text = multi;
    }

    _onRoundEnd() {
        if (this._txtMulti.json["tween"])
            OMY.Omy.add.tween(this._txtMulti, this._txtMulti.json["setting"], this._txtMulti.json["tween_time"]);
    }

    destroy() {
        this._graphic = null;
        this._gdConf = null;
        AppG.emit.off(CrashConst.S_GAME_STATE_UPDATE, this._checkState, this);
        AppG.emit.off(CrashConst.S_MULTIPLIER, this._updateMulti, this);
        AppG.emit.off(CrashConst.S_ROUND_END, this._onRoundEnd, this);
        OMY.Omy.remove.tween(this._txtMulti);
        this._txtMulti = null;
    }
}
