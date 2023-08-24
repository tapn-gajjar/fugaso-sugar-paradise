import {GameConstStatic} from "../../GameConstStatic";
import {Background} from "../../display/Background";
import {MainViewBase} from "../../../casino/gui/pages/MainViewBase";
import {LineInGame} from "../../display/LineInGame";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

export class MainView extends MainViewBase {
    constructor() {
        super();
        /** @type {ReelBlock} */
        this._reelBlock = null;
        AppG.emit.on(AppConst.APP_HIDE_WIN_EFFECT, this._cleanWinEffect, this);
        AppG.emit.once(GameConstStatic.EMIT_HIDE_UI, this._onHideUI, this);
    }

    revive() {
        this._bgGraphic = this.getChildByName("c_game_bg");
        this._reelGraphic = this.getChildByName("reels").getChildByName("reel_canvas");

        this._tint = this._bgGraphic.getChildByName("anticipation_tint");
        this._tint.alpha = 0;

        

        super.revive();

        if (AppG.gameConst.gameHaveIntroInformation) {
            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            /*if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.3, 0, 0.1);*/
            this._startIntroInfo();
        } else if (AppG.gameConst.gameHaveIntro) {
            AppG.emit.emit(GameConstStatic.EMIT_HIDE_UI);
            this._startIntro();
            // OMY.Omy.add.timer(AppG.gameConst.getData("game_const")["intro_delay_time"], this._startIntro, this);

            OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            /*if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.3, 0, 0.1);*/
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_bg_rs, true);
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            // OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);

            OMY.Omy.sound.pauseAll();
            OMY.Omy.sound.resumeAll();
        }
    }

    /**     * @private     */
    _startIntro() {
        /*OMY.Omy.viewManager.showWindow(AppConst.W_INTRO, true/!*,
            OMY.Omy.viewManager.gameUI.getWindowLayer("c_intro_layer")*!/);*/
        AppG.emit.emit(GameConstStatic.EMIT_HIDE_UI);
    }

    /**     * @private     */
    _startIntroInfo() {
        OMY.Omy.viewManager.showWindow(AppConst.W_INTRO_INFO, true);
    }

    _createGraphic() {
        /** @type {Background} */
        this.bg = new Background(this._bgGraphic);
        super._createGraphic();
        /** @type {OMY.OContainer} */
        this._reelsCanvas = this.getChildByName("reels");
        this._reelsCanvasZoom = this._reelsCanvas;

        /** @type {LineInGameParticle} */
        this._lineInGame = new LineInGame(this.getChildByName("c_numbers"), this._reelBlock.activeList);
        this._lineInGame.linesGraphic = this.getChildByName("c_lines");
        // this._lineInGame.hide();

        /** @type {OMY.OContainer} */
        this._reelWaitCanvas = this.getChildByName("reels").getChildByName("c_effects");
        this._reelWaitCanvas.setAll("visible", false);
        this._isWaitEffect = false;


        /** @type {OMY.OContainer} */
        this._wildsCanvas = this.getChildByName("reels").getChildByName("c_wilds");
        if (this._gdConf["content_mask"]) {
            const maskJson = this._gdConf["content_mask"];
            this._wildsCanvas.mask = OMY.Omy.add.maskRectJson(this._reelsCanvas, maskJson);
        }
        this._editMode = this._wildsCanvas.json["edit"];
        if (this._editMode) {
            this._effect1 = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json["suger_wild_1"]);
            this._effect2 = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json["suger_wild_2"]);
            this._effect3 = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json["suger_wild_3"]);
            this._effect1.gotoAndPlay(0, true, this._effect1.json["sugar_idle"]);
            this._effect2.gotoAndPlay(0, true, this._effect2.json["sugar_idle"]);
            this._effect3.gotoAndPlay(0, true, this._effect3.json["sugar_idle"]);
        }

        
        
        /** @type {OMY.OContainer} */
        this._reelWaitFrameCanvas = this.getChildByName("reels").getChildByName("c_frame_effects");
        this._reelWaitFrameCanvas.setAll("visible", false);

        /** @type {OMY.OContainer} */
        this._reelCoinsCanvas = this.getChildByName("reels").getChildByName("c_coins");
        for (let i = 0; i < this._reelCoinsCanvas.children.length; i++) {
            let actor = this._reelCoinsCanvas.children[i];
            actor.visible = false;
            actor.addComplete(this._clearCoinsMatrix, this, false);
            actor.userData = 1 + i;
        }
        this._isCoinsEffect = false;
        this._isCoinsMatrix = [0, 0, 0, 0, 0];
        AppG.emit.on(GameConstStatic.SYMBOL_ON_REEL, this._wildOnScreen, this);

        if(!AppG.isBeginRespin){
            let effectstartName;
            this._sugerStartWildEffects = [];
            this._spines = [];
            for (let i = 0; i < this._activeList.length; i++) {
                for (let j = 0; j < this._activeList[0].length; j++) { 
                    if (this._activeList[i][j].symbolName === "A") {
                        effectstartName = "suger_wild_" + String(i);
                        this._spines[i] = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json[effectstartName]); 
                        // this._spines[j].name = String(i) + "_" + String(j); 
                        this._activeList[i][j].respinSymbol(this._spines[j]);
                    }
                }
            }
    
            for (let i = 0; i < this._activeList.length; i++) {
                for (let j = 0; j < this._activeList[0].length; j++) {  
                    if (this._activeList[i][j].symbolName === "A") {
                        effectstartName = "suger_wild_" + String(i);
                        this._sugerStartWildEffects[i] = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json[effectstartName]);
                        this._sugerStartWildEffects[i].gotoAndPlay(0, true, this._sugerStartWildEffects[i].json["sugar_idle"]);
                        break;
                    }
                }           
            }
        }
        
        /* /!** @type {OMY.OContainer} *!/
         this._freeInFreeMess = this.getChildByName("c_free_in_free").getChildByName("c_free_info");
         this._freeInFreeMess.visible = false;
         if (this._freeInFreeMess.json.test)
             OMY.Omy.add.timer(this._freeInFreeMess.json.test,
                 this.freeInFree, this);*/

        AppG.emit.on(AppConst.APP_SHOW_BIG_WIN, this._onShowBigWin, this);
        AppG.emit.on(AppConst.APP_HIDE_MESSAGE_WIN, this._onHideBigWin, this);
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        super._updateGameSize(dx, dy, isScreenPortrait);

        if(this._isWaitEffect && !AppG.isSuperTurbo){
            OMY.Omy.remove.tween(this._reelsCanvasZoom);
            if (AppG.isScreenPortrait) {
                OMY.Omy.add.tween(this._reelsCanvasZoom, {
                    scaleX: 0.72,
                    scaleY: 0.72,
                    ease: "cubic.out"
                }, 3);
            }else{
                OMY.Omy.add.tween(this._reelsCanvasZoom, {
                    scaleX: 1.1,
                    scaleY: 1.1,
                    ease: "cubic.out"
                }, 3);
            }
        }else if(!this._isWaitEffect && !AppG.isSuperTurbo){
            OMY.Omy.remove.tween(this._reelsCanvasZoom);
            if (AppG.isScreenPortrait) {
                OMY.Omy.add.tween(this._reelsCanvasZoom, {
                    scaleX: 0.71,
                    scaleY: 0.71,
                    ease: "cubic.out"
                }, 3);
            }else{
                OMY.Omy.add.tween(this._reelsCanvasZoom, {
                    scaleX: 1,
                    scaleY: 1,
                    ease: "cubic.out"
                }, 3);
            }
        }

    }

    // region spin:
    //-------------------------------------------------------------------------
    sendSpin() {

        if (!AppG.isRespin) {
            this.finishSugerWild();
        }
        
        if (AppG.isRespin)
            OMY.Omy.sound.play(GameConstStatic.S_reel_respin_bg);
        else
            OMY.Omy.sound.play(GameConstStatic.S_reel_bg, true);
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_intro)) OMY.Omy.sound.stop(GameConstStatic.S_intro);
        this._isCoinsMatrix.map((a, index, array) => array[index] = 0);
        this._activeWaitReelIndex = -1;

        super.sendSpin();

        if(!AppG.isTurbo && !AppG.isSuperTurbo){
            this._frameUnderReel = this._reelsCanvas.getChildByName("main_frame_under_reel");
            this._frameUnderReel.visible = true;
            this._frameUnderReel.gotoAndPlay(0, false);
        }

        this._frameEachSpin = this._reelWaitFrameCanvas.getChildByName("each_spin_frame");
        this._frameEachSpin.visible = true;
        this._frameEachSpin.gotoAndPlay(false);
    }

    onSendSpin() {
        if ((AppG.isBeginRespin || AppG.isRespin) && !AppG.skipped) {
            this._longEffect = [0, 0, 0, 0, 0];
            let countWild = 0;
            let isLong = false;
            for (let i = 1; i < AppG.serverWork.newHoldReel.length; i++) {
                if (!isLong && Boolean(AppG.serverWork.newHoldReel[i])) {
                    isLong = true;
                    continue;
                }
                if (isLong && !this._reelBlock.getReel(i).isBlock) {
                    this._longEffect[i] = 1;
                    if (i < AppG.serverWork.newHoldReel.length - 1)
                        countWild += 1;
                }
            }
            if (countWild > 0) {
                this._needOnWildWait = true;
                this._reelBlock.respinLongEffect(this._longEffect);
            }
        }
        super.onSendSpin();
        if (AppG.isRespin) {
            if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_respin)) {
                OMY.Omy.sound.play(GameConstStatic.S_respin);
            }  
        }
    }

    skipSpin() {
        // this._clearWaitEffect();
        if (AppG.isMoveReels) {
            this._needOnWildWait = false;
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg)) {
                OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
            }
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_respin_bg)) {
                OMY.Omy.sound.stop(GameConstStatic.S_reel_respin_bg);
            }
        }
        super.skipSpin();
    }

    _spinEnd() {
        super._spinEnd();
        this._clearWaitEffect();
        this._clearCoinsEffect();
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait))
            OMY.Omy.sound.stop(GameConstStatic.S_wild_wait);

        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg)) {
            OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
        }
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_respin_bg)) {
            OMY.Omy.sound.stop(GameConstStatic.S_reel_respin_bg);
        }
        AppG.emit.emit(GameConstStatic.CHECK_IDL_SYMB_EFFECT);

    }

    _onReelStops(reelId) {
        super._onReelStops(reelId);
        if (AppG.isBeginRespin || AppG.isRespin) {
            /*if (Boolean(AppG.serverWork.newHoldReel[reelId])) {
                for (let j = 0; j < this._activeList[reelId].length; j++) {
                    if (this._activeList[reelId][j].symbolName === "A") {
                        this._activeList[reelId][j].playWildWaitEffect();
                        break;
                    }
                }
            }*/
            if (this._needOnWildWait && this._reelBlock.getReel(reelId).effectIndex !== -1) {
                this._stopWaitSymbolReel(this._reelBlock.getReel(reelId).effectIndex);
            }
        }
        // if (this._isCoinsEffect) {
        //     if (Boolean(this._isCoinsMatrix[reelId])) {
        //         this._isCoinsMatrix[reelId] = 0;
        //         /** @type {OMY.OActorSpine} */
        //         let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(reelId));
        //         actor.visible = false;
        //         actor.stop();
        //     }
        // }
    }

    /**     * @private     */
    _onReelEaseStops(reelId) {
        super._onReelEaseStops(reelId);
        this._checkCoinsEffect();
        if (AppG.isBeginRespin || AppG.isRespin) {
            if (Boolean(AppG.serverWork.newHoldReel[reelId])) {
                for (let j = 0; j < this._activeList[reelId].length; j++) {
                    if (this._activeList[reelId][j].symbolName === "A") {
                        this._activeList[reelId][j].playWildWaitEffect();
                        break;
                    }
                }
            }
        }
    }

