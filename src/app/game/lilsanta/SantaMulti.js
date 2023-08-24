import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

export default class SantaMulti extends PIXI.utils.EventEmitter {
    /**
     * @param {OMY.OContainer}graphic
     */
    constructor(graphic) {
        super();

        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = graphic.json;
        /** @type {OMY.OContainer} */
        this._canvas = this._graphic.getChildByName("c_effect");

        if (Boolean(this._gdConf["edit"])) {
            let i = 2;
            while (this._gdConf["spine"][String(++i)]) {
                OMY.Omy.add.actorJson(this._canvas, this._gdConf["spine"][String(i)]).gotoAndPlay(0, true);
            }
            AppG.updateGameSize(this._canvas);
        }
        this._activeWaitEffect = null;
        this._activeWinEffect = null;
        AppG.emit.on(AppConst.APP_EMIT_SPIN_REEL, this.hideWinCombo, this);
        this._delayIdleEffect();
    }

    /**     * @private     */
    _clearTimer() {
        this._timerIdl?.destroy();
        this._timerIdl = null;
    }

    /**     * @private     */
    _delayIdleEffect() {
        this._clearTimer();
        this._timerIdl = OMY.Omy.add.timer(OMY.OMath.randomRangeNumber(10, 20),
            this._blinkIdl, this);
    }

    /**     * @private     */
    _blinkIdl() {
        if (Boolean(this._gdConf["edit"])) return;
        if (this._activeWaitEffect || this._activeWinEffect) {
            this._delayIdleEffect();
            return;
        }
        let i = 2;
        while (this._gdConf["spine"][String(++i)]) {
            /** @type {OMY.OActorSpine} */
            let actor = OMY.Omy.add.actorJson(this._canvas, this._gdConf["spine"][String(i)]);
            actor.removeOnEnd = true;
            actor.gotoAndPlay(0, false, actor.json["custom_a_name"]);
        }
        AppG.updateGameSize(this._canvas);
        this._delayIdleEffect();
    }

    activeWaitCombo(countCatch) {
        if (this._countCatch !== countCatch) {
            this._canvas.callAll("kill");
            this._activeWinEffect = null;
            this._countCatch = (countCatch > 9) ? 9 : (countCatch < 3) ? 3 : countCatch;
            /** @type {OMY.OActorSpine} */
            this._activeWaitEffect = OMY.Omy.add.actorJson(this._canvas, this._gdConf["spine"][String(this._countCatch)]);
            this._activeWaitEffect.gotoAndPlay(0, true, this._activeWaitEffect.json["a_wait"]);
            AppG.updateGameSize(this._activeWaitEffect);
        }
    }

    offActiveWaitEffect() {
        if (this._activeWaitEffect) {
            this._canvas.callAll("kill");
            this._activeWaitEffect = null;
        }
        this._countCatch = 0;
    }

    winCombo(countOfWin) {
        this._canvas.callAll("kill");
        this._activeWaitEffect = null;
        countOfWin = (countOfWin > 9) ? 9 : (countOfWin < 3) ? 3 : countOfWin;
        /** @type {OMY.OActorSpine} */
        this._activeWinEffect = OMY.Omy.add.actorJson(this._canvas, this._gdConf["spine"][String(countOfWin)]);
        const animateName = (countOfWin >= 7) ? this._activeWinEffect.json["a_win2"] : this._activeWinEffect.json["a_win1"];
        this._activeWinEffect.gotoAndPlay(0, true, animateName);
        AppG.updateGameSize(this._activeWinEffect);
    }

    hideWinCombo() {
        if (this._activeWinEffect) {
            this._canvas.callAll("kill");
            this._activeWinEffect = null;
        }
        this._countCatch = 0;
    }
}