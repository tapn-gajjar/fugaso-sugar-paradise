import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {BtnHome} from "../../../casino/display/buttons/BtnHome";
import {GuiBase} from "../../../casino/gui/GuiBase";
import {BtnAudioMobile} from "../../../casino/display/buttons/desktop/settings/BtnAudioMobile";
import {BtnMenuWindow} from "../../../casino/display/buttons/mobile/BtnMenuWindow";
import {BtnBetWindow} from "../../../casino/display/buttons/mobile/BtnBetWindow";
import {BtnStartSkipMobile} from "../../../casino/display/buttons/mobile/BtnStartSkipMobile";
import {GameConstStatic} from "../../GameConstStatic";
import {BStart} from "../../display/buttons/BStart";

export class GuiMobile extends GuiBase {
    constructor() {
        super();
    }

    _createGraphic() {
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDGui");
        if (this._gdConf["entities"]) {
            for (let i = 0; i < this._gdConf["entities"].length; i++) {
                let conf = this._gdConf["entities"][i];
                if (!AppG.isHaveJackpot && conf.hasOwnProperty("jpContent")
                    && conf["jpContent"] === true) conf["active"] = false;
            }
        }
        OMY.Omy.add.createEntities(this, this._gdConf);

        this.getChildByName("s_bar_side1").saveW = this.getChildByName("s_bar_side1").width;
        this.getChildByName("s_bar_side2").saveW = this.getChildByName("s_bar_side2").width;

        /** @type {OMY.OGraphic} */
        this._tint = this.getChildByName("r_tint");
        if (this._tint) {
            this._tint.visible = false;
            this._tint.interactive = true;
            AppG.emit.on(GameConstStatic.WIN_MESSAGE_SHOW, this._onWinTintShow, this);
            AppG.emit.on(GameConstStatic.WIN_MESSAGE_HIDE, this._onWinTintHide, this);
        }

        this._createButtons();
        this._createTexts();

        OMY.Omy.viewManager.addStartOpenWindow(AppConst.W_MENU, this._onCreateMenu, this);
        OMY.Omy.viewManager.addStartCloseWindow(AppConst.W_MENU, this._onRemoveMenu, this);
        OMY.Omy.viewManager.addStartOpenWindow(AppConst.W_BET_SETTINGS, this._onCreateMenu, this);
        OMY.Omy.viewManager.addStartCloseWindow(AppConst.W_BET_SETTINGS, this._onRemoveMenu, this);

        super._createGraphic();
        this._updateGameSize();

        AppG.emit.once(GameConstStatic.EMIT_HIDE_UI, this._onHideUI, this);
        AppG.emit.once(GameConstStatic.EMIT_SHOW_UI, this._onShowUI, this);
    }

    _updateGameSize() {
        super._updateGameSize();

        this.getChildByName("s_bar_side2").width = this.getChildByName("s_bar_side2").saveW + AppG.dx;
        this.getChildByName("s_bar_side1").width = this.getChildByName("s_bar_side1").saveW + AppG.dx;

        this.getChildByName("s_panel_header").width = OMY.Omy.WIDTH;
        this.getChildByName("s_buttom").width = OMY.Omy.WIDTH;

        if (this._tint) {
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
            this._tint.x = -this.x;
            this._tint.y = -this.y;
        }
    }

    /**     * @public     */
    _createTexts() {
        super._createTexts();
        /** @type {OMY.OContainer} */
        let container;
        if (this.getChildByName("t_one_bet")) {
            container = this.getChildByName("t_one_bet");
            /** @type {OMY.OTextNumberBitmap} */
            this._txtOneBet = container.canvas.getChildByName("t_value");
            this._txtOneBet.lastText = AppG.currency;
            this._txtOneBet.showCent = true;
            this._txtOneBet.addTextUpdate(container.alignContainer, container);
            container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);
        }

