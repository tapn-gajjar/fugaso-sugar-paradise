import {FreeInFreeWindowBase} from "../../../casino/gui/windows/FreeInFreeWindowBase";
import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";

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
        /** @type {OMY.OContainer} */
        this._textCanvas = this.getChildByName("c_texts");
        if (this._bonusTint)
            this._bonusTint.alpha = 0;
        this._bonusTint.input = true;
        /** @type {OMY.OTextNumberBitmap} */
        this.tCount = this._textCanvas.canvas.getChildByName("t_count");
        // this._updateLoc();
    }

    _clearGraphic() {
        super._clearGraphic();
        this._textCanvas = null;
        this.tCount = null;
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _updateLoc() {
        /*let localMask;
        for (let locTextureKey in this._locTexture) {
            if (locTextureKey.indexOf(OMY.Omy.language) > -1) {
                localMask = this._locTexture[locTextureKey];
                break;
            }
        }
        if (this._head)
            this._head.texture = OMY.Omy.assets.getTexture(localMask);*/
    }

    _activateWindow() {
        super._activateWindow();
        OMY.Omy.sound.play(GameConstStatic.S_fg_in_free);
        OMY.Omy.sound.addPlayEndEvent(GameConstStatic.S_fg_in_free, () => {
            OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.3, 1.0);
        }, this, true);
        OMY.Omy.sound.fadeTo(GameConstStatic.S_game_bg, 0.5, 0.1);
        if (this._bonusTint)
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: this._bonusTint.json["alpha"],
            }, this._bonusTint.json["time_tween"]);
        this.tCount.text = "+" + String(this._countMoreFree);
        this._textCanvas.alignContainer();
        this._textCanvas.alpha = 0;
        this._textCanvas.scale.set(0.5);
        this._textCanvas.y = this._gdConf["start_y"];
    }

    _onRevive() {
        super._onRevive();
        OMY.Omy.add.tween(this._textCanvas,
            {
                alpha: 1,
                y: this._textCanvas.json["y"],
                scaleX: 1,
                scaleY: 1
            }, this._gdConf["time_show_text"]);
    }

    _hideWindow() {
        OMY.Omy.add.tween(this._textCanvas,
            {
                alpha: 0.5,
                x: this._gdConf[(!OMY.Omy.isDesktop && AppG.isScreenPortrait) ? "v_finish_x" : "finish_x"],
                y: this._gdConf[(!OMY.Omy.isDesktop && AppG.isScreenPortrait) ? "v_finish_y" : "finish_y"],
                scaleX: this._gdConf["finish_scale"],
                scaleY: this._gdConf["finish_scale"],
            }, this._gdConf["time_hide_text"], () => {
                AppG.emit.emit(GameConstStatic.ADD_FREE_COUNTER);
            });
        if (this._bonusTint) {
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: 0,
            }, this._bonusTint.json["time_tween"], this._setToHide.bind(this));
        }
    }

    /**     * @private     */
    _setToHide() {
        AppG.emit.emit(GameConstStatic.ADD_FREE_COUNTER);
        OMY.Omy.remove.tween(this._textCanvas);
        OMY.Omy.remove.tween(this._bonusTint);
        this._closeWindow();
    }
}
