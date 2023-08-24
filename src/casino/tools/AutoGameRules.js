import {AppConst} from "../AppConst";
import {AppG} from "../AppG";

export class AutoGameRules extends PIXI.utils.EventEmitter {
    constructor() {
        super();
        this._isAutoGameActive = false;
        this._isAutoPause = false;
        this._isBonusGame = false;
        this._isWarningAutoGame = false;

        this._ruleOnAnyWin = false;
        this._ruleIfFreeSpin = false;
        this._ruleIfSingleWinExceeds = false;
        this._ruleIfCashIncBy = false;
        this._ruleIfCashDecBy = false;
        this._ruleOnJackpotWin = false;
        this._canStartAutoGame = false;
        this._infinity = false;

        this._playedGamesSave = 0;
        this._numberOfPlaysSave = 0;
        this._ruleCountPlay = 0;
        this._ruleIfSingleWinExceedsValue = 0;
        this._ruleIfCashIncByValue = 0;
        this._ruleIfCashDecByValue = 0;

        this._freeSpinPlay = false;
    }

//---------------------------------------
/// PUBLIC
//---------------------------------------

    showAutoGame() {
        this._isShowAutoGamePanel = true;
        // this.setCanStartAutoGame(true);
    }

    hideAutoGame() {
        this._isShowAutoGamePanel = false;
    }

    /**
     * Start auto game using current rules
     * @param {int} repeat - number of plays
     */
    startAutoGame(repeat = 10) {
        this.setCanStartAutoGame(false);
        this._isAutoGameActive = true;

        this._infinity = repeat === -1;
        this._numberOfPlays = repeat;
        this._playedGames = 0;
        this._numberOfPlaysSave = this._numberOfPlays;

        this._sumBets = 0;
        this._sumWins = 0;

        this.emit(AppConst.APP_AUTO_UPDATE_SPINS_COUNT, this._numberOfPlays - this._playedGames);
    }

    /**
     * Stop auto game
     */
    stopAutoGame() {
        this.resetRules();

        this._isAutoGameActive = false;
        this._isAutoPause = false;
        this._playedGames = 0;

        this._balanceAtStart = 0;

        this.emit(AppConst.APP_AUTO_STOP);
    }

    pauseAutoGame() {
        if (this._isAutoGameActive) {
            this._isAutoPause = true;
            this._isAutoGameActive = false;

            this._playedGamesSave = this._playedGames;

            // this._sumBets = 0;
            // this._sumWins = 0;

            this._playedGames = 0;

            this.emit(AppConst.APP_AUTO_STOP);
        }
    }

    continueAutoGame() {
        if (this._isAutoPause) {
            this._isAutoPause = false;

            this.setCanStartAutoGame(false);
            this._isAutoGameActive = true;
            if (!this._infinity) {
                this._numberOfPlays = this._numberOfPlaysSave;
                this._playedGames = this._playedGamesSave;
            }

            // this._sumBets = 0;
            // this._sumWins = 0;

            this.emit(AppConst.APP_AUTO_UPDATE_SPINS_COUNT, this._numberOfPlays - this._playedGames);
        }
    }

    bonusGameOff() {
        this._isBonusGame = false;
    }

    bonusGameOn() {
        this._isBonusGame = true;
    }

    warningGameOff() {
        this._isWarningAutoGame = false;
    }

    warningGameOn() {
        this._isWarningAutoGame = true;
    }

    resetRules() {
        this.setCountOfPlay(0);
        this.setRuleOnAnyWin();
        this.setRuleIfFreeSpin();
        this.setRuleIfSingleWinExceeds();
        this.setRuleIfCashIncBy();
        this.setRuleIfCashDecBy();
        this.setRuleIfJackpotWin();
    }

    setCountOfPlay(repeats = 0) {
        this._ruleCountPlay = repeats;
        AppG.emit.emit(AppConst.APP_AUTO_COUNT_SPIN, repeats);
    }

