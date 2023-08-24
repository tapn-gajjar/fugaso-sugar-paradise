export class TablesBtn {
    constructor(graphic) {
        /** @type {OMY.OButton} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        /** @type {OMY.OSprite} */
        this._sActive = this._graphic.getChildByName("s_active");
        this._graphic.label = this._graphic.getChildByName("t_label");

        this.setNoActive();
    }

    setNoActive() {
        if (this._sActive)
            this._sActive.visible = false;
        this._graphic.isBlock = false;
    }

    setActive() {
        if (this._sActive)
            this._sActive.visible = true;
        this._graphic.isBlock = true;
    }

    destroy() {
        this._gdConf = null;
        this._sActive = null;
        this._graphic = null;
    }

    /**
     * @returns {OMY.OButton}
     */
    get graphic() {
        return this._graphic;
    }
}