import {TStaticConst} from "../TStaticConst";
import {AppG} from "../../AppG";
import {BTRulesWindow} from "./BTRulesWindow";
import {AppConst} from "../../AppConst";

export class BtnWidget extends OMY.OmyConst.Emit {
    /**
     * @param {Tournament}tournament
     */
    constructor(tournament) {
        super();
        /** @type {Tournament} */
        this._tournament = tournament;
        this._tournament.once(TStaticConst.E_CREATE_BTN_WIDGET, this._onShowVisual, this);
        this._tournament.on(TStaticConst.E_SHOW_WIDGET, this._onHidePanel, this);
        OMY.Omy.viewManager.addOpenWindow(TStaticConst.W_RULES_TOURNAMENT, this._isOpenWindowRules, this);
        OMY.Omy.viewManager.addOpenWindow(TStaticConst.W_FINAL_TOURNAMENT, this._isOpenWindowRules, this);
        AppG.emit.on(AppConst.E_START_SHOW_WINDOW, this._onStartShowW, this);
        OMY.Omy.viewManager.addCloseWindow(TStaticConst.W_RULES_TOURNAMENT, this._isCloseWindowRules, this);
        OMY.Omy.viewManager.addCloseWindow(TStaticConst.W_FINAL_TOURNAMENT, this._isCloseWindowRules, this);
        OMY.Omy.viewManager.addCloseWindow(AppConst.W_BET_SETTINGS, this._onCloseMobileW, this);
        OMY.Omy.viewManager.addCloseWindow(AppConst.W_MENU, this._onCloseMobileW, this);

        this.isActive = false;
        this._isAnimateShow = false;
        this._idleSimple = true;

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    /**     * @private     */
    _updateGameSize() {
        if (this._isAnimateShow) this._resetPosition();
    }

    /**     * @private     */
    _onShowVisual() {
        if (this._graphic) return;
        this.isActive = true;
        this._gdConf = AppG.tournament.elementsJson["widget"];
        let position = this._gdConf["position"];
        switch (position) {
            case "right":
            case "top": {
                OMY.OMath.objectCopy(this._gdConf["entities"][0], this._gdConf["pos_map"][position]["s_bg"]);
                OMY.OMath.objectCopy(this._gdConf["entities"][1], this._gdConf["pos_map"][position]["b_widget"]);
                break;
            }
        }
        /** @type {OMY.OContainer} */
        this._parent = OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer");
        /** @type {OMY.OContainer} */
        this._graphic = OMY.Omy.add.containerJson(OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer"), this._gdConf);
        /** @type {OMY.OSprite} */
        this._bg = this._graphic.getChildByName("s_bg");
        /** @type {OMY.OButton | BTRulesWindow} */
        this._btn = this._graphic.getChildByName("b_widget");
        this._btn.externalMethod(this._onOpenTourInfo.bind(this));
        if (OMY.Omy.isDesktop) {
            this._btn.addOver(this._onOverBtnHandler, this, false);
            this._btn.addOut(this._onOutBtnHandler, this, false);
            this._btn.addUpOutSide(this._onOutBtnHandler, this, false);
        }
        this._btn.addDown(this._onDownBtnHandler, this, false);
        /** @type {OMY.OActorSpine} */
        this._aSpine = this._btn.getChildByName("a_effect");
        this._aSpine.setMixByName(this._aSpine.json["a_over"], this._aSpine.json["custom_a_name"], 0.2);
        if (!OMY.Omy.isDesktop || AppG.isGameCrash)
            this._btn = new BTRulesWindow(this._btn);
        AppG.updateGameSize(this._graphic);
        this._btn.isBlock = true;
        this._animateShow(position);
    }

    /**     * @private     */
    _animateShow(position) {
        AppG.updateGameSize(this._graphic);
        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["custom_a_name"]);
        this._isAnimateShow = true;
        /**
         * @type {gsap.core.Timeline}
         * @private
         */
        this._tweenStart = OMY.Omy.add.tweenTimeline({delay: 0.3, onComplete: this._onShowBtn.bind(this)});
        switch (position) {
            case "left": {
                const saveX = this._graphic.x;
                const animate = this._gdConf["animate"];
                this._graphic.x += animate["dx0"];
                OMY.Omy.add.tween(this._graphic,
                    {x: saveX + animate["dx1"]},
                    animate["time0"], null, null, this._tweenStart);
                OMY.Omy.add.tween(this._graphic,
                    {x: saveX, ease: "back.out(1.7)"},
                    animate["time1"] - animate["time0"], null, null, this._tweenStart);
                OMY.Omy.add.timer(animate["time2"],
                    () => {
                        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_left"]);
                    }, this);
                break;
            }
            case "right": {
                const saveX = this._graphic.x;
                const animate = this._gdConf["animate_right"];
                this._graphic.x += animate["dx0"];
                OMY.Omy.add.tween(this._graphic,
                    {x: saveX + animate["dx1"]},
                    animate["time0"], null, null, this._tweenStart);
                OMY.Omy.add.tween(this._graphic,
                    {x: saveX, ease: "back.out(1.7)"},
                    animate["time1"] - animate["time0"], null, null, this._tweenStart);
                OMY.Omy.add.timer(animate["time2"],
                    () => {
                        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_right"]);
                    }, this);
                break;
            }
            case "top": {
                const saveY = this._graphic.y;
                const animate = this._gdConf["animate_top"];
                this._graphic.y += animate["dy0"];
                OMY.Omy.add.tween(this._graphic,
                    {y: saveY + animate["dy1"]},
                    animate["time0"], null, null, this._tweenStart);
                OMY.Omy.add.tween(this._graphic,
                    {y: saveY, ease: "back.out(1.7)"},
                    animate["time1"] - animate["time0"], null, null, this._tweenStart);
                OMY.Omy.add.timer(animate["time2"],
                    () => {
                        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_top"]);
                    }, this);
                break;
            }
        }
    }

    /**     * @private     */
    _resetPosition() {
        this._tweenStart.kill();
        this._tweenStart = null;
        AppG.updateGameSize(this._graphic);
        this._onShowBtn();
    }

    /**     * @private     */
    _onOutBtnHandler() {
        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["custom_a_name"]);
    }

