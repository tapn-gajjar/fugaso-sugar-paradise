export default class CounterAnimate {
    constructor(animateContainer, config) {
        /** @type {OMY.OContainer} */
        this._graphic = animateContainer;
        this._gdConf = config;

        /** @type {Array} */
        this._childs = this._graphic.children;
        this._downLimit = this._gdConf["limit"];
        this._upLimit = this._gdConf["up_limit"];
        this._speed = this._gdConf["speed"];
        /** @type {Array} */
        this._symbols = this._gdConf["symbols"];
    }

    start() {
        OMY.Omy.addUpdater(this.update, this);
    }

    end() {
        OMY.Omy.removeUpdater(this.update, this);
        for (let i = 0; i < this._childs.length; i++) {
            this._childs[i].y = this._childs[i].json.y;
        }
    }

    /**     * @private     */
    update() {
        for (let i = 0; i < this._childs.length; i++) {
            this._c = this._childs[i];
            this._c.y += this._speed;
            if (this._c.y >= this._downLimit) {
                this._c.y -= this._upLimit;
                this._c.text = OMY.OMath.getRandomItem(this._symbols);
            }
        }
    }
}