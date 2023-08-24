import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {WindowsBase} from "../../gui/WindowsBase";
import {TStaticConst} from "../TStaticConst";
import TweenClose from "../windows/effects/TweenClose";
import TweenDate from "../windows/effects/TweenDate";
import Scroll from "./elements/Scroll";
import TablesBtn from "./elements/TablesBtn";
import LeadersTab from "./tabs/LeadersTab";
import PrizesTab from "./tabs/PrizesTab";
import RulesTab from "./tabs/RulesTab";

export class TRulesWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = TStaticConst.W_RULES_TOURNAMENT;
        this.json = this._gdConf = AppG.tournament.elementsJson["rules_window"];

        this._isMobile = !OMY.Omy.isDesktop;
        this._isGraphic = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._editMode = this._gdConf["edit"];
        if (this._editMode) {
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _updateGameSize(dx, dy, port) {
        if (!this.active) return;
        AppG.updateGameSize(this);
        if (this._isMobile) {
            if (this._tween) {
                OMY.Omy.remove.tween(this);
                this._tween = null;
            }
            if (this._tweenHide) {
                OMY.Omy.remove.tween(this);
                this._tweenHide = null;
                this._onHideHandler();
            } else {
                AppG.emit.emit(TStaticConst.ON_SHOW_T_RULES);
            }
            this._bgUp.height = this._bgUp.json[(port) ? "v_height" : "height"];
            this._bgUp.width = OMY.Omy.WIDTH;
            this._bgUp.x = dx * this._bgUp.json.sdx;
            this._bgUp.y = dy * this._bgUp.json.sdy;
            this._bgDown.height = OMY.Omy.HEIGHT;
            this._bgDown.width = OMY.Omy.WIDTH;
            this._bgDown.x = dx * this._bgDown.json.sdx;
            this._bgDown.y = dy * this._bgDown.json.sdy;
        } else {
            if (this._tint) {
                this._tint.x = -this.x * (1 / this.scale.x);
                this._tint.y = -this.y * (1 / this.scale.y);
                this._tint.width = OMY.Omy.WIDTH * (1 / this.scale.x);
                this._tint.height = OMY.Omy.HEIGHT * (1 / this.scale.y);
            }
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);
        if (AppG.isGameCrash && !this._isMobile) {
            /** @type {OMY.OGraphic} */
            this._tint = this.getChildByName("r_tint");
            this._tint.input = true;
        } else {
            this.getChildByName("r_tint")?.destroy();
        }
        this._saveBtnState = OMY.Omy.navigateBtn.state;
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        OMY.Omy.navigateBtn.addUpdateState(this._onChangeBtnState, this);
        new TweenDate(this.getChildByName("s_prizes_data_time_frame"));

        if (this._isMobile) {
            this._bgUp = this.getChildByName("s_bg_up");
            this._bgDown = this.getChildByName("r_bg_down");
            this._bgUp.input = true;
            this._bgDown.input = true;
        }

        this._tabs = {};

        /** @type {OMY.OButton} */
        this._bClose = this.getChildByName("b_close");
        this._bClose.externalMethod(this._onClose.bind(this));
        OMY.Omy.isDesktop && new TweenClose(this._bClose);

        /** @type {Array.<TablesBtn>} */
        this._buttonsList = [];
        let i = 0;
        while (this.getChildByName("b_" + String(++i))) {
            this._buttonsList.push(new TablesBtn(this.getChildByName("b_" + String(i))));
            this._buttonsList[i - 1].graphic.externalMethod(this._onTabHandler.bind(this));
            this._buttonsList[i - 1].graphic.userData = i;
        }

        /** @type {OMY.OContainer} */
        this._tabsCanvas = this.getChildByName("c_tabs");
        this._scroll = new Scroll(this, this.getChildByName("c_scroll"));

        /** @type {OMY.OTextBitmap} */
        this._tDate = this.getChildByName("t_date");

        /** @type {OMY.OActorSpine} */
        this._tLogoBgSpine = this.getChildByName("a_TTourn");

        OMY.Omy.loc.addUpdate(this._onLocChange, this, false);
        this._onLocChange();

        this._tabOpen(0);

        this._updateGameSize(AppG.dx, AppG.dy, AppG.isScreenPortrait);
        this._animateShow();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        OMY.Omy.navigateBtn.removeUpdateState(this._onChangeBtnState, this);
        OMY.Omy.loc.removeUpdate(this._onLocChange, this);

        this._tDate = null;
        this._tLogoBgSpine = null;
        this._scroll.destroy();
        this._scroll = null;
        this._tabsCanvas = null;
        this._bClose = null;
        for (let i = 0; i < this._buttonsList.length; i++) {
            this._buttonsList[i].destroy();
        }
        this._buttonsList.length = 0;
        this._buttonsList = null;
        this._tint = null;
        this._isGraphic = false;
        this.callAll("destroy");

        OMY.Omy.navigateBtn.updateState(this._saveBtnState);
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }
        super._onKill();
    }

    /**     * @private     */
    _onChangeBtnState(state) {
        if (state !== AppConst.C_BLOCK) {
            this._saveBtnState = state;
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        }
    }

    _onClose() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        this._animateHide();
    }

    /**     * @private     */
    _onLocChange() {
        const timeOffset = (new Date(AppG.tournament.endTime)).getTimezoneOffset();
        const startData = new Date(AppG.tournament.startTime - timeOffset * 60000).toLocaleString("en-GB",
            {timeZone: 'UTC', hour12: false}).split(" ");
        const endData = new Date(AppG.tournament.endTime - timeOffset * 60000).toLocaleString("en-GB",
            {timeZone: 'UTC', hour12: false}).split(" ");

        const startMMDDYY = startData[0].split("/");
        const startHHMMSS = startData[1].split(":");

        const endMMDDYY = endData[0].split("/");
        const endHHMMSS = endData[1].split(":");

        this._tDate.text = OMY.StringUtils.findAndReplace(OMY.Omy.loc.getText("tournament_4"),
            ["%{d}", "%{m}", "%{y}", "%{h}", "%{d1}", "%{m1}", "%{y1}", "%{h1}"],
            startMMDDYY[0], startMMDDYY[1], startMMDDYY[2].slice(0, -1), `${startHHMMSS[0]}:${startHHMMSS[1]}`,
            endMMDDYY[0], endMMDDYY[1], endMMDDYY[2].slice(0, -1), `${endHHMMSS[0]}:${endHHMMSS[1]}`);
    }

    _tabOpen(listId) {
        this._activeTab?.kill();
        this._buttonsList.map((a, index, array) => array[index].setNoActive());
        this._buttonsList[listId].setActive();
        /** @type {LeadersTab | PrizesTab | RulesTab} */
        this._activeTab = this._tabs[String(listId)];
        if (this._activeTab) {
            this._activeTab.revive();
        } else {
            switch (listId) {
                case 0: {
                    this._activeTab = new LeadersTab(this._gdConf["leaders"]);
                    this._tLogoBgSpine.play(false, "animation");
                    break;
                }
                case 1: {
                    this._activeTab = new PrizesTab(this._gdConf["prizes"]);
                    this._tLogoBgSpine.play(false, "animation");
                    break;
                }
                case 2: {
                    this._activeTab = new RulesTab(this._gdConf["rules"]);
                    this._tLogoBgSpine.play(false, "animation");
                    break;
                }
            }
        }
        this._tabsCanvas.addChild(this._activeTab);
        this._scroll.addContent(this._activeTab.cContent, this._activeTab.maskContent, listId);
    }

    /**     * @private     */
    _onTabHandler(btn) {
        this._tabOpen(btn.userData - 1);
    }

    /**     * @private     */
    _animateShow() {
        if (this._isMobile) {
            let saveY = this.y;
            this.y = -this.height;
            this._tween = OMY.Omy.add.tween(this, {y: saveY}, this._gdConf["time_show"],
                this._onShowHandler.bind(this));
        } else {
            this.alpha = 0;
            OMY.Omy.add.tween(this, {alpha: 1}, this._gdConf["time_show"],
                this._onShowHandler.bind(this));
        }
    }

    /**     * @private     */
    _onShowHandler() {
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        AppG.emit.emit(TStaticConst.ON_SHOW_T_RULES);
        this._tween = null;
    }

    /**     * @private     */
    _animateHide() {
        if (this._isMobile) {
            this._tweenHide = OMY.Omy.add.tween(this, {y: -this.height}, this._gdConf["time_hide"],
                this._onHideHandler.bind(this));
        } else {
            OMY.Omy.add.tween(this, {alpha: 0}, this._gdConf["time_hide"],
                this._onHideHandler.bind(this));
        }
    }

    /**     * @private     */
    _onHideHandler() {
        AppG.tournament.emit(TStaticConst.E_SHOW_WIDGET);
        this._tweenHide = null;
        OMY.Omy.viewManager.hideWindow(this._wName);
    }
}
