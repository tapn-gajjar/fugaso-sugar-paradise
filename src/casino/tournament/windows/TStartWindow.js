import {TStaticConst} from "../TStaticConst";
import {WindowsBase} from "../../gui/WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {BtnToggle} from "../../display/buttons/BtnToggle";
import TweenClose from "./effects/TweenClose";
import TweenCheckOut from "./effects/TweenCheckOut";

export class TStartWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = TStaticConst.W_START_TOURNAMENT;
        this.json = this._gdConf = AppG.tournament.elementsJson["start_window"];

        this._isGraphic = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._editMode = this._gdConf["edit"];
        if (this._editMode) {
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
        if (this._tint) {
            this._tint.x = -this.x * (1 / this.scale.x);
            this._tint.y = -this.y * (1 / this.scale.y);
            this._tint.width = OMY.Omy.WIDTH * (1 / this.scale.x);
            this._tint.height = OMY.Omy.HEIGHT * (1 / this.scale.y);
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._needOpenRules = false;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);
        if (AppG.isGameCrash) {
            /** @type {OMY.OGraphic} */
            this._tint = this.getChildByName("r_tint");
            if (this._tint) this._tint.input = true;
        } else {
            this.getChildByName("r_tint")?.destroy();
        }
        this._saveBtnState = OMY.Omy.navigateBtn.state;
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        OMY.Omy.navigateBtn.addUpdateState(this._onChangeBtnState, this);
        /** @type {OMY.OContainer} */
        this._canvas = this.getChildByName("c_canvas");

        /** @type {OMY.OButton} */
        this._bClose = this._canvas.getChildByName("b_close");
        this._bClose.externalMethod(this._onClose.bind(this));
        /** @type {OMY.OButton} */
        this._bOpenWindow = this._canvas.getChildByName("b_open_rules");
        this._bOpenWindow.externalMethod(this._onOpenRules.bind(this));

        /**
         * @type {BtnToggle}
         */
        this.checkBoxOnOff_btn = new BtnToggle(this._canvas.getChildByName("checkBoxOnOff_btn"), null, null, false);
        this.checkBoxOnOff_btn.alwaysAvailable = true;
        this.checkBoxOnOff_btn.toggle = localStorage.getItem(AppG.tournament.constJson.version + "show_start_tournament") === "false";
        /** @type {OMY.OTextBitmap} */
        this._tWinShare = this._canvas.getChildByName("t_cashier");
        this._tStart2text = this._canvas.getChildByName("tournament_start_2");
        OMY.Omy.loc.addUpdate(this._onLocChange, this, false);
        this._onLocChange();

        this._updateGameSize();
        this._animateShow();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        OMY.Omy.navigateBtn.removeUpdateState(this._onChangeBtnState, this);
        OMY.Omy.loc.removeUpdate(this._onLocChange, this);

        this._bClose = null;
        this._bOpenWindow = null;
        this.checkBoxOnOff_btn = null;
        this._tWinShare = null;
        this._tStart2text = null;
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
        if (this._needOpenRules) {
            let windowLayer = (!OMY.Omy.isDesktop && AppG.isGameCrash) ? OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_rules_layer")
                : OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer");
            OMY.Omy.viewManager.showWindow(TStaticConst.W_RULES_TOURNAMENT, false, windowLayer);
        }
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
        localStorage.setItem(AppG.tournament.constJson.version + "show_start_tournament",
            (this.checkBoxOnOff_btn.toggle) ? "false" : "true");
        this._animateHide();
        !this._needOpenRules && AppG.tournament.emit(TStaticConst.E_CREATE_BTN_WIDGET);
    }

    _onOpenRules() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        AppG.serverWork.checkTournament();
        AppG.serverWork.once(AppG.serverWork.TOURNAMENT_UPDATE, this._onEndOpenRules, this);
    }

    /**     * @private     */
    _onEndOpenRules() {
        this._needOpenRules = true;
        this._onClose();
    }

    /**     * @private     */
    _onLocChange() {
        let text = AppG.formatCurrency(AppG.tournament.share);
        text = OMY.StringUtils.replaceAll(text, " ", " ");
        text = OMY.StringUtils.replaceAll(text, " ", " ");
        this._tWinShare.text = OMY.StringUtils.sprintf(OMY.Omy.loc.getText("tournament_start_4"), String(text));
        this._tStart2text.text = OMY.StringUtils.sprintf(OMY.Omy.loc.getText("tournament_start_2"), String(AppG.tournament.tournamentName));
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.isBlock = true;
            this._bOpenWindow.isBlock = true;
            this.checkBoxOnOff_btn.graphic.isBlock = true;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            this._bClose.isBlock = false;
            this._bOpenWindow.isBlock = false;
            this.checkBoxOnOff_btn.graphic.isBlock = false;
        }
    }

    /**     * @private     */
    _animateShow() {
        let data = this._gdConf["animate_setting"];
        this._canvas.scale.set(data["start_scale"]);
        this._tweenLine = OMY.Omy.add.tweenTimeline(
            {
                onComplete: this._onShowWindow.bind(this)
            }
        );
        OMY.Omy.add.tween(this._canvas.scale, {x: 1, y: 1, ease: data["ease"]},
            data["time_window"], null,
            null, this._tweenLine, 0);

        let obj = this._canvas.getChildByName("a_TCubk");
        obj.x = data["prize_x"];
        obj.y = data["prize_y"];
        OMY.Omy.add.tween(obj,
            {x: obj.json.x, y: obj.json.y},
            data["time_prize"], null,
            null, this._tweenLine, 0);

        obj = this._canvas.getChildByName("b_close");
        obj.x = data["close_x"];
        obj.y = data["close_y"];
        OMY.Omy.add.tween(obj,
            {x: obj.json.x, y: obj.json.y},
            data["time_prize"], null,
            null, this._tweenLine, 0);
    }

    /**     * @private     */
    _onShowWindow() {
        this._tweenLine = null;
        this._bClose && new TweenClose(this._bClose);
        this._bOpenWindow && new TweenCheckOut(this._bOpenWindow);
    }

    /**     * @private     */
    _animateHide() {
        this._bClose.isBlock = true;
        let data = this._gdConf["animate_setting"];
        OMY.Omy.add.tween(this._canvas,
            {alpha: 0},
            data["time_hide"], this._onHideWindow.bind(this));
    }

    /**     * @private     */
    _onHideWindow() {
        OMY.Omy.viewManager.hideWindow(this._wName);
    }
}
