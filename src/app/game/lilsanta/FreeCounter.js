import {FreeCounterBase} from "../../../casino/display/FreeCounterBase";
import {AppG} from "../../../casino/AppG";
import {GameConstStatic} from "../../GameConstStatic";

export class FreeCounter extends FreeCounterBase {
    constructor(graphic) {
        super(graphic);

        this._graphic.visible = true;
        this._graphic.alpha = 0;
        AppG.emit.on(GameConstStatic.ADD_FREE_COUNTER, this._updateText, this);
        // OMY.Omy.viewManager.addOpenWindow(AppConst.W_FREE_GAME_BEGIN, this.startFree, this);
        // OMY.Omy.viewManager.addOpenWindow(AppConst.W_FREE_GAME_END, this.endFree, this);
        // OMY.Omy.loc.addUpdate(this._updateText, this);
    }

    _updateText(countFreeGame) {
        countFreeGame = countFreeGame || AppG.countFreeGame;
        this._tField.text = String(countFreeGame) + "/" + String(AppG.totalFreeGame);
        /*super._updateText();*/
    }

    _onMoreFreeEmit() {
        // super._onMoreFreeEmit();
    }

    /** @public */
    startFree() {
        super.startFree();
        this._graphic.alpha = 1;
        this._graphic.children.forEach(this._animateStart.bind(this));
    }

    /**
     * @param {PIXI.DisplayObject}child
     * @private
     */
    _animateStart(child) {
        child.alpha = 0;
        child.y += this._graphic.json["tween_dy_y"];
        OMY.Omy.add.tween(child, {y: child.json["y"]}, 0.3);
        OMY.Omy.add.tween(child, {alpha: 1, delay: 0.12}, 0.18);
    }

    /** @public */
    endFree() {
        this._graphic.children.forEach(this._animateEnd.bind(this));
    }

    /**
     * @param {PIXI.DisplayObject}child
     * @private
     */
    _animateEnd(child) {
        OMY.Omy.add.tween(child, {y: child.json["y"] + this._graphic.json["tween_dy_y"]}, 0.3);
        OMY.Omy.add.tween(child, {alpha: 0}, 0.12);
        OMY.Omy.add.timer(0.3, this.continueEndFree, this);
    }

    /**     * @private     */
    continueEndFree() {
        super.endFree();
        this._graphic.visible = true;
        this._graphic.alpha = 0;
    }
}
