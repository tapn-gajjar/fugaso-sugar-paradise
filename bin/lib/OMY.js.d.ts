/// <reference types="pixi.js" />

type CallbackFunction = () => void;

declare namespace OMY {
    export const OmyConst: {
        SCALE_SHOW_ALL: number;
        SCALE_EXACT_FIT: number;
        OMY_SPRITE: string;
        OMY_CONTAINER: string;
        OMY_TEXT_FONT: string;
        OMY_TEXT_FONT_INPUT: string;
        OMY_TEXT_NUMBER_FONT: string;
        OMY_TEXT_BITMAP: string;
        OMY_TEXT_NUMBER_BITMAP: string;
        OMY_BUTTON: string;
        OMY_BUTTON_TWEEN: string;
        OMY_CHECK_BOX_TWEEN: string;
        OMY_CHECK_BOX: string;
        OMY_ACTOR: string;
        OMY_ACTOR_SPINE: string;
        OMY_GRAPHIC: string;
        OMY_PARTICLE: string;
        OMY_PARTICLE_CONTAINER: string;
        OMY_RECT: string;
        OMY_REVOLT_EMMITER: string;
        OMY_REVOLT_SEQUENCE: string;
        OMY_SLIDER: string;
        OMY_NEUTRINO_PARTICLES: string;
        Graphics: typeof PIXI.Graphics;
        Rectangle: typeof PIXI.Rectangle;
        TextStyle: typeof PIXI.TextStyle;
        Emit: typeof PIXI.utils.EventEmitter;
    };

    export const OMY_SETTING: {
        WEBP_SUPPORT: boolean;
        OGG_SUPPORT: boolean;
        TEXT_NUMBER_SHOW_CENT: boolean;
        CACHE_SPINE_ON_START: boolean;

        /**
         * Hide/show messages about button state and blocking screen from console
         * @typedef {boolean} default=true
         */
        VERBOSE_BUTTONS_STATE: boolean;
        SHOW_FPS: boolean;
        CHECK_IOS_FULLSCREEN: boolean;
        NO_CACHE_ASSETS_ON_LOAD: boolean;
        ALLOW_DESK_SIZE: boolean;
        RENDER_FPS: number;
    };

    export class OMap {
        constructor();

        has(name: string): boolean;

        set(name: string, obj: any): void;

        get(name: string): any;

        values(): any[];

        names(): string[];

        delete(obj: any): void;

        deleteByName(name: string): void;

        clear(): void;

        clearByKeys(arr: string[]): void;

        calcValues(): number;

        createCopy(): OMap;

        readonly length: number;
        readonly isEmpty: boolean;
    }

    export class PlayListData {
        constructor(actor: OActor);

        setData(data: object): void;

        startPlay(): void;

        next(): void;

        clear(): void;

        destroy(): void;

        readonly isFinish: boolean;
        readonly id: number;
    }

    export class OActor extends PIXI.AnimatedSprite {
        constructor(textureArray: Array<PIXI.Texture>);

        addFramesList(data: object): void;

        playFromFramesList(name: object): void;

        clearPlayFromFrames(): void;

        addPlayList(playData: object): void;

        setDelayPlayList(time?: number, nameList?: string, onComplete?: any): void;

        setDelayPlay(time?: number, looping?: boolean, onComplete?: any): void;

        setDelayGotoAndPlay(time?: number, frame?: number, looping?: boolean, onComplete?: CallbackFunction): void;

        play(looping?: boolean, animName?: string): void;

        stop(): void;

        gotoAndPlay(frame?: number, looping?: boolean, animName?: string): void;

        gotoAndStop(frame?: number, animName?: string): void;

        restart(): void;

        reverse(): void;

        next(): void;

        previous(): void;

        playList(listName: string): void;

        stopPlayList(): void;

        addAnimation(animName: string, textureArray: Array<PIXI.Texture>): void;

        changeAnimation(animName: string): void;

        hasAnimation(animName: string): boolean;

        addFrameFunction(frameId: number, func: any): OActor;

        clearFrameFunction(frameId?: number): OActor;

        addChild(child: any): any;

        addChildAt(child: any, index: any): any;

        removeChild(child: any): any;

        removeChildAt(index: any): any;

        removeChildren(beginIndex: any, endIndex: any): any[];

        contains(child: PIXI.DisplayObject): boolean;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(deltaTime: any): void;

        setAll(aVariableName: string, aValue: object): void;

        callAll(aFunctionName: string, aArgs?: any[]): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addComplete(func: any, context: any, once?: any): void;

        addLoop(func: any, context: any, once?: boolean): void;

        addEndAnimation(func: any, context: any, once?: boolean): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeComplete(func: any, context: any): void;

        removeLoop(func: any, context: any): void;

        removeEndAnimation(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: number;
        anchorY: number;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        x: any;
        y: any;
        height: any;
        width: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        removeOnEnd: any;
        readonly isReversed: any;
        readonly loopCount: any;
        totalLoop: any;
        fps: any;
        readonly animName: string;
        speed: number;
        interactChild: any;
        putOnCache: any;
        revert: boolean;
    }

    export class OActorSpine extends PIXI.spine.Spine {
        constructor(spineData: any);

        setDelayPlay(time?: number, looping?: boolean, onComplete?: any): void;

        setDelayGotoAndPlay(time?: number, frame?: number, looping?: boolean, onComplete?: any): void;

        addNext(animName: string, looping?: boolean): void;

        play(looping?: boolean, animName?: string): OActorSpine;

        stop(): OActorSpine;

        pause(): OActorSpine;

        resume(): OActorSpine;

        gotoAndPlay(frame?: number, looping?: boolean, animName?: string): OActorSpine;

        gotoAndStop(frame?: number, aName: string): OActorSpine;

        /**
         * Play mix animation with starting main animation
         * @param {number} trackIndex
         * @param {string} aName
         * @param {number} frame=0
         * @param {boolean} looping=false
         * @return {OActorSpine}
         */
        playMixAnimation(trackIndex: number, aName:string, frame?:number, looping?:boolean): OActorSpine;

        /**
         * Stop mix animation
         * @param {number} trackIndex
         * @return {OActorSpine}
         */
        stopMixAnimation(trackIndex: number): OActorSpine;

        reset(): OActorSpine;

        restart(): OActorSpine;

        changeAnimation(animName: string): void;

        hasAnimation(animName: string): any;

        setMixByName(animName1: string, animName2: string, delay?: number): void;

        setSkin(skin: any): void;

        contains(child: PIXI.DisplayObject): boolean;

        kill(): any;

        revive(): void;

        destroy(options?: any): void;

        update(dt: any): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addCallbackInTime(time: number, callback: any): void;

