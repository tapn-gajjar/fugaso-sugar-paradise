export class FullScreenIOS extends OMY.OContainer {
    constructor(onCompleteCheck, gdConf) {
        super();

        this._onCompleteCheck = onCompleteCheck;
        this._gdConf = gdConf;

        // this._tint = OMY.Omy.add.tint(1, '#000');
        // this.addChild(this._tint);
        // OMY.Omy.add.spriteJson(this, this._gdConf['ios']['image']).setXY(OMY.Omy.WIDTH * .5, OMY.Omy.HEIGHT * .5);
    }

    init() {
        if (this._onCompleteCheck) {
            this._onCompleteCheck();
            this._onCompleteCheck = null;
        }
        this._addFullSCreenImg();

    }

    /**     * @private     */
    _gotoFullScreen() {
        OMY.Omy.scaleManager.removeFullChange(this._isFullChange, this);
        OMY.Omy.game.renderer.plugins.interaction.autoPreventDefault = true;
    }

    _addFullSCreenImg() {
        OMY.Omy.game.renderer.plugins.interaction.autoPreventDefault = false;
        OMY.Omy.scaleManager.addFullChange(this._isFullChange, this);
    }

    /**     * @private     */
    _isFullChange() {
        if (OMY.Omy.scaleManager.isFullScreen)
            this._gotoFullScreen();
    }
}