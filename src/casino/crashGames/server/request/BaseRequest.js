export class BaseRequest {
    constructor(domain, packet = null, headers = null, remote = null) {
        this.remote = remote;
        this._data = {
            method: "POST",
            url: domain,
        };
        if (packet) this._data["data"] = JSON.stringify(packet);
        if (headers) this._data["headers"] = headers;
        this._uniqueID = this.uniqueID;

        this._repeatCounter = 0;
        this._errorStatus = null;
        this._isCritical = false;
    }

    query(onComplete, onError) {
        this._onComplete = onComplete;
        this._onMissing = onError;
        this._send();
    }

//---------------------------------------
// PRIVATE
//---------------------------------------

    _send() {
        if (this._data["headers"]) this._data["headers"]["auth-token"] = this.remote.token;
        $.ajax(this._data).done(this._onSuccess.bind(this)).fail(this._onError.bind(this));

        clearInterval(this.reSendTimer);
        clearInterval(this._timerRequest);
        this._timerRequest = setInterval(this._onLongDelay.bind(this), 20 * 1000);
        this._repeatCounter++;
    }

    /** @private */
    _onLongDelay() {
        clearInterval(this._timerRequest);
        if (!BaseRequest.hasError) {
            BaseRequest.hasError = true;
            this._errorStatus = "error";
            this._onMissing && this._onMissing(null, this._errorStatus, null);
        }
    }

    _onError(xhr, textStatus, errorThrown) {
        try {
            let list = JSON.parse(xhr.responseText);
            this._onSuccess(list);
        } catch (e) {
            clearInterval(this._timerRequest);
            if (!BaseRequest.hasError) BaseRequest.hasError = true;
            if (this._errorStatus !== textStatus) {
                this._errorStatus = textStatus;
                this._onMissing && this._onMissing(xhr, textStatus, errorThrown);
            }
            if (xhr.status !== 200) {
                clearInterval(this.reSendTimer);
                this.reSendTimer = setInterval(this._send.bind(this), 1000);
                if (this._repeatCounter > BaseRequest.MAX_COUNT_REPEATS && !this._isCritical) {
                    this._isCritical = true;
                    this._onMissing && this._onMissing(xhr, "critical", errorThrown);
                }
            }
        }
    }

    _onSuccess(l, status, request) {
        if (request && request.readyState !== 4) {
            return;
        }
        if (BaseRequest.hasError) BaseRequest.hasError = false;
        this._repeatCounter = 0;
        clearInterval(this.reSendTimer);
        clearInterval(this._timerRequest);
        this.remote = null;
        this._onComplete && this._onComplete(l, status, request);
    }

    get uniqueID() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    }
}

BaseRequest.hasError = false;
BaseRequest.MAX_COUNT_REPEATS = 5;