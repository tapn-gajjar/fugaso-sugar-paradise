import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";

export default class Scroll extends PIXI.utils.EventEmitter {
    constructor(parent, graphic) {
        super();
        this._graphic = graphic;
        this._parent = parent;

        this._isMobile = !OMY.Omy.isDesktop;
        /** @type {OMY.OSprite} */
        this._bg = this._graphic.getChildByName("s_scroll_bg");
        /** @type {OMY.OSlider} */
        this._slider = this._graphic.getChildByName("sl_page_slider");
        if (OMY.Omy.isDesktop) this._addPageScroll();
        OMY.Omy.addUpdater(this._onSliderUpdate, this);
    }

    addContent(content, contentMask, listId) {
        if (this._content) this._content.off("content_update", this._windowSizeUpdate, this);
        this._contentMask = contentMask;
        this._contentMask.json.save_height = this._contentMask.json.height;
        if (this._isMobile)
            this._contentMask.json.v_save_height = this._contentMask.json.v_height;
        this._content = this._slider.target = content;
        this._content.on("content_update", this._windowSizeUpdate, this);

        if (listId === 0) {
            OMY.OMath.objectCopy(this._slider.json, this._slider.json["top"]);
            this._bg.texture = this._bg.json["top_player"];
        } else {
            OMY.OMath.objectCopy(this._slider.json, this._slider.json["other"]);
            this._bg.texture = this._bg.json["texture"];
        }

        this._slider.setSliderData(this._slider.json["minSlideValue"], this._slider.json["maxSlideValue"]);
        this._slider.setTargetData(
            this._content.y,
            this._content.y - this._content.height + this._contentMask.json.height - 100,
        );
        this._slider.resetSlider();
        this._isPort = AppG.isScreenPortrait;
        this._saveContentPos = this._content.y;
        this._saveHitPos = this._content.hitArea.y;
        this._windowSizeUpdate();
    }

    /**     * @private     */
    _onDownBtn(btn) {
        this._saveInteractive = this._content.interactive;
        this._content.interactive = false;
    }

    /**     * @private     */
    _onUpBtn() {
        this._content.interactive = this._saveInteractive;
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
        if (!this._graphic?.visible) return;

        e = e || window.event;
        const delta = e.deltaY || e.detail || e.wheelDelta;
        let point = this._parent.toLocal(new PIXI.Point(OMY.Omy.mouse.mouseX, OMY.Omy.mouse.mouseY));
        let inContent = point.x >= this._contentMask.x &&
            point.y >= this._contentMask.y &&
            point.x <= (this._contentMask.x + this._contentMask.width) &&
            point.y <= (this._contentMask.y + this._contentMask.height);
        if (!inContent || this._countOpenWindows > 0) return;
        this.wheel(delta);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    wheel(delta) {
        let newValue;
        let sliderValue = this._slider._target[this._slider._property] - delta * 0.1;
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

    /**     * @private     */
    _onSliderUpdate() {
        if (this._content && this._graphic.visible)
            this._content.hitArea.y = -(this._content.y - this._saveContentPos);
    }

    _windowSizeUpdate() {
        const m = AppG.isScreenPortrait ? "v_" : "";
        if (this._isPort !== AppG.isScreenPortrait) {
            this._isPort = AppG.isScreenPortrait;
            this._saveContentPos = this._content.y;
        }
        const maskHeight = this._contentMask.json[m + "save_height"] + ((this._isMobile) ? AppG.dy : 0);
        this._contentMask.json[m + "height"] = this._contentMask.height = maskHeight;
        if (this._content.mask)
            this._content.mask.height = maskHeight;
        if (this._isMobile)
            this._contentMask.json.width = this._contentMask.width = OMY.Omy.WIDTH;

        if (this._content.hitArea)
            this._content.hitArea.height = this._contentMask.height;

        if (maskHeight < this._content.height + 10) {
            let showSlider = !this._graphic.visible;
            if (showSlider) {
                this._content.interactive = true;
                this._graphic.visible = true;
                this._slider.setSliderData(this._slider.json["minSlideValue"], this._slider.json["maxSlideValue"]);
            }
            let maxY = this._content.json[m + "y"] - this._content.height + maskHeight - 20;
            this._slider.setTargetData(
                this._content.json[m + "y"],
                maxY,
            );
            if (this._content.y < maxY) {
                OMY.Omy.game.addNextTickUpdate(() => {
                    const maskHeight = this._contentMask.json.height + (this._isMobile) ? AppG.dy : 0;
                    let maxY = this._content.json[m + "y"] - this._content.height + maskHeight - 20;
                    if (this._content.y < maxY) this._content.y = maxY;
                }, this);
            }
            if (showSlider) this._slider.resetSlider();
            else this._slider.updateSlidePos();
        } else {
            this._graphic.visible = false;
            this._content.interactive = false;
            this._content.y = this._saveContentPos;
        }
    }

    destroy() {
        OMY.Omy.removeUpdater(this._onSliderUpdate, this);
        if (this._content) this._content.off("content_update", this._windowSizeUpdate, this);
        this._contentMask = null;
        this._content = null;
        this._graphic = null;
        this._parent = null;
        this._slider = null;
        this._bg = null;
        const elem = AppConst.GAME_CONTAINER;
        if (elem.removeEventListener) {
            if ("onwheel" in document) {
                // IE9+, FF17+, Ch31+
                elem.removeEventListener("wheel", this._onWheel.bind(this), {passive: false});
            } else if ("onmousewheel" in document) {
                // устаревший вариант события
                elem.removeEventListener("mousewheel", this._onWheel.bind(this), {passive: false});
            } else {
                // Firefox < 17
                elem.removeEventListener("MozMousePixelScroll", this._onWheel.bind(this), {passive: false});
            }
        }
    }
}