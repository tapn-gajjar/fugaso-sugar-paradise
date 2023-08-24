import {AppG} from "../../AppG";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {AppConst} from "../../AppConst";

export class AutoBlockSetting {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._isOpen = false;
        this._graphic.visible = false;
        if (this._graphic.getChildByName("s_panel_autoplay")) this._graphic.getChildByName("s_panel_autoplay").input = true;

        this._checkBoxes = [];
        if (!AppG.isHaveJackpot) {
            this._graphic.removeChild(this._graphic.getChildByName("c_jack"));
        } else {
            /** @type {OMY.OCheckBox} */
            this._btnJackPot = this._graphic.getChildByName("c_jack").getChildByName("cb_jack");
            this._btnJackPot.externalMethod(this._onToggleAction.bind(this), ["cb_jack"]);
            this._checkBoxes.push(this._btnJackPot);
        }
        /** @type {OMY.OCheckBox} */
        this._btnAnyWin = this._graphic.getChildByName("cb_any");
        this._btnAnyWin.externalMethod(this._onToggleAction.bind(this), ["cb_any"]);
        this._checkBoxes.push(this._btnAnyWin);

        /** @type {OMY.OCheckBox} */
        this._btnFree = this._graphic.getChildByName("cb_free");
        if (AppG.gameHaveFree) {
            this._btnFree.externalMethod(this._onToggleAction.bind(this), ["cb_free"]);
            this._checkBoxes.push(this._btnFree);
        } else {
            this._btnFree.isChecking = false;
            this._btnFree.isBlock = true;
            this._btnFree = null;
        }

        /** @type {OMY.OCheckBox} */
        this._btnSingleWin = this._graphic.getChildByName("cb_single");
        this._btnSingleWin.externalMethod(this._onToggleAction.bind(this), ["cb_single"]);
        this._checkBoxes.push(this._btnSingleWin);
        /** @type {OMY.OTextInput} */
        this._tSingleWin = this._graphic.getChildByName("t_input_win_one");
        this._tSingleWin.addInput(this._onInputText, this);

        /** @type {OMY.OCheckBox} */
        this._btnWinTotal = this._graphic.getChildByName("cb_win");
        this._btnWinTotal.externalMethod(this._onToggleAction.bind(this), ["cb_win"]);
        this._checkBoxes.push(this._btnWinTotal);
        /** @type {OMY.OTextInput} */
        this._tLimitWin = this._graphic.getChildByName("t_input_win_limit");
        this._tLimitWin.addInput(this._onInputText, this);

        /** @type {OMY.OTextInput} */
        this._tLimitLose = this._graphic.getChildByName("t_input_lose_limit");
        this._tLimitLose.addInput(this._onInputText, this);
        if (!AppG.optionallyDecByValue) {
            /** @type {OMY.OCheckBox} */
            this._btnLoseTotal = OMY.Omy.add.buttonJson(this._graphic, this._gdConf["cb_lose"]);
            this._btnLoseTotal.externalMethod(this._onToggleAction.bind(this), ["cb_lose"]);
            this._checkBoxes.push(this._btnLoseTotal);
            this._graphic.removeChild(this._graphic.getChildByName("s_b_check_disable_2"));
        }

        this._graphic.getChildByName("t_cur_single").text = AppG.currency;
        this._graphic.getChildByName("t_cur_win").text = AppG.currency;
        this._graphic.getChildByName("t_cur_lose").text = AppG.currency;

        /** @type {OMY.OCheckBox} */
        this._btnClose = this._graphic.getChildByName("b_close");
        this._btnClose.externalMethod(this._onCloseBlock.bind(this));

        /** @type {OMY.OCheckBox} */
        this._btnReset = this._graphic.getChildByName("b_reset");
        this._btnReset.externalMethod(this.onResetSetting.bind(this));

