import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";
import {BtnToggle} from "../../../display/buttons/BtnToggle";
import {MenuPageBase} from "./MenuPageBase";
import {GameConstStatic} from "../../../../app/GameConstStatic";

export class AutoPageBase extends MenuPageBase {
    constructor(source) {
        super(source);

        // this._addUnderSlideBtn(this._cPageContent.getChildByName("b_toggle_any_win"));
        // this._addUnderSlideBtn(this._cPageContent.getChildByName("b_toggle_free"));
        this._addUnderSlideBtn(this._countAutoSlider);
        // this._cPageContent.getChildByName("b_toggle_jack") && this._addUnderSlideBtn(this._cPageContent.getChildByName("b_toggle_jack"));

        OMY.Omy.viewManager.addCloseWindow(AppConst.W_CALC, this._onCalcClose, this);
    }

    _onCheckGraphic() {
        super._onCheckGraphic();

        if (!AppG.isHaveJackpot) {
            this._cPageContent.removeChild(this._cPageContent.getChildByName("autospin_if_6"));
            this._cPageContent.removeChild(this._cPageContent.getChildByName("b_toggle_jack"));
            this._cPageContent.removeChild(this._cPageContent.getChildByName("r_line_8"));
        }
        this._btnAnyWin = new BtnToggle(this._cPageContent.getChildByName("b_toggle_any_win"),
            this._onToggleAction.bind(this), ["b_toggle_any_win"]);
        this._btnFree = new BtnToggle(this._cPageContent.getChildByName("b_toggle_free"),
            this._onToggleAction.bind(this), ["b_toggle_free"]);
        // this._btnFree.toggle = AppG.autoGameRules.ruleIfFreeSpin;
        // this._btnFree.alwaysAvailable = AppG.gameHaveFree;
        if (this._cPageContent.getChildByName("b_toggle_jack"))
            this._btnJackPot = new BtnToggle(this._cPageContent.getChildByName("b_toggle_jack"),
                this._onToggleAction.bind(this), ["b_toggle_jack"]);

        /** @type {OMY.OButtonTween} */
        this._btnSingleWin = this._cPageContent.getChildByName("b_win_value");
        this._btnSingleWin.externalMethod(this._onShowCalc.bind(this), ["b_win_value"]);
        this._btnSingleWin.label.valueData = 0;
        /** @type {OMY.OButtonTween} */
        this._btnWinTotal = this._cPageContent.getChildByName("b_total_win_value");
        this._btnWinTotal.externalMethod(this._onShowCalc.bind(this), ["b_total_win_value"]);
        this._btnWinTotal.label.valueData = 0;
        /** @type {OMY.OButtonTween} */
        this._btnLoseTotal = this._cPageContent.getChildByName("b_total_lose_value");
        this._btnLoseTotal.externalMethod(this._onShowCalc.bind(this), ["b_total_lose_value"]);
        this._btnLoseTotal.label.valueData = 0;

        this._autoSpinsCount = 0;
        /** @type {Array} */
        this._spinsCountValues = AppG.gameConst.getData("autoSpinNumber").concat();
        this._spinsCountValues.unshift(0);

        /** @type {OMY.OSprite} */
        this._sliderFill = this._cPageContent.getChildByName("c_auto_count").getChildByName("s_fill");
        this._sliderFill.mask = this._cPageContent.getChildByName("c_auto_count").getChildByName("r_mask_fill");
        this._sliderFill.mask.x = this._sliderFill.x;
        this._sliderFill.mask.y = this._sliderFill.y;
        this._sliderFill.mask.height = this._sliderFill.height;

        /** @type {OMY.OTextFont} */
        this._tCountFree = this._cPageContent.getChildByName("c_auto_count").getChildByName("t_value");
        /** @type {OMY.OSprite} */
        this._sCountFree = this._cPageContent.getChildByName("c_auto_count").getChildByName("s_value");
        /** @type {OMY.OSlider} */
        this._countAutoSlider = this._cPageContent.getChildByName("c_auto_count").getChildByName("sl_scroll_handler");
        this._countAutoSlider.setTargetData(0, this._spinsCountValues.length - 1);
        this._countAutoSlider.addUpdateCallback(this._onSliderUpdate, this);
        this._countAutoSlider.addStopCallback(this._onSliderStop, this);
    }

//-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    updateGameSize() {
        super.updateGameSize();
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------
    /**     * @private     */
    _onToggleAction(button, name) {
        switch (name) {
            case "b_toggle_any_win": {
                AppG.autoGameRules.setRuleOnAnyWin(this._btnAnyWin.toggle);
                break;
            }
            case "b_toggle_free": {
                AppG.autoGameRules.setRuleIfFreeSpin(this._btnFree.toggle);
                break;
            }
            case "b_toggle_jack": {
                AppG.autoGameRules.setRuleIfJackpotWin(this._btnJackPot.toggle);
                break;
            }
        }
    }