        removeCallbackInTime(time: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addComplete(func: any, context: any, once?: any): void;

        addSpineEvent(func: any, context: any, once?: any): void;

        addLoop(func: any, context: any, once?: boolean): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeComplete(func: any, context: any): void;

        removeSpineEvent(func: any, context: any): void;

        removeLoop(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        /**
         * find child in spine actor by name
         * @param {String}str
         * @returns {null|PIXI.Container|PIXI.Sprite}
         */
        getSpineChildByName(str: string): PIXI.Sprite;

        /**
         * find bone from skeleton
         * @param {String}boneName
         * @returns {null|PIXI.spine.Bone}
         */
        findBone(boneName: string): PIXI.spine.Bone;

        /**
         * find slot from skeleton
         * @param {String}slotName
         * @returns {null|PIXI.spine.Slot}
         */
        findSlot(slotName: string): PIXI.spine.Slot;

        /**
         * find current sprite on slot from skeleton
         * @param {String}slotName,
         * @param {Boolean}force, default=false
         * @param {Function}callback, default=null
         * @returns {null|PIXI.Sprite}
         */
        findCurrentSlotSprite(slotName: string, force?:boolean, callback?:any): PIXI.Sprite;

        readonly active: any;
        scaleX: any;
        scaleY: any;
        readonly scale: any;
        pivotX: any;
        pivotY: any;
        anchorX: any;
        anchorY: any;
        readonly localLeft: any;
        readonly localRight: any;
        readonly localTop: any;
        readonly localBottom: any;
        readonly localWidth: any;
        readonly localHeight: any;
        readonly globalLeft: any;
        readonly globalTop: any;
        readonly worldX: any;
        readonly worldY: any;
        x: any;
        y: any;
        height: any;
        width: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        removeOnEnd: any;
        readonly loopCount: any;
        totalLoop: any;
        readonly playing: any;
        loop: any;
        readonly currentFrame: any;
        readonly frameTotal: any;
        readonly animationName: any;
        speed: any;
        interactChild: any;
        putOnCache: any;
        readonly isPaused: boolean;
        destroyOnKill: boolean;
        correctTrackIndex: number;
    }

    export class GameCache {
        constructor();

        setActorAtlas(a: any): void;

        getActorAtlas(name: any, textures: any): any;
    }

    export class OTextInput extends TextInput {
        constructor(text: any, style: any, canvas?: any);

        setInputStyle(key: string, value: any): void;

        blur(): void;

        select(): void;

        focus(): void;

        setColor(tColor: any): void;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        addKeyDown(func: any, context: any, once?: any): void;

        addKeyUp(func: any, context: any, once?: any): void;

        addInput(func: any, context: any, once?: any): void;

        addFocus(func: any, context: any, once?: any): void;

        addBlur(func: any, context: any, once?: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        removeKeyDown(func: any, context: any): void;

        removeKeyUp(func: any, context: any): void;

        removeInput(func: any, context: any): void;

        removeFocus(func: any, context: any): void;

        removeBlur(func: any, context: any): void;

        align: any;
        alignV: any;
        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: number;
        anchorY: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        text: any;
        x: number;
        y: number;
        height: number;
        width: number;
        rotation: number;
        fontSize: number;
        readonly oType: any;
        disabled: boolean;
        readonly htmlInput: any;
        restrict: string;
        maxLength: number;
        placeholder: string;
    }

    export class OTextFont extends PIXI.Text {
        constructor(text: any, style: any, canvas?: any);

        drawDebugRect(): void;

        removeDrawDebugRect(): void;

        setColor(tColor: any): void;

        /**
         * Change text font style
         * @param {string} fontFamily
         */
        setNewFont(fontFamily: string): void;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        addTextUpdate(func: any, context: any, once?: any): void;

        addCharCountUpdate(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        removeTextUpdate(func: any, context: any): void;

        removeCharCountUpdate(func: any, context: any): void;

        align: any;
        alignV: any;
        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: number;
        anchorY: number;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        text: any;
        splitText: any;
        staticFirstText: string;
        staticLastText: string;
        checkFontSize: boolean;
        fullCheckFontSize: boolean;
        x: any;
        y: any;
        height: any;
        width: any;
        rotation: number;
        fontSize: any;
        oneLine: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        soundUp: string;
        soundOver: string;
    }

    export class OTextBitmap extends PIXI.BitmapText {
        constructor(text: any, style: any);

        drawDebugRect(): void;

        removeDrawDebugRect(): void;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        setColor(tColor: any): void;

        /**
         * Change text font style and font size
         * @param {string} fontFamily
         */
        setNewFont(fontFamily: string): void;

        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        forceUpdateWidth(): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        addTextUpdate(func: any, context: any, once?: any): void;

        addCharCountUpdate(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        removeTextUpdate(func: any, context: any): void;

        removeCharCountUpdate(func: any, context: any): void;

        align: any;
        alignV: any;
        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: any;
        anchorY: any;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        text: any;
        splitText: any;
        staticFirstText: string;
        staticLastText: string;
        checkFontSize: boolean;
        fullCheckFontSize: boolean;
        x: any;
        y: any;
        height: any;
        width: any;
        rotation: number;
        fontSize: any;
        realSize: number;
        readonly oneLine: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        interactChild: any;
        /**
         * Set text max width
         * @param {number} value
         */
        textMaxWidth: number;
        /**
         * Set text max height
         * @param {number} value
         */
        textMaxHeight: number;
        soundUp: string;
        soundOver: string;
    }

    export class OMultiStyleTextFont extends MultiStyleText {
        constructor(text: any, style: any, canvas?: any);

        drawDebugRect(): void;

        removeDrawDebugRect(): void;

        setColor(tColor: any): void;

        /**
         * Change text font style
         * @param {string} fontFamily
         */
        setNewFont(fontFamily: string): void;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        addTextUpdate(func: any, context: any, once?: any): void;

        addCharCountUpdate(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        removeTextUpdate(func: any, context: any): void;

        removeCharCountUpdate(func: any, context: any): void;

        align: any;
        alignV: any;
        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: number;
        anchorY: number;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        text: any;
        splitText: any;
        staticFirstText: string;
        staticLastText: string;
        checkFontSize: boolean;
        fullCheckFontSize: boolean;
        x: any;
        y: any;
        height: any;
        width: any;
        rotation: number;
        fontSize: any;
        oneLine: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        interactChild: any;
        soundUp: string;
        soundOver: string;
    }

    export class OMultiStyleTextNumberFont extends OMultiStyleTextFont {
        constructor(text: any, style: any, canvas: any);

        /**
         * @param {number} value
         * @param {boolean} incAnimNow
         * @param {string} ease default='Power0.easeNone'
         */
        setNumbers(value: any, incAnimNow?: boolean, ease?: any): void;

        createText(): void;

        updateNumbers(): void;

        kill(): void;

        destroy(): any;

        stopInctAnimation(): void;

        pauseIncAnim(): void;

        continueIncAnim(): void;

        readonly value: number;
        specSymbol: any;
        zeroZeroType: any;
        onCompleteInc: any;
        incSecond: any;
        onStepInc: any;
        soundInc: any;
        hideIfZero: any;
        delaySymbol: any;
        simpleZero: any;
        lastText: any;
        firstText: any;
        showCent: any;
    }

    export class OMath {
        static drawRectBorder(graphic: any, x: any, y: any, width: any, height: any, color?: string, lineWidth?: number, alpha?: number): void;

        static convertSecondsToString(seconds: any, d?: boolean, h?: boolean, m?: boolean, s?: boolean): string;

        static convertSecToStrSimple(seconds: any): string;

        static benchFunction(func: any, ...arr: any[]): number;

        static sortNumber(list: any, sortProp: any, toUp?: boolean): void;

        static sortNumberBy2Field(list: any, sortProp1: any, sortProp2: any, toUp?: boolean): void;

        static sortNumberSimple(list: any, toUp?: boolean): void;

        static sortString(list: any, sortProp: any): void;

        static sortStringSimple(list: any): void;

        static int(value: any): number;

        static randomiseArray(inArray: any): void;

        static replaceCharInString(str: string, toReplace: string, letters: string): string;

        static StrReplace(str: string, replaceInt: string, letters: string): string;

        static abs(value: number): number;

        static range(value: number, aLower: number, aUpper: number): boolean;

        static closest(value: number, out1: number, out2: number): number;

        static randomRangeInt(aLower: number, aUpper: number): number;

        static randomBoolean(): boolean;

        static randomRangeNumber(aLower: number, aUpper: number): number;

        static randomNumberFromArray(list: number[]): number;

        static randomList(inArray: any, outArray: any, total: any, copy: any): void;

        /**
         * Get random item from arguments
         */
        static choicer(): any;

        /**
         * Get random item from arguments
         */
        static getRandomItem(array: any[]): any;

        static equal(aValueA: number, aValueB: number, aDiff: number): boolean;

        static distance(x1: number, y1: number, x2: number, y2: number): number;

        static angle(x1: number, y1: number, x2: number, y2: number, norm: boolean): number;

        static angleDeg(x1: number, y1: number, x2: number, y2: number, norm: boolean): number;

        static toDegrees(aRadians: number): number;

        static toRadians(aDegrees: number): number;

        static normAngleDeg(aAngle: number): number;

        static normAngle(aAngle: number): number;

        static toPercent(aCurrent: number, aTotal: number): number;

        static fromPercent(aPercent: number, aTotal: number): number;

        /**
         * Get value from range by percent (0..100)
         */
        static valueFromRangeByPercent(min: number, max: number, percent: number): number;

        /**
         * Get percent from range by value
         */
        static percentFromRangeByValue(min: number, max: number, input: number): number;

        static maxFrom(aArray: any[]): number;

        static minFrom(aArray: any[]): number;

        static getMinValueFromVector(vector: any): number;

        static getMaxValueFromVector(vector: any): number;

        static calcVelocity(aVelocity: number, aAcceleration: number, aDrag: number, aMax: number): number;

        static check(value: number): number;

        static roundNumber(num: number, round: number): number;

        static roundNumberString(num: number, round: number, split: string): string;

        /**
         * Exist value in array or not
         */
        static inArray(array: any[], value: any): boolean;

        /**
         * Create array with random integer numbers
         */
        static createRandomArrayInt(lower: number, upper: number, count: number): number[];

        static createRandomiseArrayInt(lower: number, upper: number, count: number): number[];

        static createRandomiseArrayNumber(lower: number, upper: number, count: number): number[];

        static getCashString(value: any, centWith2Zero?: boolean, delaySymbol?: string): string;

        /**
         * Shuffles array in place. ES6 version
         */
        static shuffle(arr: any[]): any[];

        /**
         * Generate pseudo unique ID with ~13 chars
         * @return {string}
         */
        static uniqueID(): string;

        /**
         * Make deep copy of json object
         * @param {Object} src
         * @return {Object}
         */
        static jsonCopy(src: object): object;

        /**
         * Make deep copy from json copy object to parent json object
         * @param {Object} parent
         * @param {Object} copy
         * @param {Boolean} force
         * @return
         */
        static objectCopy(parent: object, copy: object, force?:boolean): void;

        static convertNumb(src: number): string;
    }

    export class StringUtils {
        /** Add padString before target string */
        static lpad(str: string, padString: string, length: number): string;

        /** Add padString after target string */
        static rpad(str: string, padString: string, length: number): string;

        /** Add zeros before target string */
        static padZeros(str: string, length: number): string;

        /** Replace all occurrences of a string */
        static replaceAll(str: string, search: string, replacement: string): string;

        /** Extended method for char at position */
        static charAtExt(str: string, index: number): string;

        /** Return reversed string */
        static reverse(str: string): string;

        /**
         * Replace %s mark in str to value from arguments array
         * @param {String} str
         * @param {Array} args
         * @return {String}
         */
        static sprintf(str: string, ...args: string[]): string;

        /**
         * Replace custom mark in str to value from arguments array
         * @param {String} str
         * @param {String} separator
         * @param {Array} args
         * @return {String}
         */
        static sprintfCustom(str: string, separator: string, ...args: string[]): string;

        /**
         * Replace custom mark from array in str to value from arguments array
         * @param {String} str
         * @param {string[]} separators
         * @param {Array} args
         * @return {String}
         */
        static findAndReplace(str: string, separators: string[], ...args: string[]): string;

        /**
         * Generate random color
         * @param {string}clName
         * @param {string}fName
         * @param {string}line
         * @returns {string}
         */
        static color(clName?: string, fName?: string, line?: string): string;

        /**
         * Ponyfill for IE because it doesn't support `codePointAt`
         * @param {String}str
         * @return {String}
         */
        static extractCharCode(str: string): string;

        /**
         * Ponyfill for IE because it doesn't support `Array.from`
         * @param {String}text
         * @return {Array.<String>}
         */
        static splitTextToCharacters(text: string): string[];
    }

    export class OTextNumberBitmap extends OTextBitmap {
        constructor(text: any, style: any);

        /**
         * @param {number} value
         * @param {boolean} incAnimNow
         * @param {string} ease default='Power0.easeNone'
         */
        setNumbers(value: any, incAnimNow?: boolean, ease?: any): void;

        createText(): void;

        updateNumbers(): void;

        kill(): void;

        destroy(): any;

        stopInctAnimation(): void;

        pauseIncAnim(): void;

        continueIncAnim(): void;

        readonly value: number;
        specSymbol: any;
        zeroZeroType: any;
        onCompleteInc: any;
        incSecond: any;
        onStepInc: any;
        soundInc: any;
        hideIfZero: any;
        delaySymbol: any;
        simpleZero: any;
        lastText: any;
        firstText: any;
        showCent: any;
    }

    export class OTextNumberFont extends OTextFont {
        constructor(text: any, style: any, canvas: any);

        /**
         * @param {number} value
         * @param {boolean} incAnimNow
         * @param {string} ease default='Power0.easeNone'
         */
        setNumbers(value: any, incAnimNow?: boolean, ease?: any): void;

        createText(): void;

        updateNumbers(): void;

        kill(): void;

        destroy(): any;

        stopInctAnimation(): void;

        pauseIncAnim(): void;

        continueIncAnim(): void;

        readonly value: number;
        specSymbol: any;
        zeroZeroType: any;
        onCompleteInc: any;
        incSecond: any;
        onStepInc: any;
        soundInc: any;
        hideIfZero: any;
        delaySymbol: any;
        simpleZero: any;
        lastText: any;
        firstText: any;
        showCent: any;
    }

    export const Key: {
        BACKSPACE: number;
        TAB: number;
        ENTER: number;
        SHIFT: number;
        PAUSE: number;
        CTRL: number;
        ALT: number;
        CAPS_LOCK: number;
        ESCAPE: number;
        SPACE: number;
        PAGE_UP: number;
        PAGE_DOWN: number;
        END: number;
        HOME: number;
        LEFT: number;
        UP: number;
        RIGHT: number;
        DOWN: number;
        PRINT_SCREEN: number;
        INSERT: number;
        DELETE: number;
        _0: number;
        _1: number;
        _2: number;
        _3: number;
        _4: number;
        _5: number;
        _6: number;
        _7: number;
        _8: number;
        _9: number;
        A: number;
        B: number;
        C: number;
        D: number;
        E: number;
        F: number;
        G: number;
        H: number;
        I: number;
        J: number;
        K: number;
        L: number;
        M: number;
        N: number;
        O: number;
        P: number;
        Q: number;
        R: number;
        S: number;
        T: number;
        U: number;
        V: number;
        W: number;
        X: number;
        Y: number;
        Z: number;
        CMD: number;
        CMD_RIGHT: number;
        NUM_0: number;
        NUM_1: number;
        NUM_2: number;
        NUM_3: number;
        NUM_4: number;
        NUM_5: number;
        NUM_6: number;
        NUM_7: number;
        NUM_8: number;
        NUM_9: number;
        MULTIPLY: number;
        ADD: number;
        SUBTRACT: number;
        DECIMAL_POINT: number;
        DIVIDE: number;
        F1: number;
        F2: number;
        F3: number;
        F4: number;
        F5: number;
        F6: number;
        F7: number;
        F8: number;
        F9: number;
        F10: number;
        F11: number;
        F12: number;
        NUM_LOCK: number;
        SCROLL_LOCK: number;
        SEMI_COLON: number;
        EQUAL: number;
        COMMA: number;
        DASH: number;
        PERIOD: number;
        FORWARD_SLASH: number;
        OPEN_BRACKET: number;
        BACK_SLASH: number;
        CLOSE_BRACKET: number;
        SINGLE_QUOTE: number;
    };

    export class OContainer extends PIXI.Container {
        constructor();

        addChild(child: any): any;

        addChildAt(child: any, index: any): any;

        removeChild(child: any): any;

        removeChildAt(index: any): any;

        removeChildren(beginIndex: any, endIndex: any): any[];

        removeAll(): void;

        /**
         * @param {PIXI.DisplayObject} child
         * @returns {boolean}
         */
        contains(child: any): boolean;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(): void;

        /**
         * @param {string} aVariableName
         * @param {Object} aValue
         */
        setAll(aVariableName: any, aValue: any): void;

        /**
         * @param {string} aFunctionName
         * @param {Array} aArgs
         */
        callAll(aFunctionName: any, aArgs?: any): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        updateAnchor(): void;

        /**
         * @param {Function} eMethod
         * @param {Array} methodParams
         */
        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        setToCenter(): void;

        alignContainer(): void;

        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: any;
        anchorY: any;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        x: any;
        y: any;
        height: any;
        width: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        interactChild: any;
        readonly canvas: OContainer;
        alignX: number;
        alignY: number;
        readonly numChildren: number;
        soundUp: string;
        soundOver: string;
    }

    export class ORevoltParticleEmitter extends OParticleContainer {
        constructor(revoltName: string, autoStart?: boolean, scaleMod?: number,
                    maxSize?: number, properties?: object, batchSize?: number, autoResize?: boolean);

        kill(): void;

        revive(): void;

        forceParticleUpdate(): void;

        destroy(options?: any): void;

        start(): void;

        stop(waitForParticles?: boolean): void;

        spawn(): void;

        addStarted(func: any, context: any, once: boolean): void;

        addCompleted(func: any, context: any, once: boolean): void;

        addParticleUpdated(func: any, context: any, once: boolean): void;

        addParticleSpawned(func: any, context: any, once: boolean): void;

        addParticleBounced(func: any, context: any, once: boolean): void;

        addParticleDied(func: any, context: any, once: boolean): void;

        removeStarted(func: any): void;

        removeCompleted(func: any): void;

        removeParticleUpdated(func: any): void;

        removeParticleSpawned(func: any): void;

        removeParticleBounced(func: any): void;

        removeParticleDied(func: any): void;

        readonly particle: object;

        infinite: boolean;

        target: object;

        targetOffset: number;

        paused: boolean;
    }

    export class ORevoltParticleSequence extends OParticleContainer {
        constructor(revoltName: string, delay?: number, autoStart?: boolean, scaleMod?: number,
                    maxSize?: number, properties?: object, batchSize?: number, autoResize?: boolean);

        kill(): void;

        revive(): void;

        forceParticleUpdate(): void;

        destroy(options?: any): void;

        start(): void;

        addStarted(func: any, context: any, once: boolean): void;

        addCompleted(func: any, context: any, once: boolean): void;

        removeStarted(func: any): void;

        removeCompleted(func: any): void;

        readonly particle: object;
    }

    export class OSprite extends PIXI.Sprite {
        /**
         * @param {PIXI.Texture} texture - The texture for this sprite
         * @param {string} atlas name if texture in atlas
         */
        constructor(texture: any, atlas?: any);

        addChild(child: any): any;

        addChildAt(child: any, index: any): any;

        removeChild(child: any): any;

        removeChildAt(index: any): any;

        removeChildren(beginIndex: any, endIndex: any): any[];

        /**
         * @param {PIXI.DisplayObject} child
         * @returns {boolean}
         */
        contains(child: any): boolean;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(): void;

        calculateVertices(): void;

        onLocalisation(textureName: any): void;

        changeAtlas(atlas: any, texture?: any): void;

        /**
         * @param {string} aVariableName
         * @param {Object} aValue
         */
        setAll(aVariableName: any, aValue: any): void;

        /**
         * @param {string} aFunctionName
         * @param {Array} aArgs
         */
        callAll(aFunctionName: any, aArgs?: any): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        /**
         * @param {Function} eMethod
         * @param {Array} methodParams
         */
        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: number;
        anchorY: number;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        x: any;
        y: any;
        height: any;
        width: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        textureName: any;
        texture: any;
        interactChild: any;
        readonly atlas: any;
        soundUp: string;
        soundOver: string;
    }

    export class OButton extends OSprite {
        constructor(outTexture: any, atlas?: any, overTexture?: any, downTexture?: any, blockTexture?: any, conf?: any);

        changeTextures(outFrame: any, overFrame?: any, downFrame?: any, blockFrame?: any): void;

        revive(): void;

        kill(): void;

        destroy(options?: any): void;

        onDoAction(): void;

        blockButton(state?: boolean): void;

        label: any;
        hintLabel: any;
        isBlock: any;
        oneClick: any;
    }

    export class OButtonMod extends OSprite {
        constructor(parent: any, json: object);

        revive(): void;

        kill(): void;

        destroy(options?: any): void;

        protected setActiveStates(...args): void;

        protected setNoActiveStates(...args): void;

        protected changeTextures(outFrame: any, overFrame?: any, downFrame?: any, blockFrame?: any): void;

        protected checkState(): void;

        protected onActive(): void;

        protected onBlock(): void;

        protected onHide(): void;

        protected onKeyHandler(): void;

        protected onDoAction(): void;

        protected alwaysAvailable: boolean;

        labelText: string;
        hintLabelText: string;
        isBlock: boolean;
        oneClick: boolean;
    }

    export class OButtonTween extends OButton {
        constructor(outTexture: any, atlas?: any, overTexture?: any, downTexture?: any, blockrTexture?: any, json?: any);

        revive(): void;

        destroy(options?: any): void;

        setScale(ax: any, ay: any): void;

        scaleX: number;
        scaleY: number;
    }

    export class OPoint extends PIXI.Point {
        constructor(x?: number, y?: number);

        /**
         * @param {OPoint} p
         * @returns {OPoint}
         */
        copyFrom(p: any): void;

        /**
         * @param {OPoint} p
         * @returns {OPoint}
         */
        multiplyPoint(p: any): void;

        /**
         * @param {number} value
         * @returns {OPoint}
         */
        multiply(value: any): void;

        /**
         * @param {OPoint} p
         * @returns {OPoint}
         */
        dividePoint(p: any): void;

        /**
         * @param {number} value
         * @returns {OPoint}
         */
        divide(value: any): void;

        readonly length: number;

        /**
         * @param {number} aX
         * @param {number} aY
         * @param {number} aDiff
         * @return {boolean}
         */
        equal(aX: any, aY: any, aDiff?: number): boolean;

        /**
         * @param {OPoint} p
         * @param {number} aDiff
         * @return {boolean}
         */
        equalPoint(p: any, aDiff: any): boolean;

        toString(): string;
    }

    export class OGraphic extends PIXI.Graphics {
        constructor(nativeLines: any);

        /**
         * @param {Boolean}clear, default=false
         */
        drawByJson(clear: boolean);

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(): void;

        getBounds(skipUpdate: boolean, rect: any): PIXI.Rectangle;

        getLocalBounds(rect: any): PIXI.Rectangle;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        /**
         * @param {Function} eMethod
         * @param {Array} methodParams
         */
        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        addKill(func: any, context: any, once?: any): void;

        addRevive(func: any, context: any, once?: any): void;

        addDestroy(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        removeKill(func: any, context: any): void;

        removeRevive(func: any, context: any): void;

        /**
         * @deprecated
         */
        removDestroy(func: any, context: any): void;

        removeDestroy(func: any, context: any): void;

        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        interactChild: any;
        soundUp: string;
        soundOver: string;
    }

    export class OCheckBoxTween extends OButtonTween {
        constructor(outTexture: any, atlas?: any, json?: object);

        addOtherStates(data: any): void;

        addNoActiveState(data: any): void;

        destroy(options?: any): void;

        isChecking: any;
    }

    export class OCheckBox extends OButton {
        constructor(outTexture: any, atlas?: any, json?: object);

        addOtherStates(data: any): void;

        addNoActiveState(data: any): void;

        destroy(options?: any): void;

        isChecking: any;
    }

    export class OParticleContainer extends PIXI.ParticleContainer {
        constructor(maxSize?: number, properties?: object, batchSize?: number, autoResize?: boolean);

        addChild(child: any): any;

        addChildAt(child: any, index: any): any;

        removeChild(child: any): any;

        removeChildAt(index: any): any;

        removeChildren(beginIndex: any, endIndex: any): any[];

        removeAll(): void;

        /**
         * @param {PIXI.DisplayObject} child
         * @returns {boolean}
         */
        contains(child: any): boolean;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(delta: any): void;

        setXY(ax: any, ay: any): void;

        setSize(ax: any, ay: any): void;

        setScale(ax: any, ay: any): void;

        setAnchor(ax: any, ay: any): void;

        setPivot(ax: any, ay: any): void;

        updateAnchor(): void;

        externalMethod(eMethod: any, methodParams?: any[]): void;

        boundsDragRect(rXMin?: number, rYMin?: number, rXMax?: number, rYMax?: number): void;

        addOver(func: any, context: any, once?: any): void;

        addOut(func: any, context: any, once?: any): void;

        addDown(func: any, context: any, once?: any): void;

        addUp(func: any, context: any, once?: any): void;

        addUpOutSide(func: any, context: any, once?: any): void;

        addDragUpdate(func: any, context: any, once?: any): void;

        addDragStart(func: any, context: any, once?: any): void;

        addDragStop(func: any, context: any, once?: any): void;

        removeOver(func: any, context: any): void;

        removeOut(func: any, context: any): void;

        removeDown(func: any, context: any): void;

        removeUp(func: any, context: any): void;

        removeUpOutSide(func: any, context: any): void;

        removeDragUpdate(func: any, context: any): void;

        removeDragStart(func: any, context: any): void;

        removeDragStop(func: any, context: any): void;

        isUpdate: any;
        readonly active: any;
        scaleX: number;
        scaleY: number;
        pivotX: number;
        pivotY: number;
        anchorX: any;
        anchorY: any;
        readonly localLeft: number;
        readonly localRight: number;
        readonly localTop: number;
        readonly localBottom: number;
        readonly localWidth: number;
        readonly localHeight: number;
        readonly globalLeft: number;
        readonly globalTop: number;
        readonly worldX: number;
        readonly worldY: number;
        x: any;
        y: any;
        height: any;
        width: any;
        readonly oType: any;
        input: any;
        drag: any;
        allowHorizontalDrag: any;
        allowVerticalDrag: any;
        interactChild: any;
    }

    export class OParticle extends OParticleContainer {
        constructor(maxSize?: number, properties?: object, batchSize?: number, autoResize?: boolean);

        addEmitter(emitter: any): void;

        play(once?: boolean, onComplete?: any, removeOnEnd?: boolean): void;

        stop(): void;

        emitNow(): void;

        updateOwnerPos(x: any, y: any): void;

        updateSpawnPos(x: any, y: any): void;

        kill(): void;

        clear(): void;

        revive(): void;

        destroy(options?: any): void;

        update(delta: any): void;

        getEmitter(id?: number): PIXI.particles.Emitter;

        getFrequency(id?: number): number;

        setFrequency(frequency: number, id?: number): void;

        getBehavior(type: string, id?: number): object;

        readonly numEmitters: number;

        static moveAcceleration: string;
        static alpha: string;
        static alphaStatic: string;
        static color: string;
        static colorStatic: string;
        static movePath: string;
        static rotation: string;
        static rotationStatic: string;
        static scale: string;
        static scaleStatic: string;
        static moveSpeed: string;
        static moveSpeedStatic: string;
    }

    export class ONeutrinoParticles extends OContainer {
        constructor(json: object);

        /** @public
         * @param {object}emitter
         * @return number
         */
        addEmitter(emitter: object): number;

        /** @public
         * Unpauses the effect.
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         * */
        play(emitterName?: string, name?: string): void;

        /** @public
         * Pauses the effect. All active particles will freeze.
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         * */
        stop(emitterName?: string, name?: string): void;

        /** @public
         * Unpauses generators in the effect.
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         * */
        unpauseGenerators(emitterName?: string, name?: string): void;

        /** @public
         * Pauses all generators in the effect. No new particles will be generated. All current particles will continue to update.
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         * */
        pauseGenerators(emitterName?: string, name?: string): void;

        /** @public
         * Activate effect or emitter
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         * */
        activate(emitterName: string, name?: string): void;

        /** @public
         * Deactivate effect or emitter
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         * */
        disactivate(emitterName: string, name?: string): void;

        /** @public
         * Restarts the effect.
         * @param {Array}position, A new position of the effect or null to keep the same position.
         * @param {Array}rotation, A new rotation of the effect of null to keep the same rotation.
         * @param {String}name, Name of effect.
         */
        restart(position?: any, rotation?: any, name?: string): void;

        /** @public
         * Instant change of position/rotation of the effect. Teleport
         * @param {Array}position, A new position of the effect or null to keep the same position.
         * @param {Array}rotation, A new rotation of the effect of null to keep the same rotation.
         * @param {String}name, Name of effect.
         */
        resetPosition(position?: any, rotation?: any, name?: string): void;

        /** @public
         * Restart all effects and stop
         * @param {String}name, Name of effect.
         */
        reset(name?: string): void;

        kill(): void;

        revive(): void;

        destroy(options?: any): void;

        update(delta: any): void;

        zeroUpdate(): void;

        /**
         * @param {Number}id
         * @returns {null|PIXINeutrino.Effect}
         */
        getEffect(id?: number): PIXINeutrino.Effect;

        /**
         * @param {String}name
         * @returns {null|PIXINeutrino.Effect}
         */
        getEffectByName(name?: string): PIXINeutrino.Effect;

        /** @public
         * Get emitter from effect.
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         * @returns {object}
         */
        getEmitterByName(emitterName: string, name?: string): object;

        /** @public
         * Sets a value of emitter property in all emitters of the effect.
         * @param {String}nameParam, Name of property.
         * @param {Number|Array}value, Value of property. It can be a Number, 2-, 3- or 4-component Array depending on a property you want to set.
         * @param {String}emitterName, Name of effects emitter.
         * @param {String}name, Name of effect.
         */
        setPropertyEmitters(nameParam: string, value: number, emitterName?: string, name?: string): void;

        /** @public
         * Calc num of particles by names params. All null - all particles on all effects.
         * @param {String}name, Name of effect.
         * @param {String}emitterName, Name of effects emitter.
         * @returns {number}
         */
        getNumParticles(name?: string, emitterName?: string): number;

        /** @public
         * Get, are this np effect (or someone) playing now.
         * @param {String}name, Name of effect.
         * @returns {boolean}
         */
        playing(name?: string): boolean;

        /**@public
         * Add listener for event onComplete
         * @param {function} func - add method for listener
         * @param {*} context - add display object who have listener
         * @param {boolean} [once=false]once - emit only one time
         * @return {null}
         */
        addComplete(func: Function, context: object, once?: boolean): void;

        /**@public
         * remove listener for event onComplete
         * @param {function} func - add method for listener
         * @param {*} context - add display object who have listener
         * @return {null}
         */
        removeComplete(func: Function, context: object): void;

        /**@public
         * Add listener for event startPlay
         * @param {function} func - add method for listener
         * @param {*} context - add display object who have listener
         * @param {boolean} [once=false]once - emit only one time
         * @return {null}
         */
        addStartPlay(func: Function, context: object, once?: boolean): void;

        /**@public
         * Remove listener for event startPlay
         * @param {function} func - add method for listener
         * @param {*} context - add display object who have listener
         * @return {null}
         */
        removeStartPlay(func: Function, context: object): void;

        readonly numEffects: number;
        removeOnEnd: boolean;
        killOnEnd: boolean;
        /** @public
         * Calc num of particles.
         * @returns {number}
         */
        readonly numActiveParticles: number;
        loop: boolean;
    }

    export class Factory {
        constructor(gameCache: any);

        formatObjectsByY(container: OContainer): void;

        parseJson(json: any): void;

        createRevoltParticleEmitter(parent?: any, x?: number, y?: number, revoltName?: string, autoStart?: boolean, scaleMod?: number): ORevoltParticleEmitter;

        revoltParticleEmitter(parent: any, json: any, revoltName?: string): ORevoltParticleEmitter;

        createRevoltParticleSequence(parent?: any, x?: number, y?: number, revoltName?: string, delay?: number, autoStart?: boolean, scaleMod?: number): ORevoltParticleSequence;

        revoltParticleSequence(parent: any, json: any, revoltName?: string): ORevoltParticleSequence;

        button(type: any, parent?: any, x?: number, y?: number, out?: any, atlas?: any, over?: any, down?: any, block?: any, externalMethod?: any, methodParams?: any, debug?: number): any;

        buttonJson(parent?: any, json?: object, externalMethod?: any, methodParams?: any[], btnClass?: any): any;

        btnJson(parent: any, json: any, btnClass: any): any;

        /**
         * Create container from json
         * @param {*} parent
         * @param {Object} json
         * @returns {OContainer}
         */
        containerJson(parent: any, json: { x?: number, y?: number, debug?: boolean, interactiveChildren?: boolean }): OContainer;

        container(parent?: any, x?: number, y?: number, debug?: boolean | number, interactiveChildren?: boolean): OContainer;

        particleContainer(parent?: any, x?: number, y?: number, debug?: boolean | number, interactiveChildren?: boolean): OParticleContainer;

        sprite(parent?: any, x?: number, y?: number, texture?: string, atlas?: string, debug?: number): OSprite;

        spriteJson(parent: any, jsonO: any): OSprite;

        emitterJson(parent: any, jsonO: any): void;

        particleJson(parent: any, jsonO: any, ParticleClass?: any): any;

        neutrinoParticlesJson(parent: any, jsonO: any): ONeutrinoParticles;

        sliderJson(parent: any, jsonO: any): OSlider;

        textJson(parent: any, jsonContext: any, textValue?: string): OTextFont | OTextNumberFont | OTextBitmap | OTextNumberBitmap;

        /**
         * Create animation actor from sprite sheet
         * @param {*} parent
         * @param {Object} conf
         * @param {string} conf.type
         * @param {string} conf.cacheName - if it is undefined take nameAnimation
         * @param {string} conf.nameAnimation
         * @param {string} conf.textures
         * @param {boolean} [conf.play=false] - play animation after creation
         * @param {boolean} [conf.playLoop=false] - loop animation when play it after creation
         * @param {boolean} [conf.debug=false] - setup debug mode for created object
         * @return {OActor | OActorSpine}
         */
        actorJson(parent: any, conf: any): OActor | OActorSpine;

        /**
         * @param {*} parent
         * @param {Object} conf
         * @param {int} startFrom
         * @param {string} tName
         * @param {Function} onCreateField
         */
        createTexts(parent: any, conf: any, startFrom?: number, tName?: string, onCreateField?: any): void;

        /**
         * @param {*} parent
         * @param {Object} conf
         * @param {int} startFrom
         * @param {string} iName
         * @param {Function} onCreateImg
         */
        createSprites(parent: any, conf: any, startFrom?: number, iName?: string, onCreateImg?: any): void;

        /**
         * @param {*} parent
         * @param {Object} conf
         * */
        createEntities(parent: any, conf: any): void;

        /** Creates a tween going TO the given values.
         * @link: https://greensock.com/docs/v3/GSAP
         * @link: https://greensock.com/docs/v3/Eases
         * @link: https://greensock.com/docs/v3/GSAP/gsap.to()
         * @param {*}obj
         * @param {Object}params
         * @param {Number}sec
         * @param {Function}onComplete
         * @param {Object}setting
         * @param {gsap.core.Timeline}timeline
         * @param {number | string}position
         * @returns {gsap.core.Tween | gsap.core.Timeline}
         */
        tween(obj: any, params: any, sec: any, onComplete?: CallbackFunction, setting?: any, timeline?: gsap.core.Timeline, position?: number | string): gsap.core.Tween | gsap.core.Timeline;

        /**Creates a new timeline, used to compose sequences of tweens.
         * @link: https://greensock.com/docs/v3/GSAP/gsap.timeline()
         * @param {Object}vars
         * @param {Object}defaults
         * @returns {gsap.core.Timeline}
         */
        tweenTimeline(vars?: any, defaults?: any): gsap.core.Timeline;

        /**
         * Add timer ticker
         * @param {number} sec - time
         * @param {Function} onComplete
         * @param {Object} contextObj
         * @param {number} repeat
         * @param {boolean} loop
         * @param {boolean} removeOnEnd
         * @param {number} delay, sec
         * @param {Array} params
         * @returns {OTicker}
         */
        timer(sec: number, onComplete: CallbackFunction, contextObj?: any, repeat?: number, loop?: boolean, removeOnEnd?: boolean, delay?: number, params?: any[]): OTicker;

        graphic(parent?: any, x?: number, y?: number): OGraphic;

        /**
         * Draw rectangle graphics
         * @param {*} parent
         * @param {Object} conf
         * @param {number} [conf.x=0]
         * @param {number} [conf.y=0]
         * @param {number} [conf.width=1]
         * @param {number} [conf.height=1]
         * @param {number} [conf.color=0x000000]
         * @param {number} [conf.alpha=1.0]
         * @param {string} [conf.name]
         * @param {boolean} [conf.debug=false]
         * @return {OGraphic}
         */
        rectJson(parent: any, conf: { x?: number, y?: number, width?: number, height?: number, color?: number, alpha?: number, debug?: boolean }): OGraphic;

        /**
         * Draw rectangle graphics
         * @public
         * @param {*} parent
         * @param {Object} conf
         * @param {number} [conf.x=0]
         * @param {number} [conf.y=0]
         * @param {number} [conf.width=1]
         * @param {number} [conf.height=1]
         * @param {number} [conf.color=0x000000]
         * @param {number} [conf.alpha=1.0]
         * @param {string} [conf.name]
         * @param {number} [conf.typeDraw=0] 0-rect, 1-circle, 2-ellipse, 3-polygon, 4-roundedrect
         * @param {boolean} [conf.debug=false]
         * @return {OGraphic}
         */

        graphicJson(parent: any, conf: { x?: number, y?: number, width?: number, height?: number, color?: number, alpha?: number, typeDraw?: number, debug?: boolean }): OGraphic;

        graphicRectTexture(width?: number, height?: number, tAlpha?: number, color?: number): OGraphic;

        /**
         * generate pixi texture from displayObject
         * @param {PIXI.DisplayObject}graphic
         * @param {object}option
         * @param {	PIXI.SCALE_MODES}options.scaleMode, LINEAR, NEAREST
         * @param {Number}options.resolution
         * @param {PIXI.MSAA_QUALITY}options.multisample, default=NONE, LOW, MEDIUM, HIGH
         * @param {string}name
         * @param {boolean}deep
         * @returns {PIXI.RenderTexture}
         */
        generateTextureFrom(graphic, option?: object, name?: string, deep?:boolean): PIXI.RenderTexture;

        tint(tAlpha?: number, color?: number): OGraphic;

        point(x?: number, y?: number): OPoint;

        /**
         * Add mask graphic by configuration object
         * @param {*} parent
         * @param {Object} conf
         * @param {number} conf.x=0
         * @param {number} conf.y=0
         * @param {number} conf.width=100
         * @param {number} conf.height=100
         * @param {boolean} conf.debug=false
         * @returns {PIXI.Rectangle}
         */
        maskRectJson(parent: any, conf: any): OGraphic;

        /**
         * Add mask graphic
         * @param {*} parent
         * @param {number} x=0
         * @param {number} y=0
         * @param {number} width=100
         * @param {number} height=100
         * @param {boolean} debug=false
         * @returns {OGraphic}
         */
        maskRect(parent?: any, x?: number, y?: number, width?: number, height?: number, debug?: number): OGraphic;

        /**
         * Add hit area to graphic object
         * @param {*} parent
         * @param {Object} options
         * @param {number} options.x=0
         * @param {number} options.y=0
         * @param {number} options.width=0
         * @param {number} options.height=0
         * @param {number} options.type=0
         * @param {boolean} options.debug=false
         * @returns {PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle }
         */
        hitAreaJson(parent: any, options: any): void;

        /**
         * @param parent
         * @param option = {x:0, y:0, width:0, height:0}
         * @param type Rectangle:0 | Circle:1 | Ellipse:2 | Polygon:3 | RoundedRectangle:4
         * @param {boolean} [debug=false]
         * @returns {PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle }
         */
        hintArea(parent: any, option?: any, type?: number, debug?: boolean): void;

        /**
         * Add DisplayObject into Layer Group
         * @param {*} displayObject
         * @param {PIXI.display.Group} group
         */
        addToLayer(displayObject: any, group: PIXI.display.Group): void;

        addObjectToCheckDebug(o: any): void;

        regDebugMode(o: any): any;

        removeFromDebug(o: any): number;
    }

    export class Destroyer {
        constructor(gameCache: any);

        /**
         * @param{OTicker} timer
         */
        timer(timer: OTicker): void;

        /**
         * kill tween of target
         * @param{Object} target
         * @param{Object} vars
         */
        tween(target: object, vars?: object): void;

        actorAtlas(a: any): void;

        revoltParticleEmitter(particle: any): void;

        revoltParticleSequence(particle: any): void;

        /**
         * Remove DisplayObject from Layer Group and return render in parent
         * @param {*} displayObject
         */
        removeFromLayer(displayObject: any): void;
    }

    export class Localization {
        constructor();

        addGraphic(sprite: any): void;

        setLanguageMap(option: object): void;

        changeLauguage(newL: any): void;

        startLoading(): void;

        addBufferText(saveName: any, text: any): void;

        updateLocalization(param?: any[]): void;

        setLoc(data: any): void;

        getText(name: any, param?: any[]): any;

        addLocAtlas(conf: any): void;

        removeLocAtlas(confName: any): void;

        addLocImg(conf: any): void;

        removeLocImg(confName: any): void;

        checkLocalisation(name: any): boolean;

        addUpdate(func: any, context?: any, once?: boolean): void;

        removeUpdate(func: any, context?: any): void;

        addUpdateStart(func: any, context?: any, once?: boolean): void;

        removeUpdateStart(func: any, context?: any): void;

        addUpdateEnd(func: any, context?: any, once?: boolean): void;

        removeUpdateEnd(func: any, context?: any): void;

        addTintWorkCallback(func: any, context?: any, once?: boolean): void;

        removeTintWorkCallback(func: any, context?: any): void;

        initPOEditor(apiToken: string, key: number, languages: string[], languageIds: string[], gameKey: string): void;

        loadCurrentLanguage(callback: Function, context: Object): void;

        readonly exists: boolean;
        canChangaLanguage: any;
        basePath: any;
        readonly poEditorEnabled: boolean;
    }

    export class KeyManager {
        constructor();

        blockBrowserHotKeys: boolean;

        downDuration(key: any, durationSec: any): boolean;

        isDown(key: any): any;

        isPressed(key: any): any;

        isReleased(key: any): any;

        /**
         * @param {number} key
         * @param {Function} func
         * @param {*} context
         */
        registerFunction(key: any, func: any, context: any): void;

        /**
         * @param {number} key
         * @param {Function} func
         * @param {*} context
         */
        unregisterFunction(key: any, func: any, context: any): void;

        /**
         * @param {number} key
         */
        unregisterAllFunction(key: any): void;

        addAnyKey(onHandler, context: object): void;

        removeAnyKey(onHandler, context: object): void;
    }

    export class OSound {
        constructor();

        add2Lib(type: string, name: string, sound: any): void;

        play(sName: string, loop?: boolean, forceRestart?: boolean, volume?: number): void;

        playById(id: number): void;

        stop(sName: string): void;

        stopById(id: number): void;

        pause(sName: string): void;

        resume(sName: string): void;

        fadeIn(sName: string, sec: number): void;

        fadeOut(sName: string, sec: number): void;

        fadeTo(sName: string, sec: number, volume: number): void;

        fade(sName: string, sec: number, fromVolume: number, toVolume: number): void;

        getSound(sName: string): any;

        getSoundVolume(sName: string): number;

        isSoundPlay(sName: string): boolean;

        isIdPlay(id: number): boolean;

        volume(value: number): void;

        mute(): void;

        unmute(): void;

        toggleMute(): void;

        toggleSoundMute(): void;

        toggleMusicMute(): void;

        addPlayEndEvent(s_name: any, f: any, c: any, once?: boolean): void;

        removePlayEndEvent(s_name: any, f: any): void;

        addPlayEvent(s_name: any, f: any, c: any, once?: boolean): void;

        removePlayEvent(s_name: any, f: any): void;

        addPauseEvent(s_name: any, f: any, c: any, once?: boolean): void;

        removePauseEvent(s_name: any, f: any): void;

        addStopEvent(s_name: any, f: any, c: any, once?: boolean): void;

        removeStopEvent(s_name: any, f: any): void;

        addFadeEvent(s_name: any, f: any, c: any, once?: boolean): void;

        removeFadeEvent(s_name: any, f: any): void;

        isSoundExist(s_name: string): boolean;

        pauseAll(): void;

        resumeAll(): void;

        readonly emit: any;
        readonly isMute: boolean;
        readonly isMuteSound: boolean;
        readonly isMuteMusic: boolean;
        readonly curVolume: number;

        static EMIT_PLAY_START_SOUND: string;
        static EMIT_PLAY_END_SOUND: string;
    }

    export class AssetsManager extends PIXI.utils.EventEmitter {
        constructor();

        startLoad(): void;

        addResolution(config: array): void;

        loadJson(nameRes: any, urlRes: any): void;

        loadLocal(nameRes: any, urlRes: any): void;

        loadImage(nameRes: any, urlRes: any, loadData: object): void;

        loadAtlas(nameRes: any, urlRes: any, loadData: object): void;

        loadAnimationAtlas(nameRes: any, urlRes: any, loadData: object): void;

        loadSpine(nameRes: any, urlRes: any, loadData: object): void;

        loadBitmapFont(nameRes: any, urlRes: any, loadData: object): void;

        createBitmapFont(json: object): void;

        loadAudioSprite(nameRes: any, urlRes: any): void;

        loadAudio(nameRes: string, urlRes: string, loadData?: object): void;

        loadNeutrino(nameRes: any, urlRes: any, volume?: number, type?: string): void;

        initBundle(revoltName: string): void;

        getJSON(name: any): any;

        generateTextures(json: object): void;

        getTexture(texture: any, atlas?: any): typeof PIXI.Texture;

        getAnimation(name: any): any;

        getSpineData(name: any): any;

        getSpriteSheet(name: any): any;

        cacheAnimations(onComplete?: any): any;

        clearAnimMap(): any;

        addFontLocMap(locMapObject: object): any;

        /**
         * add new font chars to BitmapFont
         * @param {String}fontName
         * @param {String}chars
         * @param {Object}fontConfig
         */
        addChars2BitmapFont(fontName:string, chars:string, fontConfig: object): any;
    }

    export class ViewManager extends OContainer {
        constructor();

        addTopGui(gui: any): void;

        addPageGui(gui: any): void;

        toTopLayer(): void;

        toBottomLayer(): void;

        /**
         * @param {string} wName
         * @param {number} layer
         */
        showView(wName: any, layer?: number): any;

        /**
         * @param {string} wName
         * @param {number} layer
         */
        hideView(wName: any, layer?: number): any;

        /**
         * @param {string} wName
         * @param {boolean} removeOther
         * @param {OContainer} customLayer
         */
        showWindowTop(wName: any, removeOther?: boolean, customLayer?: any): any;

        /**
         * @param {string} wName
         * @param {boolean} removeOther
         * @param {OContainer} customLayer
         */
        showWindow(wName: any, removeOther?: boolean, customLayer?: any): any;

        /**
         * @param {string} wName
         */
        hideWindow(wName: any): any;

        getView(wName: any): any;

        isViewExist(wName: string): boolean;

        /**
         * @param {OContainer} view
         * @param {string} wName
         */
        regWO(view: any, wName: any): void;

        /**
         * Add event listener for opening of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         * @param {boolean} [once=false]
         */
        addOpenWindow(name: string, fn: CallbackFunction, context?: any, once?: boolean);

        /**
         * Remove event listener for opening of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         */
        removeOpenWindow(name: string, fn: CallbackFunction, context?: any);

        /**
         * Add event listener for closing of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         * @param {boolean} [once=false]
         */
        addCloseWindow(name: string, fn: CallbackFunction, context?: any, once?: boolean);

        /**
         * Remove event listener for closing of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         */
        removeCloseWindow(name: string, fn: CallbackFunction, context?: any);

        /**
         * Add event listener for start opening of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         * @param {boolean} [once=false]
         */
        addStartOpenWindow(name: string, fn: CallbackFunction, context?: any, once?: boolean);

        /**
         * Remove event listener for start opening of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         */
        removeStartOpenWindow(name: string, fn: CallbackFunction, context?: any);

        /**
         * Add event listener for start closing of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         * @param {boolean} [once=false]
         */
        addStartCloseWindow(name: string, fn: CallbackFunction, context?: any, once?: boolean);

        /**
         * Remove event listener for start closing of target window
         * @param {string} name
         * @param {Function} fn
         * @param {*} [context=null]
         */
        removeStartCloseWindow(name: string, fn: CallbackFunction, context?: any);

        addDestroyWindow(func: any, context?: any, once?: boolean): void;

        removeDestroyWindow(func: any, context?: any): void;

        addCreateWindow(func: any, context?: any, once?: boolean): void;

        removeCreateWindow(func: any, context?: any): void;

        addDestroyView(func: any, context?: any, once?: boolean): void;

        removeDestroyView(func: any, context?: any): void;

        addCreateView(func: any, context?: any, once?: boolean): void;

        removeCreateView(func: any, context?: any): void;

        /** Better to use gameUI */
        readonly topGui: any;
        /** Better to use gameUI */
        readonly pageGui: any;
        readonly gameUI: any;
    }

    export class NavigateBtns {
        constructor();

        updateState(state: any): void;

        updateLastState(): void;

        addBtn(btn: any, funcState?: any, funcBlock?: any): void;

        removeBtn(btn: any, funcState: any, funcBlock: any): void;

        addUpdateState(func: any, context?: any): void;

        addBlockState(func: any, context?: any): void;

        removeUpdateState(func: any, context?: any): void;

        removeBlockState(func: any, context?: any): void;

        blockingScreen(): void;

        globalBlockingScreen(): void;

        unBlockingScreen(): void;

        readonly state: any;
        readonly isScreenBlock: boolean;
    }

    export class OMouse {
        constructor();

        readonly isDown: any;
        readonly mouseX: any;
        readonly mouseY: any;
        readonly outGame: any;
        readonly isMouse: boolean;

        addDownMouse(onHandler: any, context?: any): void;

        /**
         * Add global mouse/touch handler
         * @param onHandler
         * @param context
         * @param [once=false]
         */
        addDownHandler(onHandler: any, context?: any, once?: boolean): void;

        removeDownMouse(onHandler: any, context?: any): void;

        /**
         * Add global mouse/touch handler
         * @param onHandler
         * @param context
         * @param [once=false]
         */
        addUpHandler(onHandler: any, context?: any, once?: boolean): void;

        removeUpMouse(onHandler: any, context?: any): void;
    }

    export class ScaleManager extends PIXI.utils.EventEmitter {
        constructor(app: any);

        newResizeHandler(): void;

        resize(): void;

        startFullScreen(container: any): void;

        stopFullScreen(): void;

        addFullChange(func: any, context?: any, once?: boolean): void;

        removeFullChange(func: any, context?: any): void;

        forceOrientation(onlyLandscape?: boolean, onlyPortrait?: boolean): void;

        addIncorrectOrientation(func: any, context?: any, once?: boolean): void;

        removeIncorrectOrientation(func: any, context?: any): void;

        readonly gameWidth: any;
        readonly gameHeight: any;
        readonly gameOrientation: any;
        readonly gameLandscapeScreenRatio: any;
        readonly gamePortraitScreenRatio: any;
        screenRatio: any;
        readonly isScreenPortrait: any;
        readonly isScreenLandscape: any;
        minWidth: any;
        minHeight: any;
        maxWidth: any;
        maxHeight: any;
        scaleMode: any;
        readonly isFullScreen: any;
        readonly incorrectOrientation: any;
    }

    export class OS {
        constructor();

        init(): void;
    }

    export class Browser {
        constructor(os: any);

        init(): void;

        readonly isWebpSupported: boolean;
        readonly isOggSupported: any;
    }

    export class Omy {
        static init(): void;

        static addUpdater(func: any, context?: any): void;

        static removeUpdater(func: any, context?: any): void;

        static addSecUpdater(func: any, context?: any): void;

        static removeSecUpdater(func: any, context?: any): void;

        /**
         * Move elements after update game size
         * @param {*} container
         * @param {number} dx
         * @param {number} dy
         * @param {boolean} isScreenPortrait
         */
        static updateGameSize(container: any, dx: number, dy: number, isScreenPortrait: boolean): void;

        static checkURL(): void;

        static skipHello(): void;

        static sayHello(): void;

        static log(...rest: any[]): void;

        static warn(...rest: any[]): void;

        static info(...rest: any[]): void;

        static group(...rest: any[]): void;

        static groupCollapsed(...rest: any[]): void;

        static groupEnd(): void;

        static error(...rest: any[]): void;

        static language: string;
        static assetsURL: string;
        static isDesktop: boolean;
        static scale: number;

        static game: OmyGame;

        static readonly isLocal: boolean;
        static readonly isOmy: boolean;
        static readonly allowConsole: boolean;
        static showFPS: boolean;
        static readonly URLCache: string;
        static URLCacheTournament: string;
        static readonly fps: number;
        static readonly debugMode: boolean;
        static readonly offWebpSupport: boolean;
        static readonly isWebGL: boolean;

        static readonly stage: PIXI.Container;
        static readonly add: Factory;
        static readonly remove: Destroyer;
        static readonly cache: GameCache;
        static readonly loc: Localization;
        static readonly keys: KeyManager;
        static readonly sound: OSound;
        static readonly assets: AssetsManager;
        static readonly viewManager: ViewManager;
        static readonly navigateBtn: NavigateBtns;
        static readonly mouse: OMouse;
        static readonly scaleManager: ScaleManager;
        static readonly OS: OS;
        static readonly browser: Browser;
        static readonly Ease: any;
        static readonly Random: any;
        static readonly version: string;
        static isScreenPortrait: boolean;
        static readonly renderer: PIXI.Renderer;
        static readonly loader: PIXI.Loader;
        static readonly resources: object;

        static WIDTH: number;
        static HEIGHT: number;
    }

    export class OmyGame extends PIXI.Application {
        constructor(config: any, customStage?:PIXI.display.Stage);

        start(): void;

        stop(): void;

        render(): void;

        addGameActive(func: any, context?: any, once?: boolean): void;

        addGameNoActive(func: any, context?: any, once?: boolean): void;

        removeGameActive(func: any, context?: any): void;

        removeGameNoActive(func: any, context?: any): void;

        updateRenderSetting(): void;

        addNextTickUpdate(func: any, context: any, methodParams?: any[]): void;

        gamePaused: boolean;
        readonly realTime: number;
        readonly stats: object;
        readonly emit: PIXI.utils.EventEmitter;
        stopOnVisibilityChange: boolean;
    }

    export class OSlider extends OSprite {
        constructor(texture: any, atlas: any, debugSlide?: boolean);

        setSliderData(min: any, max: any): void;

        setTargetData(min: any, max: any): void;

        forceUpdate(value: any): void;

        resetSlider(): void;

        updateSlidePos(): void;

        update(): void;

        addStopCallback(f: any, c: any): void;

        addUpdateCallback(f: any, c: any): void;

        addUpdateTargetCallback(f: any, c: any): void;

        removeStopCallback(f: any, c: any): void;

        removeUpdateCallback(f: any, c: any): void;

        removeUpdateTargetCallback(f: any, c: any): void;

        destroy(options?: any): void;

        vertical: any;
        target: any;
        isBlock: any;
        readonly percent: any;
    }

    export class OTicker {
        constructor(stopTime?: number);

        start(): void;

        stop(): void;

        reset(): void;

        destroy(): void;

        on(fnc: any, c: any, params?: any[]): void;

        onStart(fnc: any, c: any, once?: boolean): void;

        onEnd(fnc: any, c: any, once?: boolean): void;

        onRepeat(fnc: any, c: any, once?: boolean): void;

        onStop(fnc: any, c: any, once?: boolean): void;

        onUpdate(fnc: any, c: any): void;

        offStart(fnc: any, c: any): void;

        offEnd(fnc: any, c: any): void;

        offRepeat(fnc: any, c: any): void;

        offStop(fnc: any, c: any): void;

        offUpdate(fnc: any, c: any): void;

        time: number;
        readonly active: boolean;
        readonly isStarted: boolean;
        readonly isEnded: boolean;
        expire: boolean;
        delay: number;
        repeat: number;
        loop: boolean;
        readonly completeParams: [];
    }

    export class SimpleCache {
        constructor(targetClass: any, initialCapacity: any);

        get(): any;

        set(instance: any): void;

        clear(): void;

        getNewInstance(): any;
    }
}

declare namespace PIXI {
    namespace spine {
        class Spine {
        }
    }
}
