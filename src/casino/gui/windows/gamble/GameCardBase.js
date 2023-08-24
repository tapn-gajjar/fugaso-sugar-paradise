import {AppG} from "../../../AppG";

export class GameCardBase {
    /**
     * @param {OMY.OContainer}graphic
     */
    constructor(graphic) {
        this._gdConf = graphic.json;
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._graphic.addDestroy(this.destroy, this, true);

        /** @type {OMY.OSprite} */
        this._card = this._graphic.canvas.getChildByName("s_card");
        /** @type {OMY.OSprite} */
        this._cardSuit = this._graphic.canvas.getChildByName("s_card");
        /** @type {OMY.OSprite} */
        this._closeCard = this._graphic.canvas.getChildByName("s_close");
        this._closeTexture = this._gdConf['textures_close'];
        this._updateTime = this._gdConf["update_time"] || 10;
        this._timeMoveUp = this._gdConf["time_tween"] || 0.5;
        this._timeTurn = this._gdConf["time_turn"] || 0.2;
        this._moveConf = this._gdConf["tween_move_conf"];
        /** @type {PIXI.utils.EventEmitter} */
        this._emit = new OMY.OmyConst.Emit();
    }

    destroy() {
        this._gdConf = null;
        this._moveConf = null;
        OMY.Omy.remove.tween(this._graphic);
        this._graphic = null;
        this._closeTexture = null;
        this._card = null;
        this._cardSuit = null;
        this._closeCard = null;
        this._emit.removeAllListeners();
        this._emit = null;
        this.stopWaitAnimation();
    }

    _onTurn() {
        this._turnCard = true;
        this._card.visible = true;
        this._updateCard();
    }

    _updateCard() {
        if (this._serverResult && this._turnCard) {
            this._cardSuit.texture = this._gdConf[AppG.onlyLastCard.suit];
            OMY.Omy.add.tween(this._graphic, {scaleX: 1}, this._timeTurn, this._onTurnComplete.bind(this));
        }
    }

    _onTurnComplete() {
        this._emit.emit(this.C_MOVE_UP);
        if (AppG.serverWork.isWinGamble) {
            OMY.Omy.add.tween(this._graphic, this._moveConf, this._timeMoveUp, this.resetPosition.bind(this));
        }
    }

    /**     * @public     */
    startShowCard() {
        this._emit.emit(this.C_START);
        this._serverResult = false;
        this._turnCard = false;
        this.stopWaitAnimation();
        OMY.Omy.add.tween(this._graphic, {scaleX: 0}, this._timeTurn, this._onTurn.bind(this));
    }

    showCard() {
        this._serverResult = true;
        this._updateCard();
    }

    resetPosition() {
        this._emit.emit(this.C_ON_POSITION);
        this._graphic.x = this._graphic.json.x;
        this._graphic.y = this._graphic.json.y;
        this._graphic.scale.set(1);
        this.closeCard();
    }

    startWaitAnimation() {
        this.t = this._updateTime;
        OMY.Omy.addUpdater(this.update, this);
        this.closeCard();
    }

    stopWaitAnimation() {
        OMY.Omy.removeUpdater(this.update, this);
    }

    update() {
        if (--this.t < 0) {
            this._bool = !this._bool;
            this._closeCard.texture = ((this._bool) ? this._closeTexture[0] : this._closeTexture[1]);
            this.t = this._updateTime;
        }
    }

    closeCard() {
        this._card.visible = false;
        this._graphic.scaleX = 1;
        this._closeCard.texture = this._closeTexture[0];
        this._bool = true;
    }

    /**
     * @returns {PIXI.utils.EventEmitter}
     */
    get emit() {
        return this._emit;
    }

    get C_START() {
        return "start";
    }

    get C_MOVE_UP() {
        return "move_up";
    }

    get C_ON_POSITION() {
        return "on_position";
    }
}
