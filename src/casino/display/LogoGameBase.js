export class LogoGameBase {
    constructor(graphic) {

        /** @type {OMY.OContainer} */
        this._graphic = graphic;

        this._gdConf = this._graphic.json;
    }
}
