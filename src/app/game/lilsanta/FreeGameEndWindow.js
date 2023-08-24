import {FreeGameEndWindowBase} from "../../../casino/gui/windows/FreeGameEndWindowBase";
import {AppG} from "../../../casino/AppG";
import {GameConstStatic} from "../../GameConstStatic";

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
        this._windowBg.setMixByName(this._windowBg.json["a_start"], this._windowBg.json["a_loop"], 0.5);
        /** @type {OMY.OSprite} */
        this._head = this.getChildByName("Congratulation");
        this._head.renderable = false;
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
    }

    _clearGraphic() {
        GameConstStatic.S_game_bg = GameConstStatic.S_bg;
        OMY.Omy.sound.play(GameConstStatic.S_bg_rs, true);
        this._windowBg = null;
        this._locTexture = null;
        this.tCount = null;
        this.tText1 = null;
        this.tText2 = null;
        this._head = null;
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
        let str = OMY.Omy.loc.getText(this.tText2.json.text);
        this.tText2.text = OMY.StringUtils.sprintf(str, AppG.totalFreeGame);
        str = OMY.Omy.loc.getText(this.tText1.json.text);
        this.tText1.text = OMY.StringUtils.sprintf(str, AppG.totalFreeGame);
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
        OMY.Omy.sound.play(GameConstStatic.S_fg_end_music, true);

        this._windowBg.renderable = true;
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_start"]);
        this._windowBg.addComplete(this._onShowMess, this, true);

        this.tText1.setScale(0, 0);
        this.tText1.renderable = true;
        this.tText2.setScale(0, 0);
        this.tText2.renderable = true;
        this.tCount.alpha = 0;
        this.tCount.renderable = true;
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
        this._head.renderable = true;
        this._head.alpha = 0;
        this._head.y -= 100;
        OMY.Omy.add.tween(this._head,
            {
                alpha: 1,
                y: this._head.json.y,
                delay: this._gdConf["time_delay_text"]
            }, this._gdConf["time_tween_text"]);
    }

    /**     * @private     */
    _onShowMess() {
        this._windowBg.gotoAndPlay(0, true, this._windowBg.json["a_loop"]);
        if (this.isEditMode) return;
        OMY.Omy.add.timer(this._gdConf["window_show_sec"], this._startHideWindow, this);
    }

    /**     * @private     */
    _startHideWindow() {
        OMY.Omy.sound.play(GameConstStatic.S_fg_end_music_end);
        OMY.Omy.sound.stop(GameConstStatic.S_fg_end_music);
        OMY.Omy.add.tween(this._bonusTint, {
            alpha: 0,
        }, this._bonusTint.json["time_hide"]);
        OMY.Omy.add.timer(this._gdConf["time_alpha"] * .5, () => {
            AppG.emit.emit(GameConstStatic.CHANGE_BG_2_NORMAL);
        }, this);
        OMY.Omy.add.tween(this._windowBg, {alpha: 0}, this._gdConf["time_alpha"], this._startCloseWindow.bind(this));
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
        OMY.Omy.add.tween(this._head,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
    }

    /**     * @private     */
    _startCloseWindow() {
        this._windowBg.stop();
        OMY.Omy.add.timer(0.2, this._hideWindow, this);
    }

    _hideWindow() {
        OMY.Omy.remove.tween(this._head);
        OMY.Omy.remove.tween(this.tText1);
        OMY.Omy.remove.tween(this.tText2);
        OMY.Omy.remove.tween(this.tCount);
        this._closeWindow();
    }
}
