import {WindowsBase} from "../WindowsBase";
import {AppConst} from "../../AppConst";
import {AppG} from "../../AppG";
import {GameConstStatic} from "../../../app/GameConstStatic";

export class LocalisationWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_LOCALISATION;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDLocalisation");

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

        this._languageList = AppG.languageList;
        this._languageNames = AppG.gameConst.getData("language");

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
        this._choiceLanguage = AppG.language;
        this._langId = this._languageList.indexOf(this._choiceLanguage);
        this._langId = (this._langId === -1) ? 0 : this._langId;

        OMY.Omy.add.createEntities(this, this._gdConf);
        this.getChildByName("b_no").externalMethod(this._onClose.bind(this));
        this.getChildByName("b_yes").externalMethod(this._onChangeLanguage.bind(this));

        this.getChildByName("b_left").externalMethod(this._onPrevLang.bind(this));
        this.getChildByName("b_right").externalMethod(this._onNextLang.bind(this));

        /** @type {OMY.OSprite} */
        this._flagImage = this.getChildByName("s_flag");
        /** @type {OMY.OTextBitmap} */
        this._tLanguage = this.getChildByName("t_language");
        this._updateData();

        this._updateGameSize();
    }

    /**     * @private     */
    _updateData() {
        if (this._langId < 0) this._langId = this._languageList.length - 1;
        else if (this._langId >= this._languageList.length) this._langId = 0;
        this._choiceLanguage = this._languageList[this._langId];

        this._flagImage.texture = this._flagImage.json["language"][this._choiceLanguage] || this._flagImage.json["language"]["eng"];
        this._tLanguage.text = this._languageNames[this._choiceLanguage] || "English";
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        OMY.Omy.navigateBtn.unBlockingScreen();

        this._isGraphic = false;

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

    _onChangeLanguage() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        if (this._choiceLanguage !== AppG.language) {
            localStorage.setItem("choiceLanguage", this._choiceLanguage);
            AppG.language = this._choiceLanguage;
            OMY.Omy.loc.changeLauguage(this._choiceLanguage);
        }
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    _onPrevLang() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        this._langId--;
        this._updateData();
    }

    _onNextLang() {
        OMY.Omy.sound.play(GameConstStatic.S_button_menu);
        this._langId++;
        this._updateData();
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
