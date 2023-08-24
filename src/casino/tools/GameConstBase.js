import {AppConst} from "../AppConst";

let defLanguageMap = {
    "gb": "eng",
    "can": "eng"
}

export class GameConstBase {
    constructor() {
        this._data = null;
        this._symbols = null;
    }

    createData() {
        this._data = OMY.Omy.assets.getJSON("GameConst");

        this._symbols = this._data["symbols"];
        this._symbolsForReel = this._data["symbolsForReel"];
    }

    /**     * @returns {boolean}     */
    isBonusSymbol(symbol) {
        return this._data["bonusSymbol"].indexOf(symbol) > -1;
    }

    symbolID(symb) {
        let id = this._symbols.indexOf(symb);
        if (id === -1) {
            OMY.Omy.warn("Not have this image", symb);
            id = 0;
        }
        return id;
    }

    convertChar(symb) {
        switch (symb) {
            default: {
                return symb;
            }
        }
    }

    getRandomSymbol() {
        return OMY.OMath.getRandomItem(this._symbolsForReel || this._symbols);
    }

    //список символів-скатерів, які перевіряються по лініям (виграш). По дефолту скатер не перевіряється по лініях
    /**     * @returns {boolean}     */
    checkScatterByLine(symbol) {
        return this._data["checkScatterByLine"].indexOf(symbol) > -1;
    }

    get localisation() {
        return this._data["haveLocalisation"];
    }

    get symbolWidth() {
        return ((OMY.Omy.isDesktop) ? this._data["symbolWidth"] : this._data["m_symbolWidth"]);
    }

    get symbolHeight() {
        return ((OMY.Omy.isDesktop) ? this._data["symbolHeight"] : this._data["m_symbolHeight"]);
    }

    get gambleTotalGame() {
        return (this._data.hasOwnProperty("gambleTotalGame")) ? this._data["gambleTotalGame"] : 5;
    }

    get countOfStartGambleHistory() {
        return (this._data.hasOwnProperty("countOfStartGambleHistory")) ? this._data["countOfStartGambleHistory"] : 0;
    }

    get oneLineWin() {
        return (this._data.hasOwnProperty("oneLineWin")) ? this._data["oneLineWin"] : true;
    }

    get delayDelayBetweenReelsTimeCoef() {
        return (this._data.hasOwnProperty("delayDelayBetweenReelsTimeCoef")) ? this._data["delayDelayBetweenReelsTimeCoef"] : 0;
    }

    get longReelSpeed() {
        return (this._data.hasOwnProperty("longSpinSpeed")) ? this._data["longSpinSpeed"] : this._data["maxSpeed"];
    }

    get longSpinEndSpeed() {
        return (this._data.hasOwnProperty("longSpinEndSpeed")) ? this._data["longSpinEndSpeed"] : this._data["maxSpeed"];
    }

    get longSpinEndTime() {
        return (this._data.hasOwnProperty("longSpinEndTime")) ? this._data["longSpinEndTime"] : 0.05;
    }

    get change2LongSpeedOnEnd() {
        return (this._data.hasOwnProperty("change2LongSpeedOnEnd")) ? this._data["change2LongSpeedOnEnd"] : false;
    }

    get longReelSymbol() {
        return (this._data.hasOwnProperty("longReelSymbol")) ? this._data["longReelSymbol"] : [];
    }

    get longReelSymbolMap() {
        /*"longReelSymbolMap":{
            "9":2
        },*/
        return (this._data.hasOwnProperty("longReelSymbolMap")) ? this._data["longReelSymbolMap"] : {};
    }

    get timeForLongReel() {
        /*
        * -1 - unlimited time
        * */
        return (this._data.hasOwnProperty("timeForLongReel")) ? this._data["timeForLongReel"] : -1;
    }

    get change2LongSpeed() {
        /*
        * true - if need to change reel speed on long reel effect
        * */
        return (this._data.hasOwnProperty("change2LongSpeed")) ? this._data["change2LongSpeed"] : false;
    }

