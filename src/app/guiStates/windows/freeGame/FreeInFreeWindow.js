import {FreeInFreeWindowBase} from "../../../../casino/gui/windows/FreeInFreeWindowBase";
import {GameConstStatic} from "../../../GameConstStatic";

export class FreeInFreeWindow extends FreeInFreeWindowBase {
    constructor() {
        super();
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
        /** @type {OMY.OSprite} */
        this._head = this._windowBg.getSpineChildByName("Congratulation");
        this._locTexture = this._gdConf["locTexture"];
        if (this._bonusTint)
            this._bonusTint.alpha = 0;
        this._bonusTint.input = true;
        /** @type {OMY.OTextNumberBitmap} */
        this.tCount = this.getChildByName("t_count");

        /** @type {OMY.OTextBitmap} */
        this.tText1 = this.getChildByName("t_1");
        /** @type {OMY.OTextBitmap} */
        this.tText2 = this.getChildByName("t_2");
        this._updateLoc();
    }

    _clearGraphic() {
        super._clearGraphic();
        this._windowBg = null;
        this._locTexture = null;
        this.tCount = null;
        this.tText1 = null;
        this.tText2 = null;
        this._head = null;
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
    }

    _activateWindow() {
        super._activateWindow();
        OMY.Omy.sound.play(GameConstStatic.S_fg_in_free);
        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        if (this._bonusTint)
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: this._bonusTint.json["alpha"],
            }, this._bonusTint.json["time_tween"]);
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_start"]);
        this._windowBg.addComplete(this._onShowMess, this, true);
        this.tCount.text = "+" + String(this._countMoreFree);
    }

    _onRevive() {
        super._onRevive();

        this.tText1.setScale(0, 0);
        this.tText2.setScale(0, 0);
        this.tCount.alpha = 0;
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
    }

    /**     * @private     */
    _onShowMess() {
        this._windowBg.gotoAndPlay(0, true, this._windowBg.json["a_loop"]);
    }

    _hideWindow() {
        OMY.Omy.sound.play(GameConstStatic.S_free_close);
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_end"]);
        this._windowBg.addComplete(this._setToHide, this, true);
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
    _setToHide() {
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);

        if (this._bonusTint) {
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: 0,
            }, this._bonusTint.json["time_tween"], this._closeWindow.bind(this));
        } else {
            this._closeWindow();
        }
    }
}
