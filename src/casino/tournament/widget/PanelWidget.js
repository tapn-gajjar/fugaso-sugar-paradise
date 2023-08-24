import {TStaticConst} from "../TStaticConst";
import {AppG} from "../../AppG";
import UserElement from "../rules/elements/UserElement";
import {AppConst} from "../../AppConst";
import {BTRulesWindow} from "./BTRulesWindow";
import UserPlacePanel from "../rules/elements/UserPlacePanel";

export class PanelWidget extends OMY.OContainer {
    constructor() {
        super();
        this.json = this._gdConf = AppG.tournament.elementsJson["panel_widget"];
        AppG.tournament.on(TStaticConst.E_SHOW_PANEL_WIDGET, this._onShowPanel, this);
        OMY.Omy.viewManager.addOpenWindow(TStaticConst.W_FINAL_TOURNAMENT, this._isOpenFinal, this);
        AppG.emit.on(AppConst.APP_AUTO_PANEL, this._onAutoPanelToggle, this);
        this._isShowing = false;
        this._isHiding = false;
        this._autoUpdateTime = this._gdConf["auto_update"] ?? 4;
        this.kill();
    }

    /**     * @private     */
    _onShowPanel() {
        this.revive();
        if (!this.numChildren) this._createGraphic();
        if (!this.getChildByName("r_mask").json["debug"]) {
            this.getChildByName("c_content").mask = null;
            this.getChildByName("r_mask").revive()
            this.getChildByName("c_content").mask = this.getChildByName("r_mask");
        }
        this._updateData();
        OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer").addChild(this);
        AppG.updateGameSize(this);
        this._animateShow();
    }

    /**     * @private     */
    _animateShow() {
        if (this._isShowing) return;
        this._isShowing = true;
        /**
         * @type {gsap.core.Timeline}
         * @private
         */
        this._tweenStart = OMY.Omy.add.tweenTimeline({delay: 0.1, onComplete: this._onMoveShowEnd.bind(this)});

        const saveX = this.x;
        const animate = this._gdConf["animate"];
        this.x += animate["dx"];
        OMY.Omy.add.tween(this,
            {x: saveX, ease: "back.out(1.7)"},
            animate["time_dx"], null, null, this._tweenStart);

        let sprite = this.getChildByName("s_Leaderboard_back_8");
        sprite.alpha = 0;
        OMY.Omy.add.tween(sprite, {alpha: 1},
            animate["time_alpha"], null, null, this._tweenStart, 0.3);
        sprite = this.getChildByName("s_Leaderboard_back_9");
        sprite.alpha = 0;
        OMY.Omy.add.tween(sprite, {alpha: 1},
            animate["time_alpha"], null, null, this._tweenStart, 0.3);

        sprite = this.getChildByName("c_content");
        const saveY = sprite.y;
        sprite.y += animate["dy_content"];
        OMY.Omy.add.tween(sprite, {y: saveY},
            animate["time_dy"], null, null, this._tweenStart, animate["time_dx"]);
        this._btnClose.isBlock = true;
        this._btnOpen.isBlock = true;
        this._openRules = false;
    }

    /**     * @private     */
    _onMoveShowEnd() {
        this._isShowing = false;
        this._btnClose.isBlock = false;
        this._btnOpen.onStateUpdate();
        this._tweenStart = null;
        if (AppG.autoGameRules.isShowAutoGamePanel && !this._needToClose) this._needToClose = true;
        if (this._needToClose) {
            this._needToClose = false;
            this._onClosePanel();
        }
    }

