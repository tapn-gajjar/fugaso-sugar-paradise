import {WindowsBase} from "../WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {GameConstStatic} from "../../../app/GameConstStatic";
import {BtnToggle} from "../../display/buttons/BtnToggle";

export class SettingWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_SETTING;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDSetting");

        this._isGraphic = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);
        AppG.emit.on(AppConst.APP_EMIT_WIN_JACKPOT, this._onWinJp, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
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
        OMY.Omy.navigateBtn.blockingScreen();

        this._tint = this.addChild(OMY.Omy.add.tint(((this._gdConf.hasOwnProperty("tintAlpha")) ? this._gdConf["tintAlpha"] : 0.1),
            (this._gdConf.hasOwnProperty("tintColor")) ? this._gdConf["tintColor"] : 0xffffff));
        this._tint.input = true;

        this._isIntroShow = localStorage.getItem(AppG.gameConst.langID + "show_intro");
        this._isFpsActive = localStorage.getItem(AppG.gameConst.langID + "is_fps_active");
        if (this._isFpsActive === null) this._isFpsActive = "false";

        OMY.Omy.add.createEntities(this, this._gdConf);
        this.getChildByName("b_close").externalMethod(this._onClose.bind(this));
        this._toggleIntro = new BtnToggle(this.getChildByName("b_toggle_intro"),
            this._onIntroHandler.bind(this));
        this._toggleIntro.toggle = this._isIntroShow === "false";
        this._toggleFps = new BtnToggle(this.getChildByName("b_toggle_fps"),
            this._onFpsHandler.bind(this));
        this._toggleFps.toggle = this._isFpsActive === "true";

        if (!AppG.gameConst.jsonGameHaveIntroInformation) this._toggleIntro.isBlock = true;
        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        OMY.Omy.navigateBtn.unBlockingScreen();

        this._isGraphic = false;

        if (this._tint)
            this._tint = null;
        this._toggleIntro = null;
        this._toggleFps = null;
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
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }
        super._onKill();
    }

    _onClose() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    /**     * @private     */
    _onIntroHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        localStorage.setItem(AppG.gameConst.langID + "show_intro", String(!this._toggleIntro.toggle));
    }

    /**     * @private     */
    _onFpsHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        localStorage.setItem(AppG.gameConst.langID + "is_fps_active", String(this._toggleFps.toggle));
        OMY.OMY_SETTING.RENDER_FPS = (this._toggleFps.toggle) ? 30 : 60;
        OMY.Omy.game.updateRenderSetting();
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
    _onWinJp() {
        if (this._isGraphic)
            OMY.Omy.viewManager.hideWindow(this._wName);
    }
}
