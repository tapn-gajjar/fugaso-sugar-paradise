import {AppG} from "../../casino/AppG";
import {BonusWindowBase} from "../../casino/gui/windows/BonusWindowBase";
import {AppConst} from "../../casino/AppConst";
import {GameConstStatic} from "../GameConstStatic";

const LETTERS_COUNT = 5;

export class BonusChoiceWindow extends BonusWindowBase {
    constructor() {
        super();
        this._isWarningOpened = false;
        OMY.Omy.viewManager.addOpenWindow(AppConst.W_WARNING, () => {
            this._isWarningOpened = true;
        }, this);
        OMY.Omy.viewManager.addCloseWindow(AppConst.W_WARNING, () => {
            this._isWarningOpened = false;
        }, this);
    }

    //-------------------------------------------------------------------------
    // OVERRIDE
    //-------------------------------------------------------------------------

    _updateGameSize(dx, dy, isScreenPortrait) {
        super._updateGameSize(dx, dy, isScreenPortrait);

        if (!this._isGraphic) return;
        const m = AppG.isScreenPortrait ? "v_" : "m_";
        const scaleBGx = OMY.Omy.WIDTH / this._gdConf[m + "i_width"];
        const scaleBGy = OMY.Omy.HEIGHT / this._gdConf[m + "i_height"];
        this._bgLayer.scale.set(Math.max(scaleBGx, scaleBGy));
    }

    revive(onComplete = null) {
        this.alpha = 0;
        super.revive(onComplete);
    }

    _onRevive() {
        super._onRevive();
        OMY.Omy.add.tween(this, {alpha: 1}, 1, this._onCompleteAlpha.bind(this));
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _createGraphic() {
        if (this._isGraphic) return;
        super._createGraphic();

        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        OMY.Omy.sound.play(GameConstStatic.S_bg_bonus, true);
        this._canOpenLetter = false;
        this._winTotal = 0;

        this._bgLayer = this.getChildByName("bg_layer");
        this._babaAnim = this.getChildByName("baba");
        this._manAnim = this.getChildByName("gnome");

        this._hideTextFields();
        this._addLettersListeners();

        this._rainbowAnim = this.getChildByName("rainbow");
        this._rainbowAnim.visible = false;

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        this._bgLayer = null;
        this._babaAnim = null;
        this._manAnim = null;
        this._rainbowAnim = null;

        this._textValuesArr.length = 0;
        this._textValuesArr = null;

        super._clearGraphic();
    }

    _onCompleteAlpha() {
        this._canOpenLetter = true;
        this._startManAnim();
        if (this._babaAnim)
            this._babaAnim.addComplete(this._startIdleBaba, this);
        if (this._manAnim)
            this._manAnim.addComplete(this._startIdleMan, this);
        this._startBabaWinAnim();
    }

    _startBabaWinAnim() {
        if (this._babaAnim)
            this._babaAnim.play(false, "win");
    }

    _startManAnim() {
        if (this._manAnim)
            this._manAnim.play(false, "start");
    }

    _startIdleMan() {
        if (this._manAnim)
            this._manAnim.play(true, "idle");
    }

    _startIdleBaba() {
        if (this._babaAnim)
            this._babaAnim.play(true, "idle");
    }

    _hideTextFields() {
        this._textValuesArr = [];
        for (let i = 0; i < LETTERS_COUNT; i++) {
            const textField = this.getChildByName("t_win_" + (i + 1));
            textField.alpha = 0;
            this._textValuesArr.push(textField);
        }
    }

    _addLettersListeners() {
        this._arrCoins = [];
        this._potArr = [];
        this._potGlowArr = [];
        for (let i = 0; i < LETTERS_COUNT; i++) {
            /** @type {OMY.OSprite} */
            this.getChildByName("pot_glow_" + (i + 1)).visible = false;
            this.getChildByName("gold_" + (i + 1)).alpha = 0;
            this._arrCoins.push(this.getChildByName("gold_" + (i + 1)));
            this._potGlowArr.push(this.getChildByName("pot_glow_" + (i + 1)));
            this._potArr.push(this.getChildByName("pot_" + (i + 1)));
            const btn = this.getChildByName("pot_" + (i + 1));
            btn.buttonMode = true;
            btn.userData = (i + 1);
            // btn.scale.set(0.8, 0.8);

            btn.addDown(this._onLetterClick, this);
            btn.addOver(this._onLetterOver, this);
            btn.addOut(this._onLetterOut, this);
        }
        OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this._onKeyHandler, this);
    }

