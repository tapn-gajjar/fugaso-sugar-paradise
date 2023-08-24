import {WindowsBase} from "../../casino/gui/WindowsBase";
import {AppConst} from "../../casino/AppConst";
import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";
import {BtnToggle} from "../../casino/display/buttons/BtnToggle";
import {PaytablePage} from "./windows/paytable/PaytablePage";
import {SlotButton} from "../../casino/display/SlotButton";

export class IntroInfoWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_INTRO_INFO;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDIntroInfo");
        this._pageClass = PaytablePage;

        this._currentP = 0;
        this._pages = [];
        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);
        this.timerValue = this._gdConf["timerValue"]
        this.isOpenIntro = false

        this._editMode = this._gdConf["edit"];
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

       // if (this._bg) {
       //     this._bg.width = OMY.Omy.WIDTH;
       //     this._bg.height = OMY.Omy.HEIGHT;
       // }

        // if (this._bg) {
        //     this._bg.x = -this.x;
        //     this._bg.y = -this.y;
        //     this._bg.width = OMY.Omy.WIDTH;
        //     this._bg.height = OMY.Omy.HEIGHT;
        // }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.sound.play(GameConstStatic.S_intro, true);
        OMY.Omy.viewManager.gameUI.visible = false;
        OMY.Omy.add.createEntities(this, this._gdConf);
        this._createPages();

        /** @type {OMY.OSprite} */
        this._bg = this.getChildByName("c_help_bg").getChildByName("s_help_bg");
        this._bg.input = true;
        

        const blurFilter = new PIXI.filters.BlurFilter();
        this._bg.filters = [blurFilter];

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

        /** @type {OMY.OButton} */
        this._bClose = this.getChildByName("b_close");
        this._bClose.externalMethod(this._onClose.bind(this))
        // /** @type {OMY.OButton} */
        // this._bNext = this.getChildByName("b_next") || this._navigate.canvas.getChildByName("b_next");
        // this._bNext.externalMethod(this._onNextPage.bind(this));
        // /** @type {OMY.OButton} */
        // this._bPrev = this.getChildByName("b_prev") || this._navigate.canvas.getChildByName("b_prev");
        // this._bPrev.externalMethod(this._onPrevPage.bind(this));
        // this._navigate.alignContainer();

        this.checkBoxOnOff_btn = new BtnToggle(this.getChildByName("checkBoxOnOff_btn"),
            this._onToggleAction.bind(this));
        if (this.getChildByName("c_checkBox")) {
            /** @type {OMY.OContainer} */
            this._portCheckBoxCanvas = this.getChildByName("c_checkBox");
            this._portCheckBox = new BtnToggle(this._portCheckBoxCanvas.canvas.getChildByName("checkBoxOnOff_btn"),
                this._onToggleAction.bind(this));
            OMY.Omy.loc.addUpdate(this._onLocUpdate, this, false);
        }

        // OMY.Omy.keys.registerFunction(OMY.Key.LEFT, this._onPrevPageKey, this);
        // OMY.Omy.keys.registerFunction(OMY.Key.RIGHT, this._onNextPageKey, this);

        this._updateGameSize();
        this.resetTimer();
    }

    /**     * @private     */
    _onLocUpdate() {
        if (this._portCheckBoxCanvas) this._portCheckBoxCanvas.alignContainer();
    }

    resetTimer() {
        // if (this._editMode) return;
        // this.timer?.destroy();
        // this.timer = OMY.Omy.add.timer(this.timerValue, this._onNextPage, this);

    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        OMY.Omy.viewManager.gameUI.visible = true;
        // OMY.Omy.keys.unregisterFunction(OMY.Key.LEFT, this._onPrevPageKey, this);
        // OMY.Omy.keys.unregisterFunction(OMY.Key.RIGHT, this._onNextPageKey, this);
        this._isGraphic = false;
        this._pageLayer = null;
        this._navigate = null;
        this._pages.length = 0;
        this._navigateList.length = 0;
        this._navigateList = null;
        if (this._bg)
            this._bg = null;
        this.timer?.destroy();
        this.timer = null;
        this._portCheckBox = null;
        this._portCheckBoxCanvas && OMY.Omy.loc.removeUpdate(this._onLocUpdate, this);
        this._portCheckBoxCanvas = null;
        this.callAll("destroy");
    }

    _createPages() {
        for (let i = 0; i < this._gdConf['pages'].length; i++) {
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
        this._updateGameSize();
    }

    /**     * @private     */
    _onForceOpenPage(btn) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_disable);
        let page = Number(btn.name.split("_")[2]);
        if (page >= this._pages.length) page = this._pages.length - 1;
        this._openPage(page);
    }

    /**     * @private     */
    _onPrevPageKey() {
        if (AppG.isWarning) return;
        this._onPrevPage();
    }

    /**     * @private     */
    _onNextPageKey() {
        if (AppG.isWarning) return;
        this._onNextPage();
    }

    /**     * @private     */
    _onPrevPage() {
        // OMY.Omy.sound.play(GameConstStatic.S_btn_disable);
        // OMY.Omy.sound.play(GameConstStatic.S_leaf_information);
        let page = this._currentP;
        if (--page < 0) page = this._pages.length - 1;
        this.resetTimer()
        this._openPage(page);
    }

    /**     * @private     */
    _onNextPage() {
        // OMY.Omy.sound.play(GameConstStatic.S_btn_disable);
        // OMY.Omy.sound.play(GameConstStatic.S_leaf_information);
        let page = this._currentP;
        if (++page === this._pages.length) page = 0;
        this.resetTimer()
        this._openPage(page);
    }

    _onClose() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        OMY.Omy.sound.play(GameConstStatic.S_help_close || GameConstStatic.S_btn_any);
        OMY.Omy.sound.fadeOut(GameConstStatic.S_intro, 0.3);
        this.timer?.destroy();
        this.isOpenIntro = this.checkBoxOnOff_btn.toggle;
        localStorage.setItem(AppG.gameConst.langID + "show_intro", this.isOpenIntro);
        AppG.emit.emit(GameConstStatic.EMIT_HIDE_UI);
        if (AppG.gameConst.gameHaveIntro) {
            OMY.Omy.viewManager.hideWindow(this._wName);
        } else {
            OMY.Omy.add.timer(1, () => {
                OMY.Omy.viewManager.hideWindow(this._wName);
                // OMY.Omy.add.timer(0.2, AppG.state.startNewSession, AppG.state);
            }, this);
        }
    }

    _onToggleAction(button, name) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        if (this._portCheckBoxCanvas) {
            if (this._portCheckBox.graphic === button) {
                this.checkBoxOnOff_btn.toggle = this._portCheckBox.toggle;
            } else {
                this._portCheckBox.toggle = this.checkBoxOnOff_btn.toggle;
            }
            this._portCheckBoxCanvas.alignContainer();
        }
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.isBlock = true;
            // this._bNext.isBlock = true;
            // this._bPrev.isBlock = true;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.isBlock = false;
            // this._bNext.isBlock = false;
            // this._bPrev.isBlock = false;
        }
    }
}