    setRuleOnAnyWin(condition = false) {
        this._ruleOnAnyWin = condition;
    }

    setRuleIfFreeSpin(condition = false) {
        this._ruleIfFreeSpin = condition;
    }

    setRuleIfSingleWinExceeds(condition = false, value = 0) {
        this._ruleIfSingleWinExceeds = condition;
        this._ruleIfSingleWinExceedsValue = value;
    }

    setRuleIfCashIncBy(condition = false, value = 0) {
        this._ruleIfCashIncBy = condition;
        this._ruleIfCashIncByValue = value;
    }

    setRuleIfCashDecBy(condition = false, value = 0) {
        this._ruleIfCashDecBy = condition;
        this._ruleIfCashDecByValue = value;
    }

    setRuleIfJackpotWin(condition = false) {
        this._ruleOnJackpotWin = condition;
    }

    /**
     * Decrease number of left auto game
     */
    updateRule0() {
        if (!this._isAutoGameActive || this._isBonusGame || this._isWarningAutoGame)
            return;

        if (this._infinity) return;
        ++this._playedGames;
        this.emit(AppConst.APP_AUTO_UPDATE_SPINS_COUNT, this._numberOfPlays - this._playedGames);
        OMY.Omy.log("Update auto game rule #0:", this._playedGames, this._numberOfPlays);
        if (this._playedGames >= this._numberOfPlays)
            this._breakAutoGame(0);
    }

    /**
     * Update rule #1. On any win
     */
    updateRule1() {
        if (!this._isAutoGameActive)
            return;

        if (!this._ruleOnAnyWin)
            return;

        OMY.Omy.log("Update auto game rule #1");

        this._breakAutoGame(1);
    }

    /**
     * Update rule #2. If Free Spin is won
     */
    updateRule2() {
        if (!this._isAutoGameActive)
            return;

        if (!this._ruleIfFreeSpin) {
            this.pauseAutoGame();
            return;
        }

        OMY.Omy.log("Update auto game rule #2");

        this._breakAutoGame(2);
    }

    /**
     * Update rule #3. If single win exceeds EUR value
     * @param {number} winValue
     */
    updateRule3(winValue) {
        if (!this._isAutoGameActive && !this._isAutoPause)
            return;

        if (!this._ruleIfSingleWinExceeds)
            return;

        OMY.Omy.log("Update auto game rule #3:", winValue, this._ruleIfSingleWinExceedsValue);

        if (winValue >= this._ruleIfSingleWinExceedsValue)
            this._breakAutoGame(3);
    }

    /**
     * Update rule #4. If cash increases by EUR value
     */
    updateRule4() {
        if (!this._isAutoGameActive && !this._isAutoPause)
            return;

        if (!this._ruleIfCashIncBy)
            return;

        OMY.Omy.log("Update auto game rule #4. If cash increases by EUR value\n",
            "sumBets:", this._sumBets,
            "sumWins:", this._sumWins,
            "diff:", this._sumWins - this._sumBets,
            "targetDiff:", this._ruleIfCashIncByValue);

        if (this._sumWins - this._sumBets >= this._ruleIfCashIncByValue)
            this._breakAutoGame(4);
    }

    /**
     * Update rule #5. If cash decreases by EUR value
     */
    updateRule5() {
        if (!this._isAutoGameActive)
            return;

        if (!this._ruleIfCashDecBy)
            return;

        OMY.Omy.log("Update auto game rule #5. If cash decreases by EUR value\n",
            "sumBets:", this._sumBets,
            "sumWins:", this._sumWins,
            "diff:", this._sumBets - this._sumWins,
            "targetDiff:", -this._ruleIfCashDecByValue);

        if (this._sumBets - this._sumWins >= this._ruleIfCashDecByValue)
            this._breakAutoGame(5);
    }

    freeSpin(value) {
        this._freeSpinPlay = value;
    }

    updateRule6() {
        if (!this._isAutoGameActive)
            return;

        if (!this._ruleOnJackpotWin)
            return;

        OMY.Omy.log("Update auto game rule #6. On Jackpot win");

        this._breakAutoGame(6);
    }

