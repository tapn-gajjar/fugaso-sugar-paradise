import {AppG} from "../casino/AppG";
import {AppConst} from "../casino/AppConst";
import {MainView} from "./guiStates/pages/MainView";
import {PaytableWindow} from "./guiStates/PaytableWindow";
import {GuiDesktop} from "./guiStates/gui/GuiDesktop";
import {GuiMobile} from "./guiStates/gui/GuiMobile";
import {SlotStateBase} from "../casino/SlotStateBase";
import {HistoryWindow} from "./guiStates/HistoryWindow";
import {LocalisationWindow} from "../casino/gui/windows/LocalisationWindow";
import {BetWindow} from "./guiStates/BetWindow";
import {MenuWindow} from "./guiStates/MenuWindow";
import {CalcWindow} from "../casino/gui/windows/CalcWindow";
import {WarningReality} from "../casino/gui/windows/WarningReality";
import {GameConstStatic} from "./GameConstStatic";
import {IntroInfoWindow} from "./guiStates/IntroInfoWindow";
import {SettingWindow} from "../casino/gui/windows/SettingWindow";
import {TStaticConst} from "../casino/tournament/TStaticConst";

export class SlotState extends SlotStateBase {
    constructor() {
        super();
    }

    showGame() {
        OMY.Omy.assets.addChars2BitmapFont("t_history_font", AppG.currency,
            AppG.gameConst.getData("t_history_font_config"));
        OMY.Omy.assets.addChars2BitmapFont("ui_number_font", AppG.currency,
            AppG.gameConst.getData("font")["ui_number_font_config"]);
        OMY.Omy.assets.addChars2BitmapFont("reality_font", AppG.currency,
            AppG.gameConst.getData("font")["reality_font_config"]);

        OMY.Omy.assets.addChars2BitmapFont("info_line_font", AppG.currency,
            AppG.gameConst.getData("font")["info_line_font_config"]);
        if (OMY.Omy.isDesktop) {
            OMY.Omy.assets.addChars2BitmapFont("ui_stroke_number_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_stroke_number_font_config"]);
        } else {
            OMY.Omy.assets.addChars2BitmapFont("ui_stroke_mobile_number_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_stroke_mobile_number_font_config"]);
            OMY.Omy.assets.addChars2BitmapFont("ui_menu_number_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_menu_number_font_config"]);
            OMY.Omy.assets.addChars2BitmapFont("calc_font", AppG.currency,
                AppG.gameConst.getData("font")["calc_font_config"]);
            OMY.Omy.assets.addChars2BitmapFont("ui_menu_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_menu_font_config"]);
        }
        // OMY.Omy.assets.addChars2BitmapFont("buy_number_font", AppG.currency,
        //     AppG.gameConst.getData("font")["buy_number_font_config"]);

        if (OMY.Omy.isDesktop) {
            OMY.Omy.viewManager.addTopGui(new GuiDesktop());
        } else {
            OMY.Omy.assets.addChars2BitmapFont("info_line_port_font", AppG.currency,
                AppG.gameConst.getData("font")["info_line_port_font_config"]);
            OMY.Omy.viewManager.addTopGui(new GuiMobile());
        }

        /*if (AppG.isGameDrop) this._mainView = new MainDropView();
        else */
        this._mainView = new MainView();
        OMY.Omy.viewManager.regWO(this._mainView, AppConst.P_VIEW_MAIN);
        OMY.Omy.viewManager.regWO(new WarningReality(), AppConst.W_REALITY);

        /*if (AppG.gameConst.gameHaveIntro)
            OMY.Omy.viewManager.regWO(new IntroLSWindow(), AppConst.W_INTRO);*/
        if (AppG.gameConst.gameHaveIntroInformation)
            OMY.Omy.viewManager.regWO(new IntroInfoWindow(), AppConst.W_INTRO_INFO);
        // OMY.Omy.viewManager.regWO(new GambleWindow(), AppConst.W_GAMBLE);

        // OMY.Omy.viewManager.regWO(new BonusWheelWindow(), AppConst.W_BONUS);
        /*if (AppG.gameHaveFree) {
            OMY.Omy.assets.addChars2BitmapFont("end_free_number_font", AppG.currency,
                AppG.gameConst.getData("font")["end_free_font_config"]);
            OMY.Omy.viewManager.regWO(new FreeGameBeginWindow(), AppConst.W_FREE_GAME_BEGIN);
            OMY.Omy.viewManager.regWO(new FreeGameEndWindow(), AppConst.W_FREE_GAME_END);
            OMY.Omy.viewManager.regWO(new FreeInFreeWindow(), AppConst.W_FREE_IN_FREE);
            if (AppG.gameConst.buyFreeBonus) OMY.Omy.viewManager.regWO(new FreeBuyWindow(), AppConst.W_BUY_FREE);
        }*/
        if (OMY.Omy.isDesktop) {
            OMY.Omy.viewManager.regWO(new PaytableWindow(), AppConst.W_PAY);
            OMY.Omy.viewManager.regWO(new HistoryWindow(), AppConst.W_HISTORY);
            OMY.Omy.viewManager.regWO(new LocalisationWindow(), AppConst.W_LOCALISATION);
            OMY.Omy.viewManager.regWO(new SettingWindow(), AppConst.W_SETTING);
        } else {
            OMY.Omy.viewManager.regWO(new BetWindow(), AppConst.W_BET_SETTINGS);
            OMY.Omy.viewManager.regWO(new MenuWindow(), AppConst.W_MENU);
            OMY.Omy.viewManager.regWO(new CalcWindow(), AppConst.W_CALC);
        }
        OMY.Omy.viewManager.addOpenWindow(TStaticConst.W_FINAL_TOURNAMENT, () => {
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.2, 0.2);
        }, this);
        OMY.Omy.viewManager.addCloseWindow(TStaticConst.W_FINAL_TOURNAMENT, () => {
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.2, 1);
        }, this);

        super.showGame();
    }

    continueNewSession() {
        this._resetTimerBg();
        return super.continueNewSession();
    }

    startFreeGame() {
        this._timeWin?.destroy();
        this._timeNoActive?.destroy();
        this._fadeMainSound = false;
        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        OMY.Omy.sound.stop(GameConstStatic.S_bg_rs);
    }

    /**     * @private     */
    _resetTimerBg() {
        this._timeNoActive?.destroy();
        this._timeNoActive = OMY.Omy.add.timer(5, this._downBgTheme, this);
    }

    /**     * @private     */
    _resetTimerWin() {
        this._timeWin?.destroy();
        this._timeWin = OMY.Omy.add.timer(30, this._downBgTheme, this);
    }

    /**     * @private     */
    _downBgTheme() {
        const time = AppG.gameConst.game_const["main_time_no_active"];
        if (this._fadeMainSound) {
            const volume = AppG.gameConst.game_const["main_volume_no_active"];
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg, time, volume);
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, time, 1);
            this._timeWin?.destroy();
            this._fadeMainSound = false;
            this._resetTimerBg();
        } else {
            this._timeNoActive?.destroy();
            const volume = AppG.gameConst.game_const["volume_user_no_active"];
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, time, volume);
        }
    }

    spinGame() {
        if (!AppG.isSuperTurbo) {
            this._timeNoActive?.destroy();
            if (!this._fadeMainSound)
                OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.3, 1);
        }
        super.spinGame();
    }

    lose() {
        super.lose();
    }

    showAllWinCombo() {
        if (this._gameWithFree && AppG.beginFreeGame) this._mainView.hideWin();
        super.showAllWinCombo();
        // if (AppG.isEndFree) this._mainView.startLoopAnimation(true);
        /*if (AppG.winCoef >= 5 && !AppG.isPLayFreeSpins) {
            this._resetTimerWin();
            if (!this._fadeMainSound) {
                if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_bg))
                    OMY.Omy.sound.play(GameConstStatic.S_bg, true);
                this._fadeMainSound = true;

                OMY.Omy.sound.fadeTo(GameConstStatic.S_bg, 0.5, 1);
                OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.3, 0);
            }
        }*/
    }

    gameOver() {
        if (AppG.isMoreFreeGame) {
            this._mainView.freeInFree();
        } else {
            if (AppG.gameHaveRespin && (AppG.isBeginRespin || AppG.isRespin)) {
                let needChangeReel = false;
                for (let i = 0; i < AppG.serverWork.newHoldReel.length; i++) {
                    if (Boolean(AppG.serverWork.newHoldReel[i])) {
                        needChangeReel = true;
                        break;
                    }
                }
                if (needChangeReel) {
                    this._mainView.startRespinGame();
                    return;
                }
            }
            super.gameOver();
        }
    }

    continueGameOver() {
        super.continueGameOver();
    }

    collectWin(fast = false) {
        OMY.Omy.sound.stop(GameConstStatic.S_gamble_wait);
        super.collectWin(fast);
    }

    _showFreeInFree() {
        this._mainView.freeInFree();
    }

    get fadeMainSound() {
        return this._fadeMainSound;
    }
}
