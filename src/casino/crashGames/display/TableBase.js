import {TablesBtn} from "./buttons/TablesBtn";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {CrashConst} from "../CrashConst";
import {TStaticConst} from "../../tournament/TStaticConst";

export class TableBase {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._isEditMode = Boolean(this._gdConf["debug_count"]);
        this._tableType = null;
        this._activeTable = 0;

        this._createGraphic();
        this._createElements();

        if (OMY.Omy.isDesktop) {
            this._addPageScroll();
            if (this._buttonsList)
                this._openList(this._activeTable);
            this._updateGameSize();
        } else {
            this._graphic.kill();
            AppG.emit.on(CrashConst.EMIT_TABLE_TOGGLE, this._onTableToggle, this);
        }
        OMY.Omy.viewManager.addCreateWindow(this._onWindowAdd, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowRemove, this);
        this._countOpenWindows = 0;
        this._graphic.addRevive(this._revive, this);
        this._graphic.addKill(this._kill, this);
        // AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _createGraphic() {
        if (this._graphic.getChildByName("c_page_content")) {
            /** @type {OMY.OContainer} */
            this._cPageContent = this._graphic.getChildByName("c_page_content");
            this._onCheckContent();
            OMY.Omy.addUpdater(this._onSliderUpdate, this);
        }
        if (this._graphic.getChildByName("b_1")) {
            /** @type {Array.<TablesBtn>} */
            this._buttonsList = [];
            let i = 0;
            while (this._graphic.getChildByName("b_" + String(++i))) {
                this._buttonsList.push(new TablesBtn(this._graphic.getChildByName("b_" + String(i))));
                this._buttonsList[i - 1].graphic.externalMethod(this._onFilterOpen.bind(this));
                this._buttonsList[i - 1].graphic.userData = i;
            }
        }
    }

    _createElements(countMax = 20) {
        if (!this._cPageContent) return false;

        /** @type {OMY.OContainer} */
        let element = this._cPageContent.children[0];
        element.name += "0";
        this._elJson = element.json;
        let max = ((this._isEditMode) ? this._gdConf["debug_count"] - 1 : countMax) + 1;
        for (let i = 1; i < max; i++) {
            element = OMY.Omy.add.containerJson(this._cPageContent, this._elJson);
            element.y = i * this._gdConf["step"];
            element.name += String(i);
        }

        return true;
    }

    _revive() {
        this._cPageContent.mask = null;
        this._cPageContent.mask = this._contentMask;
    }

    _kill() {

    }

    _onTableToggle(tableType) {
        (tableType === this._tableType) ?
            ((this._graphic.active) ? this._graphic.kill() : this._graphic.revive()) :
            (this._graphic.active) ? this._graphic.kill() : null;

        if (this._graphic.active) {
            if (this._buttonsList)
                this._openList(this._activeTable);
            this._updateGameSize();
        }
    }

    _onCheckContent() {
        if (this._gdConf["content_mask"]) {
            const maskJson = this._gdConf["content_mask"];
            this._contentMask = OMY.Omy.add.maskRectJson(this._graphic, maskJson);
            this._contentMask && (this._contentMask.json = maskJson);
            this._cPageContent.mask = this._contentMask;
            this._cPageContent.drag = false;
            this._formatContent();
        }

        /** @type {OMY.OContainer} */
        this._scroll = this._graphic.getChildByName("c_scroll");
        if (this._scroll) {
            /** @type {OMY.OSlider} */
            this._slider = this._scroll.getChildByName("sl_page_slider");
            this._slider.target = this._cPageContent;
            this._slider.setTargetData(
                this._cPageContent.y,
                this._cPageContent.y - this._cPageContent.height + this._gdConf["content_mask"].height - 100,
            );
            this._slider.resetSlider();
            this._saveContentPos = this._cPageContent.y;
            this._saveHitPos = this._cPageContent.hitArea.y;
        }
    }

    /**     * @private     */
    _updateGameSize() {
        this._windowSizeUpdate();
    }

    _windowSizeUpdate() {
        const m = AppG.isScreenPortrait ? /*"v_"*/"" : "";
        if (this._slider) {
            const maskHeight = this._gdConf["content_mask"]["height"]/* + AppG.dy*/;
            if (this._cPageContent.mask)
                this._cPageContent.mask.height = maskHeight;
            if (this._cPageContent.hitArea)
                this._cPageContent.hitArea.height = this._contentMask.height;

            if (maskHeight < this._cPageContent.height + 10) {
                let showSlider = !this._scroll.visible;
                if (showSlider) {
                    this._cPageContent.interactive = true;
                    this._scroll.visible = true;
                    this._slider.setSliderData(this._slider.json[m + "minSlideValue"], this._slider.json[m + "maxSlideValue"]);
                }
                let maxY = this._cPageContent.json.y - this._cPageContent.height + maskHeight - 20;
                this._slider.setTargetData(
                    this._cPageContent.json.y,
                    maxY,
                );
                if (this._cPageContent.y < maxY) {
                    OMY.Omy.game.addNextTickUpdate(() => {
                        const maskHeight = this._gdConf["content_mask"]["height"]/* + AppG.dy*/;
                        let maxY = this._cPageContent.json.y - this._cPageContent.height + maskHeight - 20;
                        if (this._cPageContent.y < maxY) this._cPageContent.y = maxY;
                    }, this);
                }
                if (showSlider) this._slider.resetSlider();
                else this._slider.updateSlidePos();
            } else {
                this._scroll.visible = false;
                this._cPageContent.interactive = false;
                this._cPageContent.y = this._saveContentPos;
            }
        }
    }

    /**     * @private     */
    _formatContent() {
        if (this._cPageContent) {
            !this._cPageContent.hitArea && OMY.Omy.add.hintArea(this._cPageContent, this._cPageContent.getLocalBounds(), 0, this._gdConf["debugHitArea"]);
            let hitArea = this._cPageContent.getLocalBounds();
            if (/*OMY.Omy.isDesktop*/true) {
                this._cPageContent.hitArea.x = hitArea.x;
                this._cPageContent.hitArea.y = hitArea.y;
                this._cPageContent.hitArea.width = hitArea.width;
                this._cPageContent.hitArea.height = this._contentMask.height;
            } else {
                let scaleContent = 1 / this._graphic.scale.x;
                this._cPageContent.hitArea.x = 10 - this._cPageContent.getGlobalPosition().x;
                this._cPageContent.hitArea.y = hitArea.y;
                this._cPageContent.hitArea.width = (OMY.Omy.WIDTH - 10) * scaleContent;
                this._cPageContent.hitArea.height = hitArea.height;
            }
        }
    }

    /**     * @private     */
    _onSliderUpdate() {
        if (this._slider && this._scroll.visible)
            this._cPageContent.hitArea.y = -(this._cPageContent.y - this._saveContentPos);
    }

    _openList(listId) {
        if (this._cPageContent) this._cPageContent.y = this._cPageContent.json.y;
        this._activeTable = listId;
        this._buttonsList.map((a, index, array) => array[index].setNoActive());
        this._buttonsList[listId].setActive();
    }

    _onFilterOpen(btn, btnId, d) {
        this._openList(btn.userData - 1);
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
        if (!this._scroll?.visible) return;

        e = e || window.event;
        const delta = e.deltaY || e.detail || e.wheelDelta;
        let point = this._graphic.toLocal(new PIXI.Point(OMY.Omy.mouse.mouseX, OMY.Omy.mouse.mouseY));
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

    //-------------------------------------------------------------------------
    //endregion

    /**     * @private     */
    _onWindowAdd(wType) {
        switch (wType) {
            case TStaticConst.W_RULES_TOURNAMENT:
            case TStaticConst.W_START_TOURNAMENT:
            case TStaticConst.W_FINAL_TOURNAMENT:
            case AppConst.W_WARNING:
            case AppConst.W_HISTORY:
            case AppConst.W_PAY: {
                this._countOpenWindows++;
                break;
            }
        }
    }

    /**     * @private     */
    _onWindowRemove(wType) {
        switch (wType) {
            case TStaticConst.W_RULES_TOURNAMENT:
            case TStaticConst.W_START_TOURNAMENT:
            case TStaticConst.W_FINAL_TOURNAMENT:
            case AppConst.W_WARNING:
            case AppConst.W_HISTORY:
            case AppConst.W_PAY: {
                this._countOpenWindows--;
                this._countOpenWindows = (this._countOpenWindows < 0) ? 0 : this._countOpenWindows;
                break;
            }
        }
    }

    destroy() {
        this._gdConf = null;
        AppG.emit.off(CrashConst.EMIT_TABLE_TOGGLE, this._onTableToggle, this);
        OMY.Omy.viewManager.removeCreateWindow(this._onWindowAdd, this);
        OMY.Omy.viewManager.removeDestroyWindow(this._onWindowRemove, this);
        this._graphic.removeRevive(this._revive, this);
        this._graphic.removeKill(this._kill, this);
        this._graphic = null;
        this._cPageContent = null;
        for (let i = 0; i < this._buttonsList.length; i++) {
            this._buttonsList[i].destroy();
        }
        this._buttonsList.length = 0;
        this._buttonsList = null;
        this._elJson = null;
        this._contentMask = null;
        this._scroll = null;
        this._slider = null;
        OMY.Omy.removeUpdater(this._onSliderUpdate, this);
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