    /** @private */
    _onKeyHandler() {
        if (this._isWarningOpened) return;
        let arrayItems = [];
        for (let i = 0; i < LETTERS_COUNT; i++) {
            if (this.getChildByName("pot_" + (i + 1)).visible)
                arrayItems.push(this.getChildByName("pot_" + (i + 1)));
        }
        OMY.OMath.randomiseArray(arrayItems);
        this._onLetterClick(arrayItems.shift());
    }

    _onLetterClick(btn) {
        if (!this._canOpenLetter || !btn) {
            return;
        }
        OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this._onKeyHandler, this);
        if (this._babaAnim)
            this._babaAnim.removeComplete(this._startIdleBaba, this);

        if (this._manAnim)
            this._manAnim.removeComplete(this._startIdleMan, this);
        this._startBabaWinAnim();
        this._startManAnim();

        if (!OMY.Omy.isDesktop)
            this.getChildByName("pot_glow_" + (btn.userData)).visible = true;

        this._btn = btn;

        this._canOpenLetter = false;

        this._rainbowAnim.addComplete(this._continueClick, this);
        this._rainbowAnim.visible = true;
        this._rainbowAnim.gotoAndPlay(0, false);
        OMY.Omy.sound.play(GameConstStatic.S_bonus_pick);
    }

    _continueClick() {
        this._btn.input = false;
        const index = this._btn.userData;

        OMY.Omy.add.tween(this._btn.scale, {
            x: 1, y: 1,
            onCompleteParams: [this._btn, index],
        }, 0.1, this._chooseLetter.bind(this));
    }

    _chooseLetter(btn, index) {
        const winValue = ((this._debugMode) ?
            100 * AppG.serverWork.totalBet :
            AppG.serverWork.bonusValues[0]);

        AppG.winCredit += winValue;
        AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit);
        let textField;
        for (let i = 0; i < LETTERS_COUNT; i++) {
            if (index === i + 1) {
                this._textValuesArr[i].setNewFont(
                    this._textValuesArr[i].json["font_win"]["name"],
                    this._textValuesArr[i].json["font_win"]["size"]);
                textField = this._textValuesArr[i];
            } else {
                const noWin = OMY.OMath.getRandomItem(this._gdConf["win_bet"]) * AppG.serverWork.totalBet;
                this._textValuesArr[i].setNumbers(noWin);
            }
            OMY.Omy.add.tween(this._textValuesArr[i], {alpha: 1}, 1);
            OMY.Omy.add.tween(this._arrCoins[i], {alpha: 1}, 1);
        }

        if (winValue > 0) {
            this._winTotal += winValue;
            textField.setNumbers(winValue, false);
        } else {
            textField.text = OMY.Omy.loc.getText("bonus_collect");
            /*OMY.Omy.add.timer(1, () => {
                OMY.Omy.sound.stop(AppConst.S_bg_bonus);
                OMY.Omy.sound.play(AppConst.S_bonus_end);

            }, this);*/
        }

        this._endShowBonus();
    }

    _endShowBonus() {
        OMY.Omy.sound.stop(GameConstStatic.S_bg_bonus);
        OMY.Omy.sound.play(GameConstStatic.S_bonus_end);

        super._endShowBonus();
    }

    _onLetterOver(btn) {
        if (!this._canOpenLetter) {
            return;
        }
        this.getChildByName("pot_glow_" + (btn.userData)).visible = true;
        // OMY.Omy.add.tween(btn.scale, {x: 1.1, y: 1.1}, 0.2);
    }

    _onLetterOut(btn) {
        this.getChildByName("pot_glow_" + (btn.userData)).visible = false;
        // OMY.Omy.add.tween(btn.scale, {x: 1, y: 1}, 0.2);
    }

    _onClose() {
        if (AppG.isWarning) return;
        // OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this._onKeyHandler, this);
        // OMY.Omy.viewManager.pageGui.bonusUpdate();
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.5, 0.3, 1);

        super._hideWindow();
    }

    _hideWindow() {
        // AppG.emit.emit(AppConst.APP_EMIT_BONUS_CLOSE);
        OMY.Omy.add.tween(this, {alpha: 0}, 1, this._onClose.bind(this));
    }
}
