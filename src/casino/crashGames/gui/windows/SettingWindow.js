import {WindowsBase} from "../../../gui/WindowsBase";
import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {BtnToggle} from "../../../display/buttons/BtnToggle";

export class SettingWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_LOCALISATION;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDSetting");

        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        this._languageList = AppG.languageList;
        this._languageNames = AppG.gameConst.getData("language");
        this._isConnect = true;

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        AppG.emit.on(AppConst.APP_WARNING_NO_INET, this._onWarningConnect, this);
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

        if (this.getChildByName("s_tint")) {
            /** @type {OMY.OSprite} */
            this._tint = this.getChildByName("s_tint");
            this._tint.input = true;
            this._tint.externalMethod(this._onCloseHandler.bind(this));
        }
        if (this.getChildByName("s_bg"))
            this.getChildByName("s_bg").input = true;
        this._settingLoc();
        this._settingSound();

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isOpen) return;
        this._isOpen = false;
        this._tint = null;
        this._flagImage = null;
        this._btnConfirmLoc = null;
        this._tLanguage = null;
        AppG.emit.off(AppConst.APP_TOGGLE_SOUND, this._checkSoundState, this);
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
        this._clearGraphic();
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }

    /**     * @private     */
    _onCloseHandler() {
        OMY.Omy.viewManager.hideWindow(this._wName);
    }

    // region localisation:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingLoc() {
        this._choiceLanguage = AppG.language;
        this._langId = this._languageList.indexOf(this._choiceLanguage);
        this._langId = (this._langId === -1) ? 0 : this._langId;

        /** @type {OMY.OButton} */
        this._btnConfirmLoc = this.getChildByName("b_yes");
        this._btnConfirmLoc.externalMethod(this._onChangeLanguage.bind(this));
        this.getChildByName("b_left").externalMethod(this._onPrevLang.bind(this));
        this.getChildByName("b_right").externalMethod(this._onNextLang.bind(this));

        /** @type {OMY.OSprite} */
        this._flagImage = this.getChildByName("s_flag");
        /** @type {OMY.OTextBitmap} */
        this._tLanguage = this.getChildByName("t_language");
        this._updateData();
    }

    /**     * @private     */
    _updateData() {
        if (this._langId < 0) this._langId = this._languageList.length - 1;
        else if (this._langId >= this._languageList.length) this._langId = 0;
        this._choiceLanguage = this._languageList[this._langId];

        this._flagImage.texture = this._flagImage.json["language"][this._choiceLanguage] || this._flagImage.json["language"]["eng"];
        this._tLanguage.text = this._languageNames[this._choiceLanguage] || "English";
        if (OMY.Omy.isDesktop)
            this._btnConfirmLoc.visible = this._choiceLanguage !== AppG.language && this._isConnect;
        else
            this._btnConfirmLoc.isBlock = this._choiceLanguage === AppG.language || !this._isConnect;
    }

    _onChangeLanguage() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        if (this._choiceLanguage !== AppG.language) {
            localStorage.setItem("choiceLanguage", this._choiceLanguage);
            AppG.language = this._choiceLanguage;
            OMY.Omy.loc.changeLauguage(this._choiceLanguage);
        }
        if (OMY.Omy.isDesktop)
            this._btnConfirmLoc.visible = false;
        else
            this._btnConfirmLoc.isBlock = true;
    }

    _onPrevLang() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._langId--;
        this._updateData();
    }

    _onNextLang() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._langId++;
        this._updateData();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region audio:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingSound() {
        this._btnToggle = new BtnToggle(this.getChildByName("b_toggle_sound"),
            this._onSoundAction.bind(this));
        AppG.emit.on(AppConst.APP_TOGGLE_SOUND, this._checkSoundState, this);
        this._checkSoundState();
    }

    _checkSoundState() {
        this._btnToggle.toggle = !OMY.Omy.sound.isMute;
    }

    _onSoundAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        (OMY.Omy.sound.isMute) ? OMY.Omy.sound.unmute() : OMY.Omy.sound.mute();
        AppG.emit.emit(AppConst.APP_TOGGLE_SOUND);
    }

    //-------------------------------------------------------------------------
    //endregion

    /**     * @private     */
    _onWarningConnect(isError) {
        this._isConnect = !isError;
        if (this._btnConfirmLoc) {
            if (OMY.Omy.isDesktop)
                this._btnConfirmLoc.visible = this._choiceLanguage !== AppG.language && this._isConnect;
            else
                this._btnConfirmLoc.isBlock = this._choiceLanguage === AppG.language || !this._isConnect;
        }
    }

    get isOpen() {
        return this._isOpen;
    }
}
