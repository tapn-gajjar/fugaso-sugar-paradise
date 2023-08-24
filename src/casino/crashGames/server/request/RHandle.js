import {BaseRequest} from "./BaseRequest";

export class RHandle extends BaseRequest {
    constructor(domain, packet = null, headers = null, remote = null) {
        super(domain, packet, headers, remote);

        this._data["url"] += "/handle";
        this._data["contentType"] = "application/json;charset=UTF-8";
        this._data["dataType"] = "json";
    }
}