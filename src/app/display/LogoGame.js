import {LogoGameBase} from "../../casino/display/LogoGameBase";
import {AppG} from "../../casino/AppG";
import {AppConst} from "../../casino/AppConst";

export class LogoGame extends LogoGameBase {
    constructor(graphic) {
        super(graphic);
          /** @type {OMY.OActorSpine} */
          this._aSpine = this._graphic.getChildByName("a_logo");
          this._aSpine.gotoAndStop(0);

        AppG.emit.on(AppConst.EMIT_WIN, this._playWinEffect, this);
        this._delayIdleEffect();
    }

    /**     * @private     */
        _playWinEffect() {
            
        }
        /**     * @private     */
        _clearTimer() {
            this._timerIdl?.destroy();
            this._timerIdl = null;
        }
         /**     * @private     */
        _delayIdleEffect() {
            this._clearTimer();
            this._timerIdl = OMY.Omy.add.timer(OMY.OMath.randomRangeNumber(7, 10),
            this.logoIdl, this);
        }
        /**     * @private     */
        logoIdl() {
            this._aSpine.gotoAndPlay(0, false, this._aSpine.json.custom_a_name);
            this._delayIdleEffect();
    }
}
