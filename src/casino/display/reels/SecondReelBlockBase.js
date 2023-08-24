import {ReelBlockBase} from "./ReelBlockBase";
import {AppG} from "../../AppG";
import {SecondReel} from "../../../app/display/reels/SecondReel";

export class SecondReelBlockBase extends ReelBlockBase {
    constructor() {
        super();
    }

    _configBlock() {
        this._reelClass = SecondReel;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDReelsSecond");
        this._reelsConfig = AppG.gameConst.secondReelConfig;
        this.setXY(
            this._gdConf.x,
            this._gdConf.y,
        );
        if (this._gdConf["debug"])
            OMY.Omy.add.regDebugMode(this);

        this._totalReel = this._reelsConfig.countReel;

        this._defaultDesiredTime = this._reelsConfig.defaultDesiredTime;
        this._turboModeTimeCoef = this._reelsConfig.turboModeTimeCoef;
        this._countSlot = this._reelsConfig.countSlot;
        this._countDown = this._reelsConfig.countDown;
        this._countUp = this._reelsConfig.countUp;
        this._delaySpinReel = this._reelsConfig.delaySpinReel;
        this._delayStartSpinTime = this._reelsConfig.delayStartSpinTime;
        this._delayDelayBetweenReelsTime = this._reelsConfig.delayDelayBetweenReelsTime;
        this._delayDelayBetweenReelsTimeCoef = this._reelsConfig.delayDelayBetweenReelsTimeCoef;
    }

    _createReels() {
        super._createReels();
    }

    _addEmit() {
    }
}