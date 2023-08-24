import {WindowsBase} from "../../../casino/gui/WindowsBase";
import {AppConst} from "../../../casino/AppConst";
import {AppG} from "../../../casino/AppG";
import {GameConstStatic} from "../../GameConstStatic";

export class IntroLSWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_INTRO;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDIntro");

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);
        this._edit = Boolean(this._gdConf["edit"]);

        if (this._gdConf["debug"] || this._edit) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        // AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);
        // const m = AppG.isScreenPortrait ? "v_" : "m_";
        // const scaleBGx = OMY.Omy.WIDTH / this._bg.json[m + "i_width"];
        // const scaleBGy = OMY.Omy.HEIGHT / this._bg.json[m + "i_height"];
        // this._bg.scale.set(Math.max(scaleBGx, scaleBGy));
        /*if (this._tint) {
            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }*/
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);

        /** @type {OMY.OActorSpine} */
        this._actor = this.getChildByName("a_effect");
        this._actor.gotoAndStop(0);
        this._actor.removeOnEnd = true;

        // this._tint = this.getChildByName("r_tint");
        // this._tint.interactive = true;

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        // AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._isGraphic = false;
        this._actor = null;

        // if (this._tint)
        //     this._tint = null;
        this.callAll("destroy");
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
    }

    _onRevive() {
        super._onRevive();

        OMY.Omy.sound.play(GameConstStatic.S_intro);
        if (this._edit) return;

        this._actor.visible = true;
        this._actor.gotoAndPlay(0);
        this._actor.addSpineEvent(this._onSpineEvent, this);
        this._actor.addComplete(this._onPlaySpine, this, true);
    }

    kill(onComplete = null) {
        if (this._isGraphic) {
            this._isOpen = false;
        }
        super.kill(onComplete);
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }
        super._onKill();
    }

    /**     * @private     */
    _onPlaySpine() {
        this._isAnimate = false;
        if (this._edit) return;
        OMY.Omy.sound.fadeIn(GameConstStatic.S_bg_rs, 0.5);
        OMY.Omy.sound.play(GameConstStatic.S_lil_santa_open_to_game);
        this._onClose();
    }

    /**     * @private     */
    _onSpineEvent(actor, eventData) {
        switch (eventData.data.name) {
            case "pos_3": {
                break;
            }
        }
    }

    _onClose() {
        OMY.Omy.viewManager.hideWindow(this._wName);
        // OMY.Omy.add.timer(0.1, AppG.state.startNewSession, AppG.state);
        OMY.Omy.sound.stop(GameConstStatic.S_lil_santa_record_music);
    }
}
