import {BetWindowBase} from "../../casino/gui/windows/BetWindowBase";

export class BetWindow extends BetWindowBase {
    constructor() {
        super();
    }

    _createGraphic() {
        if (this._isGraphic) return;
        super._createGraphic();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        super._clearGraphic();
    }

    revive(onComplete = null) {
        super.revive(onComplete);
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }
}