    get secondReelConfig() {
        let result = this._data["secondReelConfig"];
        if (!result) {
            result = {
                "countUp": 1,
                "countDown": 1,
                "countSlot": 3,
                "countReel": 5,
                "startBackInTime": 0.1,
                "startBackInSpeed": -5,
                "timeDownStartSpeed": 1,
                "endBackInTime": 0.04,
                "endBackInTime2": 0.08,
                "endBackCoef": 0.25,
                "maxSpeed": 50,
                "minSpeed": 50,
                "defaultDesiredTime": 450,
                "turboModeTimeCoef": 1.3,
                "delayDelayBetweenReelsTimeCoef": 0.2,
                "delayDelayBetweenReelsTime": 0.2,
                "delayStartSpinTime": 0,
                "delaySpinReel": 0,
                "longReel": 2.3,
                "longReelSpeed": 30,
                "time_focus_on": 0.6,
                "time_focus_off": 0.2,
                "innerStart": false,
                "innerFinish": true,
                "blurInReelAnimation": true,
            };
        }
        return result;
    }

    /**     * @public     */
    getData(name) {
        return this._data[name];
    }

    get gameName() {
        return this._data["gameName"];
    }

    /**     * @returns {boolean}     */
    isScatterSymbol(symbol) {
        return String(this._data["scatterSymbol"]).indexOf(symbol) > -1;
    }

    get coinSystem() {
        return this._data.coinSystem;
    }

    get gameHaveJackpot() {
        return this._data["gameHaveJackpot"];
    }

    // гра має холд режим для барабанів
    /**     * @returns {boolean}     */
    get gameHaveRespin() {
        return this._data.gameHaveRespin;
    }

    get game_const() {
        return this._data["game_const"] || {};
    }

    get countReel() {
        return this._data["countReel"];
    }

    get countSlot() {
        return this._data["countSlot"];
    }

    get showLoopNoWinSymbols() {
        return (this._data.hasOwnProperty("showLoopNoWinSymbols")) ? this._data["showLoopNoWinSymbols"] : false;
    }

    get showOnWinNoWinSymbols() {
        return (this._data.hasOwnProperty("showOnWinNoWinSymbols")) ? this._data["showOnWinNoWinSymbols"] : false;
    }

    get delaySpinMap() {
        return (this._data.hasOwnProperty("delaySpinMap")) ? this._data["delaySpinMap"] : null;
    }

    get blurIgnoreList() {
        return (this._data.hasOwnProperty("blurIgnoreList")) ? this._data["blurIgnoreList"] : [];
    }

    get defaultCat() {
        return this._data["defaultCat"] || 0;
    }

    get onlyBetOne() {
        return this._data["onlyBetOne"] || false;
    }

    get hardSkip() {
        return (this._data.hasOwnProperty("hardSkip")) ? this._data["hardSkip"] : false;
    }

    get hardSkipCoef() {
        return (this._data.hasOwnProperty("hardSkipCoef")) ? this._data["hardSkipCoef"] : .5;
    }

    get hardSkipBackCoef() {
        return (this._data.hasOwnProperty("hardSkipBackCoef")) ? this._data["hardSkipBackCoef"] : 1;
    }

    get lowVolumeOnWin() {
        return (this._data.hasOwnProperty("lowVolumeOnWin")) ? this._data["lowVolumeOnWin"] : true;
    }

    get delaySkipWin() {
        return (this._data.hasOwnProperty("delaySkipWin")) ? this._data["delaySkipWin"] : 0;
    }

    get clearLinesOnWinLoop() {
        return (this._data.hasOwnProperty("clearLinesOnWinLoop")) ? this._data["clearLinesOnWinLoop"] : this._data["clearLinesOnWin"];
    }

    get gameHaveGamble() {
        return (this._data.hasOwnProperty("gameHaveGamble")) ? this._data["gameHaveGamble"] : false;
    }

    get showWinOnGamble() {
        return (this._data.hasOwnProperty("showWinOnGamble")) ? this._data["showWinOnGamble"] : false;
    }

    get useTotalBetForLimit() {
        return (this._data.hasOwnProperty("useTotalBetForLimit")) ? this._data["useTotalBetForLimit"] : false;
    }

    get realSlotMachine() {
        return this._data.hasOwnProperty("reel_slot_machine");
    }

    slotMachineData(dataName) {
        return (this._data["reel_slot_machine"].hasOwnProperty(dataName))
            ? this._data["reel_slot_machine"][dataName] :
            null;
    }

    get gambleWinLimit() {
        return (this._data.hasOwnProperty("gambleWinLimit")) ? this._data["gambleWinLimit"] : Number.MAX_VALUE;
    }

