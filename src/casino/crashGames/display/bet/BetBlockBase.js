import {BtnToggle} from "../../../display/buttons/BtnToggle";
import {AppG} from "../../../AppG";
import {CrashConst} from "../../CrashConst";
import {UserBetConst} from "../../data/UserBet";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {AppConst} from "../../../AppConst";

export class BetBlockBase extends PIXI.utils.EventEmitter {
    constructor(graphic) {
        super();
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        /** @type {OMY.OContainer} */
        this._additCanvas = graphic.getChildByName("c_additionally") || this._graphic;
        this._gdConf = this._graphic.json;
        this._betId = this._gdConf["userData"];
        /** @type {UserBet} */
        this._userBetData = AppG.serverWork.getUserBetData(this._betId);

        this._graphic.addKill(this._onKill, this);
        this._graphic.addRevive(this._onRevive, this);
        this._minBet = AppG.serverWork.minBet;
        this._maxBet = AppG.serverWork.maxBet;
        this._currentBet = this._userBetData.bet;
        this._currentCash = this._userBetData.cash;
        this._incrementBet = false;
        this._incrementCrash = false;
        this._betSpeedDx = 0.001;
        this._crashSpeedDx = 0.001;
        this._minCrash = AppG.gameConst.game_const["min_cash_out"];
        this._maxCrash = AppG.gameConst.game_const["max_cash_out"];
        this._isBetting = false;
        this._isPanelLock = false;
        this._isAutoPanelHide = false;

        // OMY.Omy.addUpdater(this.update, this);
        AppG.emit.on(CrashConst.S_GAME_STATE_UPDATE, this._checkState, this);
        AppG.emit.on(CrashConst.S_MULTIPLIER, this._onMultiUpdate, this);
        AppG.emit.on(CrashConst.S_ROUND_END, this._onRoundEnd, this);
        OMY.Omy.loc.addUpdate(this._onLocUpdate, this);

        AppG.emit.on(CrashConst.EMIT_ON_BET_SET, this._onBetServerHandler, this);
        AppG.emit.on(CrashConst.EMIT_ON_CANCEL_SET, this._onCancelServerHandler, this);
        AppG.emit.on(CrashConst.EMIT_ON_CASHOUT_SET, this._onCashServerHandler, this);
        AppG.emit.on(CrashConst.AUTO_BET, this._autoGameOn, this);
        AppG.emit.on(CrashConst.CANCEL_AUTO_BET, this._cancelAutoGame, this);

        this._createGraphic();
    }

    _onKill() {
        // this._tSingleWin.focus();
    }

    _onRevive() {
        this._isBetting = this._userBetData.isBetting;
        this._isPanelLock = !this._isBetting;
        this._currentBet = this._userBetData.bet;

        this._updateBetField(false);
        this._currentCash = this._userBetData.cash;
        if (this._tCashInput) this._updateCrashField();
        if (this._activeFastCash) {
            if (this._activeFastCash.sActive) this._activeFastCash.sActive.visible = false;
            let findBtn = null;
            for (let i = 0; i < this._canvasFastCash.numChildren; i++) {
                if (Number(this._canvasFastCash.children[i].json.userData) === this._currentCash) {
                    findBtn = this._canvasFastCash.children[i];
                    break;
                }
            }
            if (!findBtn) {
                findBtn = this._canvasFastCash.children[0];
                this._currentCash = Number(findBtn.json.userData);
                AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.cash, this._currentCash);
            }
            this._activeFastCash = findBtn;
            if (this._activeFastCash.sActive) this._activeFastCash.sActive.visible = true;
        }

        if (this._bToggleBet) this._bToggleBet.toggle = this._userBetData.autoBet;
        if (this._bToggleCash) this._bToggleCash.toggle = this._userBetData.autoCash;

        if (!this._isAutoPanelHide && this._bMoreSetting) {
            this._isAutoPanelHide = true;
            this._graphic.removeChild(this._additCanvas);
            this._bMoreSetting.bg.scaleX = 1;
            this._bMoreSetting.bg.texture = this._bMoreSetting.bg.json["texture_wait"];
        }
        this._additCanvas?.revive();

        if (this._isBetting) this._lockPanel(); else this._unLockPanel();

        this._checkState(AppG.serverWork.currentState, AppG.serverWork.nextState);

