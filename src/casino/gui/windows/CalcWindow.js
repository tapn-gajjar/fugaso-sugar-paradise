import {WindowsBase} from "../WindowsBase";
import {AppG} from "../../AppG";
import {AppConst} from "../../AppConst";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class CalcWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_CALC;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDCalc");
        this._ruleValue = 0;

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        if (!OMY.Omy.isDesktop) {
            AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
            this._updateGameSize();
        }
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        if (!this.active) return;
        AppG.updateGameSize(this);

        if (this._bg) {
            this._bg.x = -this.x;
            this._bg.y = -this.y;
            this._bg.width = OMY.Omy.WIDTH;
            this._bg.height = OMY.Omy.HEIGHT;
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);

        /** @type {OMY.OSprite} */
        this._bg = this.getChildByName("s_bg");
        this._bg.input = true;

        /** @type {OMY.OContainer} */
        this._canvas = this.getChildByName("c_calc");
        /** @type {OMY.OButtonTween} */
        this._bClose = this._canvas.getChildByName("b_no");
        this._bClose.externalMethod(this._onClose.bind(this));
        /** @type {OMY.OButtonTween} */
        this._bOk = this._canvas.getChildByName("b_yes");
        this._bOk.externalMethod(this._onSaveValue.bind(this));
        /** @type {OMY.OButtonTween} */
        this._bClear = this._canvas.getChildByName("b_delete");
        this._bClear.externalMethod(this._clearCalcValueByDigit.bind(this));

        this._numbers = this._canvas.getChildByName("c_number");
        let i = -1;
        while (this._numbers.getChildByName("b_" + String(++i))) {
            this._numbers.getChildByName("b_" + String(i)).externalMethod(this._numButtonTap.bind(this));
        }

        /** @type {OMY.OTextFont} */
        this._calcInput = this._canvas.getChildByName("t_output");
        this._calcValue = this._calcStr = String(this._ruleValue);
        this._calcInput.text = this._calcValue + AppG.currency;

        this._updateGameSize(AppG.dx, AppG.dy, AppG.isScreenPortrait);
    }

    _clearCalcValueByDigit() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        let text = this._calcValue;
        if (text.length > 1) {
            text = text.substring(0, text.length - 1);
        } else {
            text = "0";
        }
        this._calcStr = text.toString();
        this._calcValue = text;
        this._calcInput.text = this._calcValue + AppG.currency;
    }

    _numButtonTap(button) {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._calcStr += button.label.text;
        while (this._calcStr.length > 1 && this._calcStr.charAt(0) === "0") {
            this._calcStr = this._calcStr.substring(1, this._calcStr.length);
        }

        if (this._calcStr.length > 10) {
            this._calcStr = this._calcStr.substring(0, 10);
        }
        this._calcValue = this._calcStr;
        this._calcInput.text = this._calcValue + AppG.currency;
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        this._bOk = false;
        this._bClose = false;
        this._bClear = false;
        this._numbers = false;
        this._isGraphic = false;
        this._canvas = false;
        this._btnLayer = null;
        this._activeBtn = null;
        // this._navigateList.length = 0;
        // this._navigateList = null;
        if (this._bg)
            this._bg = null;
        this.callAll("destroy");
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
        this._isOpen = true;
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        if (this._isGraphic) {
            this._isOpen = false;
        }
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }

        super._onKill();
    }

    _onClose() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._hideCalc();
    }

    /**     * @private     */
    _onSaveValue() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._ruleValue = Number(this._calcStr);
        this._hideCalc();
    }

    /**     * @private     */
    _hideCalc() {
        if (AppG.isWarning) return;
        if (OMY.Omy.viewManager.getView(AppConst.W_WARNING).active) return;
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    get isOpen() {
        return this._isOpen;
    }

    set ruleValue(value) {
        this._ruleValue = value;
    }

    get ruleValue() {
        return this._ruleValue;
    }
}
