export default class TweenDate {
    /**
     * @param {OMY.OSprite}graphic
     */
    constructor(graphic) {
        /** @type {OMY.OSprite} */
        this._graphic = graphic;
        this._graphic.addDestroy(this._onDestroy, this, true);

        this._tl = OMY.Omy.add.tweenTimeline(
            {
                delay: 2.3333,
                repeat: -1,
                repeatDelay: 0.5
            });
        OMY.Omy.add.tween(this._graphic,
            {alpha: 0.5}, 0.667, null, null, this._tl);
        OMY.Omy.add.tween(this._graphic,
            {alpha: 1.0}, 0.667, null, null, this._tl);
    }

    /**     * @private     */
    _onDestroy() {
        this._tl.kill();
        this._tl = null;
        OMY.Omy.remove.tween(this._graphic);
        this._graphic = null;
    }
}