    get useConfigBlur() {
        return (this._data.hasOwnProperty("useConfigBlur")) ? this._data["useConfigBlur"] : true;
    }

    get countUserBetData() {
        return (this._data.hasOwnProperty("countUserBetData")) ? this._data["countUserBetData"] : 2;
    }

    get languageMap() {
        return (this._data.hasOwnProperty("languageMap")) ? this._data["languageMap"] : defLanguageMap;
    }

    get timeWaitSpinRequest() {
        return (this._data.hasOwnProperty("timeWaitSpinRequest")) ? this._data["timeWaitSpinRequest"] : Number.MAX_VALUE;
    }

    get gameType() {
        return (this._data.hasOwnProperty("gameType")) ? this._data["gameType"] : AppConst.T_GAME_SIMPLE;
    }

    get gameHaveIntroInformation() {
        return this.jsonGameHaveIntroInformation;
    }

    get jsonGameHaveIntroInformation() {
        return (this._data.hasOwnProperty("gameHaveIntroInformation")) ? this._data["gameHaveIntroInformation"] : false;
    }

    get useOn1stReel() {
        return (this._data.hasOwnProperty("useOn1stReel")) ? this._data["useOn1stReel"] : true;
    }

    get paytableDenomination() {
        return (this._data.hasOwnProperty("paytableDenomination")) ? this._data["paytableDenomination"] : false;
    }

    get betWithDenomination() {
        return (this._data.hasOwnProperty("betWithDenomination")) ? this._data["betWithDenomination"] : false;
    }

    get langID() {
        return this._data["langID"];
    }

    get isWaitEffect() {
        return (this._data.hasOwnProperty("isWaitEffect")) ? this._data["isWaitEffect"] : false;
    }

    get waitSymbols() {
        return (this._data.hasOwnProperty("waitSymbols")) ? this._data["waitSymbols"] : [];
    }

    get waitSymbolMap() {
        return (this._data.hasOwnProperty("waitSymbolMap")) ? this._data["waitSymbolMap"] : {};
    }

    get timeWaitReel() {
        return (this._data.hasOwnProperty("timeWaitReel")) ? this._data["timeWaitReel"] : 0;
    }

    get slowSpeedOnWaitForAll() {
        return (this._data.hasOwnProperty("slowSpeedOnWaitForAll")) ? this._data["slowSpeedOnWaitForAll"] : true;
    }

    get effectOnWaitForAll() {
        return (this._data.hasOwnProperty("effectOnWaitForAll")) ? this._data["effectOnWaitForAll"] : true;
    }

    get noBlurActiveReel() {
        return (this._data.hasOwnProperty("noBlurActiveReel")) ? this._data["noBlurActiveReel"] : false;
    }

    get waitSpinSpeed() {
        return (this._data.hasOwnProperty("waitSpinSpeed")) ? this._data["waitSpinSpeed"] : 10;
    }

    get changeWaitSpeedOnEnd() {
        return (this._data.hasOwnProperty("changeWaitSpeedOnEnd")) ? this._data["changeWaitSpeedOnEnd"] : false;
    }

    get waitSpinEndSpeed() {
        return (this._data.hasOwnProperty("waitSpinEndSpeed")) ? this._data["waitSpinEndSpeed"] : 10;
    }

    get waitSpinEndTime() {
        return (this._data.hasOwnProperty("waitSpinEndTime")) ? this._data["waitSpinEndTime"] : 0.15;
    }

    get winAllScattersOnReels() {
        return (this._data.hasOwnProperty("winAllScattersOnReels")) ? this._data["winAllScattersOnReels"] : false;
    }

    get buyFreeBonus() {
        return (this._data.hasOwnProperty("buyFreeBonus")) ? this._data["buyFreeBonus"] : false;
    }

    get forceTurboWin() {
        return (this._data.hasOwnProperty("forceTurboWin")) ? this._data["forceTurboWin"] : .5;
    }

    get forceTurboBigWin() {
        return (this._data.hasOwnProperty("forceTurboBigWin")) ? this._data["forceTurboBigWin"] : 1.5;
    }

    get superTurboModeTimeCoef() {
        return (this._data.hasOwnProperty("superTurboModeTimeCoef")) ? this._data["superTurboModeTimeCoef"] : 0.5;
    }
}
