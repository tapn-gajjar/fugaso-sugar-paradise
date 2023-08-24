import {RHandle} from "./RHandle";

export class RJackpotPing extends RHandle {
    constructor(domain, packet = null, headers = null) {
        super(domain, packet, headers);
    }

    query(onComplete, onError) {
        if (RJackpotPing.active) return;
        RJackpotPing.active = this;
        super.query(onComplete, onError);
    }

    _onSuccess(l, status, request) {
        RJackpotPing.active = null;
        super._onSuccess(l, status, request);
    }
}

RJackpotPing.active = null;