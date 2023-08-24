import {AppG} from "../../AppG";

export class ResponsibleMess {
    constructor(graphic, onComplete) {
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._onComplete = onComplete;
        /** @type {OMY.OButton} */
        this._btnOk = this._graphic.getChildByName("b_yes");
        this._btnOk.externalMethod(this._onOk.bind(this));
        /** @type {OMY.OButton} */
        this._cancelOk = this._graphic.getChildByName("b_no");
        this._cancelOk.externalMethod(this._onCancel.bind(this));

        /** @type {OMY.OTextBitmap} */
        this._linkTxt = this._graphic.getChildByName("t_message1");
        this._linkTxt.input = true;
        this._linkTxt.addDown(this._onTextClick, this);
        this._linkTxt.addOver(this._onTextOver, this);
        this._linkTxt.addOut(this._onTextOut, this);

        this._underline = this._graphic.getChildByName("r_line");
        this._underline.alpha = 0;
    }

    /**     * @private     */
    _onOk() {
        if (this._onComplete) {
            this._onComplete();
        }

        this.destroy();
    }

    /**     * @private     */
    _onCancel() {
        if (OMY.Omy.isDesktop) {
            window.top.location.href = AppG.closeUrl;
        } else {
            location.href = AppG.closeUrl;
        }
    }

    /**     * @private     */
    _onTextClick() {
        if (this._underline)
            this._underline.alpha = 0;
        window.open("//fugaso.com/about-us", "_blank");
    }

    /**     * @private     */
    _onTextOver() {
        if (this._underline)
            this._underline.alpha = 1;
    }

    /**     * @private     */
    _onTextOut() {
        if (this._underline)
            this._underline.alpha = 0;
    }

    destroy() {
        this._graphic.destroy();
        this._graphic = null;
        this._gdConf = null;
        this._linkTxt = null;
        this._cancelOk = null;
        this._btnOk = null;
        this._underline = null;
    }
}