import {BaseRequest} from "./BaseRequest";

export class RHandle extends BaseRequest {
    constructor(domain, packet = null, headers = null) {
        super(domain, packet, headers);

        this._data["url"] += "/handle";
        this._data["contentType"] = "application/json;charset=UTF-8";
        this._data["dataType"] = "json";
    }
}