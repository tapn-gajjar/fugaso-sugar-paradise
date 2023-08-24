import {AppG} from "../../../AppG";

export class MenuPageBase {
    constructor(source) {
        /** @type {OMY.OContainer} */
        this._source = source;
        this.json = this._gdConf = this._source.json;
        this._source.addDestroy(this.destroy, this, true);
        this._source.addRevive(this.revive, this, false);

        /** @type {OMY.OContainer} */
        this._cPageContent = this._source.getChildByName("c_page_content");

        this._onCheckGraphic();
        this._formatContent(this._cPageContent);

        if (this._gdConf["content_mask"]) {
            this._createMask();
            this._cPageContent.drag = false;
            // this._cPageContent.interactive = false;
            // this._cPageContent.interactiveChildren = false;
        }

        /** @type {OMY.OContainer} */
        this._scroll = this._source.getChildByName("c_scroll");
        if (this._scroll) {
            //this._cPageContent.interactChild = false;
            /** @type {OMY.OSlider} */
            this._slider = this._scroll.getChildByName("sl_page_slider");
            this._slider.target = this._cPageContent;
            this._slider.setTargetData(
                this._cPageContent.y,
                this._cPageContent.y - this._cPageContent.height + this._gdConf["content_mask"].height - 100,
            );
            this._slider.resetSlider();

            let hitArea = this._cPageContent.getLocalBounds();
            const hitAreaConf = {
                x: 10,
                y: hitArea.y - 10,
                width: OMY.Omy.WIDTH - 100,
                height: hitArea.height + 200,
            };
            OMY.Omy.add.hintArea(this._cPageContent, hitAreaConf, 0);
        }
    }

    /**     * @private     */
    _createMask() {
        const maskJson = this._gdConf["content_mask"];
        const mask = OMY.Omy.add.maskRectJson(this._source, maskJson);
        mask && (mask.json = maskJson);
        this._cPageContent.mask = mask;
    }

    _onCheckGraphic() {

    }

    /**     * @private     */
    _formatContent(container) {
        OMY.Omy.add.formatObjectsByY(container);

        if (this._cPageContent.hitArea) {
            let hitArea = this._cPageContent.getLocalBounds();
            this._cPageContent.hitArea.x = 10 - this._cPageContent.getGlobalPosition().x;
            this._cPageContent.hitArea.y = hitArea.y - 50;
            this._cPageContent.hitArea.width = OMY.Omy.WIDTH - 10;
            this._cPageContent.hitArea.height = hitArea.height + 100;
            if (this._cPageContent.mask) {
                this._cPageContent.mask.x = this._cPageContent.hitArea.x;
                this._cPageContent.mask.width = this._cPageContent.hitArea.width;
            }
        }
    }

    /**     * @private     */
    _onDownBtn(btn) {
        this._saveInteractive = this._cPageContent.interactive;
        this._cPageContent.interactive = false;
    }

    /**     * @private     */
    _onUpBtn() {
        this._cPageContent.interactive = this._saveInteractive;
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------
    /**
     * @param {OMY.OButton}btn
     */
    _addUnderSlideBtn(btn) {
        btn.addDown(this._onDownBtn, this);
        btn.addUp(this._onUpBtn, this);
        btn.addUpOutSide(this._onUpBtn, this);
    }

    updateGameSize() {
        if (!this._source.visible) return;
        if (this._cPageContent)
            this._formatContent(this._cPageContent);
        const m = AppG.isScreenPortrait ? "v_" : "";
        if (this._slider) {
            const maskHeight = this._gdConf["content_mask"]["height"] * this._gdConf["content_mask"][m + "scaleY"] + AppG.dy;
            this._cPageContent.mask.height = maskHeight;
            if (maskHeight < this._cPageContent.height + 30) {
                this._cPageContent.interactive = true;
                this._scroll.visible = true;
                this._slider.setSliderData(this._slider.json[m + "minSlideValue"], this._slider.json[m + "maxSlideValue"]);
                this._slider.setTargetData(
                    this._cPageContent.y,
                    this._cPageContent.y - this._cPageContent.height + maskHeight - 100,
                );
                this._slider.resetSlider();
            } else {
                this._scroll.visible = false;
                this._cPageContent.interactive = false;
            }
        }
    }

    wheel(delta) {
        let newValue;
        let sliderValue = this._slider._target[this._slider._property] - delta * 0.25;
        if (sliderValue > this._slider._minTargetValue) {
            newValue = this._slider._minTargetValue;
        } else if (sliderValue < this._slider._maxTargetValue) {
            newValue = this._slider._maxTargetValue;
        } else {
            newValue = sliderValue;
        }
        this._slider._target[this._slider._property] = newValue;
        this._slider.updateSlidePos();
    }

    destroy() {
        this._source = null;
        this._slider = null;
        this._cPageContent = null;
        this._scroll = null;
        this.json = this._gdConf = null;
    }

    revive() {
        if (this._cPageContent.mask) {
            this._cPageContent.mask.destroy();
            this._createMask();
        }
    }

    onShow() {
        OMY.Omy.updateGameSize(this._cPageContent, AppG.dx, AppG.dy, AppG.isScreenPortrait);
        this.updateGameSize();
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------

    get source() {
        return this._source;
    }
}