    /**     * @private     */
    _createGraphic() {
        OMY.Omy.add.createEntities(this, this._gdConf);

        this.getChildByName("s_Leaderboard_back_2").input = true;
        this.getChildByName("c_content").getChildByName("s_Leaderboard_back_1").input = true;

        /** @type {OMY.OButton | BTRulesWindow} */
        this._btnOpen = this.getChildByName("b_open");
        this._btnOpen.externalMethod(this._onOpenTourInfo.bind(this));
        this._btnOpen = new BTRulesWindow(this._btnOpen);
        /** @type {OMY.OButton} */
        this._btnClose = this.getChildByName("b_close");
        this._btnClose.externalMethod(this._onClosePanel.bind(this));

        /** @type {OMY.OContainer} */
        this._players = this.getChildByName("c_content").getChildByName("c_players");
        this._isEditMode = Boolean(this._gdConf["edit"]);
        if (!this.getChildByName("r_mask").json["debug"])
            this.getChildByName("c_content").mask = this.getChildByName("r_mask");
        this._createElements();
        if (this.getChildByName("c_content").getChildByName("c_user_place"))
            /** @type {UserPlacePanel} */
            this._userPlacePanel = new UserPlacePanel(this.getChildByName("c_content").getChildByName("c_user_place"));
    }

    /**     * @private     */
    _createElements() {
        const countMax = this._gdConf["countMax"];
        /** @type {OMY.OContainer} */
        let element;
        this._elJson = this._gdConf["element"];
        /** @type {Array.<UserElement>} */
        this._elements = [];
        for (let i = 0; i < countMax; i++) {
            element = OMY.Omy.add.containerJson(this._players, this._elJson);
            if (i)
                element.y = this._players.children[i - 1].y + this._gdConf["step"];
            element.name += String(i);
            this._elements.push(new UserElement(element, null, i + 1, true, false));
        }
    }

    /**     * @private     */
    _updateData() {
        if (!this.active) return;
        if (this._isEditMode) return;
        const players = AppG.tournament.places
        for (let i = 0; i < this._elements.length; i++) {
            if (i < players.length)
                this._elements[i].updateData(players[i]);
            this._elements[i].visible = i < players.length;
        }
        this._userPlacePanel?.updateData();
        if (!this._autoUpdateTimer)
            this._autoUpdateTimer = OMY.Omy.add.timer(this._autoUpdateTime, this._onGetTInfo, this, 0, true);
    }

    /**     * @private     */
    _onClosePanel() {
        if (!this.active) return;
        this._btnClose.isBlock = true;
        this._btnOpen.isBlock = true;
        this._animateHide();
    }

    /**     * @private     */
    _animateHide() {
        if (this._isHiding) return;
        if (this._autoUpdateTimer) {
            this._autoUpdateTimer.destroy();
            this._autoUpdateTimer = null;
        }
        this._needToClose = false;
        this._isHiding = true;
        this._tweenStart?.kill();
        this._tweenStart = null;
        const animate = this._gdConf["animate"];
        OMY.Omy.add.tween(this, {x: this.x + animate["dx"]}, animate["time_dx"],
            this._onHideComplete.bind(this));
    }

    /**     * @private     */
    _onHideComplete() {
        this._isHiding = false;
        this.kill();
        this.parent?.removeChild(this);
        !this._openRules && AppG.tournament.emit(TStaticConst.E_SHOW_WIDGET);
    }

    /**     * @private     */
    _onOpenTourInfo() {
        AppG.serverWork.checkTournament();
        AppG.serverWork.once(AppG.serverWork.TOURNAMENT_UPDATE, this._onEndOpenRules, this);
        this._btnClose.isBlock = true;
        this._btnOpen.isBlock = true;
    }

    /**     * @private     */
    _onEndOpenRules() {
        if (AppG.isMoveReels) return;
        this._openRules = true;
        this._onClosePanel();
        OMY.Omy.viewManager.showWindow(TStaticConst.W_RULES_TOURNAMENT, false,
            OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer"));
    }

    /**     * @private     */
    _onGetTInfo() {
        if (!this.active) {
            this._autoUpdateTimer?.destroy();
            this._autoUpdateTimer = null;
            return;
        }
        AppG.serverWork.checkTournament();
        AppG.serverWork.once(AppG.serverWork.TOURNAMENT_UPDATE, this._updateData, this);
    }

    /**     * @private     */
    _isOpenFinal() {
        if (!this.active) return;
        this._onClosePanel();
    }

    /**     * @private     */
    _onAutoPanelToggle(isOpen) {
        if (!this.active) return;
        if (isOpen) {
            if (this._isShowing) this._needToClose = true;
            else this._onClosePanel();
        }
    }
}