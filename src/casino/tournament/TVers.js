export class TVers {
    constructor() {
        this._version = OMY.Omy.assets.getJSON("t_version");
        OMY.Omy.URLCacheTournament = this.md5;
    }

    get version() {
        return this._version["version"];
    }

    get date() {
        return this._version["date"];
    }

    get build() {
        return this._version["build"];
    }

    get md5() {
        return this._version["md5"];
    }
}
