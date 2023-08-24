import {FreeGameBeginWindowBase} from "../../../casino/gui/windows/FreeGameBeginWindowBase";
import {AppG} from "../../../casino/AppG";
import {GameConstStatic} from "../../GameConstStatic";
import {AppConst} from "../../../casino/AppConst";

export class FreeGameBeginWindow extends FreeGameBeginWindowBase {
    constructor() {
        super();

        this.PI_2 = Math.PI * 2;
        this._sectorsList = this._gdConf["sectors_list"];
        this._sectorSize = this.PI_2 / this._sectorsList.length;
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
        this._windowBg.renderable = false;
        // /** @type {OMY.OSprite} */
        // this._head = this._windowBg.getSpineChildByName("Congratulation");
        // this._locTexture = this._gdConf["locTexture"];
        if (this._bonusTint)
            this._bonusTint.alpha = 0;
        this._bonusTint.input = true;

        /** @type {OMY.OContainer} */
        this._container = this.getChildByName("c_content");
        this._container.alpha = 0;
        this._loopRotate = false;
        /** @type {OMY.OContainer} */
        this._cWheelCenter = this._container.getChildByName("c_wheel_center");
        this._cWheelCenter.rotation = 0;
        this._cWheelCenter.getChildByName("a_center").gotoAndStop(0);

        /** @type {OMY.OButton} */
        this._spinButton = this._container.getChildByName("b_spin");
        /** @type {OMY.OActorSpine} */
        this._spinBtnActor = this._spinButton.getChildByName("a_button");
        this._spinBtnActor.gotoAndStop(0);
        /** @type {OMY.OActorSpine} */
        this._aArrow = this._container.getChildByName("a_arrow");
        this._aArrow.gotoAndStop(0);
        this._aArrow.renderable = false;

        /** @type {OMY.OContainer} */
        this._cSector = this._container.getChildByName("c_sector");
        /** @type {OMY.OActorSpine} */
        this._aSectorWin = this._cSector.getChildByName("a_effect");
        /** @type {OMY.OTextBitmap} */
        this._tCount = this._cSector.getChildByName("t_count");
        /** @type {OMY.OTextBitmap} */
        this._tMulti = this._cSector.getChildByName("t_multi");
        this._cSector.renderable = false;

        /* /!** @type {OMY.OTextBitmap} *!/
                this.tCount = this.getChildByName("t_count");
                this.tCount.text = String(AppG.totalFreeGame - AppG.countFreeGame);
                this.tCount.renderable = false;*/
    }

    _clearGraphic() {
        this._windowBg = null;
        this._container = null;
        this._cWheelCenter = null;
        this._spinButton = null;
        this._spinBtnActor = null;
        this._aArrow = null;
        this._cSector = null;
        this._aSectorWin = null;
        this._tCount = null;
        this._tMulti = null;
        this._config = null;
        super._clearGraphic();
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    /*_updateLoc() {
        let localMask;
        for (let locTextureKey in this._locTexture) {
            if (locTextureKey.indexOf(OMY.Omy.language) > -1) {
                localMask = this._locTexture[locTextureKey];
                break;
            }
        }
        if (this._head)
            this._head.texture = OMY.Omy.assets.getTexture(localMask);
    }*/

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
        this._windowBg.renderable = true;
        this._bonusTint.alpha = 0;
        OMY.Omy.add.tween(this._bonusTint, {
            alpha: this._bonusTint.json["alpha"],
        }, this._bonusTint.json["time_tween"], this._showContent.bind(this));
    }

