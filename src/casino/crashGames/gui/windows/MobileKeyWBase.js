import {WindowsBase} from "../../../gui/WindowsBase";
import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {CrashConst} from "../../CrashConst";
import {UserBetConst} from "../../data/UserBet";

export class MobileKeyWBase extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_MOBILE_KEY;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDMobileNumber");

        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._value = 0;
        this._headText = "gui_betTitle";
        this._limits = [0, 1];
        this._openId = 0;
        this._hasSeparator = false;

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"]) OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        AppG.emit.on(CrashConst.KEY_MOBILE_OPEN, this._need2Open, this);
        OMY.Omy.loc.addUpdate(this._onLocUpdate, this);
        AppG.emit.on(CrashConst.BET_DATA_UPDATE, this._checkState, this);
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);

        if (this._tint) {
            let scaleContent = 1 / this.scale.x;
            this._tint.x = -this.x * scaleContent;
            this._tint.y = -this.y * scaleContent;
            this._tint.width = OMY.Omy.WIDTH * scaleContent;
            this._tint.height = OMY.Omy.HEIGHT * scaleContent;
        }
    }

    _createGraphic() {
        if (this._isOpen) return;
        this._isOpen = true;

        OMY.Omy.add.createEntities(this, this._gdConf);
        this._tint = this.getChildByName("s_tint");
        this._tint.input = true;

        this._settingTexts();
        this._settingKeys();

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isOpen) return;
        this._isOpen = false;
        this._tint = null;
        this._tHeader = null;
        this._tLimit = null;
        this._tValue = null;
        this._bRemove = null;
        this._bApply = null;
        this._bClose = null;
        this.callAll("destroy");
    }

    /**     * @private     */
    _onLocUpdate() {
        if (this._tHeader) this._tHeader.text = OMY.Omy.loc.getText(this._headText);
    }

    revive(onComplete = null) {
        super.revive(onComplete);

        let split = String(this._value).split(".");
        this._hasSeparator = split.length > 1;
        this._number1 = split[0];
        this._number2 = (this._hasSeparator) ? split[1] : "";

        this._createGraphic();
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        this._clearGraphic();
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }

    // region Texts:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingTexts() {
        /** @type {OMY.OTextFont} */
        this._tHeader = this.getChildByName("t_label");
        this._tHeader.text = OMY.Omy.loc.getText(this._headText);
        /** @type {OMY.OTextFont} */
        this._tLimit = this.getChildByName("t_limit");
        this._tLimit.text = OMY.OMath.getCashString(this._limits[0], true) + AppG.currency + " - " + OMY.OMath.getCashString(this._limits[1], true) + AppG.currency;
        /** @type {OMY.OTextFont} */
        this._tValue = this.getChildByName("t_value");
        this._tValue.text = AppG.currency + String(this._value);
    }

    //-------------------------------------------------------------------------
    //endregion

    // region Keys:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingKeys() {
        /** @type {OMY.OButton} */
        this._bRemove = this.getChildByName("b_remove");
        this._bRemove.externalMethod(this._onDelete.bind(this));
        /** @type {OMY.OButton} */
        this._bApply = this.getChildByName("b_apply");
        this._bApply.externalMethod(this._onApplyChange.bind(this));
        /** @type {OMY.OButton} */
        this._bClose = this.getChildByName("b_close");
        this._bClose.externalMethod(this._onCloseWindow.bind(this));

        let i = -1;
        /** @type {OMY.OButton} */
        let btn;
        while (this.getChildByName("b_" + String(++i))) {
            btn = this.getChildByName("b_" + String(i));
            btn.externalMethod(this._onNumberHandler.bind(this));
        }
    }

    /**     * @private     */
    _onCloseWindow() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    /**     * @private     */
    _onApplyChange() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        AppG.emit.emit(CrashConst.KEY_MOBILE_CLOSE, this._value, this._openId);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    /**     * @private     */
    _onDelete() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        if (!this._hasSeparator) this._number1 = this._number1.substring(0, this._number1.length - 1); else if (this._number2.length) this._number2 = this._number2.substring(0, this._number2.length - 1); else this._hasSeparator = false;
        this._updateText();
    }

    /**
     * @param {OMY.OButton}btn
     * @private
     */
    _onNumberHandler(btn) {
        if (btn.json.userData === ".") {
            if (this._hasSeparator) return;
            this._hasSeparator = true;
            if (!this._number1.length) this._number1 = "0";
        } else {
            if (!this._hasSeparator) {
                if (this._number1.length === 1 && this._number1[0] === "0")
                    this._number1 = btn.json.userData;
                else
                    this._number1 += btn.json.userData;
            } else if (this._number2.length < 2) {
                this._number2 += btn.json.userData;
            }
        }
        this._updateText();
    }

    /**     * @private     */
    _updateText() {
        this._valueString = this._number1 + ((this._hasSeparator) ? "." : "") + this._number2;
        this._value = Number((this._valueString.length) ? this._valueString : 0);
        if (this._value > this._limits[1]) {
            this._value = this._limits[1];
            let split = String(this._value).split(".");
            this._hasSeparator = split.length > 1;
            this._number1 = split[0];
            this._number2 = (this._hasSeparator) ? split[1] : "";
            this._valueString = String(this._value);
        }
        this._tValue.setColor((this._value < this._limits[0]) ?
            this._tValue.json["block"] : this._tValue.json["fill"]);
        this._tValue.text = AppG.currency + String((this._valueString.length) ? this._valueString : 0);
    }

    //-------------------------------------------------------------------------
    //endregion

    /**
     * @param {Number}startValue
     * @param {String}headText
     * @param {Array.<Number>}limit
     * @param {String}id
     * @param {Number}betBlock
     * * @private     */
    _need2Open(startValue, headText, limit, id, betId) {
        this._value = startValue;
        this._headText = headText;
        this._limits = limit;
        this._openId = id;
        this._betId = betId;

        OMY.Omy.viewManager.showWindow(this._wName, false, OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    /**
     * @param {Number}index
     * @param {String}paramName
     * @param {Number|String|Boolean}value
     * @private
     */
    _checkState(index, paramName, value) {
        if (!this.active || !this._bApply) return;
        if (paramName === UserBetConst.isBetting && index === this._betId)
            this._bApply.isBlock = value;
    }

    get isOpen() {
        return this._isOpen;
    }
}
