import {FreeGameBeginWindowBase} from "../../../casino/gui/windows/FreeGameBeginWindowBase";
import {AppG} from "../../../casino/AppG";
import {GameConstStatic} from "../../GameConstStatic";
import {AppConst} from "../../../casino/AppConst";

export class FreeGameBeginWindow extends FreeGameBeginWindowBase {
    constructor() {
        super();
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    _updateGameSize() {
        super._updateGameSize();
    }

    revive(onComplete = null) {
        super.revive(onComplete);
    }

    _createGraphic() {
        super._createGraphic();
        /** @type {OMY.OActorSpine} */
        this._windowBg = this.getChildByName("a_bg");
        this._windowBg.play(true);
        this._windowBg.alpha = 0;
        this._bonusTint.alpha = 0;
        this._bonusTint.input = true;

        /** @type {OMY.OButton} */
        this._spinButton = this.getChildByName("b_spin");
        this._spinButton.isBlock = true;
        this._spinButton.addDown(this._onSpinHandler, this, true)
    }

    _clearGraphic() {
        this._windowBg = null;
        this._spinButton = null;
        super._clearGraphic();
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _activateWindow() {
        super._activateWindow();
    }

    _onRevive() {
        super._onRevive();
        this._startShowMess();
    }

    /**     * @private     */
    _startShowMess() {
        AppG.state.startFreeGame();
        OMY.Omy.sound.play(GameConstStatic.S_wheel_music, true);
        let showAlpha = OMY.Omy.add.tweenTimeline({onComplete: this._showContent.bind(this)});
        OMY.Omy.add.tween(this._bonusTint, {
            alpha: this._bonusTint.json["alpha"],
        }, this._bonusTint.json["time_tween"], null, null, showAlpha, 0);
        OMY.Omy.add.tween(this._windowBg, {alpha: 1}, this._gdConf["time_alpha"], null, null,
            showAlpha, this._bonusTint.json["time_tween"] * .3);
        let spine = OMY.Omy.add.actorJson(this, this._gdConf["transition"]);
        spine.removeOnEnd = true;
        spine.gotoAndPlay(0);
        spine = null;
    }

    /**     * @private     */
    _showContent() {
        this._spinButton.isBlock = false;
        OMY.Omy.sound.play(GameConstStatic.S_fg_start);
        OMY.Omy.keys.registerFunction(OMY.Key.SPACE, this._keyHandler, this);
        OMY.Omy.keys.registerFunction(OMY.Key.ENTER, this._keyHandler, this);
    }

    /**     * @private     */
    _keyHandler() {
        this._onSpinHandler();
    }

    /**     * @private     */
    _onSpinHandler() {
        if (AppG.isWarning || OMY.Omy.viewManager.getView(AppConst.W_REALITY)?.active) {
            return;
        }

        OMY.Omy.sound.play(GameConstStatic.S_btn_wheel_start);
        OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this._keyHandler, this);
        OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this._keyHandler, this);
        this._spinButton.isBlock = true;
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_play_press"]);
        this._windowBg.addComplete(this._onSpinFortuneHandler, this, true);
    }

    /**     * @private     */
    _onSpinFortuneHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_wheel_run, true);
        this._stopMult = AppG.totalFreeGame || 10;
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_start"]);
        this._windowBg.addComplete(() => {
            this._windowBg.gotoAndPlay(0, true, this._windowBg.json["a_spin"]);
            OMY.Omy.add.timer(this._gdConf["time_rotation"], this._onCanStopRotation, this);
        }, this, true);
    }

    /**     * @private     */
    _onCanStopRotation() {
        this._windowBg.loop = false;
        this._windowBg.addComplete(() => {
            this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_end"][String(this._stopMult)]);
            this._windowBg.addComplete(this._endRotation, this, true);
        }, this, true);
    }

    _endRotation() {
        OMY.Omy.sound.stop(GameConstStatic.S_wheel_run);
        OMY.Omy.sound.play(GameConstStatic.S_wheel_win);
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_win"][String(this._stopMult)]);
        this._windowBg.addComplete(this._onShowSectorWin, this, true);
    }

    /**     * @private     */
    _onShowSectorWin() {
        OMY.Omy.add.timer(this._gdConf["delay_win_message_sec"], this._startHideWindow, this);
    }

    /**     * @private     */
    _startHideWindow() {
        OMY.Omy.add.tween(this._bonusTint, {
            alpha: 0,
            delay: 0.3
        }, this._bonusTint.json["time_hide"]);
        OMY.Omy.add.tween(this._windowBg, {
            alpha: 0,
            delay: 0.3
        }, this._bonusTint.json["time_hide"], this._startCloseWindow.bind(this));

        OMY.Omy.sound.play(GameConstStatic.S_Transition_Effect);
        let spine = OMY.Omy.add.actorJson(this, this._gdConf["transition"]);
        spine.removeOnEnd = true;
        spine.gotoAndPlay(0);
        spine = null;
        AppG.emit.emit(GameConstStatic.CHANGE_BG_2_FREE);
    }

    /**     * @private     */
    _startCloseWindow() {
        OMY.Omy.add.timer(0.1, this._hideWindow, this);
    }

    _hideWindow() {
        OMY.Omy.sound.stop(GameConstStatic.S_wheel_music);
        GameConstStatic.S_game_bg = GameConstStatic.S_bg_fg;
        const volume = (AppG.isSuperTurbo) ? AppG.gameConst.game_const["volume_user_no_active"] : 1;
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true, false, volume);
        this._closeWindow();
    }
}
