import {RichBegin} from "./RichBegin";
import {RichGame} from "./RichGame";
import {RichEnd} from "./RichEnd";
import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";

export class RichFreeSpins {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._graphic.autoReviveChildren = false;
        this._gdConf = this._graphic.json;

        /** @type {RichBegin} */
        this._richBegin = new RichBegin(this._graphic.getChildByName("c_start"), this._closeRichBegin.bind(this));
        /** @type {RichGame} */
        this._richGame = new RichGame(this._graphic.getChildByName("c_game"));
        /** @type {RichEnd} */
        this._richEnd = new RichEnd(this._graphic.getChildByName("c_end"), this._closeRichEnd.bind(this));
        /** @type {OMY.OGraphic} */
        this._tint = this._graphic.getChildByName("r_tint");
        this._tint.input = true;

        AppG.emit.on(AppConst.APP_EMIT_RICH_START, this._startRichGame, this);
        AppG.emit.on(AppConst.APP_EMIT_RICH_END, this._finishRichGame, this);
        AppG.emit.on(AppConst.APP_EMIT_FORCE_START, this._forceShow, this);
        this._graphic.kill();

        if (this._gdConf["debugStart"]) this._startRichGame();
        else if (this._gdConf["debugGame"]) this._closeRichBegin();
        else if (this._gdConf["debugEnd"]) this._finishRichGame();

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _updateGameSize(dx, dy, isPortrait) {
        if (!this._graphic.active) return;
        AppG.updateGameSize(this._graphic);

        if (this._tint) {
            this._tint.x = -this._graphic.x;
            this._tint.y = -this._graphic.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }
    }

    /**     * @private     */
    _startRichGame() {
        this._graphic.revive();
        this._tint.revive();
        this._richBegin.show();
        this._updateGameSize();
    }

    /**     * @private     */
    _closeRichBegin() {
        if (!this._graphic.active) this._graphic.revive();
        this._tint.kill();
        this._richGame.show();
        this._updateGameSize();
    }

    /**     * @private     */
    _forceShow() {
        if (!this._graphic.active)
            this._graphic.revive();
        this._richGame.show();
        this._updateGameSize();
    }

    /**     * @private     */
    _finishRichGame() {
        if (!this._graphic.active) this._graphic.revive();
        this._tint.revive();
        this._richGame.hide();
        this._richEnd.show();
        this._updateGameSize();
    }

    /**     * @private     */
    _closeRichEnd() {
        this._graphic.kill();
    }
}