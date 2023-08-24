import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";
import {ReelBlockBase} from "../../casino/display/reels/ReelBlockBase";
import {AppConst} from "../../casino/AppConst";
import {SlotSymbol} from "./reels/SlotSymbol";

export class ReelBlock extends ReelBlockBase {
    constructor() {
        super();
        AppG.emit.on(AppConst.APP_EMIT_CATCH_SCATTER, this._onCatchScatter, this);
        this._minNotWild = AppG.gameConst.game_const["count_not_wild"][0];
        this._maxNotWild = AppG.gameConst.game_const["count_not_wild"][1];
    }

    start() {
        this._longMatrix = null;
        if (!SlotSymbol.countNotWild) SlotSymbol.countNotWild = [0, 0, 0, 0, 0];
        SlotSymbol.countNotWild.map((a, index, array) =>
            array[index] = OMY.OMath.randomRangeInt(this._minNotWild, this._maxNotWild));
        super.start();
    }

    _onTurboPreEase(reelId) {
        // OMY.Omy.sound.play(((AppG.delayDelayBetweenReelsTimeCoef) ? GameConstStatic.S_reel_stop : GameConstStatic.S_reel_stop_all));
        super._onTurboPreEase(reelId);
        if (this._totalStopComplete === this._countActive) {
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_stop_all)){
                OMY.Omy.sound.stop(GameConstStatic.S_reel_stop_all);
            }
            OMY.Omy.sound.play(GameConstStatic.S_quickStop);
        }
    }

    _checkScatter(reelId) {
    }

    /**     * @private     */
    _onCatchScatter(count, reelId) {
        let needPlay = true;
        if (count === 1 && reelId >= 3) needPlay = false;
        if (count === 2 && reelId > 3) needPlay = false;
        if (needPlay)
            OMY.Omy.sound.play(GameConstStatic["S_reel_scatter" + String(count)]);
    }

    respinLongEffect(longMatrix) {
        this._longMatrix = longMatrix;
    }

    _checkLongReelCase() {
        if (this._longMatrix) {
            let effectIndex = -1;
            let timeForLongReel = 0;
            let timeDelay = this._delayDelayBetweenReelsTime *
                ((this._turboMode) ? this._delayDelayBetweenReelsTimeCoef : 1);
            for (let i = 0; i < this._longMatrix.length; i++) {
                this._reelList[i].effectIndex = -1;
                if (Boolean(this._longMatrix[i])) {
                    this._reelList[effectIndex].effectIndex = (i === this._longMatrix.length - 1) ? -1 : i;
                    timeForLongReel += (i === this._longMatrix.length - 1) ? timeDelay : this._timeForLongReel;
                    this._reelList[i].longReel(timeForLongReel, false, "A");
                }
                if (!this._reelList[i].isBlock) effectIndex = i;
            }
            this._longMatrix = null;
        }
    }
}
