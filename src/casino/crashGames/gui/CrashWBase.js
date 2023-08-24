import {WindowsBase} from "../../gui/WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";

export class CrashWBase extends WindowsBase {
    constructor() {
        super();
        this._heightMaskLimit = 10;
        this._settingWindow();
    }

    _settingWindow() {
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);
        if (OMY.Omy.isDesktop) this._addPageScroll();
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    /**     * @private     */
    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);
        this._windowSizeUpdate();
    }

    _windowSizeUpdate() {
        if (this._cPageContent)
            this._formatContent(this._cPageContent);
        const m = AppG.isScreenPortrait ? "v_" : "";
        if (this._slider) {
            const maskHeight = this._gdConf["content_mask"]["height"]/* + AppG.dy*/;
            if (this._cPageContent.mask)
                this._cPageContent.mask.height = maskHeight;
            if (maskHeight < this._cPageContent.height + this._heightMaskLimit) {
                this._cPageContent.interactive = true;
                this._scroll.visible = true;
                this._slider.setSliderData(this._slider.json[m + "minSlideValue"], this._slider.json[m + "maxSlideValue"]);
                this._slider.setTargetData(
                    this._cPageContent.y,
                    this._cPageContent.y - this._cPageContent.height + maskHeight - 60,
                );
                this._slider.resetSlider();
            } else {
                this._scroll.visible = false;
                this._cPageContent.interactive = false;
            }
        }

        if (this._tint) {
            let scaleContent = 1 / this.scale.x;
            this._tint.x = -this.x * scaleContent;
            this._tint.y = -this.y * scaleContent;
            this._tint.width = OMY.Omy.WIDTH * scaleContent;
            this._tint.height = OMY.Omy.HEIGHT * scaleContent;
        }
    }

    /**     * @private     */
    _createGraphic() {
        if (this._isOpen) return;
        this._isOpen = true;
        OMY.Omy.add.createEntities(this, this._gdConf);

        if (this.getChildByName("s_tint")) {
            /** @type {OMY.OSprite} */
            this._tint = this.getChildByName("s_tint");
            this._tint.input = true;
        }
        if (this.getChildByName("b_close")) {
            /** @type {OMY.OButton} */
            this._bClose = this.getChildByName("b_close");
            this._bClose.externalMethod(this._closeWindow.bind(this));
        }

        if (this.getChildByName("c_page_content")) {
            /** @type {OMY.OContainer} */
            this._cPageContent = this.getChildByName("c_page_content");
            this._onCheckContent();
        }

        OMY.Omy.navigateBtn.addBlockState(this._onBlockBtn, this);
        OMY.Omy.loc.addUpdate(this._updateGameSize, this);

        this._createElements();
        this._updateGameSize();
    }

    _createElements() {

    }

    _onCheckContent() {
        if (this._gdConf["content_mask"]) {
            const maskJson = this._gdConf["content_mask"];
            const mask = OMY.Omy.add.maskRectJson(this, maskJson);
            mask && (mask.json = maskJson);
            this._cPageContent.mask = mask;
            this._cPageContent.drag = false;
            // this._cPageContent.interactive = false;
            // this._cPageContent.interactiveChildren = false;
        }

        /** @type {OMY.OContainer} */
        this._scroll = this.getChildByName("c_scroll");
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

            OMY.Omy.add.hintArea(this._cPageContent, this._cPageContent.getLocalBounds(), 0, this._gdConf["debugHitArea"]);
        }
    }

    /**     * @private     */
    _formatContent(container) {
        OMY.Omy.add.formatObjectsByY(container);
        if (this._cPageContent.hitArea) {
            let hitArea = this._cPageContent.getLocalBounds();
            if (OMY.Omy.isDesktop) {
                this._cPageContent.hitArea.x = hitArea.x;
                this._cPageContent.hitArea.y = hitArea.y - 50;
                this._cPageContent.hitArea.width = hitArea.width - 10;
                this._cPageContent.hitArea.height = hitArea.height + 100;
            } else {
                let scaleContent = 1 / this.scale.x;
                this._cPageContent.hitArea.x = 10 - this._cPageContent.getGlobalPosition().x;
                this._cPageContent.hitArea.y = hitArea.y - 50;
                this._cPageContent.hitArea.width = (OMY.Omy.WIDTH - 10) * scaleContent;
                this._cPageContent.hitArea.height = hitArea.height + 100;
            }
        }
    }

    // region scroll:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _onDownBtn(btn) {
        this._saveInteractive = this._cPageContent.interactive;
        this._cPageContent.interactive = false;
    }

    /**     * @private     */
    _onUpBtn() {
        this._cPageContent.interactive = this._saveInteractive;
    }

    /**
     * @param {OMY.OButton}btn
     */
    _addUnderSlideBtn(btn) {
        btn.addDown(this._onDownBtn, this);
        btn.addUp(this._onUpBtn, this);
        btn.addUpOutSide(this._onUpBtn, this);
    }

    _addPageScroll() {
        if (this._once) return;
        this._once = true;

        const elem = AppConst.GAME_CONTAINER;
        if (elem.addEventListener) {
            if ("onwheel" in document) {
                // IE9+, FF17+, Ch31+
                elem.addEventListener("wheel", this._onWheel.bind(this), {passive: false});
            } else if ("onmousewheel" in document) {
                // устаревший вариант события
                elem.addEventListener("mousewheel", this._onWheel.bind(this), {passive: false});
            } else {
                // Firefox < 17
                elem.addEventListener("MozMousePixelScroll", this._onWheel.bind(this), {passive: false});
            }
        }
    }

    _onWheel(e) {
        if (!this._isOpen || !this._scroll.visible) return;

        e = e || window.event;
        const delta = e.deltaY || e.detail || e.wheelDelta;
        this.wheel(delta);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
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

    //-------------------------------------------------------------------------
    //endregion

    /** @private */
    _onBlockBtn(value) {
        if (!this._isOpen) return;
        this._buttonBlocked = value;
        if (this._bClose) this._bClose.isBlock = value;
    }

    /** @private */
    _clearGraphic() {
        if (!this._isOpen) return;
        this._isOpen = false;

        OMY.Omy.loc.removeUpdate(this._updateGameSize, this);
        OMY.Omy.navigateBtn.removeBlockState(this._onBlockBtn, this);
        this._bClose = null;
        this._cPageContent = null;
        this._slider = null;
        this._scroll = null;
        this._tint = null;
        this._clearElements();
        this.callAll("destroy");
    }

    _clearElements() {

    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        this._clearGraphic();
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }

    _closeWindow() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        this._onClose();
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    _onClose() {

    }

    _onWindowCreate(window) {
        if (!this._isOpen) return;
        if (window === AppConst.W_WARNING) {
            if (this._bClose)
                this._bClose.isBlock = true;
        }
    }

    _onWindowClose(window) {
        if (!this._isOpen) return;
        if (window === AppConst.W_WARNING) {
            if (this._bClose)
                this._bClose.isBlock = false;
        }
    }

    get isOpen() {
        return this._isOpen;
    }
}
