export class SymbolEffectBase extends OMY.OContainer {
    constructor() {
        super();
        this._gdConf = OMY.Omy.assets.getJSON("GDWinEffect");
    }

    kill() {
        super.kill();
    }

    /**
     * @param {WinSymbolD}winData
     * @param {Number}id
     * @param {Boolean}isSkiped
     * @param {Boolean}isLoop
     */
    showSymbol(winData, id, isSkiped, isLoop) {
        this.revive();
        this._tValue?.kill();
    }
}