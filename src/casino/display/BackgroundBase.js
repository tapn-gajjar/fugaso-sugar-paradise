import {AppG} from "../AppG";

export class BackgroundBase {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;

        this._gdConf = this._graphic.json;
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _updateGameSize(dx, dy, isScreenPortrait) {
        AppG.updateGameSize(this._graphic);

        const m = AppG.isScreenPortrait ? "v_" : "m_";
        const scaleBGx = OMY.Omy.WIDTH / this._gdConf[m + "i_width"];
        const scaleBGy = OMY.Omy.HEIGHT / this._gdConf[m + "i_height"];
        this._graphic.scale.set(Math.max(scaleBGx, scaleBGy));
    }
}
