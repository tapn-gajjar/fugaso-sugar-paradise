import {PaytablePageBase} from "../../../../casino/gui/windows/paytable/PaytablePageBase";
import {AppG} from "../../../../casino/AppG";

export class PaytablePage extends PaytablePageBase {
    constructor(gd) {
        super(gd);
        this._spriteLocList = [];

        /** @type {OMY.OContainer} */
        this._animLayer = (this.getChildByName("c_animLayer")) ? this.getChildByName("c_animLayer") : this;
        /** @type {OMY.OSprite} */
        this._titleBg = this.getChildByName("s_pt_title_shadow");
        /** @type {OMY.OTextBitmap} */
        this._tLabel = this.getChildByName("t_label");
        OMY.Omy.loc.addUpdate(this._onLocChange, this);
        this._onLocChange();
    }

    /**     * @private     */
    _onLocChange() {
        for (let i = 0; i < this._spriteLocList.length; i++) {
            let sprite = this._spriteLocList[i];
            for (let key in sprite.json["loc"]) {
                if (OMY.OMath.inArray(sprite.json["loc"][key], AppG.language)) {
                    sprite.texture = key;
                    break;
                }
            }
        }
        this._labelCanvas?.alignContainer();
        if (this._titleBg && this._tLabel) this._titleBg.width = this._tLabel.width + 170;
    }

    revive() {
        super.revive();
        if (this.json["spine"]) {
            for (let i = 0; i < this.json["spine"].length; i++) {
                OMY.Omy.add.actorJson(this._animLayer, this.json["spine"][i]);
            }
        }
        this._isTween = true;

        if (this.json.hasOwnProperty("animate_symbols") && this.json["animate_symbols"]) {
            for (let i = 0; i < this._animLayer.children.length; i++) {
                this._animLayer.children[i].gotoAndStop(0);
            }
            this._startIndex = 0;
            this._animateSymbols();
        }

        if (this.json.hasOwnProperty("format_elements") && this.json["format_elements"]) OMY.Omy.add.formatObjectsByY(this);
    }

    kill() {
        this._timerDelay?.destroy();
        this._timerDelay = null;
        super.kill();
    }

    destroy(apt) {
        OMY.Omy.loc.removeUpdate(this._onLocChange, this);
        this._spriteLocList.length = 0;
        this._spriteLocList = null;
        this._timerDelay?.destroy();
        this._timerDelay = null;
        this._animLayer = null;
        this._labelCanvas = null;
        this._titleBg = null;
        this._tLabel = null;
        super.destroy(apt);
    }

    _updateBet() {
        super._updateBet();
    }

    // region : symbols
    //-------------------------------------------------------------------------
    /**     * @private     */
    _animateSymbols() {
        /** @type {OMY.OActorSpine} */
        let actor = this._animLayer.children[this._startIndex];

        if (++this._startIndex >= this._animLayer.children.length) this._startIndex = 0;
        actor.play();
        actor.addComplete(this._delayStartNextSymb, this, true);
    }

    /**     * @private     */
    _delayStartNextSymb(actor) {
        this._timerDelay = OMY.Omy.add.timer(actor.json["delay"], this._animateSymbols, this);
    }

    //-------------------------------------------------------------------------
    //endregion
}
