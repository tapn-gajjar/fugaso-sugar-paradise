import {WindowsBase} from "../WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {AutoPage} from "../../../app/guiStates/windows/menu/AutoPage";
import {GameinfoPage} from "../../../app/guiStates/windows/menu/GameinfoPage";
import {RulesPage} from "../../../app/guiStates/windows/menu/RulesPage";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {SettingPage} from "../../../app/guiStates/windows/menu/SettingPage";
import {HistoryPage} from "../../../app/guiStates/windows/menu/HistoryPage";

export class MenuBaseWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_MENU;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDMenu");

        this.setXY(this._gdConf["x"], this._gdConf["y"]);
        this._isOpen = false;
        this._openedPage = 0;

        OMY.Omy.add.createEntities(this, this._gdConf);

        if (!AppG.playingForFun) this.removeChild(this.getChildByName("t_play_for_fun"));
        if (this.getChildByName("t_clock")) this._clock();

        /** @type {OMY.OSprite} */
        this._bg = this.getChildByName("s_bg");
        this._bg.input = true;
        this.getChildByName("s_panel_3").input = true;

        this._cPageSetting = new SettingPage(this.getChildByName("c_page_setting"));
        this._cPageSetting.source.visible = false;
        this._cPageAuto = new AutoPage(this.getChildByName("c_page_auto"));
        this._cPageAuto.source.visible = false;
        this._cPageGameinfo = new GameinfoPage(this.getChildByName("c_page_gameinfo"));
        this._cPageGameinfo.source.visible = false;
        this._cPageRules = new RulesPage(this.getChildByName("c_page_rules"));
        this._cPageRules.source.visible = false;
        this._cPageHistory = new HistoryPage(this.getChildByName("c_page_history"));
        this._cPageHistory.source.visible = false;

        this.getChildByName("b_close").externalMethod(this._onClose.bind(this));
        this.getChildByName("b_set_setting").externalMethod(this._openPage.bind(this));
        this.getChildByName("b_set_auto").externalMethod(this._openPage.bind(this));
        this.getChildByName("b_set_paytable").externalMethod(this._openPage.bind(this));
        this.getChildByName("b_set_rules").externalMethod(this._openPage.bind(this));
        this.getChildByName("b_set_history").externalMethod(this._openPage.bind(this));
        this._addPageScroll();

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        this._gdConf["debug"] && OMY.Omy.add.regDebugMode(this);
        this._gdConf["show_debug"] && OMY.Omy.add.timer(0.5, this._showDebug, this);
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);
        if (!this._isOpen) {
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
            this._isOpen = true;
            if (AppG.isRichSpin) {
                if (this._currentP === 1/* || this._currentP === 2*/) {
                    this._currentP = 0;
                }
            }
            this.getChildByName("b_set_auto").isBlock = AppG.isRichSpin || !AppG.isHaveAuto;

            this._openStartPage();
            this._updateGameSize();
        }
    }

    _updateGameSize() {
        if (OMY.Omy.isDesktop) return;

        if (this._isOpen) {
            AppG.updateGameSize(this);
            if (this._bg) {
                this._bg.x = -this.x;
                this._bg.y = -this.y;
                this._bg.width = OMY.Omy.WIDTH;
                this._bg.height = OMY.Omy.HEIGHT;
            }

            this.getChildByName("s_panel_3").width = OMY.Omy.WIDTH;
            this.getChildByName("s_buttom").width = OMY.Omy.WIDTH;

            this._cPageHistory.updateGameSize();
            this._cPageSetting.updateGameSize();
            this._cPageAuto.updateGameSize();
            this._cPageGameinfo.updateGameSize();
            this._cPageRules.updateGameSize();
        }
    }

    _openStartPage() {
        switch (this._openedPage) {
            case 0: {
                this.getChildByName("b_set_setting").isBlock = true;
                this._activeButton = this.getChildByName("b_set_setting");
                this._setActivePage(this._cPageSetting);
                break;
            }
            case 1: {
                this.getChildByName("b_set_auto").isBlock = true;
                this._activeButton = this.getChildByName("b_set_auto");
                this._setActivePage(this._cPageAuto);
                break;
            }
            case 2: {
                this.getChildByName("b_set_paytable").isBlock = true;
                this._activeButton = this.getChildByName("b_set_paytable");
                this._setActivePage(this._cPageGameinfo);
                break;
            }
            case 3: {
                this.getChildByName("b_set_rules").isBlock = true;
                this._activeButton = this.getChildByName("b_set_rules");
                this._setActivePage(this._cPageRules);
                break;
            }
            case 4: {
                this.getChildByName("b_set_history").isBlock = true;
                this._activeButton = this.getChildByName("b_set_history");
                this._setActivePage(this._cPageHistory);
                break;
            }
        }
    }

    showMe() {
        OMY.Omy.viewManager.showWindow(this._wName, false, OMY.Omy.viewManager.gameUI.getWindowLayer("c_bet_layer"));
    }

    showAuto() {
        this._openedPage = 1;
        this.showMe();
        this._setActivePage(this._cPageAuto);
    }

    showMenu() {
        this._openedPage = 2;
        this.showMe();
        this._setActivePage(this._cPageGameinfo);
    }

    kill(onComplete = null) {
        if (this._isOpen) {
            OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
            this._isOpen = false;
            OMY.Omy.navigateBtn.unBlockingScreen();
            this.callAll("kill");
        }
        super.kill(onComplete);
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _onRevive() {
        super._onRevive();
        OMY.Omy.navigateBtn.blockingScreen();
    }

    _openPage(button) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        button.isBlock = true;
        this._activeButton.isBlock = false;
        this._activeButton = button;
        switch (button) {
            case this.getChildByName("b_set_setting"): {
                this._openedPage = 0;
                this._setActivePage(this._cPageSetting);
                break;
            }
            case this.getChildByName("b_set_auto"): {
                this._openedPage = 1;
                this._setActivePage(this._cPageAuto);
                break;
            }
            case this.getChildByName("b_set_paytable"): {
                this._openedPage = 2;
                this._setActivePage(this._cPageGameinfo);
                break;
            }
            case this.getChildByName("b_set_rules"): {
                this._openedPage = 3;
                this._setActivePage(this._cPageRules);
                break;
            }
            case this.getChildByName("b_set_history"): {
                this._openedPage = 4;
                this._setActivePage(this._cPageHistory);
                break;
            }
        }
    }

    _setActivePage(page) {
        this._activePage && (this._activePage.source.visible = false);
        this._activePage = page;
        this._activePage.source.visible = true;
        this._activePage.onShow();
    }

    _onClose() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        OMY.Omy.viewManager.hideWindow(this._wName);
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
        if (!this._activePage) return;

        e = e || window.event;
        const delta = e.deltaY || e.detail || e.wheelDelta;
        this._activePage.wheel(delta);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    /**
     * Full code flow for clock
     * @private
     */
    _clock() {
        /**
         * Format new Date() to hh:mm
         * @param {Date} localIsoDate
         * @return {string}
         */
        const formatTime = (localIsoDate) => {
            const z = (n) => {
                return (n < 10 ? "0" : "") + n;
            };
            const hh = localIsoDate.getHours();
            const mm = localIsoDate.getMinutes();
            return z(hh) + ":" + z(mm);
        };

        /**
         * Update time
         */
        const updateTime = () => {
            const date = new Date();
            if (this._txtLocalTime) {
                this._txtLocalTime.text = formatTime(date);
                OMY.Omy.add.timer(60 - date.getSeconds(), updateTime, this);
            }
        };

        this._txtLocalTime = this.getChildByName("t_clock");
        updateTime();
    }
}
