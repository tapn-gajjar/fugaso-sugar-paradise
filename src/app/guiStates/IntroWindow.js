import {WindowsBase} from "../../casino/gui/WindowsBase";
import {AppConst} from "../../casino/AppConst";
import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";

export class IntroWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_INTRO;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDIntro");

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);
        this._edit = Boolean(this._gdConf["visible"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }

        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);

        // const m = AppG.isScreenPortrait ? "v_" : "m_";
        // const scaleBGx = OMY.Omy.WIDTH / this._bg.json[m + "i_width"];
        // const scaleBGy = OMY.Omy.HEIGHT / this._bg.json[m + "i_height"];
        // this._bg.scale.set(Math.max(scaleBGx, scaleBGy));

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
        OMY.Omy.add.createEntities(this, this._gdConf);

        /* /!** @type {OMY.OContainer} *!/
         this._bg = this.getChildByName("c_game_bg");
         this._bg.input = true;
         this._bg.alpha = 0;*/
        /** @type {OMY.OContainer} */
        this._animateCanvas = this.getChildByName("c_animate");
        /** @type {OMY.OActorSpine} */
        this._actor = this._animateCanvas.canvas.getChildByName("a_logo_intro");
        this._actor.gotoAndStop(0);
        this._tint = this.getChildByName("r_tint");
        this._tint.interactive = true;

        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._isGraphic = false;
        this._bg = null;
        this._animateCanvas = null;
        this._actor = null;

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

        OMY.Omy.sound.play(GameConstStatic.S_intro_ambience);
        OMY.Omy.sound.play(GameConstStatic.S_intro);
        // GameConstStatic.S_game_bg = GameConstStatic.S_bg;
        // OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        OMY.Omy.sound.play(GameConstStatic.S_intro_start_logo_anim);
        // OMY.Omy.add.tween(this._bg, {alpha: 1, delay: .5}, 1.0);
        this._actor.gotoAndPlay(0);
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
        if (this._edit) return;
        OMY.Omy.sound.play(GameConstStatic.S_intro_end_logo_anim);
        // OMY.Omy.add.tween(this._animateCanvas.scale, {x: 2.0, y: 2.0}, 1.0);
        // OMY.Omy.add.tween(this._animateCanvas, {alpha: 0}, 0.7, this._start2Close.bind(this));
        // OMY.Omy.add.tween(this._bg, {alpha: 0}, 0.5);
        this._start2Close();
    }

    /**     * @private     */
    _start2Close() {
        OMY.Omy.remove.tween(this._animateCanvas);
        // OMY.Omy.add.tween(this, {alpha: 0},
        //     this._gdConf["tween_alpha_time"], this._onClose.bind(this));
        this._onClose();
    }

    _onClose() {
        OMY.Omy.viewManager.hideWindow(this._wName);
        OMY.Omy.add.timer(0.1, AppG.state.startNewSession, AppG.state);
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
}