        if (this.getChildByName("t_line")) {
            container = this.getChildByName("t_line");
            /** @type {OMY.OTextNumberBitmap} */
            this._txtLines = container.canvas.getChildByName("t_value");
            this._txtLines.showCent = false;
            this._txtLines.addTextUpdate(container.alignContainer, container);
            container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);
        }

        this.updateWin();
        this.updateBalance();
        this.updateBet();
        if (AppG.isBeginRespin)
            this._txtWin.setNumbers(AppG.totalRespinWin);
    }

    /**     * @public     */
    _createButtons() {
        this._btnStart = new BStart(this.getChildByName("b_start"));

        super._createButtons();

        if (AppG.isHaveSkip)
            new BtnStartSkipMobile(this.getChildByName("b_stop"));
        else
            this.getChildByName("b_stop").destroy();
        new BtnMenuWindow(this.getChildByName("b_menu"));
        new BtnBetWindow(this.getChildByName("b_bet"));
        new BtnHome(this.getChildByName("b_home"));
        new BtnAudioMobile(this.getChildByName("b_audio"));
    }

    updateBalance() {
        super.updateBalance();
    }

    updateBet() {
        super.updateBet();
        this._txtOneBet?.setNumbers(AppG.serverWork.currBet);
        this._txtLines?.setNumbers(AppG.serverWork.currLines);
    }

    _updateOnWin(value, skip = false) {
        if (AppG.winCredit !== 0 && AppG.isRespin && skip)
            value = AppG.totalWinInSpin;
        super._updateOnWin(value, skip);
    }

    /** @private */
    _onCreateWindow(wName) {
        switch (wName) {
            case AppConst.W_INTRO: {
                break;
            }
            case AppConst.W_FREE_IN_FREE:
            case AppConst.W_FREE_GAME_END:
            case AppConst.W_FREE_GAME_BEGIN: {
                this._txtWin.setNumbers(0);
                break;
            }
        }
    }

    /** @private */
    _onRemoveWindow(wName) {
        switch (wName) {
            case AppConst.W_BONUS: {
                // this._panelWin.visible = true;
                // this._textWin.visible = true;
                // this.getChildByName("c_win_block").visible = true;
                // this.getChildByName("t_win_tittle").visible = true;
                // this.getChildByName("s_panel_win").visible = true;
                break;
            }
        }
    }

    /**     * @private     */
    _onCreateMenu(wName) {
        if (wName === AppConst.W_BET_SETTINGS) {
            this.getChildByName("s_panel_b_android").renderable = false;
            this.getChildByName("s_bar_side1").renderable = false;
            this.getChildByName("s_bar_side2").renderable = false;
        }
        if (this.getChildByName("t_one_bet")) this.getChildByName("t_one_bet").renderable = false;
        if (this.getChildByName("t_line")) this.getChildByName("t_line").renderable = false;
        this.getChildByName("b_menu").renderable = false;
        this.getChildByName("b_bet").renderable = false;
        this.getChildByName("b_audio").renderable = false;
        this.getChildByName("t_clock").renderable = false;
        this.getChildByName("s_logo_small").renderable = false;
        this.getChildByName("s_panel_header").renderable = false;
        if (this.getChildByName("t_play_for_fun")) this.getChildByName("t_play_for_fun").renderable = false;
    }

    /**     * @private     */
    _onRemoveMenu(wName) {
        if (wName === AppConst.W_BET_SETTINGS) {
            this.getChildByName("s_panel_b_android").renderable = true;
            this.getChildByName("s_bar_side1").renderable = true;
            this.getChildByName("s_bar_side2").renderable = true;
        }
        if (this.getChildByName("t_one_bet")) this.getChildByName("t_one_bet").renderable = true;
        if (this.getChildByName("t_line")) this.getChildByName("t_line").renderable = true;
        this.getChildByName("b_menu").renderable = true;
        this.getChildByName("b_bet").renderable = true;
        this.getChildByName("b_audio").renderable = true;
        this.getChildByName("t_clock").renderable = true;
        this.getChildByName("s_logo_small").renderable = true;
        this.getChildByName("s_panel_header").renderable = true;
        if (this.getChildByName("t_play_for_fun")) this.getChildByName("t_play_for_fun").renderable = true;
    }

    /**     * @private     */
    _onWinTintShow() {
        this._tint.visible = true;
        this._tint.alpha = 0;
        OMY.Omy.add.tween(this._tint, {alpha: 1}, 0.3);
    }

    /**     * @private     */
    _onWinTintHide() {
        OMY.Omy.add.tween(this._tint, {alpha: 0}, 0.3, this._onHideTint.bind(this));
    }

    /**     * @private     */
    _onHideTint() {
        this._tint.visible = false;
    }

    /**     * @private     */
    _onHideUI() {
        this.alpha = 0;
    }

    /**     * @private     */
    _onShowUI() {
        OMY.Omy.add.tween(this, {alpha: 1}, 1.0);
    }
}
