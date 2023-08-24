import {AppG} from "../../casino/AppG";

export class HistoryData {
    constructor(data) {
        this._rawData = data;

        this._id = this._rawData["id"];
        this._kind = this._rawData["kind"];

        this._rounds = [];
        let rounds = this._rawData["rounds"];
        let l = rounds.length;
        for (let i = 0; i < l; i++) {
            let roundData = rounds[i];
            if (!roundData)
                return;

            let round = new HistoryRoundData(roundData);
            this._rounds.push(round);
        }
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    /**
     * Return id
     * @returns {int}
     */
    get id() {
        return this._id;
    }

    /**
     * Return 'HISTORY' kind
     * @returns {string}
     */
    get kind() {
        return this._kind;
    }

    /**
     * Return array with history rounds
     * @returns {Array.<HistoryRoundData>}
     */
    get rounds() {
        return this._rounds;
    }
}

export class HistoryRoundData {
    constructor(data) {
        this._rawData = data;

        this._mRoundId = this._rawData["id"];
        this._mDate = this._rawData["dateStart"];
        this._mType = this._rawData["kind"].charAt(0) || HistoryData.TYPE_NORMAL;
        this._mGameName = this._rawData["gameName"];
        this._mBet = this._rawData["bet"] / AppG.serverWork.creditType;
        this._mWin = this._rawData["win"] / AppG.serverWork.creditType;
        this._mBalance = this._rawData["balance"] / AppG.serverWork.creditType;

        /**
         * Array of actions
         * @type {Array.<HistoryActionData>}
         * @private
         */
        this._actions = [];
        let actions = this._rawData["actions"];
        let n = actions.length;
        let bufferAction = [];
        for (let i = 0; i < n; i++) {
            let actionData = actions[i];
            if (!actionData)
                return;

            let action = new HistoryActionData(actionData);

            if (!action
                || action.description === HistoryRoundData.ACTION_BET
                /*|| action.description == HistoryRoundData.ACTION_GAMBLE_END
                    || action.description == HistoryRoundData.ACTION_GAMBLE_FREE_END
                    || action.description == HistoryRoundData.ACTION_GAMBLE_PLAY*/)
                continue;

            if (action.mBonusWin) {
                if (action.description.toUpperCase() === "FREE_SPIN") {
                    let duplicate = new HistoryActionData(actionData);
                    duplicate.mChange2Bonus = true;
                    this._actions.push(duplicate);
                } else {
                    action.mChange2Bonus = true;
                }
            }

            if (action.description === "FREE_SPIN")
                this._mType = HistoryData.TYPE_FREE;

            if (action.haveJackpot) {
                bufferAction.push(action);
                continue;
            }

            if (action.haveTournament) {
                bufferAction.push(action);
                continue;
            }

            this._actions.push(action);
        }
        while (bufferAction.length) {
            let action = bufferAction.shift();
            this._actions.unshift(action);
            while (action.mJackpots?.length) {
                this._actions.unshift(new HistoryActionData(action.rawData));
            }
            while (action.mTournaments?.length) {
                this._actions.unshift(new HistoryActionData(action.rawData));
            }
        }
        bufferAction.length = 0;
        bufferAction = null;
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    /**
     * Return round id
     * @returns {int}
     */
    get roundId() {
        return this._mRoundId;
    }

    /**
     * Return round date
     * @returns {int}
     */
    get date() {
        return this._mDate;
    }

    /**
     * Unknown return
     * @returns {*}
     */
    get type() {
        return this._mType;
    }

    /**
     * Return game name
     * @returns {string}
     */
    get gameName() {
        return this._mGameName;
    }

    /**
     * Return round bet
     * @returns {number}
     */
    get bet() {
        return this._mBet;
    }

    /**
     * Return win value
     * @returns {number}
     */
    get win() {
        return this._mWin;
    }

    /**
     * Return balance after round
     * @returns {number}
     */
    get balance() {
        return this._mBalance;
    }

    /**
     * Get actions list
     * @returns {Array.<HistoryActionData>}
     */
    get actionsList() {
        return this._actions;
    }

    /**
     * Return stop list
     * @returns {array}
     */
    get stopList() {
        return this._actions[0].stopList;
    }
}

HistoryData.TYPE_NORMAL = "S";
HistoryData.TYPE_FREE = "F";

export class HistoryActionData {
    constructor(data) {
        this._rawData = data;

        this._mBonusWin = false;
        this._mChange2Bonus = false;
        this._bonusSymbol = this._rawData["free"]?.symbol || null;
        if (this._bonusSymbol && this._rawData["wons"]?.length) {
            for (let i = 0; i < this._rawData["wons"].length; i++) {
                if (this._rawData["wons"][i]["symbol"] === this._bonusSymbol) {
                    this._mBonusWin = true;
                    break;
                }
            }
        }

        this._mActionId = this._rawData["id"];
        this._haveJackpot = false;
        this._mJackpots = this._rawData["jackpots"];
        if (this._mJackpots?.length) {
            this._rawData["description"] = "jackpot";
            this._jackData = this._mJackpots.shift();
            this._mActionId = this._jackData["id"];
            this._mJackpotName = this._jackData["name"];
            this._mJackpotWin = this._jackData["amount"];
            this._haveJackpot = true;
        }

        this._mCategory = this._rawData["category"];
        this._mDescription = this._rawData["description"].toLowerCase();
        this._mLangKey = "history_action_" + this._mDescription;

        this._haveTournament = false;
        this._mTournaments = this._rawData["tournaments"];
        if (this._mTournaments?.length) {
            this._rawData["description"] = HistoryRoundData.ACTION_TOURNAMENT;
            this._tournamentsData = this._mTournaments.shift();
            this._mActionId = this._tournamentsData["id"];
            this._mTournamentPlace = this._tournamentsData["place"];
            this._mTournamentWin = this._tournamentsData["amount"];
            this._haveTournament = true;

            this._mDescription = this._rawData["description"].toLowerCase();
            this._mLangKey = "tournament_3";
        }

        this._mStopList = this._rawData["stops"] ? this._rawData["stops"].split(",") : [];

        this._mCards = this._rawData["cards"];
        this._mChoice = this._rawData["choice"];

        let l = this._mStopList.length;
        for (let i = 0; i < l; i++) {
            this._mStopList[i] = OMY.OMath.int(this._mStopList[i]);
        }
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    /**
     * Return action id
     * @returns {int}
     */
    get actionId() {
        return this._mActionId;
    }

    /**
     * Return action category
     * @returns {int}
     */
    get category() {
        return this._mCategory;
    }

    /**
     * Return action description
     * @returns {string}
     */
    get description() {
        return this._mDescription;
    }

    /**
     * Return key fo localization
     * @returns {string}
     */
    get langKey() {
        return this._mLangKey;
    }

    /**
     * Return stop list
     * @returns {Array}
     */
    get stopList() {
        return this._mStopList;
    }

    /**
     * Return gamble card history
     * @returns {String}
     */
    get cards() {
        return this._mCards;
    }

    /**
     * Return gamble player choice
     * @returns {String}
     */
    get choice() {
        return this._mChoice;
    }

    get mBonusWin() {
        return this._mBonusWin;
    }

    get bonusSymbol() {
        return this._bonusSymbol;
    }

    get mChange2Bonus() {
        return this._mChange2Bonus;
    }

    set mChange2Bonus(value) {
        this._mChange2Bonus = value;
    }

    get haveJackpot() {
        return this._haveJackpot;
    }

    get mJackpots() {
        return this._mJackpots;
    }

    get mJackpotName() {
        return this._mJackpotName;
    }

    get mJackpotWin() {
        return this._mJackpotWin;
    }

    get rawData() {
        return this._rawData;
    }

    get haveTournament() {
        return this._haveTournament;
    }

    get mTournaments() {
        return this._mTournaments;
    }

    get tournamentPlace() {
        return this._mTournamentPlace;
    }

    get tournamentWin() {
        return this._mTournamentWin;
    }
}

HistoryRoundData.ACTION_TOURNAMENT = "tournament";
HistoryRoundData.ACTION_JACKPOT = "jackpot";
HistoryRoundData.ACTION_BET = "bet";
HistoryRoundData.ACTION_GAMBLE_PLAY = "gamble_play";
HistoryRoundData.ACTION_GAMBLE_END = "gamble_end";
HistoryRoundData.ACTION_GAMBLE_FREE_END = "gamble_free_end";