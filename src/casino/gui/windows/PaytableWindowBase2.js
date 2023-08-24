import {WindowsBase} from "../WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {SlotButton} from "../../display/SlotButton";
import {MenuPaytablePage} from "../../../app/guiStates/windows/menu/MenuPaytablePage";

export class PaytableWindowBase2 extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_PAY;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDPaytable");
        this._isGraphic = false;
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

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

    _updateGameSize() {
        if (!this._isGraphic) return;
        AppG.updateGameSize(this);

        if (this._bg) {
            this._bg.x = -this.x;
            this._bg.y = -this.y;
            this._bg.width = OMY.Omy.WIDTH;
            this._bg.height = OMY.Omy.HEIGHT;
        }
        this._cPayinfo.updateGameSize();
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);

        /** @type {OMY.OSprite} */
        this._bg = this.getChildByName("s_bg");
        this._bg.input = true;

        this._cPayinfo = new MenuPaytablePage(this);
        this._cPayinfo.onShow();
        this._addPageScroll();
        this._bClose = new SlotButton(this.getChildByName("b_close"), this._onClose.bind(this));
        this._bClose.alwaysAvailable = true;
        OMY.Omy.navigateBtn.addBlockState(this._onBlockBtn, this);
        this._updateGameSize();
    }

    /** @private */
    _onBlockBtn(value) {
        if (!this._isGraphic) return;
        this._buttonBlocked = value;
        if (this._bClose) this._bClose.graphic.isBlock = value;
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        OMY.Omy.navigateBtn.removeBlockState(this._onBlockBtn, this);
        this._isGraphic = false;
        if (this._bg)
            this._bg = null;
        this._cPayinfo = null;
        this.callAll("destroy");
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        if (!this._isOpen) {
            this._createGraphic();
            OMY.Omy.navigateBtn.updateState(AppConst.C_PAYTABLE);
            this._isOpen = true;
        }
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._isOpen = false;
            if (AppG.isFreeGame)
                OMY.Omy.navigateBtn.updateState(AppConst.C_FREE_GAME);
            else
                OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
            this._clearGraphic();
        }

        super._onKill();
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
        if (!this._cPayinfo) return;
        e = e || window.event;
        const delta = e.deltaY || e.detail || e.wheelDelta;
        this._cPayinfo.wheel(delta);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onClose() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        OMY.Omy.sound.play(GameConstStatic.S_help_close || GameConstStatic.S_btn_any);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    _onWindowCreate(window) {
        if (this._isGraphic && window === AppConst.W_WARNING) this._bClose.graphic.isBlock = true;
    }

    _onWindowClose(window) {
        if (this._isGraphic && window === AppConst.W_WARNING) this._bClose.graphic.isBlock = false;
    }

    get isOpen() {
        return this._isOpen;
    }
}
