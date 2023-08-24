import {BackgroundBase} from "../../casino/display/BackgroundBase";
import {AppG} from "../../casino/AppG";

export class Background extends BackgroundBase {
    constructor(graphic) {
        super(graphic);

        /** @type {OMY.OSprite} */
        this._bg = this._graphic.getChildByName("s_background");
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        // AppG.updateGameSize(this._graphic);
        // this._bg.width = OMY.Omy.WIDTH;
        // this._bg.height = OMY.Omy.HEIGHT;
        // super._updateGameSize(dx, dy, isScreenPortrait);
        /*if (this._view !== AppG.isScreenPortrait) {
            this._view = AppG.isScreenPortrait;
            const m = AppG.isScreenPortrait ? "v" : "h";
            this._spine.play(true, this._spine.json[m]);
        }*/

    }
}
