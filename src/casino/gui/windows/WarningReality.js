import {WindowsBase} from "../WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class WarningReality extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_REALITY;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDReality");

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this.kill();

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);
        OMY.Omy.loc.addUpdate(this._onLocChange, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        if (OMY.Omy.debugMode) {
            OMY.Omy.keys.registerFunction(OMY.Key.NUM_0, this._onTimerShow, this);
        }
        this._start();
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);

        if (this._tint) {
            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        AppG.isAutoGame && AppG.autoGameRules.stopAutoGame();
        OMY.Omy.navigateBtn.blockingScreen();

        this._tint = this.addChild(OMY.Omy.add.tint(((this._gdConf.hasOwnProperty("tintAlpha")) ? this._gdConf["tintAlpha"] : 0.1),
            (this._gdConf.hasOwnProperty("tintColor")) ? this._gdConf["tintColor"] : 0xffffff));
        this._tint.input = true;
        OMY.Omy.add.createEntities(this, this._gdConf);

        this.getChildByName("b_no").externalMethod(this._onClose.bind(this));
        this.getChildByName("b_yes").externalMethod(this._onOk.bind(this));
        if (AppG.historyUrl) {
            // AntG.add.button(this._container, this._gdConf['b_history'], this._onOpenHistory.bind(this));
            // AntG.add.text(this._container, this._gdConf['t_history']);
        }

        /** @type {OMY.OTextFont} */
        this._tField = this.getChildByName("t_text");
        this._updateData();

        this._updateGameSize();
    }

    /**     * @private     */
    _updateData() {
        this._diffBalance = AppG.serverWork.playerBalance - this._realityCheckBalance;
        this._diffTime = Date.now() - this._realityCheckTime;
        this._updateText();
    }

    /**     * @private     */
    _updateText() {
        let message = "";
        if (this._diffBalance > 0) {
            message = OMY.Omy.loc.getText("warning_reality_check_win");
        } else if (this._diffBalance < 0) {
            message = OMY.Omy.loc.getText("warning_reality_check_lose");
        } else {
            message = OMY.Omy.loc.getText("warning_reality_check");
        }
        let minutes = OMY.OMath.int(this._diffTime / 60000);
        message = OMY.StringUtils.replaceAll(message, "{0}", String(minutes));
        message = OMY.StringUtils.replaceAll(message, "{1}", [OMY.OMath.abs(this._diffBalance).toFixed(2), AppG.currency].join(""));

        this._tField.text = message;
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        OMY.Omy.navigateBtn.unBlockingScreen();
        this._isGraphic = false;
        this._tField = null;

        if (this._tint)
            this._tint = null;
        this.callAll("destroy");
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
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
            this._start();
            this._clearGraphic();
        }
        super._onKill();
    }

    _onClose() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        if (OMY.Omy.isDesktop) {
            window.top.location.href = AppG.closeUrl;
        } else {
            location.href = AppG.closeUrl;
        }
    }

    _onOk() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    /**     * @private     */
    _onOpenHistory() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        window.open(AppG.historyUrl);
    }

    /**     * @private     */
    _onTimerShow() {
        if (this._isGraphic) {
            this._updateData();
        } else {
            OMY.Omy.viewManager.showWindow(this._wName, false, OMY.Omy.viewManager.gameUI.getWindowLayer());
        }
    }

    _start(time = 0) {
        time = time || AppG.realityCheckTime;

        this._realityCheckTimer?.destroy();
        this._realityCheckTimer = OMY.Omy.add.timer(time, this._onTimerShow, this, 0, true);

        this._realityCheckBalance = AppG.serverWork.playerBalance;
        this._realityCheckTime = Date.now();
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = false;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = true;
        }
    }

    /**     * @private     */
    _onLocChange() {
        if (!this._isGraphic) return;
        this._updateText();
    }
}
