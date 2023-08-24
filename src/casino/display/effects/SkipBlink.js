import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";

export class SkipBlink {
    constructor(graphic) {
        /** @type {OMY.OGraphic} */
        this._graphic = graphic;
        this.json = this._graphic.json;
        this._offBlink();

        AppG.emit.on(AppConst.APP_EMIT_SKIP_SPIN, this._blink, this);
        AppG.emit.on(AppConst.APP_EMIT_SKIP_WIN, this._blink, this);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

    _updateGameSize() {
        this._graphic.width = OMY.Omy.WIDTH;
        this._graphic.height = OMY.Omy.HEIGHT;
    }

    /**     * @private     */
    _blink() {
        this._graphic.visible = true;
        this._graphic.alpha = 0;
        OMY.Omy.add.tween(this._graphic, {alpha: this.json["alpha"]}, this.json["tween_time"],
            this._offBlink.bind(this),
            {
                // delay:0
                ease: this.json["ease"],
                // paused:false
                // onStart:Function
                // onUpdate:Function
                // onRepeat:Function
                repeat: 1,
                // repeatDelay:0
                yoyo: true,
                // startAt:null TweenMax.to(mc, 2, {x:500, startAt:{x:0}});
            });
    }

    /**     * @private     */
    _offBlink() {
        this._graphic.visible = false;
    }
}