import {AppConst} from "../../../AppConst";

export class FullScreenAndroid extends OMY.OContainer {
    constructor(onCompleteCheck) {
        super();

        this._onCompleteCheck = onCompleteCheck;
    }

    init() {
        if (OMY.Omy.scaleManager.isFullScreen) {
            OMY.Omy.stage.interactive = false;
            OMY.Omy.stage.off('tap', this._gotoFullScreen, this);
            this._onCompleteCheck();
            this._onCompleteCheck = null;
        } else {
            this._addFullSCreenImg();
        }
    }

    kill() {
        OMY.Omy.stage.interactive = false;
        OMY.Omy.stage.off('tap', this._gotoFullScreen, this);
        return super.kill();
    }

    _gotoFullScreen() {
        OMY.Omy.stage.interactive = false;
        this._onCompleteCheck();
        OMY.Omy.scaleManager.startFullScreen(AppConst.GAME_CONTAINER);
    }

    _addFullSCreenImg() {
        OMY.Omy.stage.interactive = true;
        OMY.Omy.stage.once('tap', this._gotoFullScreen, this);
    }
}