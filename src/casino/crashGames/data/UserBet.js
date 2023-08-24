import {AppG} from "../../AppG";
import {CrashConst} from "../CrashConst";

export class UserBet extends PIXI.utils.EventEmitter {
    constructor(index) {
        super();
        this._index = index;
        this._currentBet = AppG.serverWork.defaultBet;
        this._currentCash = AppG.gameConst.game_const["min_cash_out"];
        this._isBetting = false;
        this._autoBet = false;
        this._autoCash = false;

        AppG.emit.on(CrashConst.BET_DATA_UPDATE, this._updateParams, this);
    }

    /**
     * @param {Number}index
     * @param {String}paramName
     * @param {Number|String|Boolean}value
     * @private
     */
    _updateParams(index, paramName, value) {
        if (Number(index) !== this._index) return;
        switch (paramName) {
            case UserBetConst.bet: {
                this._currentBet = value;
                break;
            }
            case UserBetConst.cash: {
                this._currentCash = value;
                break;
            }
            case UserBetConst.isBetting: {
                this._isBetting = value;
                break;
            }
            case UserBetConst.autoBet: {
                this._autoBet = value;
                break;
            }
            case UserBetConst.autoCash: {
                this._autoCash = value;
                break;
            }
        }
    }

    get index() {
        return this._index;
    }

    get bet() {
        return this._currentBet;
    }

    get cash() {
        return this._currentCash;
    }

    get isBetting() {
        return this._isBetting;
    }

    get autoBet() {
        return this._autoBet;
    }

    get autoCash() {
        return this._autoCash;
    }
}

export const UserBetConst = {
    bet: "bet",
    cash: "cash",
    isBetting: "isBetting",
    autoBet: "autoBet",
    autoCash: "autoCash"
};