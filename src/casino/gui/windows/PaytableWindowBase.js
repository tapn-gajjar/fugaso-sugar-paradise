import {WindowsBase} from "../WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {PaytablePageBase} from "./paytable/PaytablePageBase";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {SlotButton} from "../../display/SlotButton";

export class PaytableWindowBase extends WindowsBase {
    constructor() {
        super();

        this._pageClass = PaytablePageBase;
        this._wName = AppConst.W_PAY;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDPaytable");
        this._currentP = 0;
        this._pages = [];
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
        if (!this.active) return;
        AppG.updateGameSize(this);

        if (this._bg) {
            this._bg.x = -this.x;
            this._bg.y = -this.y;
            this._bg.width = OMY.Omy.WIDTH;
            this._bg.height = OMY.Omy.HEIGHT;
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);
        this._createPages();

        /** @type {OMY.OSprite} */
        this._bg = this.getChildByName("s_help_bg");
        this._bg.input = true;

        /** @type {OMY.OContainer} */
        this._pageLayer = this.getChildByName("c_page_layer");
        /** @type {OMY.OContainer} */
        this._navigate = this.getChildByName("c_navigate");
        this._navigateList = [];
        let index = -1;
        while (this._navigate.canvas.getChildByName("b_p_" + String(++index))) {
            /** @type {OMY.OButton} */
            let button = this._navigate.canvas.getChildByName("b_p_" + String(index));
            if (index < this._pages.length) {
                this._navigateList.push(button);
                button.externalMethod(this._onForceOpenPage.bind(this));
            } else {
                button.destroy();
            }
        }
        for (let i = 0; i < this._navigate.canvas.children.length; i++) {
            this._navigate.canvas.children[i].x = (i === 0) ? 0 :
                this._navigate.canvas.children[i - 1].x + this._navigate.canvas.children[i].json.dx;
        }

        this._bClose = new SlotButton(this.getChildByName("b_close"), this._onClose.bind(this));
        this._bClose.alwaysAvailable = true;
        this._bNext = new SlotButton(this.getChildByName("b_next") || this._navigate.canvas.getChildByName("b_next"),
            this._onNextPage.bind(this));
        this._bNext.alwaysAvailable = true;
        this._bPrev = new SlotButton(this.getChildByName("b_prev") || this._navigate.canvas.getChildByName("b_prev"),
            this._onPrevPage.bind(this));
        this._bPrev.alwaysAvailable = true;
        this._navigate.alignContainer();

        OMY.Omy.navigateBtn.addBlockState(this._onBlockBtn, this);
        OMY.Omy.keys.registerFunction(OMY.Key.LEFT, this._onPrevPage, this);
        OMY.Omy.keys.registerFunction(OMY.Key.RIGHT, this._onNextPage, this);

        this._updateGameSize();
    }

    /** @private */
    _onBlockBtn(value) {
        if (!this._isGraphic) return;
        this._buttonBlocked = value;
        if (this._bClose) this._bClose.graphic.isBlock = value;
        if (this._bPrev) this._bPrev.graphic.isBlock = value;
        if (this._bNext) this._bNext.graphic.isBlock = value;
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        OMY.Omy.keys.unregisterFunction(OMY.Key.LEFT, this._onPrevPage, this);
        OMY.Omy.keys.unregisterFunction(OMY.Key.RIGHT, this._onNextPage, this);
        OMY.Omy.navigateBtn.removeBlockState(this._onBlockBtn, this);
        this._isGraphic = false;
        this._pageLayer = null;
        this._navigate = null;
        this._pages.length = 0;
        this._navigateList.length = 0;
        this._navigateList = null;
        if (this._bg)
            this._bg = null;
        this.callAll("destroy");
    }

    _createPages() {
        for (let i = 0; i < this._gdConf['pages'].length; i++) {
            if (!AppG.isHaveJackpot && this._gdConf["pages"][i].hasOwnProperty("jackPot") &&
                this._gdConf["pages"][i]["jackPot"]) continue;
            this._pages.push(
                new this._pageClass(this._gdConf["pages"][i]),
            );
        }
        for (let i = 0; i < this._pages.length; i++) {
            if (this._pages[i])
                this._pages[i].kill();
        }
    }

    revive(onComplete = null) {
        super.revive(onComplete);

        this._createGraphic();

        OMY.Omy.navigateBtn.updateState(AppConst.C_PAYTABLE);

        this._currentP = -1;
        this._isOpen = true;
        this._openPage(((this._gdConf["need_open_page"] && this._gdConf["need_open_page"].length) ? this._gdConf["need_open_page"] : 0));
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        if (this._isGraphic) {
            this._isOpen = false;
        }
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            if (AppG.isFreeGame)
                OMY.Omy.navigateBtn.updateState(AppConst.C_FREE_GAME);
            else
                OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
            this._clearGraphic();
        }

        super._onKill();
    }

    _removePage(page) {
        this._pageLayer.removeChild(page);
        page.kill();
    }

    /**     * @private     */
    _openPage(id) {
        if (this._currentP !== -1) {
            this._removePage(this._pages[this._currentP]);
        }
        this._pages[id].revive();
        this._pageLayer.addChild(this._pages[id]);

        this._currentP = id;
        this._navigateList.map((a, index, array) => array[index].isBlock = false);
        if (this._currentP < this._navigateList.length)
            this._navigateList[this._currentP].isBlock = true;
        // this._btnPage && (this._btnPage.label.text = (this._currentP + 1) + "/" + this._pages.length);
    }

    /**     * @private     */
    _onForceOpenPage(btn) {
        if (AppG.isWarning) return;
        OMY.Omy.sound.play(GameConstStatic.S_btn_disable);
        let page = Number(btn.name.split("_")[2]);
        if (page >= this._pages.length) page = this._pages.length - 1;
        this._openPage(page);
    }

    /**     * @private     */
    _onPrevPage() {
        if (AppG.isWarning || this._buttonBlocked) return;

        OMY.Omy.sound.play(GameConstStatic.S_btn_disable);
        let page = this._currentP;
        if (--page < 0) page = this._pages.length - 1;
        this._openPage(page);
    }

    /**     * @private     */
    _onNextPage() {
        if (AppG.isWarning || this._buttonBlocked) return;

        OMY.Omy.sound.play(GameConstStatic.S_btn_disable);
        let page = this._currentP;
        if (++page === this._pages.length) page = 0;
        this._openPage(page);
    }

    _onClose() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        OMY.Omy.sound.play(GameConstStatic.S_help_close || GameConstStatic.S_btn_any);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.graphic.isBlock = true;
            this._bNext.graphic.isBlock = true;
            this._bPrev.graphic.isBlock = true;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.graphic.isBlock = false;
            this._bNext.graphic.isBlock = false;
            this._bPrev.graphic.isBlock = false;
        }
    }

    get isOpen() {
        return this._isOpen;
    }
}
