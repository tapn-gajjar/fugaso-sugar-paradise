import {BaseRequest} from "./BaseRequest";

export class RPing extends BaseRequest {
    constructor(domain, packet = null, headers = null) {
        super(domain, packet, headers);

        this._data["url"] += "/ping";
    }

    query(onComplete, onError) {
        if (RPing.active) return;
        RPing.active = this;
        super.query(onComplete, onError);
    }

    _onSuccess(l, status, request) {
        RPing.active = null;
        super._onSuccess(l, status, request);
    }
}

RPing.active = null;