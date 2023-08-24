import {WindowsBase} from "../WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {BtnWithIco} from "../../display/buttons/desktop/settings/BtnWithIco";
import {CrashConst} from "../../crashGames/CrashConst";

export class Warnings extends WindowsBase {
    constructor() {
        super();
        this._isOpen = false;
        this._wName = AppConst.W_WARNING;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDWarning");
        this._wType = AppConst.WARNING_CONNECT_CLOSE;

        this._tint = this.addChild(OMY.Omy.add.tint(((this._gdConf.hasOwnProperty("tintAlpha")) ? this._gdConf["tintAlpha"] : 0.1),
            (this._gdConf.hasOwnProperty("tintColor")) ? this._gdConf["tintColor"] : 0xffffff));
        this._tint.input = true;

        this._source = OMY.Omy.add.container(this, this._gdConf["x"], this._gdConf["y"]);
        OMY.Omy.add.createEntities(this._source, this._gdConf);
        this._source.json = this.json;

        this._tHead = this._source.getChildByName("t_head");
        this._tMessage = this._source.getChildByName("t_message");
        if (this._source.getChildByName("b_close")) {
            /** @type {OMY.OButton} */
            this._bClose = new BtnWithIco(this._source.getChildByName("b_close"), this._onClose.bind(this));
        }

        OMY.Omy.loc.addUpdate(this._updateLoc, this);

        this._debugMode = this._gdConf["debug"] || this._gdConf["visible"];
        if (this._debugMode) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this._source);
            OMY.Omy.add.timer(10, this._showDebug, this);
        } else {
            this.kill();
        }

        this._updateGameSize = () => {
            AppG.updateGameSize(this._source);

            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        };
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
        this._checkScreenBlocking = true;
        this.isUpdate = true;
    }

    _showDebug() {
        if (this._gdConf["debug_game_const"])
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(this._gdConf["debug_game_const"]);
        else if (this._gdConf["debug_code"])
            OMY.Omy.viewManager.getView(AppConst.W_WARNING)
                .show(this._gdConf["debug_warning_id"] || AppConst.WARNING_CUSTOM_WARNING, null, null, this._gdConf["debug_code"]);
        else
            OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_NO_INET);
    }

    show(wType, text = "", headText = null, responseCode = "", reset = false) {
        if (this.parent && !reset)
            return;
        AppG.isWarning = true;
        this._tHead.text = this._getText("warnings_text1");
        if (AppG.isAutoGame) {
            this._isWasAuto = true;
            if (wType === AppConst.WARNING_NO_CASH_FOR_BET || wType === AppConst.WARNING_NO_CASH) {
                this._isWasAuto = false;
                OMY.Omy.navigateBtn.updateState(AppConst.C_NONE);
            } else {
                AppG.autoGameRules.warningGameOn();
            }
        }
        this._responseCode = responseCode;

        switch (responseCode) {
            case "GENERAL_CODE":
            case "UNKNOWN":
            case "TECHNICAL_ERROR":
            case "WAGER_NOT_FOUND":
            case "OPERATION_NOT_ALLOWED":
            case "NOT_LOGGED_ON":
            case "AUTHENTICATION_FAILED":
            case "OUT_OF_MONEY_CODE":
            case "UNKNOWN_CURRENCY":
            case "PARAMETER_REQUIRED":
            case "BET_LIMIT_EXCEEDED":
            case "ACCOUNT_BLOCKED":
            case "OUT_OF_ATTEMPTS": {
                wType = AppConst.WARNING_NEW_1;
                const code = AppConst.CUSTOM_WARNING_ID[responseCode];
                headText = this._getText("warnings_title_code_" + String(code));
                text = this._getText("warnings_des_code_" + String(code));
                break;
            }

            case "BET_WAS_ALREADY_PLACED":
            case "INCORRECT_BET_INDEX":
            case "INSUFFICIENT_BALANCE":
            case "NOT_VALID_BET":
            case "SOMETHING_WENT_WRONG":
            case "MAGNIFY_MAN_IS_BUSTED":
            case "INCORRECT_GAME_STATE":
            case "BET_WAS_NOT_PLACED": {
                wType = CrashConst.WARNING_BET_STATE;
                headText = this._getText(CrashConst.LOC_CONST_WARN[responseCode]["head"]);
                text = this._getText(CrashConst.LOC_CONST_WARN[responseCode]["text"]);
                break;
            }

            case "SAME_SESSION":
            case "INVALID_TOKEN": {
                wType = CrashConst.WARNING_CRASH_CRITICAL;
                headText = this._getText(CrashConst.LOC_CONST_WARN[responseCode]["head"]);
                text = this._getText(CrashConst.LOC_CONST_WARN[responseCode]["text"]);
                break;
            }

            case "CUSTOM_ERROR": {
                wType = AppConst.WARNING_SERVER_MESSAGE;
                break;
            }

            default: {

                break;
            }
        }

        this._wType = wType;

        if (headText)
            this._tHead.text = headText;
        this._tMessage.text = text || this._getText("warnings_text" + String(this._wType));

        this.alpha = 0;
        OMY.Omy.remove.tween(this);
        OMY.Omy.add.tween(this, {alpha: 1}, 0.3);

        if (this._tMessage.text.length === 0) {
            this._tMessage.text = "The game is currently not available. Try again later.";
            this._wType = AppConst.WARNING_CONNECT_CLOSE;
        }

        if (this._bClose)
            (this._wType === AppConst.WARNING_NO_INET) ? this._bClose.graphic.kill() : this._bClose.graphic.revive();
        this.emit("update", true);
        let layer = null;
        if (Boolean(OMY.Omy.viewManager.gameUI?.getChildByName("c_warning_layer")))
            layer = OMY.Omy.viewManager.gameUI.getWindowLayer("c_warning_layer");
        else if (OMY.Omy.viewManager.gameUI?.visible)
            layer = OMY.Omy.viewManager.gameUI.getWindowLayer();
        OMY.Omy.viewManager.showWindow(this._wName, false, layer);
    }

    hide(wType) {
        if (this._wType === wType && this.parent) {
            this.emit("update", false);
            OMY.Omy.remove.tween(this);
            OMY.Omy.add.tween(this, {alpha: 0}, 0.2, this._setHide.bind(this));
        }
    }

    regEmit(func, context, once = false) {
        if (once)
            this.once("update", func, context);
        else
            this.on("update", func, context);
    }

    removeEmit(func, context) {
        this.removeListener("update", func, context);
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    update() {
        if (this._checkScreenBlocking) {
            if (this._isOpen && !OMY.Omy.navigateBtn.isScreenBlock) {
                OMY.Omy.navigateBtn.blockingScreen();
            }
        }
        super.update();
    }

    _onRevive() {
        this._isOpen = true;
        super._onRevive();
        OMY.Omy.navigateBtn.blockingScreen();

        this._updateGameSize();
        if (this._bClose)
            (this._wType === AppConst.WARNING_NO_INET) ? this._bClose.graphic.kill() : this._bClose.graphic.revive();
        // OMY.Omy.mouse.addDownMouse(this._onClose, this);
    }

    _onKill() {
        if (this._debugMode) return;
        AppG.isWarning = false;
        if (this._isWasAuto) {
            this._isWasAuto = false;
            AppG.autoGameRules.warningGameOff();
        }
        super._onKill();
        OMY.Omy.navigateBtn.unBlockingScreen();

        this._isOpen = false;
    }

    _updateLoc() {
        switch (this._wType) {
            case AppConst.WARNING_NEW_1: {
                const code = AppConst.CUSTOM_WARNING_ID[this._responseCode];
                this._tHead.text = this._getText("warnings_title_code_" + String(code));
                this._tMessage.text = this._getText("warnings_des_code_" + String(code));
                break;
            }

            case CrashConst.WARNING_CRASH_CRITICAL:
            case CrashConst.WARNING_BET_STATE: {
                this._tHead.text = this._getText(CrashConst.LOC_CONST_WARN[this._responseCode]["head"]);
                this._tMessage.text = this._getText(CrashConst.LOC_CONST_WARN[this._responseCode]["text"]);
                break;
            }

            default: {
                this._tHead.text = this._getText("warnings_text1");
                this._tMessage.text = this._getText("warnings_text" + String(this._wType));
                break;
            }
        }
    }

    _getText(locConst) {
        return OMY.Omy.loc.getText(locConst);
    }

    _onClose() {
        this.input = false;
        // OMY.Omy.mouse.removeDownMouse(this._onClose, this);

        this.emit("update", false);
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        switch (this._wType) {
            case CrashConst.WARNING_CRASH_CRITICAL:
            case AppConst.WARNING_CONNECT_CLOSE:
            case AppConst.WARNING_CUSTOM_WARNING:
            case AppConst.WARNING_NO_INET_CLOSE:
            case AppConst.WARNING_LOAD_ASSETS: {
                location.href = location.href;
                break;
            }
            case AppConst.WARNING_NO_INET: {
                break;
            }
            case AppConst.WARNING_NEW_1: {
                if (AppG.closeUrl)
                    location.href = AppG.closeUrl;
                else
                    location.href = location.href;
                break;
            }
            case AppConst.WARNING_AUTO_GAME: {
                if (!OMY.Omy.isDesktop) {
                    OMY.Omy.viewManager.getView(AppConst.W_MENU).showAuto();
                }
                this._setHide();
                break;
            }
            case AppConst.WARNING_SERVER_MESSAGE: {
                location.href = location.href;
                break;
            }

            default: {
                OMY.Omy.remove.tween(this);
                OMY.Omy.add.tween(this, {alpha: 0}, 0.2, this._setHide.bind(this));
                break;
            }
        }
    }

    _setHide() {
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    get wType() {
        return this._wType;
    }
}
