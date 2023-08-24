export default class TweenClose {
    /**
     * @param {OMY.OButton}graphic
     */
    constructor(graphic) {
        /** @type {OMY.OButton} */
        this._graphic = graphic;
        this._graphic.addDestroy(this._onDestroy, this, true);
        this.saveScaleX = this._graphic.scale.x;
        this.saveScaleY = this._graphic.scale.y;

        this._tl = OMY.Omy.add.tweenTimeline(
            {
                delay: 2.3333,
                repeat: -1,
                repeatDelay: 2.3333
            });
        OMY.Omy.add.tween(this._graphic.scale, {
            "x": this.saveScaleX - 0.4,
            "y": this.saveScaleY - 0.4
        }, 2.4 - 2.3333, null, null, this._tl);
        OMY.Omy.add.tween(this._graphic.scale, {
            "x": this.saveScaleX + 0.1,
            "y": this.saveScaleY + 0.1,
        }, 2.5333 - 2.4, null, null, this._tl);
        OMY.Omy.add.tween(this._graphic.scale, {
            "x": this.saveScaleX,
            "y": this.saveScaleY,
        }, 2.6667 - 2.5333, null, null, this._tl);
    }

    /**     * @private     */
    _onDestroy() {
        this._tl.kill();
        this._tl = null;
        OMY.Omy.remove.tween(this._graphic);
        this._graphic = null;
    }
}