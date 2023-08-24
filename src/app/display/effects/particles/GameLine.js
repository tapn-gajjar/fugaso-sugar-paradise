import {AppG} from "../../../../casino/AppG";

export class GameLine {
    constructor(particleJson) {
        this._gdConf = particleJson;
        /** @type {OMY.ORevoltParticleEmitter} */
        this._particle = OMY.Omy.add.revoltParticleEmitter(null, particleJson);
        this._particle.kill();
    }

    /**     * @public     */
    showLine(posList) {
        this._posList = posList;

        OMY.Omy.remove.tween(this._particle.particle);
        this.play();
    }

    /**     * @public     */
    play() {
        this._isPlayEffect = true;
        this._particle.revive();
        this._particle.visible = true;
        this._particle.start();
        this._particle.addCompleted(this.onEndParticle, this, true);

        this._particle.particle.x = this._posList[0].x;
        this._particle.particle.y = this._posList[0].y;

        OMY.Omy.add.tween(this._particle.particle,
            {
                motionPath: {
                    path: this._posList,
                    curviness:0,
                    resolution:1
                },
            },
            this._gdConf["time"], this._onFinishShow.bind(this));
    }

    clear() {
        if (this._isPlayEffect) this.onEndParticle();
    }

    /**     * @private     */
    onEndParticle() {
        if (this._isPlayEffect) {
            this._isPlayEffect = false;
            OMY.Omy.remove.tween(this._particle.particle);
            this._particle.parent?.removeChild(this._particle);
            this._particle.kill();
        }
    }

    /**     * @private     */
    _onFinishShow() {
        this._particle.stop();
    }

    get particle() {
        return this._particle;
    }
}