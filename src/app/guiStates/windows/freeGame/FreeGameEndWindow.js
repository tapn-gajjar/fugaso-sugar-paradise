import {AppG} from "../../../../casino/AppG";
import {GameConstStatic} from "../../../GameConstStatic";
import {FreeGameEndWindowBase} from "../../../../casino/gui/windows/FreeGameEndWindowBase";
import {AppConst} from "../../../../casino/AppConst";

export class FreeGameEndWindow extends FreeGameEndWindowBase {
    constructor() {
        super();
        /** @type {Array.<String>>} */
        this._langList = this._gdConf["list_up_count"];
    }

//---------------------------------------
// PUBLIC
//---------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);
    }

    _createGraphic() {
        super._createGraphic();

        this._bonusTint = this.getChildByName("r_bonus_tint");
        /** @type {OMY.OActorSpine} */
        this._windowBg = this.getChildByName("s_free_bg");
        this._windowBg.renderable = false;
        /** @type {OMY.OSprite} */
        this._head = this._windowBg.getSpineChildByName("Congratulation");
        this._locTexture = this._gdConf["locTexture"];
        if (this._bonusTint)
            this._bonusTint.alpha = 0;
        this._bonusTint.input = true;
        /** @type {OMY.OTextNumberBitmap} */
        this.tCount = this.getChildByName("t_total_win");
        this.tCount.setNumbers(this._totalWin);
        this.tCount.lastText = String(AppG.currency);
        this.tCount.renderable = false;

        /** @type {OMY.OTextBitmap} */
        this.tText1 = this.getChildByName("t_1");
        this.tText1.renderable = false;
        /** @type {OMY.OTextBitmap} */
        this.tText2 = this.getChildByName("t_2");
        this.tText2.renderable = false;
        /** @type {OMY.OTextBitmap} */
        this.tText3 = this.getChildByName("t_3");
        this.tText3.renderable = false;

        /** @type {OMY.OActorSpine} */
        this._aFruits = this.getChildByName("a_Transition");
        this._aFruits.renderable = false;
    }

    _clearGraphic() {
        GameConstStatic.S_game_bg = GameConstStatic.S_bg;
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        this._windowBg = null;
        this._locTexture = null;
        this.tCount = null;
        this.tText1 = null;
        this.tText2 = null;
        this.tText3 = null;
        this._head = null;
        this._aFruits = null;
        super._clearGraphic();
    }

    _updateGameSize() {
        super._updateGameSize();
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _updateLoc() {
        let localMask;
        for (let locTextureKey in this._locTexture) {
            if (locTextureKey.indexOf(OMY.Omy.language) > -1) {
                localMask = this._locTexture[locTextureKey];
                break;
            }
        }
        if (this._head)
            this._head.texture = OMY.Omy.assets.getTexture(localMask);
        if (OMY.OMath.inArray(this._langList, OMY.Omy.language)) {
            let str = OMY.Omy.loc.getText("free_end_1");
            this.tText1.text = OMY.StringUtils.sprintf(str, (AppG.serverWork.isMaxWin) ? AppG.countFreeGame : AppG.totalFreeGame);
            this.tText2.text = OMY.Omy.loc.getText((AppG.serverWork.isMaxWin) ? "free_end_3" : "free_end_2");
        } else {
            let str = OMY.Omy.loc.getText("free_end_2");
            this.tText1.text = OMY.Omy.loc.getText((AppG.serverWork.isMaxWin) ? "free_end_3" : "free_end_1");
            this.tText2.text = OMY.StringUtils.sprintf(str, (AppG.serverWork.isMaxWin) ? AppG.countFreeGame : AppG.totalFreeGame);
        }
    }

    _activateWindow() {
        super._activateWindow();
    }

    _onRevive() {
        super._onRevive();
        if (this._bonusTint)
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: this._bonusTint.json["alpha"],
            }, this._bonusTint.json["time_tween"], this._startShowMess.bind(this));
    }

    /**     * @private     */
    _startShowMess() {
        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        OMY.Omy.sound.play(GameConstStatic.S_fg_end);

        this._windowBg.renderable = true;
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_start"]);
        this._windowBg.addComplete(this._onShowMess, this, true);

        this.tText1.setScale(0, 0);
        this.tText1.renderable = true;
        this.tText2.setScale(0, 0);
        this.tText2.renderable = true;
        this.tCount.alpha = 0;
        this.tCount.renderable = true;
        this.tText3.alpha = 0;
        this.tText3.renderable = true;
        OMY.Omy.add.tween(this.tText1,
            {
                scaleX: 1,
                scaleY: 1,
                delay: this._gdConf["time_delay_text"]
            }, this._gdConf["time_tween_text"]);
        OMY.Omy.add.tween(this.tText2,
            {
                scaleX: 1,
                scaleY: 1,
                delay: this._gdConf["time_delay_text"]
            }, this._gdConf["time_tween_text"]);
        OMY.Omy.add.tween(this.tCount,
            {
                alpha: 1,
                delay: this._gdConf["time_delay_text"]
            }, this._gdConf["time_tween_text"]);
        this._updateLoc();
    }

    /**     * @private     */
    _onShowMess() {
        this._windowBg.gotoAndPlay(0, true, this._windowBg.json["a_loop"]);
        OMY.Omy.add.tween(this.tText3,
            {
                alpha: 1,
                delay: this._gdConf["time_delay_text"]
            }, this._gdConf["time_tween_text"]);
        if (!this._gdConf["debug"]) {
            OMY.Omy.mouse.addDownMouse(this._onClockOnScreen, this);
            OMY.Omy.keys.addAnyKey(this._onClockOnScreen, this);
        }
    }

    /**     * @private     */
    _onClockOnScreen() {
        if (AppG.isWarning || OMY.Omy.viewManager.getView(AppConst.W_REALITY)?.active) {
            OMY.Omy.mouse.removeDownMouse(this._onClockOnScreen, this);
            OMY.Omy.mouse.addDownMouse(this._onClockOnScreen, this);
            return;
        }
        if (this.isEditMode) return;
        OMY.Omy.mouse.removeDownMouse(this._onClockOnScreen, this);
        OMY.Omy.keys.removeAnyKey(this._onClockOnScreen, this);
        OMY.Omy.remove.tween(this.tText3);
        this.tText3.destroy();
        this._startHideWindow();
    }

    /**     * @private     */
    _startHideWindow() {
        OMY.Omy.add.tween(this._bonusTint, {
            alpha: 0,
        }, this._bonusTint.json["time_hide"]);
        OMY.Omy.sound.play(GameConstStatic.S_free_close);
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_end"]);
        this._windowBg.addComplete(this._startCloseWindow, this, true);
        this._windowBg.addSpineEvent(this._startChangeBg, this, true);
        OMY.Omy.add.tween(this.tText1,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
        OMY.Omy.add.tween(this.tText2,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
        OMY.Omy.add.tween(this.tCount,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
    }

    /**     * @private     */
    _startChangeBg() {
        OMY.Omy.sound.play(GameConstStatic.S_transition_effect);
        this._aFruits.renderable = true;
        this._aFruits.gotoAndPlay(0);
        this._aFruits.addSpineEvent(() => {
            AppG.emit.emit(GameConstStatic.E_CHANGE_BG);
        }, this, true);
    }

    /**     * @private     */
    _startCloseWindow() {
        this._aFruits.stop();
        this._windowBg.stop();
        OMY.Omy.add.timer(0.2, this._hideWindow, this);
    }

    _hideWindow() {
        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        OMY.Omy.remove.tween(this.tText1);
        OMY.Omy.remove.tween(this.tText2);
        OMY.Omy.remove.tween(this.tCount);
        this._closeWindow();
    }
}