    updateBets(betValue) {
        if (!this._isAutoGameActive)
            return;

        if (!this._ruleIfCashIncBy && !this._ruleIfCashDecBy)
            return;

        if (this._freeSpinPlay)
            return;

        this._sumBets += betValue;
    }

    updateWins(winValue) {
        if (!this._isAutoGameActive && !this._isAutoPause)
            return;

        if (!this._ruleIfCashIncBy && !this._ruleIfCashDecBy)
            return;

        this._sumWins += winValue;
    }

//---------------------------------------
/// PRIVATE
//---------------------------------------

    _breakAutoGame(ruleNumber = -1) {
        OMY.Omy.log("Auto game breaked by rule #" + ruleNumber);
        this.stopAutoGame();
    }

    addOnStopHandler(method, context, once) {
        if (once)
            this.once(AppConst.APP_AUTO_STOP, method, context);
        else
            this.on(AppConst.APP_AUTO_STOP, method, context);
    }

    addOnCountUpdateHandler(method, context, once) {
        if (once)
            this.once(AppConst.APP_AUTO_UPDATE_SPINS_COUNT, method, context);
        else
            this.on(AppConst.APP_AUTO_UPDATE_SPINS_COUNT, method, context);
    }

    removeOnStopHandler(method, context) {
        this.removeListener(AppConst.APP_AUTO_STOP, method, context);
    }

    removeOnCountUpdateHandler(method, context) {
        this.removeListener(AppConst.APP_AUTO_UPDATE_SPINS_COUNT, method, context);
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------

    get onStopAutoGame() {
        throw  new Error("use addOnStopHandler");
    }

    get isAutoGame() {
        return this._isAutoGameActive || this._isAutoPause || this._isBonusGame || this._isWarningAutoGame;
    }

    /**
     * Is show auto game panel
     * @returns {boolean}
     */
    get isShowAutoGamePanel() {
        return this._isShowAutoGamePanel;
    }

    get isAnyRule() {
        return this._ruleIfCashDecBy;
        /* return this._ruleOnAnyWin ||
             this._ruleIfFreeSpin ||
             this._ruleIfSingleWinExceeds ||
             this._ruleIfCashIncBy ||
             this._ruleIfCashDecBy ||
             this._ruleOnJackpotWin;*/
    }

    /**
     * Getter can start auto game
     * @returns {boolean}
     */
    getCanStartAutoGame() {
        return this._canStartAutoGame;
    }

    /**
     * Setter can start auto game
     * @param {boolean} value
     */
    setCanStartAutoGame(value) {
        this._canStartAutoGame = value;
    }

    get spinsCountUpdateSignal() {
        throw  new Error("use addOnCountUpdateHandler");
    }

    get isAutoPause() {
        return this._isAutoPause;
    }

    get isBonusGame() {
        return this._isBonusGame;
    }

    get isAutoGameActive() {
        return this._isAutoGameActive;
    }

    get ruleCountPlay() {
        return this._ruleCountPlay;
    }

    get ruleOnAnyWin() {
        return this._ruleOnAnyWin;
    }

    get ruleIfFreeSpin() {
        return this._ruleIfFreeSpin;
    }

    get ruleIfSingleWinExceeds() {
        return this._ruleIfSingleWinExceeds;
    }

    get ruleIfSingleWinExceedsValue() {
        return this._ruleIfSingleWinExceedsValue;
    }

    get ruleIfCashIncBy() {
        return this._ruleIfCashIncBy;
    }

    get ruleIfCashIncByValue() {
        return this._ruleIfCashIncByValue;
    }

    get ruleIfCashDecBy() {
        return this._ruleIfCashDecBy;
    }

    get ruleIfCashDecByValue() {
        return this._ruleIfCashDecByValue;
    }

    get ruleOnJackpotWin() {
        return this._ruleOnJackpotWin;
    }
}