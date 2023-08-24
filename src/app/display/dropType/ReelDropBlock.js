import {GameConstStatic} from "../../GameConstStatic";
import {ReelBlockDropBase} from "../../../casino/display/reels/drop/ReelBlockDropBase";
import {AppG} from "../../../casino/AppG";
import {DropSymbol} from "./reels/DropSymbol";

export class ReelDropBlock extends ReelBlockDropBase {
    constructor() {
        super();
        // AppG.emit.on(AppConst.APP_EMIT_CATCH_SCATTER, this._onCatchScatter, this);
    }

    recover() {
        for (let i = 0; i < this._totalReel; i++) {
            this._reelList[i].recoverSymbols();
        }
    }

    start() {
        DropSymbol.countScatter = 0;
        this._countScatter = 0;
        super.start();
    }

    _onTurboPreEase(reelId) {
        if (!AppG.isRespin) {
            if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_stop))
                OMY.Omy.sound.play(GameConstStatic.S_reel_stop);
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_crass_fall);
        }
        super._onTurboPreEase(reelId);
        /* if (this._checkReelBySymbol(reelId, ["A"]) && !OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_drop)) {
             OMY.Omy.sound.stop(GameConstStatic.S_reel_stop);
             OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
         }*/
    }

    _onNormalPreEase(reelId) {
        if (!AppG.isRespin)
            OMY.Omy.sound.play(GameConstStatic.S_reel_stop);
        else
            OMY.Omy.sound.play(GameConstStatic.S_crass_fall);
        this._checkScatterPreEase(reelId);
        /*if (this._checkReelBySymbol(reelId, ["A"])) {
            OMY.Omy.sound.stop(GameConstStatic.S_reel_stop);
            OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
        }*/
    }

    _onNormalSkipPreEase(reelId) {
        super._onNormalSkipPreEase(reelId);
        /*if (this._checkReelBySymbol(reelId, ["A"]) && !OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_drop)) {
            OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
        }*/
    }

    /**     * @private     */
    _onCatchScatter(reelId) {
        // if (++this._countScatter > 5) this._countScatter = 5;
        // OMY.Omy.sound.play(GameConstStatic["S_reel_scatter" + String(this._countScatter)]);
        // OMY.Omy.sound.play(GameConstStatic.S_reel_scatter5);
    }

    _checkScatter(reelId) {
    }
}