    /**     * @private     */
    _onOverBtnHandler() {
        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_over"]);
    }

    /**     * @private     */
    _onDownBtnHandler() {
        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_up"]);
    }

    /**     * @private     */
    _onShowBtn() {
        this._isAnimateShow = false;
        this._btn.isBlock = false;
        this._timerIdle = OMY.Omy.add.timer(this._gdConf["timer_idle_first"], this._startIdle, this);
    }

    /**     * @private     */
    _onOpenTourInfo() {
        AppG.emit.emit(AppConst.APP_AUTO_HIDE_BLOCK);
        AppG.serverWork.checkTournament();
        AppG.serverWork.once(AppG.serverWork.TOURNAMENT_UPDATE, this._onEndOpenRules, this);
        this._btn.isBlock = true;
    }

    /**     * @private     */
    _onEndOpenRules() {
        if (OMY.Omy.isDesktop && !AppG.isGameCrash) {
            this._btn.isBlock = true;
            OMY.Omy.add.tween(this._graphic, {alpha: 0}, this._gdConf["animate_open_panel"],
                this._onHideButton.bind(this));
        } else {
            if (AppG.isMoveReels) return;
            if (AppG.isPLayFreeSpins || AppG.isPLayReSpins) return;
            OMY.Omy.add.tween(this._graphic, {alpha: 0}, this._gdConf["animate_open_panel"],
                this._onHideButton.bind(this));

            let windowLayer = (!OMY.Omy.isDesktop && AppG.isGameCrash) ? OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_rules_layer")
                : OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer");
            OMY.Omy.viewManager.showWindow(TStaticConst.W_RULES_TOURNAMENT, false, windowLayer);
        }
    }

    /**     * @private     */
    _onHideButton() {
        this._timerIdle?.destroy();
        this.isActive = false;
        this._graphic.parent && this._parent.removeChild(this._graphic);
        if (OMY.Omy.isDesktop && !AppG.isGameCrash) {
            this._tournament.emit(TStaticConst.E_SHOW_PANEL_WIDGET);
        } else {
            let windowLayer = (!OMY.Omy.isDesktop && AppG.isGameCrash) ? OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_rules_layer")
                : OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer");
            OMY.Omy.viewManager.showWindow(TStaticConst.W_RULES_TOURNAMENT, false, windowLayer);
        }
    }

    /**     * @private     */
    _isOpenWindowRules() {
        this._isOpenRules = true;
        if (this._btn) this._btn.isBlock = true;
    }

    /**     * @private     */
    _isCloseWindowRules() {
        this._isOpenRules = false;
        if (this._btn) this._btn.isBlock = false;
    }

    /**     * @private     */
    _onOpenMobileW() {
        this._graphic.visible = false;
    }

    /**     * @private     */
    _onStartShowW(wName) {
        switch (wName) {
            case AppConst.W_BET_SETTINGS:
            case AppConst.W_MENU: {
                this._onOpenMobileW();
                break;
            }
        }
    }

    /**     * @private     */
    _onCloseMobileW() {
        this._graphic.visible = true;
    }

    /**     * @private     */
    _onHidePanel() {
        if (!this._graphic) {
            this._tournament.off(TStaticConst.E_CREATE_BTN_WIDGET, this._onShowVisual, this);
            this._onShowVisual();
            return;
        }
        this.isActive = true;
        this._parent.addChildAt(this._graphic, 0);
        if (this._isOpenRules && this._btn) this._btn.isBlock = true;
        this._graphic.alpha = 1;
        this._animateShow(this._gdConf["position"]);
    }

    /**     * @private     */
    _startIdle() {
        this._timerIdle?.destroy();
        (this._idleSimple) ?
            this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_wait_1"])
            : this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_wait_2"]);
        this._idleSimple = !this._idleSimple;
        this._timerIdle = OMY.Omy.add.timer((this._idleSimple) ? this._gdConf["timer_idle"][0] : this._gdConf["timer_idle"][1],
            this._startIdle, this);
    }
}