    /**     * @private     */
    _onShowCalc(button, name) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);

        this._calcName = name;
        OMY.Omy.viewManager.getView(AppConst.W_CALC).ruleValue = button.label.valueData;
        OMY.Omy.viewManager.showWindow(AppConst.W_CALC, false, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    /**     * @private     */
    _onCalcClose() {
        let cashNumber = OMY.OMath.int(OMY.Omy.viewManager.getView(AppConst.W_CALC).ruleValue);
        const toggle = cashNumber > 0;
        switch (this._calcName) {
            case ("b_win_value"): {
                AppG.autoGameRules.setRuleIfSingleWinExceeds(toggle, cashNumber);
                this._btnSingleWin.label.valueData = cashNumber;
                this._btnSingleWin.label.text = this._getButtonText(cashNumber);
                break;
            }
            case ("b_total_win_value"): {
                AppG.autoGameRules.setRuleIfCashIncBy(toggle, cashNumber);
                this._btnWinTotal.label.valueData = cashNumber;
                this._btnWinTotal.label.text = this._getButtonText(cashNumber);
                break;
            }
            case ("b_total_lose_value"): {
                AppG.autoGameRules.setRuleIfCashDecBy(toggle, cashNumber);
                this._btnLoseTotal.label.valueData = cashNumber;
                this._btnLoseTotal.label.text = this._getButtonText(cashNumber);
                break;
            }
        }
    }

    /**     * @private     */
    _onSliderUpdate(value, percent) {
        this._sliderFill.mask.width = this._sliderFill.width * percent;
        this._autoSpinsCount = this._spinsCountValues[Math.round(value)];
        this._sCountFree.visible = this._autoSpinsCount === -1;
        this._tCountFree.visible = this._autoSpinsCount !== -1;
        this._tCountFree.text = String(this._autoSpinsCount);
    }

    _onSliderStop(value) {
        AppG.autoGameRules.setCountOfPlay(this._spinsCountValues[Math.round(value)]);
    }

    destroy() {
        OMY.Omy.viewManager.removeCloseWindow(AppConst.W_CALC, this._onCalcClose, this);
        this._btnAnyWin = null;
        this._btnFree = null;
        this._btnJackPot = null;
        this._btnSingleWin = null;
        this._btnWinTotal = null;
        this._btnLoseTotal = null;
        this._countAutoSlider = null;
        super.destroy();
    }

    onShow() {
        let countIndex = this._spinsCountValues.indexOf(AppG.autoGameRules.ruleCountPlay);
        countIndex = (countIndex === -1) ? 0 : countIndex;
        let percent = countIndex / (this._spinsCountValues.length - 1);
        this._onSliderUpdate(countIndex, percent);
        this._countAutoSlider.forceUpdate(countIndex);
        this._btnAnyWin.toggle = AppG.autoGameRules.ruleOnAnyWin;
        if (!AppG.gameHaveFree)
            this._btnFree.graphic.isBlock = true;
        else
            this._btnFree.toggle = AppG.autoGameRules.ruleIfFreeSpin;
        if (this._btnJackPot) this._btnJackPot.toggle = AppG.autoGameRules.ruleOnJackpotWin;
        this._btnSingleWin.label.valueData = AppG.autoGameRules.ruleIfSingleWinExceedsValue;
        this._btnSingleWin.label.text = this._getButtonText(this._btnSingleWin.label.valueData);
        this._btnWinTotal.label.valueData = AppG.autoGameRules.ruleIfCashIncByValue;
        this._btnWinTotal.label.text = this._getButtonText(this._btnWinTotal.label.valueData);
        this._btnLoseTotal.label.valueData = AppG.autoGameRules.ruleIfCashDecByValue;
        this._btnLoseTotal.label.text = this._getButtonText(this._btnLoseTotal.label.valueData);

        this._btnSingleWin.label._checkScale();
        this._btnWinTotal.label._checkScale();
        this._btnLoseTotal.label._checkScale();

        const saveMask = this._sliderFill.mask;
        this._sliderFill.mask = null;
        this._sliderFill.mask = saveMask;

        super.onShow();
    }

    /**     * @private     */
    _getButtonText(value) {
        return (value > 0) ? String(value) + AppG.currency : OMY.Omy.loc.getText("mobile_menu_11");
    }

//-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}
