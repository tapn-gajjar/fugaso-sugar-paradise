import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";
import {BtnToggle} from "../../../display/buttons/BtnToggle";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {MenuPageBase} from "./MenuPageBase";

export class SettingPageBase extends MenuPageBase {
    constructor(source) {
        super(source);
    }

    _onCheckGraphic() {
        super._onCheckGraphic();

        /** @type {OMY.OContainer} */
        this._langCanvas = this._cPageContent.getChildByName("c_lang");
        this._settingSound();
        this._cPageContent.getChildByName("b_toggle_turbo") && this._settingTurbo();
        this._settingLoc();

        this._isFpsActive = localStorage.getItem(AppG.gameConst.langID + "is_fps_active");
        if (this._isFpsActive === null) this._isFpsActive = "false";
        this._settingIntro();
        this._settingFps();
    }

//-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    updateGameSize() {
        super.updateGameSize();
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    destroy() {
        this._values = null;
        this._btnToggle = null;
        AppG.emit.off(AppConst.APP_TOGGLE_SOUND, this._checkSoundState, this);
        this._btnTurboToggle && AppG.emit.off(AppConst.APP_ON_TURBO, this._checkTurboState, this);
        this._btnTurboToggle = null;
        this._languageList = null;
        this._languageNames = null;
        this._langCanvas = null;
        this._toggleIntro = null;
        this._toggleFps = null;
        super.destroy();
    }

    // region audio:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingSound() {
        this._btnToggle = new BtnToggle(this._cPageContent.getChildByName("b_toggle_sound"),
            this._onSoundAction.bind(this));
        AppG.emit.on(AppConst.APP_TOGGLE_SOUND, this._checkSoundState, this);

        let curVolume = OMY.OMath.roundNumber(OMY.Omy.sound.curVolume, 2);
        this._values = [0, 1];
        let index = this._values.indexOf(curVolume);
        this._curIndex = index === -1 ? 0 : ((OMY.Omy.sound.isMute) ? 0 : index);
        this._checkSoundState();
    }

    _checkSoundState() {
        let curVolume = OMY.OMath.roundNumber(OMY.Omy.sound.curVolume, 2);
        this._curIndex = this._values.indexOf(curVolume);
        this._curIndex = ((this._curIndex === -1) ? 0 : this._curIndex);
        this._btnToggle.toggle = !OMY.Omy.sound.isMute;
    }

    _onSoundAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        this._toggleMute();
        AppG.emit.emit(AppConst.APP_TOGGLE_SOUND);
    }

    _toggleMute() {
        this._curIndex++;
        this._curIndex = this._curIndex >= this._values.length ? 0 : this._curIndex;
        let newVolume = this._values[this._curIndex];
        if (newVolume > 0) {
            OMY.Omy.sound.unmute();
        } else {
            OMY.Omy.sound.mute();
        }
        OMY.Omy.sound.volume(newVolume);
    }

    //-------------------------------------------------------------------------
    //endregion
    // region turbo:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingTurbo() {
        this._btnTurboToggle = new BtnToggle(this._cPageContent.getChildByName("b_toggle_turbo"),
            this._onTurboAction.bind(this));
        AppG.emit.on(AppConst.APP_ON_TURBO, this._checkTurboState, this);
        this._checkTurboState();
    }

    _checkTurboState() {
        this._btnTurboToggle.toggle = AppG.isTurbo;
    }

    _onTurboAction() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        AppG.isTurbo = !AppG.isTurbo;
    }

    //-------------------------------------------------------------------------
    //endregion
    // region intro:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingIntro() {
        if (this._cPageContent.getChildByName("b_toggle_intro")) {
            this._toggleIntro = new BtnToggle(this._cPageContent.getChildByName("b_toggle_intro"),
                this._onIntroHandler.bind(this));
        }
    }

    _onIntroHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        localStorage.setItem(AppG.gameConst.langID + "show_intro", String(!this._toggleIntro.toggle));
    }

    //-------------------------------------------------------------------------
    //endregion
    // region fps:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingFps() {
        if (this._cPageContent.getChildByName("b_toggle_fps")) {
            this._toggleFps = new BtnToggle(this._cPageContent.getChildByName("b_toggle_fps"),
                this._onFpsHandler.bind(this));
            this._toggleFps.toggle = this._isFpsActive === "true";
        }
    }

    _onFpsHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        localStorage.setItem(AppG.gameConst.langID + "is_fps_active", String(this._toggleFps.toggle));
        OMY.OMY_SETTING.RENDER_FPS = (this._toggleFps.toggle) ? 30 : 60;
        OMY.Omy.game.updateRenderSetting();
    }

    //-------------------------------------------------------------------------
    //endregion
    // region localisation:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _settingLoc() {
        this._languageList = AppG.languageList;
        this._languageNames = AppG.gameConst.getData("language");

        this._choiceLanguage = AppG.language;
        this._langId = this._languageList.indexOf(this._choiceLanguage);
        this._langId = (this._langId === -1) ? 0 : this._langId;

        this._langCanvas.getChildByName("b_yes").externalMethod(this._onChangeLanguage.bind(this));
        this._langCanvas.getChildByName("b_left").externalMethod(this._onPrevLang.bind(this));
        this._langCanvas.getChildByName("b_right").externalMethod(this._onNextLang.bind(this));

        /** @type {OMY.OSprite} */
        this._flagImage = this._langCanvas.getChildByName("s_flag");
        /** @type {OMY.OTextBitmap} */
        this._tLanguage = this._langCanvas.getChildByName("t_language");
        this._updateData();
    }

    /**     * @private     */
    _updateData() {
        if (this._langId < 0) this._langId = this._languageList.length - 1;
        else if (this._langId >= this._languageList.length) this._langId = 0;
        this._choiceLanguage = this._languageList[this._langId];

        this._flagImage.texture = this._flagImage.json["language"][this._choiceLanguage] || this._flagImage.json["language"]["eng"];
        this._tLanguage.text = this._languageNames[this._choiceLanguage] || "English";
        this._langCanvas.getChildByName("b_yes").visible = this._choiceLanguage !== AppG.language;
    }

    _onChangeLanguage() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_any);
        if (this._choiceLanguage !== AppG.language) {
            localStorage.setItem("choiceLanguage", this._choiceLanguage);
            AppG.language = this._choiceLanguage;
            OMY.Omy.loc.changeLauguage(this._choiceLanguage);
        }
        this._langCanvas.getChildByName("b_yes").visible = false;
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

    onShow() {
        super.onShow();
        this._isIntroShow = localStorage.getItem(AppG.gameConst.langID + "show_intro");
        if (this._toggleIntro) {
            this._toggleIntro.toggle = this._isIntroShow === "false";
            if (!AppG.gameConst.jsonGameHaveIntroInformation) this._toggleIntro.isBlock = true;
        }
        if (this._btnTurboToggle && !AppG.isHaveTurbo)
            this._btnTurboToggle.graphic.isBlock = true;
    }

//-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}