//-------------------------------------------------------------------------
    //endregion

    // region scatter wait:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _stopWaitSymbolReel(reelId, waitSymbol) {
        this._offWaitEffect();
        this._onWaitEffect(reelId);
        if (!this._isWaitEffect) {
            this._isWaitEffect = true;
            /*for (let i = 0; i < reelId; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].holdSymbol();
                }
            }*/
        } /*else {
             for (let j = 0; j < this._reelBlock.activeList[reelId - 1].length; j++) {
                 this._reelBlock.activeList[reelId - 1][j].holdSymbol();
             }
         }*/
    }

    /**     * @private     */
    _offWaitEffect() {
        if (this._activeWaitEffect) {

            OMY.Omy.remove.tween(this._activeWaitEffect);
            OMY.Omy.add.tween(this._activeWaitEffect, {alpha: 0, onCompleteParams: [this._activeWaitEffect]},
                this._reelWaitCanvas.json["alpha_time"], (spine) => {
                    spine.stop();
                    spine.visible = false;
                });
            this._activeWaitEffect = null;

            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_anticipation_3)) {
                OMY.Omy.sound.stop(GameConstStatic.S_anticipation_3);
            }
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_anticipation_2)) {
                OMY.Omy.sound.stop(GameConstStatic.S_anticipation_2);
            }
        
            if(!this._isWaitEffect){
                OMY.Omy.remove.tween(this._reelsCanvasZoom);
                if (AppG.isScreenPortrait) {
                    OMY.Omy.add.tween(this._reelsCanvasZoom, {
                        scaleX: 0.71,
                        scaleY: 0.71,
                        ease: "quad.in",
                        onCompleteParams: [this._activeWaitEffect]
                    }, 0.5);
                }else{
                    OMY.Omy.add.tween(this._reelsCanvasZoom, {
                        scaleX: 1,
                        scaleY: 1,
                        ease: "quad.in",
                        onCompleteParams: [this._activeWaitEffect]
                    }, 0.5);
                }
                
                OMY.Omy.remove.tween(this._tint);
                OMY.Omy.add.tween(this._tint, {
                    alpha: 0,
                    onCompleteParams: [this._activeWaitEffect]
                }, 0.5);
                if (this._frameAnticipation) {
                    OMY.Omy.remove.tween(this._frameAnticipation);
                    OMY.Omy.add.tween(this._frameAnticipation, {alpha: 0, onCompleteParams: [this._frameAnticipation]},
                        this._reelWaitCanvas.json["alpha_time"], (spine) => {
                            spine.stop();
                            spine.visible = false;
                        });
                    this._frameAnticipation = null;
                }
                if (this._frameExpanded) {
                    OMY.Omy.remove.tween(this._frameExpanded);
                    OMY.Omy.add.tween(this._frameExpanded, {alpha: 0, onCompleteParams: [this._frameExpanded]},
                        this._reelWaitCanvas.json["alpha_time"], (spine) => {
                            spine.stop();
                            spine.visible = false;
                        });
                    this._frameExpanded = null;
                }
            }        
        }
    }

    /**     * @private     */
    _onWaitEffect(reelId) {
        // if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait))
        //     OMY.Omy.sound.play(GameConstStatic.S_wild_wait, true);

        if(!this._isWaitEffect && !AppG.isSuperTurbo){
            OMY.Omy.add.tween(this._tint, {
                alpha: 0.9,
            }, 0.5);
    
            OMY.Omy.remove.tween(this._reelsCanvasZoom);
            if (AppG.isScreenPortrait) {
                OMY.Omy.add.tween(this._reelsCanvasZoom, {
                    scaleX: 0.72,
                    scaleY: 0.72,
                    ease: "cubic.out"
                }, 3);
            }else{
                OMY.Omy.add.tween(this._reelsCanvasZoom, {
                    scaleX: 1.1,
                    scaleY: 1.1,
                    ease: "cubic.out"
                }, 3);
            }
    
            this._frameAnticipation = this._reelWaitFrameCanvas.getChildByName("main_frame_effects");
            OMY.Omy.remove.tween(this._frameAnticipation);
            this._frameAnticipation.visible = true;
            this._frameAnticipation.alpha = 0;
            this._frameAnticipation.gotoAndPlay(0, true);
            OMY.Omy.add.tween(this._frameAnticipation, {alpha: 1},
                this._reelWaitFrameCanvas.json["alpha_time"]);
    
            this._frameExpanded = this._reelWaitFrameCanvas.getChildByName("frame_sugar_expanded");
            OMY.Omy.remove.tween(this._frameExpanded);
            this._frameExpanded.visible = true;
            this._frameExpanded.alpha = 0;
            this._frameExpanded.gotoAndPlay(0, true);
            OMY.Omy.add.tween(this._frameExpanded, {alpha: 1},
                this._reelWaitFrameCanvas.json["alpha_time"]);
        } 
        
        this._activeWaitReelIndex = reelId;
        if(!AppG.isTurbo && !AppG.isSuperTurbo){
            this._reelBlock._reelList[reelId].stopMoveSpeed();
        }
        this._activeWaitEffect = this._reelWaitCanvas.getChildByName("reel_" + String(reelId+1));
        OMY.Omy.remove.tween(this._activeWaitEffect);
        this._activeWaitEffect.visible = true;
        this._activeWaitEffect.alpha = 0;
        this._activeWaitEffect.gotoAndPlay(0, true);
        OMY.Omy.add.tween(this._activeWaitEffect, {alpha: 1},
            this._reelWaitCanvas.json["alpha_time"]);

        if(reelId == 3){
            OMY.Omy.sound.play(GameConstStatic.S_anticipation_3, false);
        }else if(reelId == 2){
            OMY.Omy.sound.play(GameConstStatic.S_anticipation_2, false);
        }
    }

    /**     * @private     */
    _clearWaitEffect() {
        if (this._isWaitEffect) {
            OMY.Omy.sound.stop(GameConstStatic.S_scatter_wait);
            for (let i = 0; i < this._reelBlock.activeList.length; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].unHoldSymbol();
                }
            }
            this._isWaitEffect = false;
            this._needOnWildWait = false;
            this._activeWaitReelIndex = -1;
            this._offWaitEffect();
        }
    }

    //-------------------------------------------------------------------------
    //endregion
    // region :wild on screen
    //-------------------------------------------------------------------------
    /**     * @private     */
    _wildOnScreen(reelIndex) {
        if(!AppG.isTurbo && !AppG.isSuperTurbo){
            if (reelIndex > 0 && reelIndex < 4) {
                if (!this._isCoinsEffect) {
                    this._isCoinsEffect = true;
                }
                const activeReel = reelIndex === this._activeWaitReelIndex;
                if (!Boolean(this._isCoinsMatrix[reelIndex])) {
                    this._isCoinsMatrix[reelIndex] = 1;
                    /** @type {OMY.OActorSpine} */
                    let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(reelIndex));
                    actor.visible = true;
                    actor.alpha = 1;
                    let animate = (activeReel) ? actor.json["bonus_anim"] : actor.json["custom_a_name"];
                    actor.gotoAndPlay(0, false, animate);
                    if (!activeReel)
                        OMY.Omy.sound.play(GameConstStatic.S_fly_coins);
                } else if (!activeReel) {
                    let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(reelIndex));
                    actor.gotoAndPlay(0, false);
                    OMY.Omy.sound.play(GameConstStatic.S_fly_coins);
                }
            }
        }
    }

    /**     * @private     */
    _clearCoinsMatrix(actor) {
        this._isCoinsMatrix[actor.userData] = 0;
        actor.stop();
        actor.visible = false;
    }

    /**     * @private     */
    _clearCoinsEffect() {
        if (this._isCoinsEffect) {
            OMY.Omy.sound.stop(GameConstStatic.S_fly_coins);
            this._isCoinsEffect = false;
            // this._reelWaitCanvas.callAll("stop");
            // this._reelWaitCanvas.setAll("visible", false);

        }
    }

    /**     * @private     */
    _checkCoinsEffect() {
        if (this._isCoinsEffect) {
            for (let i = 0; i < this._isCoinsMatrix.length; i++) {
                if (Boolean(this._isCoinsMatrix[i])) {
                    let actor = this._reelCoinsCanvas.getChildByName("reel_" + String(i));
                    // actor.stop();
                    OMY.Omy.add.tween(actor, {alpha: 0}, 0.2, this._clearCoinsMatrix.bind(this),
                        {
                            onCompleteParams: [actor],
                        });
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    //endregion
    // region BONUS GAME: WHEEL
    //-------------------------------------------------------------------------

    _startBonusGame() {
        super._startBonusGame();
    }

    _continueShowBonus() {
        super._continueShowBonus();
    }

//-------------------------------------------------------------------------
    //endregion

    // region FREE GAME
    //-------------------------------------------------------------------------

    startFreeGame() {
        super.startFreeGame();

        OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        GameConstStatic.S_game_bg = GameConstStatic.S_bg_fg;
    }

    _continueStartFree() {
        if (AppG.serverWork.haveFreeOnStart) {
            super._continueStartFree();
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_scatter_join);
            this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
            this._activeList.map((a, index, array) => a.map((b, index, array) => b.scatterFree()));
            OMY.Omy.add.timer(this._gdConf["timer_start_free"], this._showFreeWindow, this);
        }
    }

    /**     * @private     */
    _showFreeWindow() {
        OMY.Omy.sound.stop(GameConstStatic.S_scatter_join);
        OMY.Omy.add.timer(1, () => {
            this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        }, this);
        super._continueStartFree();
    }

    finishFreeGame() {
        super.finishFreeGame();
    }

    _continueEndFree() {
        super._continueEndFree();
    }

    freeInFree() {
        /*this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
        this._activeList.map((a, index, array) => a.map((b, index, array) => b.scatterFree(true)));
        OMY.Omy.add.timer(this._gdConf["timer_start_free"], this._showFreeInFreeWindow, this);*/
    }

    /*/!**     * @private     *!/
    _showFreeInFreeWindow() {
        this._freeInFreeMess.visible = true;
        this._freeInFreeMess.alignContainer();
        this._freeInFreeMess.alpha = 0;
        this._freeInFreeMess.scale.set(0);
        OMY.Omy.sound.play(GameConstStatic.S_fg_in_free);
        this._freeInFreeMess.setXY(this._freeInFreeMess.json.x, this._freeInFreeMess.json.y);
        OMY.Omy.add.tween(this._freeInFreeMess, {
            scaleX: 1, scaleY: 1, alpha: 1, ease: this._freeInFreeMess.json["ease_show"],
        }, this._freeInFreeMess.json["tween_show"], this._inFreeDelay.bind(this));
    }

    /!**     * @private     *!/
    _inFreeDelay() {
        OMY.Omy.add.timer(this._freeInFreeMess.json["delay_screen"], this._hideInFreeMess, this);
    }

    /!**     * @private     *!/
    _hideInFreeMess() {
        const hidePos = this._freeInFreeMess.json["tween_hide_pos"];
        OMY.Omy.add.tween(this._freeInFreeMess, {
            scaleX: 0, scaleY: 0, alpha: 0, ease: this._freeInFreeMess.json["ease_hide"],
            x: hidePos.x, y: hidePos.y,
        }, this._freeInFreeMess.json["tween_hide"], this._onInFreeMessHide.bind(this));
    }

    /!**     * @private     *!/
    _onInFreeMessHide() {
        this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        AppG.serverWork.updateTotalFreeGame();
        AppG.state.gameOver();
    }*/

//-------------------------------------------------------------------------
    //endregion

    // region Re-Spin:
    //-------------------------------------------------------------------------

    startRespinGame(onStart = false) {
        if (AppG.isBeginRespin) {
            super.startRespinGame(onStart);
            // OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
            // GameConstStatic.S_game_bg = GameConstStatic.S_bg_rs;
            // OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        }

        this.changeReelForWild();
        if (onStart) {
            OMY.Omy.add.timer(2.5, AppG.state.startNewSession, AppG.state);
        } else {
            OMY.Omy.add.timer(2.5, AppG.state.continueGameOver, AppG.state);
        }
        return true;
    }

    changeReelForWild() {
        this.shootSoundExecuted = false;
        this.sugerExpandsSoundExecuted = false;
        let holds = AppG.serverWork.newHoldReel;
        for (let i = 0; i < holds.length; i++) {
            if (holds[i] === 1) this._playReelChangeEffect(i);
        }
        OMY.Omy.sound.play(GameConstStatic.S_respin_open);
        // OMY.Omy.add.timer(2.4, this._synchAnimations, this);
    }

    /**     * @private     */
    _synchAnimations() {
        for (let i = 0; i < this._wildsCanvas.children.length; i++) {
            this._wildsCanvas.children[i].gotoAndPlay(0, true);
        }
    }

    /**     * @private     */
    _playReelChangeEffect(i) {
        this._reelBlock.blockReel(i);
        let startPoint = null;
        let countWild = 0;
        for (let j = 0; j < this._activeList[i].length; j++) {
            if (this._activeList[i][j].symbolName === "A") {
                countWild++;
                if (!startPoint)
                    startPoint = this._wildsCanvas.toLocal(this._activeList[i][j].getGlobalPosition());
            }
        }
        
        let effectName;
        this._sugerWildEffects = [];   
        for (let j = 0; j < i; j++) {     
            effectName = "suger_wild_" + String(j+1);
            this._sugerWildEffects[j] = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json[effectName]);
        }
        this._spines = [];
        for (let j = 0; j < this._activeList[i].length; j++) {
            
            this._spines[j] = OMY.Omy.add.actorJson(this._wildsCanvas, this._wildsCanvas.json[effectName]);
            this._spines[j].name = String(i) + "_" + String(j);
            if (countWild === 3) {
                let point = this._wildsCanvas.toLocal(this._activeList[i][j].getGlobalPosition());
                this._spines[j].setXY(point.x, point.y);
            } else {
                if(startPoint){
                    this._spines[j].setXY(startPoint.x + 4, startPoint.y);
                }                
            }
            this._spines[j].gotoAndPlay(0, false);
            if (this._activeList[i][j].symbolName === "A") {
                // Main Canon Symbol 
                this._activeList[i][j].respinSymbol(this._spines[j]);
                // this.spine.gotoAndPlay(0, false, spine.json["a_win"]);
                
            } else {
                this._spines[j].gotoAndPlay(0, false);
                // Convert Normal Symbol to Cannon Symbol
                // this.spine.gotoAndPlay(0, false);
                /** @type {SlotSymbolBase} */
                const symbol = this._activeList[i][j];
                const point = this._wildsCanvas.toLocal(symbol.getGlobalPosition());
                OMY.Omy.add.tween(this._spines[j], {x: (point.x + 4) , y: point.y}, 0.5, this._changeSymbol2Respin.bind(this),
                {
                    delay: 0,
                    ease: "slow(0.2, 0.2, false)",
                    onCompleteParams: [this._spines[j], symbol],
                });

            }
        }

        if(!this.shootSoundExecuted){
            OMY.Omy.add.timer(0.6, () => {
                OMY.Omy.sound.play(GameConstStatic.S_wild_shoots);
            }, this);
            this.shootSoundExecuted = true;
        }        

        this._canonShoot = this._reelsCanvas.getChildByName("shoot_fx");
        this._canonShoot.visible = true;
        for (let i = 0; i < this._spines.length; i++) {
            this._spines[i].gotoAndPlay(0, false, this._spines[i].json["cannon_turns"]);
            OMY.Omy.add.timer(0.8, () => {
                this._canonShoot.gotoAndPlay(0, false);
            }, this);
        }

        this._spines[2].addComplete(() => {
            //Start big suger wild effect
            this._playSugarStart(i);
            for (let i = 0; i < this._spines.length; i++) {
                this._spines[i].alpha = 0;
            }
            
        }, this, false);             
    }

    /**     * @private     */
    _playSugarStart(i) {
        for (let j = 0; j <= this._sugerWildEffects.length; j++) {
            if(i == (j+1)){
                this._sugerWildEffects[j].gotoAndPlay(0, false, this._sugerWildEffects[j].json["sugar_start"]);
                if(!this.sugerExpandsSoundExecuted){
                    OMY.Omy.sound.play(GameConstStatic.S_wild_expands);
                    this.sugerExpandsSoundExecuted = true;
                }
                
                this._sugerWildEffects[j].addComplete(() => {
                    this._sugerWildEffects[j].gotoAndPlay(0, true, this._sugerWildEffects[j].json["sugar_idle"]);
                }, this, false);
            }
        }
    }
   

    /**
     *  * @private
     * @param {OMY.OActorSpine}spine
     * @param {SlotSymbol}symbol
     * @private
     */
    _changeSymbol2Respin(spine, symbol) {
        symbol.setSymbol("A");
        symbol.respinSymbol(spine);
    }

    finishRespinGame(onWin = false) {
        if (AppG.isEndRespin) {
            // OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
            // GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            // OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            // OMY.Omy.sound.play(GameConstStatic.S_respin_close);
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_respin)) {
                OMY.Omy.sound.stop(GameConstStatic.S_respin);
            } 
            super.finishRespinGame();
            this._reelBlock.unBlockReels();
            // this._wildsCanvas.callAll("stop");
            // this._wildsCanvas.callAll("kill");
            // for (let i = 0; i < this._activeList.length; i++) {
            //     for (let j = 0; j < this._activeList[i].length; j++) {
            //         this._activeList[i][j].unRespinSymbol();
            //     }
            // }
            
            if (!onWin) {
                if (AppG.serverWork.nextActionTake) {
                    AppG.state.collectWin();
                    return true;
                }
            }
        }
        return false;
    }

    finishSugerWild(){
        OMY.Omy.sound.play(GameConstStatic.S_respin_close);
        this._wildsCanvas.callAll("stop");
        this._wildsCanvas.callAll("kill");

        for (let i = 0; i < this._activeList.length; i++) {
            for (let j = 0; j < this._activeList[i].length; j++) {
                this._activeList[i][j].unRespinSymbol();
            }
        }
        
    }

//-------------------------------------------------------------------------
    //endregion

    // region win on lines:
    //-------------------------------------------------------------------------
    // showWinCombo() {
    //     this._winOnlyScatter = this._dataWin.oneWinSymbol && this._dataWin.hasScatterWin;

    //     /*switch (this._dataWin.maxCountSymbol) {
    //         case 5: {
    //             OMY.Omy.sound.play(GameConstStatic.S_show_win_5);
    //             break;
    //         }
    //         case 4: {
    //             OMY.Omy.sound.play(GameConstStatic.S_show_win_4);
    //             break;
    //         }

    //         default: {
    //             OMY.Omy.sound.play(GameConstStatic.S_show_win_3);
    //             break;
    //         }
    //     }*/
    //     if(AppG.isSuperTurbo){
    //         this._showWinTurbo();
    //         return;
    //     }
    //     super.showWinCombo();
    //     if (AppG.winCoef > 100) OMY.Omy.sound.play(GameConstStatic.S_show_win_5);
    //     else if (AppG.winCoef > 30) OMY.Omy.sound.play(GameConstStatic.S_show_win_4);
    //     else if (AppG.winCoef > 10) OMY.Omy.sound.play(GameConstStatic.S_show_win_3);
    // }

    showWinCombo() {
        OMY.Omy.info('view. show win combo');
        this._winOnlyScatter = this._dataWin.oneWinSymbol && this._dataWin.hasScatterWin;

        if(AppG.isSuperTurbo){
            this._showWinTurbo();
            return;
        }

        AppG.emit.emit(AppConst.EMIT_WIN);
        OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
        this._playWinAnimation = true;
        this._isShowingWinLines = true;
        this._isAnimationsSkiped = false;
        this._playLoopAnimations = false;
        this._configShowLine();

        if (!this._incWinByLine) {
            this._calcAutoRulesWin(AppG.serverWork.spinWin);
            this._calcAllSpinWin(AppG.serverWork.spinWin);
        }
        this._calcWinTime();
        if (!this._incWinByLine) {
            if (this._gameHaveBigMess) {
                this._checkWinMessageEffect();
            } else {
                AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit);
            }
        }

        if (this._oneLineWin) {
            this._showOneLineWinAnimations();
        } else {
            this._showAllWinLines();
        }
        AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._endShowWinLines, this);
        // this._showingWinTimer = OMY.Omy.add.timer(AppG.showWinTime, this._endShowWinLines, this);

        if (AppG.winCoef > 100) OMY.Omy.sound.play(GameConstStatic.S_show_win_5);
        else if (AppG.winCoef > 30) OMY.Omy.sound.play(GameConstStatic.S_show_win_4);
        else if (AppG.winCoef > 10) OMY.Omy.sound.play(GameConstStatic.S_show_win_3);

    }


    _showWinTurbo() {
        this._allLineOnScreen = false;
        super._showWinTurbo();
    }

    _showAllWinLinesTurbo() {
        OMY.Omy.info('view. start show all win line turbo');
        this._dataWin.repeatWins();
        this._winEffect.show();

        this._resetArrayWinData();
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();
            if (this._dataWin.winSymbol === "@") this._santaMulti.winCombo(this._dataWin.countSymbol);

            let allowArray = this.findWinSymbols(this._dataWin, false, false, this._showOnWinNoWinSymbols);
            this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter);
            for (let i = 0; i < allowArray.length; i++) {
                let index = AppG.convertID(allowArray[i].reelId, allowArray[i].symbolId);
                if (this._arrayWinData[index].type !== AppConst.SLOT_SYMBOL_WIN && allowArray[i].type === AppConst.SLOT_SYMBOL_WIN) {
                    AppG.setWinSymbolD(this._arrayWinData[index]);
                    this._arrayWinData[index] = allowArray[i];
                }
            }
            if (!this._dataWin.isScatter)
                this._lineInGame.showWinLine(this._dataWin.line, false, false, false, this._dataWin.countSymbol);
            this._animateWinLine();
        }
        this._reelBlock.updateWinState(this._arrayWinData);

        this._dataWin.repeatWins();
    }

    _checkWinMessageEffect() {
        OMY.Omy.info('view. win coef:', AppG.winCoef, "winCredit", AppG.winCredit);
        if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate")) {
            OMY.Omy.sound.play(GameConstStatic.S_start_big_win);
            if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN, AppG.winCredit);
            }/* else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN, AppG.winCredit);
            } else {
                AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN, AppG.winCredit);
            }*/
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN, AppG.winCredit);
        }
    }

    _checkWinMessageTurbo() {
        OMY.Omy.info('view. win coef in turbo:', AppG.winCoef);
        if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate")) {
            OMY.Omy.sound.play(GameConstStatic.S_start_big_win);
            if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN_TURBO, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN_TURBO, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN_TURBO, AppG.winCredit);
            }/* else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN_TURBO, AppG.winCredit);
            } else {
                AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, AppG.winCredit);
            }*/
        } else {
            AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, AppG.winCredit);
        }
    }

    //-------------------------------------------------------------------------
    //endregion
    // region win on loop:
    //-------------------------------------------------------------------------

    _animateLoopLine() {
        super._animateLoopLine();
        /*switch (this._dataWin.countSymbol) {
            case 5: {
                OMY.Omy.sound.play(GameConstStatic.S_win_5());
                break;
            }
            case 4: {
                OMY.Omy.sound.play(GameConstStatic.S_win_4());
                break;
            }

            default: {
                OMY.Omy.sound.play(GameConstStatic.S_win_3());
                break;
            }
        }*/
    }

    _animateWinLine() {
        super._animateWinLine();
    }

    // _skipWinAnimations() {
    //     super._skipWinAnimations();
    // }
    _skipWinAnimations() {
        if (!this._isShowingWinLines) return;
        if (this._isAnimationsSkiped) return;
        OMY.Omy.info('view. skip win');
        this._isAnimationsSkiped = true;
        this._lineTimer?.destroy();
        this._showingWinTimer?.destroy();
        this._timerIntervalLines?.destroy();
        this._timerIntervalLines = null;
        /*if (!this._allLineOnScreen) {
            OMY.Omy.sound.stop(GameConstStatic.S_show_win_3);
            !this._winOnlyScatter && OMY.Omy.sound.play(GameConstStatic.S_end_show_win);
            this._allLineOnScreen = true;
            while (!this._dataWin.endLines) {
                this._dataWin.nextLine();
                if (this._dataWin.isScatter)
                    this._lineInGame.showWinLineScatter();
                else
                    this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWin, !this._dataWin.isScatter);
            }
        }*/
    }

    _endShowWinLines() {
        this._lineTimer?.destroy();
        super._endShowWinLines();
    }

    _settingNextLineTime() {
        // if (AppG.isAutoGame) {
        //     return AppG.incTimeTake / this._dataWin.countLinesWin;
        // } else {
        return super._settingNextLineTime();
        // }
    }

    startLoopAnimation() {
        if ((AppG.isAutoGame && !AppG.isEndRespin) || AppG.isFreeGame) return;
        if (AppG.isEndRespin)
            this.finishRespinGame(true);

        this._lineTimer?.destroy();
        if (this._dataWin.countLinesWin !== 0) {
            if (!this._playLoopAnimations) {
                super.startLoopAnimation();
            } else {
                if (this._gdConf["wait_delay_loop"]) {
                    this._lineInGame.hideWinEffect();
                    this._winEffect.hide();
                    this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
                    this._delayLoopTimer = OMY.Omy.add.timer(this._gdConf["wait_delay_loop"], this._onWaitDelayLoop, this);
                } else {
                    super.startLoopAnimation();
                }
            }
        } else {
            if (!this._playLoopAnimations)
                super.startLoopAnimation();
        }
    }

    findWinSymbols(dataWin, playSound = true, dispatch = true, noWin = false) {
        dispatch = this._playLoopAnimations;
        return super.findWinSymbols(dataWin, playSound, dispatch, noWin);
    }

    hideWin() {
        this._delayLoopTimer?.destroy();
        return super.hideWin();
    }

    /**     * @private     */
    _onWaitDelayLoop() {
        this._delayLoopTimer = null;
        super.startLoopAnimation();
    }

    //-------------------------------------------------------------------------
    //endregion

    /**     * @private     */
    _cleanWinEffect() {

    }

    // region work with windows:
    //-------------------------------------------------------------------------
    _onPayWindowOpen() {
        super._onPayWindowOpen();
        // this.getChildByName("reels").getChildByName("reel_canvas").alpha = 0;
        // this.getChildByName("reels").alpha = 0;
        // this.getChildByName("c_numbers").alpha = 0;
        // this.getChildByName("c_lines").alpha = 0;
        // this.getChildByName("c_logo").alpha = 0;
    }

    _onPayWindowClose() {
        super._onPayWindowClose();
        // this.getChildByName("reels").getChildByName("reel_canvas").alpha = 1;
        // this.getChildByName("reels").alpha = 1;
        // this.getChildByName("c_numbers").alpha = 1;
        // this.getChildByName("c_lines").alpha = 1;
        // this.getChildByName("c_logo").alpha = 1;
    }
    //-------------------------------------------------------------------------
    //endregion

    // region INTRO:
    //-------------------------------------------------------------------------


    _onIntroWindowClose() {
        OMY.Omy.sound.pauseAll();
        OMY.Omy.sound.resumeAll();
        super._onIntroWindowClose();
        // AppG.state.startNewSession();
        this._onDelayShowAll();
    }

    /**     * @private     */
    _onDelayShowAll() {
        OMY.Omy.sound.play(GameConstStatic.S_intro_screen);
        // OMY.Omy.add.timer(1, this._onShowUI, this);
        this._onShowUI();
    }

    /**     * @private     */
    _onShowUI() {
        OMY.Omy.sound.stop(GameConstStatic.S_intro);
        OMY.Omy.sound.play(GameConstStatic.S_bg_rs, true);
        this.getChildByName("c_logo").alpha = 1;
        this.getChildByName("reels").alpha = 1;

        OMY.Omy.add.timer(0.5, () => {
            AppG.emit.emit(GameConstStatic.EMIT_SHOW_UI);
            AppG.state.startNewSession();
        }, this);
    }

    _onIntroInfoClose() {
        super._onIntroInfoClose();
        if (AppG.gameConst.gameHaveIntro) {
            this._startIntro();
        } else {
            if (!AppG.beginFreeGame && !AppG.isFreeGame) {
                GameConstStatic.S_game_bg = GameConstStatic.S_bg;
                // if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                //     OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            }

            OMY.Omy.sound.pauseAll();
            OMY.Omy.sound.resumeAll();
        }
    }

    /**     * @private     */
    _onHideUI() {
        this.getChildByName("reels").alpha = 0;
        this.getChildByName("c_logo").alpha = 0;
        OMY.Omy.add.timer(.5, this._onIntroWindowClose, this);
    }
    //-------------------------------------------------------------------------
    //endregion

    /**     * @private     */
    _onUpdateBtnState(btnState) {
        switch (btnState) {
            case AppConst.C_COLLECT: {
                if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_gamble_wait)) OMY.Omy.sound.play(GameConstStatic.S_gamble_wait, true);
                break;
            }
        }
    }

    /**     * @private     */
    _onShowBigWin() {
    }

    /**     * @private     */
    _onHideBigWin() {
    }

    get activeWaitReelIndex() {
        return this._activeWaitReelIndex;
    }
}
