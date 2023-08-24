export class FullScreenChrome extends OMY.OContainer {
    constructor(onCompleteCheck, gdConf) {
        super();

        this._onCompleteCheck = onCompleteCheck;
        this._gdConf = gdConf;

        this._tint = OMY.Omy.add.tint(1, '#000');
        this.addChild(this._tint);
        OMY.Omy.add.createSprites(this, this._gdConf['chrome']);
        OMY.Omy.add.createTexts(this, this._gdConf['chrome']);

        OMY.Omy.add.buttonJson(this, this._gdConf['chrome']['b_yes'], this._gotoFullScreen.bind(this));
    }

    init() {
    }

    _gotoFullScreen() {
        this._onCompleteCheck();
    }
}