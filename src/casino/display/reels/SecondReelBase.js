import {ReelBase} from "./ReelBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class SecondReelBase extends ReelBase {
    constructor(conf, index, initCombination) {
        super(conf, index, initCombination);

        AppG.emit.off(AppConst.APP_EMIT_CHOICE_NUDGE, this._nudgeMove, this);
    }

    _configReel() {
        this._reelsConfig = AppG.gameConst.secondReelConfig;

        this.minSpeed = this._reelsConfig.minSpeed;
        this.maxSpeed = this._reelsConfig.maxSpeed;
        this.longSpinSpeed = this._reelsConfig.longReelSpeed;

        this._countSymb = this._reelsConfig.countSlot;
        this._countDownSymb = this._reelsConfig.countDown;
        this._countUpSymb = this._reelsConfig.countUp;

        this._startBackInSpeed = this._reelsConfig.startBackInSpeed;
        this._startBackInTime = this._reelsConfig.startBackInTime;
        this._innerStart = this._reelsConfig.innerStart;
        this._innerFinish = this._reelsConfig.innerFinish;
        this._timeDownStartSpeed = this._reelsConfig.timeDownStartSpeed;

        this._endBackInTime = this._reelsConfig.endBackInTime;
        this._endBackInTime2 = this._reelsConfig.endBackInTime2;
        this._endBackCoef = this._reelsConfig.endBackCoef;

    }
}