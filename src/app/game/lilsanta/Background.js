import {BackgroundBase} from "../../../casino/display/BackgroundBase";

export class Background extends BackgroundBase {
    constructor(graphic) {
        super(graphic);

        /** @type {OMY.OActorSpine} */
        this._bg = this._graphic.getChildByName("s_background");
    }

    startFree() {
        this._bg.setSkin(this._bg.json["skin_free"]);
    }

    endFree() {
        this._bg.setSkin(this._bg.json["skin_normal"]);
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