    /**     * @private     */
    _showContent() {
        this._aArrow.renderable = true;
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["custom_a_name"]);
        this._aArrow.gotoAndPlay(0, false, this._aArrow.json["show"]);
        this._windowBg.addComplete(this._onShowMess, this, true);
        OMY.Omy.add.tween(this._container,
            {alpha: 1, delay: this._container.json["tween_delay"]},
            this._container.json["tween_alpha"]);
    }

    /**     * @private     */
    _onShowMess() {
        OMY.Omy.sound.play(GameConstStatic.S_fg_start);
        this._windowBg.gotoAndPlay(0, true, this._windowBg.json["idle"]);
        this._aArrow.gotoAndPlay(0, true, this._aArrow.json["idle"]);

        this._spinBtnActor.gotoAndPlay(0, false);
        this._spinBtnActor.addComplete(this._onPlayBtnHandler, this, true);
    }

    /**     * @private     */
    _onPlayBtnHandler() {
        this._spinBtnActor.gotoAndPlay(0, true, this._spinBtnActor.json["a_idle"]);
        this._spinButton.externalMethod(this._onSpinHandler.bind(this));
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

        OMY.Omy.keys.unregisterFunction(OMY.Key.SPACE, this._keyHandler, this);
        OMY.Omy.keys.unregisterFunction(OMY.Key.ENTER, this._keyHandler, this);
        this._spinButton.isBlock = true;
        this._spinBtnActor.gotoAndPlay(0, false, this._spinBtnActor.json["a_hide"]);
        this._spinBtnActor.addComplete(this._onSpinFortuneHandler, this, true);
    }

    /**     * @private     */
    _onSpinFortuneHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_wheel_run, true);
        this._spinButton.alpha = 0;
        OMY.Omy.game.addNextTickUpdate(this._spinButton.kill, this._spinButton);
        this._cWheelCenter.rotation = OMY.OMath.normAngle(this._cWheelCenter.rotation % this.PI_2);
        this._stopMult = AppG.totalFreeGame || 10;
        const targetValue = this._stopMult;
        const listIndexes = [];
        for (let i = 0; i < this._sectorsList.length; i++) {
            if (targetValue === this._sectorsList[i]) {
                listIndexes.push(i);
            }
        }
        !listIndexes.length && listIndexes.push(0);
        this._targetIndex = OMY.OMath.getRandomItem(listIndexes);

        this.isUpdate = true;
        this._loopRotate = true;
        this._rSpeed = 0;
        this._canShowWin = false;

        OMY.Omy.add.timer(this._gdConf["time_wait_for_r"], this._onTimerMoveComplete, this);
        OMY.Omy.add.tween(this, {
            _rSpeed: this._gdConf["max_speed"],
            ease: "none",
        }, this._gdConf["grow_speed_time"]);

        this._aArrow.gotoAndPlay(0, false, this._aArrow.json["start"]);
        this._aArrow.addComplete((actor) => {
            this._aArrow.gotoAndPlay(0, true, this._aArrow.json["spin"]);
        }, this, true);
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["start"]);
        this._windowBg.addComplete((actor) => {
            this._windowBg.gotoAndPlay(0, true, this._windowBg.json["spin"]);
        }, this, true);

        // if (this.isEditMode) return;
        // this._startHideWindow();
    }

    /**     * @private     */
    _onTimerMoveComplete() {
        OMY.Omy.remove.tween(this);
        this._canShowWin = true;
    }

    update() {
        super.update();
        if (this._loopRotate) {
            this._cWheelCenter.rotation += this._rSpeed;
            if (this._canShowWin) {
                this.isUpdate = false;
                this._loopRotate = false;
                this._windowBg.gotoAndPlay(0, false, this._windowBg.json["end"]);
                this._windowBg.addComplete((actor) => {
                    this._windowBg.gotoAndPlay(0, true, this._windowBg.json["idle"]);
                }, this, true);
                this._aArrow.gotoAndPlay(0, false, this._aArrow.json["end"]);
                this._aArrow.addComplete((actor) => {
                    this._aArrow.gotoAndPlay(0, true, this._aArrow.json["idle"]);
                }, this, true);

                const targetAngle = this.PI_2 + (this._sectorsList.length - this._targetIndex) * this._sectorSize;
                let count_PI = Math.floor(this._cWheelCenter.rotation / this.PI_2);
                this._cWheelCenter.rotation = this._cWheelCenter.rotation - this.PI_2 * count_PI;

                OMY.Omy.sound.fadeOut(GameConstStatic.S_wheel_run, this._gdConf["rotation_sec"] * .8);
                OMY.Omy.add.tween(this._cWheelCenter, {
                        rotation: targetAngle,
                        ease: this._gdConf["rotation_ease"],
                    }, this._gdConf["rotation_sec"], this._endRotation.bind(this),
                );
            }
        }
    }

    _endRotation() {
        OMY.Omy.sound.stop(GameConstStatic.S_wheel_run);
        OMY.Omy.sound.play(GameConstStatic.S_wheel_win);
        this._cSector.renderable = true;
        this._config = this._gdConf["sectors_config"][this._targetIndex];
        this._tCount.text = String(this._stopMult);
        this._tMulti.text = String(this._config["multi"]);
        // AppG.serverWork.freeMulti = this._config["multi_number"];
        this._aSectorWin.gotoAndPlay(0, false, this._config["start"]);
        this._aSectorWin.addComplete(this._onShowSectorWin, this, true);
        this._aSectorWin.addSpineEvent(() => {
            OMY.Omy.add.tween(this._tCount, {
                x: this._tCount.json["tween_x"],
                y: this._tCount.json["tween_y"],
                scaleX: 1,
                scaleY: 1,
                ease: "none"
            }, this._tCount.json["time_scale"]);
            OMY.Omy.add.tween(this._tMulti, {
                x: this._tMulti.json["tween_x"],
                y: this._tMulti.json["tween_y"],
                scaleX: 1,
                scaleY: 1,
                ease: "none"
            }, this._tMulti.json["time_scale"]);
        }, this, true);

        this._tCount.scale.set(this._tCount.json["tween_scale"]);
        this._tCount.alpha = 0;
        this._tMulti.scale.set(this._tMulti.json["tween_scale"]);
        this._tMulti.alpha = 0;
        OMY.Omy.add.tween(this._tCount, {alpha: 1}, this._tCount.json["time_alpha"], null, null);
        OMY.Omy.add.tween(this._tMulti, {alpha: 1}, this._tMulti.json["time_alpha"], null, null);

        // OMY.Omy.sound.stop(GameConstStatic.S_move_wheel);
        // OMY.Omy.sound.play((this._stopMult === 10) ? GameConstStatic.S_wheel_x10 : GameConstStatic.S_wheel_sector);

        // OMY.Omy.add.timer(this._gdConf["delay_win_message_sec"], this._startHideWindow, this);
    }

    /**     * @private     */
    _onShowSectorWin() {
        this._aSectorWin.gotoAndPlay(0, true, this._config["idle"]);
        AppG.emit.emit(GameConstStatic.CHANGE_BG_2_FREE);
        OMY.Omy.add.timer(this._gdConf["delay_win_message_sec"], this._startHideWindow, this);
    }

    /**     * @private     */
    _startHideWindow() {
        OMY.Omy.add.tween(this._bonusTint, {
            alpha: 0,
        }, this._bonusTint.json["time_hide"]);
        this._aSectorWin.gotoAndPlay(0, false, this._config["end"]);
        this._aSectorWin.addComplete(this._alphaHideWindow, this, true);
        OMY.Omy.add.tween(this._tCount, {alpha: 0, delay: this._tCount.json["time_delay_alpha"]},
            this._tCount.json["time_hide_alpha"]);
        OMY.Omy.add.tween(this._tMulti, {alpha: 0, delay: this._tMulti.json["time_delay_alpha"]},
            this._tMulti.json["time_hide_alpha"]);
    }

    /**     * @private     */
    _alphaHideWindow() {
        OMY.Omy.add.tween(this._windowBg, {alpha: 0}, this._bonusTint.json["time_hide"]);
        OMY.Omy.add.tween(this._container, {alpha: 0}, this._bonusTint.json["time_hide"], this._startCloseWindow.bind(this));
    }

    /**     * @private     */
    _startCloseWindow() {
        this._windowBg?.stop();
        OMY.Omy.add.timer(0.1, this._hideWindow, this);
    }

    _hideWindow() {
        OMY.Omy.sound.stop(GameConstStatic.S_wheel_music);
        GameConstStatic.S_game_bg = GameConstStatic.S_bg_fg;
        OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        this._closeWindow();
    }
}