        this._startBtnsList = [];
        this._autospinArray = AppG.gameConst.getData("autoSpinNumber");
        this._startIndex = 0;
        let i = -1;
        while (this._graphic.getChildByName("b_number_" + String(++i))) {
            /** @type {OMY.OButton} */
            let btn = this._graphic.getChildByName("b_number_" + String(i));
            btn.externalMethod(this._onStartAuto.bind(this));
            if (btn.getChildByName("s_infinity"))
                btn.getChildByName("s_infinity").visible = this._autospinArray[i] === -1;
            btn.label.visible = this._autospinArray[i] !== -1;
            btn.label.text = String(this._autospinArray[i]);
            this._startBtnsList.push(btn);
        }

        /** @type {OMY.OCheckBox} */
        this._btnLeft = this._graphic.getChildByName("b_left");
        this._btnLeft.externalMethod(this.onMoveCountSpin.bind(this));
        /** @type {OMY.OCheckBox} */
        this._btnRight = this._graphic.getChildByName("b_right");
        this._btnRight.externalMethod(this.onMoveCountSpin.bind(this));

        AppG.emit.on(AppConst.APP_AUTO_TOGGLE_BLOCK, this._toggleBlock, this);
        AppG.emit.on(AppConst.APP_AUTO_HIDE_BLOCK, this._autoHideBlock, this);
    }

    /**     * @private     */
    _toggleBlock() {
        this._isOpen = !this._isOpen;
        this._graphic.visible = this._isOpen;
        if (this._isOpen) this._openBlock();
        else this.setNotActiveInput();
        AppG.emit.emit(AppConst.APP_AUTO_PANEL, this._isOpen);
    }

    /**     * @private     */
    _autoHideBlock() {
        if (this._isOpen)
            this._toggleBlock();
    }

    /**     * @private     */
    _openBlock() {
        this.onResetSetting();
        if (this._btnJackPot)
            this._btnJackPot.isChecking = AppG.autoGameRules.ruleOnJackpotWin;
        if (this._btnFree)
            this._btnFree.isChecking = AppG.autoGameRules.ruleIfFreeSpin;

        this._btnAnyWin.isChecking = AppG.autoGameRules.ruleOnAnyWin;
        this._btnSingleWin.isChecking = AppG.autoGameRules.ruleIfSingleWinExceeds;
        this._btnWinTotal.isChecking = AppG.autoGameRules.ruleIfCashIncBy;
        if (this._btnLoseTotal)
            this._btnLoseTotal.isChecking = AppG.autoGameRules.ruleIfCashDecByValue;

        this._tSingleWin.text = 0;
        this._tLimitWin.text = 0;
        this._tLimitLose.text = 0;
        this._checkReset();
        AppG.autoGameRules.showAutoGame();
    }

    /**     * @private     */
    _onInputText(input, text) {
        const inputValue = Number(text);
        if (text !== String(inputValue)) {
            input.text = text = String(inputValue);
        }

        switch (input) {
            case this._tSingleWin: {
                this._btnSingleWin.isChecking = inputValue !== 0;
                AppG.autoGameRules.setRuleIfSingleWinExceeds(this._btnSingleWin.isChecking, inputValue);
                break;
            }
            case this._tLimitWin: {
                this._btnWinTotal.isChecking = inputValue !== 0;
                AppG.autoGameRules.setRuleIfCashIncBy(this._btnWinTotal.isChecking, inputValue);
                break;
            }
            case this._tLimitLose: {
                AppG.autoGameRules.setRuleIfCashDecBy(inputValue !== 0, inputValue);
                if (this._btnLoseTotal)
                    this._btnLoseTotal.isChecking = inputValue !== 0;
                break;
            }
        }
        this._checkReset();
    }

    /**     * @private     */
    _onToggleAction(button, name) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        switch (name) {
            case "cb_any": {
                AppG.autoGameRules.setRuleOnAnyWin(this._btnAnyWin.isChecking);
                break;
            }
            case "cb_free": {
                AppG.autoGameRules.setRuleIfFreeSpin(this._btnFree.isChecking);
                break;
            }
            case "cb_jack": {
                AppG.autoGameRules.setRuleIfJackpotWin(this._btnJackPot.isChecking);
                break;
            }
            case "cb_single": {
                if (!this._btnSingleWin.isChecking && Number(this._tSingleWin.text) !== 0) {
                    this._tSingleWin.text = "0";
                    AppG.autoGameRules.setRuleIfSingleWinExceeds(false, 0);
                }
                break;
            }
            case "cb_win": {
                if (!this._btnWinTotal.isChecking && Number(this._tLimitWin.text) !== 0) {
                    this._tLimitWin.text = "0";
                    AppG.autoGameRules.setRuleIfCashIncBy(false, 0);
                }
                break;
            }
            case "cb_lose": {
                if (!this._btnLoseTotal.isChecking && Number(this._tLimitLose.text) !== 0) {
                    this._tLimitLose.text = "0";
                    AppG.autoGameRules.setRuleIfCashDecBy(false, 0);
                }
                break;
            }
        }
        this._checkReset();
    }

    /**     * @private     */
    _onStartAuto(btn) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        if (!AppG.autoGameRules.ruleIfCashDecByValue && AppG.optionallyDecByValue) {
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_AUTO_GAME);
            return;
        }
        AppG.autoGameRules.setCountOfPlay(Number(btn.label.text));
        this._toggleBlock();
        AppG.state.startAutoGame();
    }

    /**     * @private     */
    onMoveCountSpin(btn) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        switch (btn) {
            case this._btnLeft: {
                this._startIndex -= 3;
                if (this._startIndex < 0)
                    this._startIndex = this._autospinArray.length + this._startIndex;
                break;
            }
            case this._btnRight: {
                this._startIndex += 3;
                if (this._startIndex >= this._autospinArray.length)
                    this._startIndex = this._startIndex - this._autospinArray.length;
                break;
            }
        }
        for (let i = 0; i < this._startBtnsList.length; i++) {
            if (this._startBtnsList[i].getChildByName("s_infinity"))
                this._startBtnsList[i].getChildByName("s_infinity").visible = this._autospinArray[this._startIndex + i] === -1;
            this._startBtnsList[i].label.visible = this._autospinArray[this._startIndex + i] !== -1;
            this._startBtnsList[i].label.text = String(this._autospinArray[this._startIndex + i]);
        }
    }

    /**     * @private     */
    _onCloseBlock() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._toggleBlock();
    }

    /**     * @private     */
    onResetSetting() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        for (let i = 0; i < this._checkBoxes.length; i++) {
            if (this._checkBoxes[i].isChecking) {
                this._checkBoxes[i].isChecking = false;
                switch (this._checkBoxes[i].name) {
                    case "cb_any": {
                        AppG.autoGameRules.setRuleOnAnyWin(false);
                        break;
                    }
                    case "cb_free": {
                        AppG.autoGameRules.setRuleIfFreeSpin(false);
                        break;
                    }
                    case "cb_jack": {
                        AppG.autoGameRules.setRuleIfJackpotWin(false);
                        break;
                    }
                    case "cb_single": {
                        AppG.autoGameRules.setRuleIfSingleWinExceeds(false, 0);
                        break;
                    }
                    case "cb_win": {
                        AppG.autoGameRules.setRuleIfCashIncBy(false, 0);
                        break;
                    }
                }
            }
        }
        AppG.autoGameRules.setRuleIfCashDecBy(false, 0);
        this._tSingleWin.text = "0";
        this._tLimitWin.text = "0";
        this._tLimitLose.text = "0";

        this._btnReset.visible = false;
    }

    /**     * @private     */
    _checkReset() {
        let result = false;
        for (let i = 0; i < this._checkBoxes.length; i++) {
            if (this._checkBoxes[i].isChecking) {
                result = true;
                break;
            }
        }
        if (AppG.optionallyDecByValue) {
            if (AppG.autoGameRules.ruleIfCashDecByValue !== 0)
                result = true;
        }
        this._btnReset.visible = result;
    }

    /**     * @private     */
    setNotActiveInput() {
        this._tSingleWin.focus();
        this._tLimitWin.focus();
        this._tLimitLose.focus();
        this._tSingleWin.text = "0";
        this._tLimitWin.text = "0";
        this._tLimitLose.text = "0";
        AppG.autoGameRules.hideAutoGame();
    }
}