export class SoundMess {
    constructor(graphic, onComplete) {
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._onComplete = onComplete;
        this._graphicParent = this._graphic.parent;
        this._graphicParent.removeChild(this._graphic);

        /** @type {OMY.OButton} */
        this._btnOk = this._graphic.getChildByName("b_yes");
        this._btnOk.externalMethod(this._onOk.bind(this));
        /** @type {OMY.OButton} */
        this._cancelOk = this._graphic.getChildByName("b_no");
        this._cancelOk.externalMethod(this._onCancel.bind(this));
    }

    show() {
        this._graphicParent.addChild(this._graphic);
        this._graphic.visible = false;
        OMY.Omy.add.timer(0.01, () => {
            this._graphic.visible = true;
        }, this);
    }

    /**     * @private     */
    _onOk() {
        OMY.Omy.sound.unmute();
        OMY.Omy.sound.volume((OMY.Omy.isDesktop) ? 0.5 : 1);
        if (this._onComplete) {
            this._onComplete();
        }
        this.destroy();
    }

    /**     * @private     */
    _onCancel() {
        OMY.Omy.sound.mute();
        if (this._onComplete) {
            this._onComplete();
        }
        this.destroy();
    }

    destroy() {
        this._graphic.destroy();
        this._graphic = null;
        this._gdConf = null;
        this._cancelOk = null;
        this._btnOk = null;
        this._graphicParent = null;
    }
}