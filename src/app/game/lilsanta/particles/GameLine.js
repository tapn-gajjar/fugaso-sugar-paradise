import {AppG} from "../../../../casino/AppG";

export class GameLine {
    constructor(particleJson) {
        this._gdConf = particleJson;
        /** @type {OMY.ORevoltParticleEmitter} */
        this._particle = OMY.Omy.add.revoltParticleEmitter(null, particleJson);
        this._particle.addCompleted(this.onEndParticle, this, false);
        this._particle.kill();
        this._totalSymbols = AppG.gameConst.countReel;
    }

    /**     * @public     */
    showLine(posList, countSymbols) {
        this._posList = posList;

        OMY.Omy.remove.tween(this._particle.particle);
        this.play(countSymbols);
    }

    /**     * @public     */
    play(countSymbols) {
        this._particle.alpha = 1;
        if (!this._isPlayEffect) {
            this._isPlayEffect = true;
            this._particle.revive();
            this._particle.visible = true;
        } else {
            this._particle.kill();
            this._particle.revive();
        }
        this._particle.start();

        this._particle.particle.x = this._posList[0].x;
        this._particle.particle.y = this._posList[0].y;

        let tweenTime = this._gdConf["time"] * (countSymbols / this._totalSymbols);
        OMY.Omy.add.tween(this._particle.particle,
            {
                ease: "none",
                motionPath: {
                    path: this._posList,
                    curviness: 0,
                    resolution: 1
                },
            }, tweenTime, this._onFinishShow.bind(this));
    }

    clear() {
        if (this._isPlayEffect) this.onEndParticle();
    }

    /**     * @private     */
    onEndParticle() {
        if (this._isPlayEffect) {
            this._isPlayEffect = false;
            OMY.Omy.remove.tween(this._particle.particle);
            OMY.Omy.remove.tween(this._particle);
            this._particle.removeCompleted(this.onEndParticle, this);
            this._particle.parent?.removeChild(this._particle);
            this._particle.kill();
        }
    }

    /**     * @private     */
    _onFinishShow() {
        this._particle.stop();
        // OMY.Omy.add.tween(this._particle, {alpha: 0}, .05);

    }

    get particle() {
        return this._particle;
    }
}