        AppG.updateGameSize(this._graphic);
    }

    update() {
        if (this._incrementBet) {
            this._betSpeed += this._betSpeedDx;
            this._betIncTempValue += this._betVector * this._betSpeed;
            this._currentBet = OMY.OMath.int(this._betIncTempValue);
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.bet, this._currentBet);
            this._updateBetField(false);
        }
        if (this._incrementCrash) {
            this._crashSpeed += this._crashSpeedDx;
            this._crashIncTempValue += this._crashVector * this._crashSpeed;
            this._currentCash = OMY.OMath.int(this._crashIncTempValue);
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.cash, this._currentCash);
            this._updateCrashField();
        }
    }

    _createGraphic() {
        if (OMY.Omy.isDesktop) {
            /** @type {OMY.OTextInput} */
            this._tBetInput = this._graphic.getChildByName("t_input_bet");
            this._tBetInput.addInput(this._onInputText, this);
            this._tBetInput.addBlur(this._onBlurInput, this);
            this._tBetInput.addFocus(this._onFocusInput, this);
            this._tBetInput.text = OMY.OMath.getCashString(this._currentBet) + AppG.currency;
        } else {
            /** @type {OMY.OTextFont} */
            this._tBetInput = this._graphic.getChildByName("t_input_bet");
            this._tBetInput.externalMethod(this._onMobileInputText.bind(this));
            AppG.emit.on(CrashConst.KEY_MOBILE_CLOSE, this._onMobileBlurInput, this);
            this._tBetInput.text = OMY.OMath.getCashString(this._currentBet) + AppG.currency;
            this._betLabelString = "gui_betTitle";
        }
        if (this._graphic.getChildByName("t_input_cash")) {
            /** @type {OMY.OTextInput} */
            this._tCashInput = this._graphic.getChildByName("t_input_cash");
            this._tCashInput.addInput(this._onInputText, this);
            this._tCashInput.addBlur(this._onBlurInput, this);
            this._tCashInput.addFocus(this._onFocusInput, this);
            this._tCashInput.text = OMY.OMath.getCashString(this._currentCash) + "x";
        }

        if (this._graphic.getChildByName("b_bet_down")) {
            /** @type {OMY.OButton} */
            this._bBetDown = this._graphic.getChildByName("b_bet_down");
            this._bBetDown.externalMethod(this._onBetChangeHandler.bind(this));
            // this._bBetDown.addDown(this._onDownOnBet, this);
            // this._bBetDown.addUpOutSide(this._onUpOutSideOnBet, this);
            /** @type {OMY.OButton} */
            this._bBetUp = this._graphic.getChildByName("b_bet_up");
            this._bBetUp.externalMethod(this._onBetChangeHandler.bind(this));
            // this._bBetUp.addDown(this._onDownOnBet, this);
            // this._bBetUp.addUpOutSide(this._onUpOutSideOnBet, this);
        }
        if (this._graphic.getChildByName("b_cash_down")) {
            /** @type {OMY.OButton} */
            this._bCashDown = this._graphic.getChildByName("b_cash_down");
            this._bCashDown.externalMethod(this._onCashChangeHandler.bind(this));
            // this._bCashDown.addDown(this._onDownOnCrash, this);
            // this._bCashDown.addUpOutSide(this._onUpOutSideOnCrash, this);

            /** @type {OMY.OButton} */
            this._bCashUp = this._graphic.getChildByName("b_cash_up");
            this._bCashUp.externalMethod(this._onCashChangeHandler.bind(this));
            // this._bCashUp.addDown(this._onDownOnCrash, this);
            // this._bCashUp.addUpOutSide(this._onUpOutSideOnCrash, this);
        }
        if (this._additCanvas.getChildByName("c_fast_bet")) {
            /** @type {OMY.OContainer} */
            this._canvasFastBet = this._additCanvas.getChildByName("c_fast_bet");
            this._createFastBetBtns();
        }
        if (this._additCanvas.getChildByName("c_fast_cash")) {
            /** @type {OMY.OContainer} */
            this._canvasFastCash = this._additCanvas.getChildByName("c_fast_cash");
            this._createFastCashBtns();
        }
        if (this._additCanvas.getChildByName("b_toggle_bet")) {
            /** @type {BtnToggle} */
            this._bToggleBet = new BtnToggle(this._additCanvas.getChildByName("b_toggle_bet"), this._onToggleAutoBet.bind(this));
        }
        if (this._additCanvas.getChildByName("b_toggle_cash")) {
            /** @type {BtnToggle} */
            this._bToggleCash = new BtnToggle(this._additCanvas.getChildByName("b_toggle_cash"), this._onToggleAutoCash.bind(this));
        }

        /** @type {OMY.OButton} */
        this._bBet = this._graphic.getChildByName("b_bet");
        this._bBet.externalMethod(this._onBetHandler.bind(this));
        /** @type {OMY.OContainer} */
        this._betTexts = this._bBet.getChildByName("c_texts");
        /** @type {OMY.OButton} */
        this._bCash = this._graphic.getChildByName("b_cashout");
        this._bCash.externalMethod(this._onCashHandler.bind(this));
        /** @type {OMY.OTextFont} */
        this._tCashOutLabel = this._bCash.label;
        /** @type {OMY.OButton} */
        this._bCancel = this._graphic.getChildByName("b_cancel");
        this._bCancel.externalMethod(this._onCancelHandler.bind(this));
        if (this._graphic.getChildByName("b_more")) {
            /** @type {OMY.OButton} */
            this._bMoreSetting = this._graphic.getChildByName("b_more");
            this._bMoreSetting.externalMethod(this._onMoreSettingHandler.bind(this));
            /** @type {OMY.OSprite} */
            this._bMoreSetting.bg = this._bMoreSetting.getChildByName("s_bg");
            this._isAutoPanelHide = true;
            this._graphic.removeChild(this._additCanvas);
            AppG.emit.on(CrashConst.EMIT_TABLE_TOGGLE, this._onTableToggle, this);
            if (this._canvasFastCash) {
                this._activeFastCash = this._canvasFastCash.children[0];
                if (this._activeFastCash.sActive)
                    this._activeFastCash.sActive.visible = true;
                this._currentCash = Number(this._activeFastCash.json.userData);
            }
        }
    }

    _checkState(currentState, nextState) {
        if (!this._graphic.active) return;
        switch (currentState) {
            case CrashConst.ROUND_CREATE_STATE: {
                if (this._isBetting) {
                    if (this._bBet.active) this._bBet.kill();
                    if (AppG.serverWork.isBetting(this._betId)) {
                        if (!this._bCash.active) this._bCash.revive();
                        this._bCash.isBlock = true;
                        if (this._bCancel.active) this._bCancel.kill();
                    } else {
                        if (!this._bCancel.active) this._bCancel.revive();
                        if (this._bCash.active) this._bCash.kill();
                    }
                } else {
                    if (this._bCancel.active) this._bCancel.kill();
                    if (this._bCash.active) this._bCash.kill();
                    if (!this._bBet.active) this._bBet.revive();
                    this._betTexts.canvas.getChildByName("t_next").visible = true;
                    OMY.Omy.game.addNextTickUpdate(this._betTexts.alignContainer, this._betTexts);
                    this._bBet.isBlock = false;
                }
                break;
            }
            case CrashConst.ROUND_INCREASE_STATE: {
                if (this._isBetting) {
                    if (this._bBet.active) this._bBet.kill();
                    if (AppG.serverWork.isBetting(this._betId)) {
                        if (!this._bCash.active) this._bCash.revive();
                        if (this._bCancel.active) this._bCancel.kill();
                    } else {
                        if (!this._bCancel.active) this._bCancel.revive();
                        if (this._bCash.active) this._bCash.kill();
                    }
                } else {
                    if (this._bCancel.active) this._bCancel.kill();
                    if (this._bCash.active) this._bCash.kill();
                    if (!this._bBet.active) this._bBet.revive();
                    this._betTexts.canvas.getChildByName("t_next").visible = true;
                    OMY.Omy.game.addNextTickUpdate(this._betTexts.alignContainer, this._betTexts);
                    this._bBet.isBlock = false;
                }
                break;
            }
            case CrashConst.ROUND_BET_STATE: {
                if (this._bCash.active) this._bCash.kill();
                if (this._isBetting) {
                    if (this._bBet.active) this._bBet.kill();
                    if (!this._bCancel.active) this._bCancel.revive();
                } else {
                    if (!this._bBet.active) this._bBet.revive();
                    if (this._bCancel.active) this._bCancel.kill();
                    this._bBet.getChildByName("c_texts").canvas
                        .getChildByName("t_next").visible = false;
                    this._bBet.getChildByName("c_texts").alignContainer();
                    this._bBet.isBlock = false;
                }
                if (this._bToggleBet?.toggle) {
                    if (this._isBetting) return;
                    this._onBetHandler();
                }
                break;
            }
        }
    }

    /**     * @private     */
    _onLocUpdate() {
        this._bBet.getChildByName("c_texts").alignContainer();
    }

    /**     * @private     */
    _onMultiUpdate(value) {
        if (this._bCash.active && !this._bCash.isBlock) this._tCashOutLabel.text = OMY.OMath.getCashString(value * this._currentBet, true) + AppG.currency;
    }

    /**     * @private     */
    _onRoundEnd(userIds) {
        for (let i = 0; i < userIds.length; i++) {
            if (userIds[i] === this._betId && this._graphic.active && !AppG.serverWork.isBetExists(this._betId)) {
                this.onDoCash();
                break;
            }
        }
    }

    // region fast bet:
    //-------------------------------------------------------------------------
    _createFastBetBtns() {
        for (let i = 0; i < this._canvasFastBet.numChildren; i++) {
            this._canvasFastBet.children[i].externalMethod(this._onFastBetHandler.bind(this));
        }
    }

    /**     * @private     */
    _onFastBetHandler(btn) {
        let value = btn.json.userData;
        if (value === "max") {
            this._currentBet = this._maxBet;
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.bet, this._currentBet);
        } else {
            value = Number(value);
            this._currentBet *= value;
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.bet, this._currentBet);
        }
        this._updateBetField(false)
    }

    //-------------------------------------------------------------------------
    //endregion
    // region fast cash:
    //-------------------------------------------------------------------------
    _createFastCashBtns() {
        for (let i = 0; i < this._canvasFastCash.numChildren; i++) {
            this._canvasFastCash.children[i].externalMethod(this._onFastCrashHandler.bind(this));
            if (this._canvasFastCash.children[i].getChildByName("s_active")) {
                /** @type {OMY.OSprite} */
                this._canvasFastCash.children[i].sActive = this._canvasFastCash.children[i].getChildByName("s_active");
                this._canvasFastCash.children[i].sActive.visible = false;
                this._canvasFastCash.children[i].label = this._canvasFastCash.children[i].getChildByName("t_label");
            }
        }
    }

    /**     * @private     */
    _onFastCrashHandler(btn) {
        let value = btn.json.userData;
        value = Number(value);
        if (this._activeFastCash) {
            if (this._activeFastCash.sActive) this._activeFastCash.sActive.visible = false;
            this._currentCash = value;
            this._activeFastCash = btn;
            if (this._activeFastCash.sActive) this._activeFastCash.sActive.visible = true;
        } else {
            this._currentCash *= value;
        }
        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.cash, this._currentCash);
        this._updateCrashField();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region cash buttons:
    //-------------------------------------------------------------------------
    _onCashChangeHandler(btn) {
        this._timerCrashBtn?.destroy();
        if (this._incrementCrash) {
            this._incrementCrash = false;
            return;
        }
        if (btn === this._bCashDown) this._crashVector = -1; else this._crashVector = 1;
        this._currentCash += this._crashVector;
        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.cash, this._currentCash);
        this._updateCrashField();
    }

    /**     * @private     */
    _updateCrashField() {
        if (this._currentCash < this._minCrash) this._currentCash = this._minCrash; else if (this._currentCash > this._maxCrash) this._currentCash = this._maxCrash;
        this._checkCorrectCash();

        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.cash, this._currentCash);
        this._checkAutoCashOut();
        if (this._tCashInput)
            this._tCashInput.text = OMY.OMath.getCashString(this._currentCash) + "x";
    }

    /**     * @private     */
    _checkCorrectCash() {
        this._currentCash = OMY.OMath.roundNumber(this._currentCash, 100);
        if (this._bCashDown) {
            this._bCashDown.isBlock = this._currentCash === this._minCrash;
            this._bCashUp.isBlock = this._currentCash === this._maxCrash;
        }
    }

    /**     * @private     */
    _onDownOnCrash(btn) {
        if (btn === this._bCashDown) this._crashVector = -1; else this._crashVector = 1;
        this._crashSpeed = 0.1;
        this._crashIncTempValue = this._currentCash;
        this._timerCrashBtn = OMY.Omy.add.timer(1, this._onIncCrash, this);
    }

    /**     * @private     */
    _onUpOutSideOnCrash() {
        this._timerCrashBtn?.destroy();
        this._incrementCrash = false;
    }

    /**     * @private     */
    _onIncCrash() {
        this._timerCrashBtn = null;
        this._incrementCrash = true;
    }

    //-------------------------------------------------------------------------
    //endregion
    // region bet buttons:
    //-------------------------------------------------------------------------
    _onBetChangeHandler(btn) {
        // this._timerBetBtn?.destroy();
        // if (this._incrementBet) {
        //     this._incrementBet = false;
        //     return;
        // }
        // if (btn === this._bBetDown) this._betVector = -1; else this._betVector = 1;
        this._currentBet = AppG.serverWork.changeBet(this._currentBet, btn === this._bBetUp);
        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.bet, this._currentBet);
        this._updateBetField(true);
    }

    /**     * @private     */
    _updateBetField(loop) {
        loop = false;
        if (loop) {
            if (this._currentBet < this._minBet) this._currentBet = this._maxBet; else if (this._currentBet > this._maxBet) this._currentBet = this._minBet;
        } else {
            if (this._currentBet < this._minBet) this._currentBet = this._minBet; else if (this._currentBet > this._maxBet) this._currentBet = this._maxBet;
        }
        this._checkCorrectBet();

        if (this._canvasFastBet) {
            if (this._currentBet === this._maxBet) {
                this._canvasFastBet.setAll("isBlock", true);
            } else if (this._canvasFastBet.children[0].isBlock) {
                this._canvasFastBet.setAll("isBlock", false);
            }
        }

        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.bet, this._currentBet);
        this._tBetInput.text = OMY.OMath.getCashString(this._currentBet) + AppG.currency;
    }

    /**     * @private     */
    _checkCorrectBet() {
        this._currentBet = OMY.OMath.roundNumber(this._currentBet, 100);
        this._bBetDown.isBlock = this._currentBet === this._minBet;
        this._bBetUp.isBlock = this._currentBet === this._maxBet;
    }

    /**     * @private     */
    _onDownOnBet(btn) {
        if (btn === this._bBetDown) this._betVector = -1; else this._betVector = 1;
        this._betSpeed = 0.1;
        this._betIncTempValue = this._currentBet;
        this._timerBetBtn = OMY.Omy.add.timer(1, this._onIncBet, this);
    }

    /**     * @private     */
    _onUpOutSideOnBet() {
        this._timerBetBtn?.destroy();
        this._incrementBet = false;
    }

    /**     * @private     */
    _onIncBet() {
        this._timerBetBtn = null;
        this._incrementBet = true;
    }

    //-------------------------------------------------------------------------
    //endregion

    // region work with bet:
    //-------------------------------------------------------------------------
    _onToggleAutoBet() {
        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.autoBet, this._bToggleBet.toggle);
    }

    _onToggleAutoCash() {
        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.autoCash, this._bToggleCash.toggle);
        this._checkAutoCashOut();
    }

    /**     * @private     */
    _checkAutoCashOut() {
        if (!this._bToggleCash) return;
        if (this._bToggleCash.toggle && !this._bToggleCash.isBlock) {
            if (this._tCashInput) {
                this._tCashInput.disabled = false;
                this._tCashInput.setColor(this._tCashInput.json.input.color);
            }
            if (this._canvasFastCash) {
                if (this._currentCash === this._maxCrash) {
                    this._canvasFastCash.setAll("isBlock", true);
                } else if (this._canvasFastCash.children[0].isBlock) {
                    this._canvasFastCash.setAll("isBlock", false);
                }
            }
            if (this._bCashDown) {
                this._checkCorrectCash();
            }
        } else {
            if (this._tCashInput) {
                this._tCashInput.disabled = true;
                this._tCashInput.setColor(this._tCashInput.json.input.block);
            }
            if (this._canvasFastCash) this._canvasFastCash.setAll("isBlock", true);
            if (this._bCashDown) {
                this._bCashDown.isBlock = true;
                this._bCashUp.isBlock = true;
            }
        }
    }

    /**     * @private     */
    _checkAutoBet() {
        if (!this._isPanelLock) {
            if (OMY.Omy.isDesktop) {
                this._tBetInput.disabled = false;
                this._tBetInput.setColor(this._tBetInput.json.input.color);
            } else {
                this._tBetInput.input = true;
                this._tBetInput.setColor(this._tBetInput.json.fill);
            }
            if (this._canvasFastBet) {
                if (this._currentBet === this._maxBet) {
                    this._canvasFastBet.setAll("isBlock", true);
                } else if (this._canvasFastBet.children[0].isBlock) {
                    this._canvasFastBet.setAll("isBlock", false);
                }
            }
            if (this._bBetDown) {
                this._checkCorrectBet();
            }
        } else {
            if (OMY.Omy.isDesktop) {
                this._tBetInput.disabled = true;
                this._tBetInput.setColor(this._tBetInput.json.input.block);
            } else {
                this._tBetInput.input = false;
                this._tBetInput.setColor(this._tBetInput.json.block);
            }
            if (this._canvasFastBet) this._canvasFastBet.setAll("isBlock", true);
            if (this._bBetDown) {
                this._bBetDown.isBlock = true;
                this._bBetUp.isBlock = true;
            }
        }
    }

    _onBetHandler() {
        if (AppG.serverWork.playerBalance === 0) {
            this._bToggleBet.toggle = false;
            AppG.emit.emit(CrashConst.WARNING_MESSAGE, AppConst.WARNING_NO_CASH);
            return;
        } else if (!AppG.serverWork.isUserHasCash(this._currentBet)) {
            this._bToggleBet.toggle = false;
            AppG.emit.emit(CrashConst.WARNING_MESSAGE, AppConst.WARNING_NO_CASH_FOR_BET);
            return;
        }
        this._isBetting = true;
        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.isBetting, this._isBetting);
        this._lockPanel();
        this._bBet.isBlock = true;
        AppG.serverWork.setBet(this._betId, this._currentBet, this._currentCash, this._bToggleCash.toggle);
    }

    /**     * @private     */
    _onBetServerHandler(betId) {
        if (!this._graphic.active || this._betId !== betId) return;
        this._checkState(AppG.serverWork.currentState, AppG.serverWork.nextState);
    }

    _onCashHandler() {
        this._bCash.isBlock = true;
        AppG.serverWork.setCashOut(this._betId);
        this.onDoCash();
    }

    /**     * @private     */
    _onCashServerHandler(betId) {
        if (!this._graphic.active || this._betId !== betId) return;
        this.onDoCash();
    }

    /**     * @private     */
    onDoCash() {
        if (this._isBetting) {
            this._isBetting = false;
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.isBetting, this._isBetting);
            this._unLockPanel();
            this._checkState(AppG.serverWork.currentState, AppG.serverWork.nextState);
        }
    }

    _onCancelHandler() {
        this._bCancel.isBlock = true;
        AppG.serverWork.setCancel(this._betId);
    }

    /**     * @private     */
    _onCancelServerHandler(betId) {
        if (!this._graphic.active || this._betId !== betId) return;
        this._isBetting = false;
        AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.isBetting, this._isBetting);
        this._unLockPanel();
        let isAutoBetToggle = this._bToggleBet?.toggle;
        this._bToggleBet.toggle = false;
        this._checkState(AppG.serverWork.currentState, AppG.serverWork.nextState);
        this._bToggleBet.toggle = isAutoBetToggle;
    }

    clearBet() {
        if (this._bToggleBet.toggle) {
            this._bToggleBet.toggle = false;
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.autoBet, false);
        }
        if (this._isBetting && !AppG.serverWork.isBetting(this._betId)) {
            this._isBetting = false;
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.isBetting, this._isBetting);
            this._unLockPanel();
            AppG.serverWork.setCancel(this._betId);
        }
    }

    /**     * @private     */
    _lockPanel() {
        if (this._isPanelLock) return;
        this._isPanelLock = true;
        if (this._bToggleCash) this._bToggleCash.isBlock = true;
        this._checkAutoCashOut();
        this._checkAutoBet();
        this.emit(this.LOCK_EMIT, this._isPanelLock);
    }

    /**     * @private     */
    _unLockPanel() {
        if (!this._isPanelLock) return;
        this._isPanelLock = false;
        if (this._bToggleCash) this._bToggleCash.isBlock = false;
        this._checkAutoCashOut();
        this._checkAutoBet();
        this.emit(this.LOCK_EMIT, this._isPanelLock);
    }

    /**     * @private     */
    _autoGameOn(index) {
        if (this._graphic.active && this._betId === index && !this._isBetting) {
            this._isBetting = true;
            AppG.emit.emit(CrashConst.BET_DATA_UPDATE, this._betId, UserBetConst.isBetting, this._isBetting);
            this._lockPanel();
            this._bBet.isBlock = true;
        }
    }

    /**     * @private     */
    _cancelAutoGame(index) {
        if (this._graphic.active && this._betId === index && !this._isBetting) {
            this.clearBet();
        }
    }

    /**     * @private     */
    _onMoreSettingHandler() {
        this._isAutoPanelHide && AppG.emit.emit(CrashConst.EMIT_TABLE_TOGGLE, CrashConst.T_NONE);
        this._isAutoPanelHide = !this._isAutoPanelHide;
        this._checkAdditionalSetting();
        if (!this._isAutoPanelHide)
            AppG.updateGameSize(this._graphic);
    }

    /**     * @private     */
    _checkAdditionalSetting() {
        this._bMoreSetting.bg.texture =
            this._bMoreSetting.bg.json[(this._isAutoPanelHide) ? "texture_wait" : "texture_active"];
        this._bMoreSetting.bg.scaleX = (this._isAutoPanelHide) ? 1 : -1;
        if (this._isAutoPanelHide && this._additCanvas.parent) this._graphic.removeChild(this._additCanvas);
        else if (!this._additCanvas.parent) this._graphic.addChildAt(this._additCanvas, this._graphic.numChildren - 1);
    }

    /**     * @private     */
    _onTableToggle() {
        if (!this._isAutoPanelHide) {
            this._isAutoPanelHide = true;
            this._checkAdditionalSetting();
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    // region input field:
    //-------------------------------------------------------------------------
    /**
     * @private
     */
    _onMobileInputText() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._keyMobileId = OMY.OMath.uniqueID();
        AppG.emit.emit(CrashConst.KEY_MOBILE_OPEN,
            this._currentBet, this._betLabelString, [this._minBet, this._maxBet], this._keyMobileId, this._betId);
    }

    /**
     * @param {Number} value
     * @param {String} id
     * * @private     */
    _onMobileBlurInput(value, id) {
        if (this._keyMobileId === id) {
            if (value < this._minBet) value = this._minBet;
            else if (value > this._maxBet) value = this._maxBet;
            this._currentBet = value;
            this._tBetInput.text = OMY.OMath.getCashString(value) + AppG.currency;
            this._updateBetField(false);
        }
    }

    /**
     * @param {OMY.OTextInput}field
     * @param {String}text
     * @private
     */
    _onInputText(field, text) {
        /** @type {String} */
        let newChar = null;
        if (text.length > this._bufferInputText.length) {
            for (let i = 0; i < text.length; i++) {
                if (this._bufferInputText[i] !== text[i]) {
                    newChar = text[i];
                    break;
                }
            }
        }
        if (newChar && (newChar === "." || newChar === ",") && this._hasSeparator) {
            field.text = this._bufferInputText;
        } else {
            this._hasSeparator = text.split(".").length === 2;
            if (!this._hasSeparator) this._hasSeparator = text.split(",").length === 2;
            this._bufferInputText = text;
        }
    }

    /**
     * @param {OMY.OTextInput}field
     * @private
     */
    _onBlurInput(field) {
        if (field.text[0] === "," || field.text[0] === ".") field.text = "0" + field.text;
        let check = field.text.split(",");
        if (check.length >= 2) {
            field.text = check[0] + "." + check[1];
        }
        field.text = OMY.OMath.getCashString(Number(field.text));
        let value = Number(field.text);
        switch (field) {
            case this._tBetInput: {
                if (value < this._minBet) {
                    value = this._minBet;
                    field.text = OMY.OMath.getCashString(value);
                } else if (value > this._maxBet) {
                    value = this._maxBet;
                    field.text = OMY.OMath.getCashString(value);
                }
                this._currentBet = value;
                this._updateBetField(false);
                break;
            }
            case this._tCashInput: {
                if (value < this._minCrash) {
                    value = this._minCrash;
                    field.text = OMY.OMath.getCashString(value);
                } else if (value > this._maxCrash) {
                    value = this._maxCrash;
                    field.text = OMY.OMath.getCashString(value);
                }
                this._currentCash = value;
                this._updateCrashField();
                break;
            }
        }
    }

    /**
     * @param {OMY.OTextInput}field
     * @private
     */
    _onFocusInput(field) {
        /** @type {String} */
        this._bufferInputText = field.text;
        switch (field) {
            case this._tBetInput: {
                this._bufferInputText = this._bufferInputText.split(AppG.currency)[0];
                break;
            }
            case this._tCashInput: {
                this._bufferInputText = this._bufferInputText.split("x")[0];
                break;
            }
        }
        this._hasSeparator = this._bufferInputText.split(".").length === 2;
        if (!this._hasSeparator) this._hasSeparator = this._bufferInputText.split(",").length === 2;
        field.text = this._bufferInputText;
    }

    //-------------------------------------------------------------------------
    //endregion

    destroy() {
        this._graphic.removeKill(this._onKill, this);
        this._graphic.removeRevive(this._onRevive, this);
        this._graphic = null;
        this._additCanvas = null;
        this._gdConf = null;
        this._userBetData = null;
        AppG.emit.off(CrashConst.S_GAME_STATE_UPDATE, this._checkState, this);
        AppG.emit.off(CrashConst.S_MULTIPLIER, this._onMultiUpdate, this);
        AppG.emit.off(CrashConst.S_ROUND_END, this._onRoundEnd, this);
        OMY.Omy.loc.removeUpdate(this._onLocUpdate, this);
        AppG.emit.off(CrashConst.EMIT_ON_BET_SET, this._onBetServerHandler, this);
        AppG.emit.off(CrashConst.EMIT_ON_CANCEL_SET, this._onCancelServerHandler, this);
        AppG.emit.off(CrashConst.EMIT_ON_CASHOUT_SET, this._onCashServerHandler, this);
        AppG.emit.off(CrashConst.AUTO_BET, this._autoGameOn, this);
        AppG.emit.off(CrashConst.CANCEL_AUTO_BET, this._cancelAutoGame, this);
        if (OMY.Omy.isDesktop) {
            this._tBetInput.removeInput(this._onInputText, this);
            this._tBetInput.removeBlur(this._onBlurInput, this);
            this._tBetInput.removeFocus(this._onFocusInput, this);
        } else {
            AppG.emit.off(CrashConst.KEY_MOBILE_CLOSE, this._onMobileBlurInput, this);
        }
        this._tBetInput = null;
        if (this._tCashInput) {
            this._tCashInput.removeInput(this._onInputText, this);
            this._tCashInput.removeBlur(this._onBlurInput, this);
            this._tCashInput.removeFocus(this._onFocusInput, this);
            this._tCashInput = null;
        }

        this._bBetDown = null;
        this._bBetUp = null;
        this._bCashDown = null;
        this._bCashUp = null;
        this._canvasFastBet = null;
        this._canvasFastCash = null;
        this._bToggleBet = null;
        this._bToggleCash = null;
        this._bBet = null;
        this._betTexts = null;
        this._bCash = null;
        this._tCashOutLabel = null;
        this._bCancel = null;
        if (this._bMoreSetting) {
            this._bMoreSetting.bg = null;
            this._bMoreSetting = null;
            AppG.emit.off(CrashConst.EMIT_TABLE_TOGGLE, this._onTableToggle, this);
            if (this._activeFastCash) {
                this._activeFastCash.sActive = null;
                this._activeFastCash = null;
            }
        }
        this._timerCrashBtn?.destroy();
        this._timerCrashBtn = null;
        this._timerBetBtn?.destroy();
        this._timerBetBtn = null;
        this._bufferInputText = null;
    }

    get LOCK_EMIT() {
        return "loc_emit";
    }
}
