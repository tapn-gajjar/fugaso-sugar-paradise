import {GameConst} from "../app/tools/GameConst";
import {WildSystem} from "../app/data/WildSystem";
import {GameWinData} from "../app/data/GameWinData";
import {WinSymbolD} from "../app/data/WinSymbolD";
import {AppConst} from "./AppConst";
import {SlotState} from "../app/SlotState";
import {ServerWork} from "../app/server/ServerWork";
import * as vers from "./version";
import {AutoGameRules} from "./tools/AutoGameRules";
import {Tournament} from "./tournament/Tournament";

let _playerId = null;
let _sessionId = null;
let _password = null;
let _operatorId = false;
let _isLocal = false;
let _payInUrl = null;
let _homeInUrl = false;
let _closeUrl = null;
let _gameName = null;
let _hostUrl = null;
let _mode = null;
let _isProduct = false;
let _showResponsibleGame = false;
let _realityCheckTime = 1800;
let _realityCheckElapsed = 1800;
let _historyUrl = null;
let _playingForFun = false;
let _isHaveJackpot = true;
let _showIntro = true;
let _optionallyDecByValue = true;
let _locMode = false;
let _serverConsole = false;
let _offWinEffect = false;

let _language = "";
let _defaultLanguage = "";
let _languageList = [];
let _urlLanguageList = {
    "en": "eng",
    "fr": "fra",
    "de": "deu",
    "it": "ita",
    "nw": "nor",
    "pt": "prt",
    "ru": "rus",
    "is": "esp",
    "sk": "swe",
    "tk": "tur",
    "gb": "gb",
    "au": "gb",
    "ca": "can",
    "ja": "jpn",
    "uk": "ukr",
    "pl": "pol",
    "ro": "ron",
    "el": "gre",
    "zh_cn": "zh_cn",
    "zh_tw": "zh_tw",
    "hi": "hin",
    "ko": "kor",
    "id": "ind",
    "th": "tha",
    "vi": "vie",
};
let _currency = "";
let _customCurrency = null;

let _needCollect = false;
let _moveReels = false;
let _isFreeGame = false;
let _beginFreeGame = false;
let _isEndFree = false;
let _isMoreFreeGame = false;
let _isBonusGame = false;
let _beginBonusGame = false;
let _isEndBonusGame = false;
let _isRichSpinBegin = false;
let _isRichSpinEnd = false;
let _isRichSpin = false;
let _jacpotIsShowing = false;

let _skipped = false;
let _skippedWin = false;
let _isMoveReels = false;

/*@type {GameConst} */
let _gameConst;
/*@type {WildSystem} */
let _wildSystem;
/*@type {GameWinData} */
let _dataWins;
/*@type {ServerWork} */
let _serverWork;
/*@type {SlotState} */
let _state;
/**
 * Rules for auto game
 * @type {AutoGameRules}
 */
let _autoGameRules;
/*@type {Tournament} */
let _tournament;

let _winSymbolStorage = [];
let _activeSymbolList = null;

let _winCredit = 0;
let _isWin;
let _autoStart = false;
let _isRespin = false;
let _isBeginRespin = false;
let _isEndRespin = false;
let _isTurbo = false;
let _isSuperTurbo = false;
let _gameRoundTxt = null;
let _gameRoundId = 0;

let _isTest = false;

let _gameIsLoad = false;

let _emit;

let _isWarning = false;
let _not_connection = false;

let _reelsTest = null;

let _dx = 0;
let _dy = 0;
let _isScreenPortrait = false;
let _sizeEmmit = new OMY.OmyConst.Emit();

let _incTimeTake = 0;
let _showWinTime = 0;
let _winCoef = 0;
let _winValueOnCurrency = false;
let _maxUrlAuto = NaN;
let _notLoadSounds = false;

let _isDeVersion = false;
let _isHaveTurbo = true;
let _isHaveAuto = true;
let _isHaveSkip = true;
let _country = null;
let _curacao = false;

let _gameType = NaN;

const localesCurrencyMap = {
    eng: "en",
    fra: "fr",
    deu: "de",
    ita: "it",
    nor: "no",
    prt: "pt",
    rus: "ru",
    ukr: "uk",
    pol: "pl",
    ron: "ro",
    gre: "el",
    esp: "es",
    swe: "sv",
    tur: "tr",
    jpn: "ja",
    zh_cn: "zh-CN",
    zh_tw: "zh-TW",
    hin: "hi",
    kor: "ko",
    ind: "in",
    tha: "th",
    vie: "vi",
    gb: "en",
    can: "en"
}

let _stage = null;

export class AppG {
    static init() {
        _gameConst = new GameConst();
        _stage = window.game.stage;
        _emit = new OMY.OmyConst.Emit();
    }

    static initGameConst() {
        console.info("Casino API v." + vers.version);
        _gameConst.createData();
        OMY.Omy.loc.setLanguageMap(_gameConst.languageMap);

        if (_isDeVersion) {
            OMY.Omy.assets.getJSON("GameConst")["gameHaveJackpot"] = false;
            OMY.Omy.assets.getJSON("GameConst")["defaultDesiredTime"] = OMY.Omy.assets.getJSON("GameConst")["deVDesiredTime"] || 5000;
            OMY.Omy.assets.getJSON("GameConst")["defaultLanguage"] = "deu";
        }

        _defaultLanguage = _language = _gameConst.getData("defaultLanguage");
        _languageList = _gameConst.getData("languageIDs");
        AppG.languageUrl = localStorage.getItem("choiceLanguage") || AppG.getURLParameter("language")
            || AppG.getURLParameter("lang") || _language;
        _winValueOnCurrency = _gameConst.getData("winValueOnCurrency");
        if (!isNaN(_maxUrlAuto))
            _gameConst.getData("autoSpinNumber")[_gameConst.getData("autoSpinNumber").length - 1] = _maxUrlAuto;
        _gameType = _gameConst.gameType;
    }

    static createMembers() {
        _serverWork = new ServerWork();
        _wildSystem = new WildSystem(_gameConst.getData("wildSymbol"));
        _dataWins = new GameWinData();
        _autoGameRules = new AutoGameRules();
        _state = new SlotState();
        /*@type {Tournament} */
        _tournament = new Tournament();
    }

    static createTxtRound(txtField) {
        if (_gameRoundTxt) {
            _gameRoundTxt.destroy();
        }
        if (txtField) {
            _gameRoundTxt = txtField;
            _gameRoundTxt.text = String(_gameRoundId);
        } else {
            let style = {
                x: 1258,
                y: 49,
                fontFamily: "Arial",
                fontSize: "12pt",
                fill: "#FFFFFF",
                type: "textFont",
                oneLine: true,
                strokeThickness: 1,
                stroke: "#000000",
                align: "right",
                text: "",
                debug: 0,
            };
            _gameRoundTxt = OMY.Omy.add.textJson(OMY.Omy.game.stage, style, String(_gameRoundId));
            _gameRoundTxt.visible = _isTest;
        }
    }

    static set gameRoundId(value) {
        if (value) {
            _gameRoundId = String(value);
            if (_gameRoundTxt) _gameRoundTxt.text = String(_gameRoundId);
        }
    }

    static convertID(reelId = 0, symbolId = 0) {
        return reelId * _serverWork.totalReel + _gameConst.getData("countSlot") - symbolId - 1;
    }

    static setWinSymbolD(wd) {
        wd.clear();
        _winSymbolStorage.push(wd);
    }

    static getWinSymbolD() {
        let answer = null;
        if (_winSymbolStorage.length) {
            answer = _winSymbolStorage.shift();
        } else {
            answer = new WinSymbolD();
        }

        return answer;
    }

    /**     * @public     */
    static checkURL() {
        if (AppG.getURLParameter("customCurrency")) {
            if (AppG.getURLParameter("customCurrency") === "true")
                _customCurrency = "£€$¥¥₽₴₪﷼";
            else
                _customCurrency = AppG.getURLParameter("customCurrency");
        }
        _serverConsole = AppG.getURLParameter("serverConsole") === "true" || _serverConsole;
        _offWinEffect = AppG.getURLParameter("offWinEffect") === "true" || _offWinEffect;
        _showResponsibleGame = AppG.getURLParameter("responsibleGame") === "true" || _showResponsibleGame;
        _realityCheckTime = AppG.getURLParameter("realityCheckInterval") || _realityCheckTime;
        _realityCheckElapsed = AppG.getURLParameter("realityCheckElapsed") || _realityCheckElapsed;
        _historyUrl = AppG.getURLParameter("historyUrl") || _historyUrl;
        _payInUrl = AppG.getURLParameter("payInUrl");
        _closeUrl = AppG.getURLParameter("closeUrl");
        _hostUrl = AppG.getURLParameter("hostUrl");
        // _homeInUrl = AppG.getURLParameter("lobby") === "true";
        _isProduct = Boolean(AppG.getURLParameter("gameName"));
        _password = AppG.getURLParameter("password");
        _playerId = AppG.getURLParameter("playerId") || AppG.getURLParameter("userName");
        _operatorId = AppG.getURLParameter("operatorId");
        _sessionId = AppG.getURLParameter("sessionId");
        _gameName = AppG.getURLParameter("gameName");
        _mode = AppG.getURLParameter("mode");
        window._debugWin = AppG.getURLParameter("customWinValue") || 0;
        _playingForFun = _mode === "demo";
        if (AppG.getURLParameter("jackpot")) _isHaveJackpot = AppG.getURLParameter("jackpot") === "true";
        if (AppG.getURLParameter("mute") && AppG.getURLParameter("mute") === "true") OMY.Omy.sound.mute();
        if (AppG.getURLParameter("showIntro"))
            _showIntro = AppG.getURLParameter("showIntro") && AppG.getURLParameter("showIntro") === "true";
        if (AppG.getURLParameter("autoPlay"))
            _optionallyDecByValue = AppG.getURLParameter("autoPlay") && AppG.getURLParameter("autoPlay") === "true";
        if (AppG.getURLParameter("locEditMode") && AppG.getURLParameter("locEditMode") === "true") _locMode = true;
        if (AppG.getURLParameter("maxUrlAuto")) _maxUrlAuto = AppG.getURLParameter("maxUrlAuto");
        if (AppG.getURLParameter("rtsMode")) _notLoadSounds = AppG.getURLParameter("rtsMode") === "true";
        if (AppG.getURLParameter("curacao")) _curacao = AppG.getURLParameter("curacao") === "true";
        if (AppG.getURLParameter("country")) {
            _country = AppG.getURLParameter("country").toLowerCase();
            switch (_country) {
                case "de": {
                    _isDeVersion = true;
                    _isHaveTurbo = false;
                    _isHaveAuto = false;
                    _isHaveSkip = false;
                    break;
                }
            }
        }
    }

    static getURLParameter(name) {
        const parDecoded = decodeURIComponent(location.search);
        return (new RegExp("[?|&]" + name + "=" + "([^&]+?)(&|#|$)").exec(parDecoded) || [, ""])[1].replace(/\+/g, "%20") || null;
    }

    static getTimeByWinValue(win, config, saveInc = false) {
        config = config || {min: 1.5, max: 4.0, total: 20000.0};

        win = win / AppG.serverWork.betForLimit;
        let percent = OMY.OMath.toPercent(win, config.total);
        percent = percent > 100 ? 100 : percent;
        let time = ((percent * (config.max - config.min) / 100) + config.min);
        // console.error("AppG ==> getTimeByWinValue: " + "", time);
        if (saveInc) _incTimeTake = time;
        return time;
    }

    static add2Loader(configArray, BASE_PATH) {
        for (let i = 0, l = configArray.length; i < l; ++i) {
            const loadElement = configArray[i];
            const baserUrl = BASE_PATH || (loadElement["deviceFolder"] ? OMY.Omy.assetsURL : AppConst.BASE_PATH);
            const isMobile = loadElement["isMobile"] ? !OMY.Omy.isDesktop : OMY.Omy.isDesktop;
            const needed = loadElement.hasOwnProperty("isMobile") ? isMobile : true;
            const active = loadElement.hasOwnProperty("active") ? loadElement["active"] : true;
            if (!active) continue;
            if (_notLoadSounds && loadElement["loader"] === "loadAudioSprite") {
                const sounds = OMY.Omy.assets.getJSON("loadConfig")["sound"];
                for (let j = 0; j < sounds.length; j++) {
                    const loadElementS = sounds[j];
                    if (loadElementS["name"]) {
                        needed && OMY.Omy.assets[loadElementS["loader"]](loadElementS["name"], baserUrl + loadElementS["file"] + loadElementS["name"], loadElementS["volume"], loadElementS["type"]);
                    } else {
                        for (let k = loadElementS["round"][0]; k < loadElementS["round"][1] + 1; k++) {
                            const name = loadElementS["pref"] + String(k);
                            needed && OMY.Omy.assets[loadElementS["loader"]](name, baserUrl + loadElementS["url"] + name + loadElementS["suf"], loadElementS["volume"], loadElementS["type"]);
                        }
                    }
                }
                continue;
            }
            if (!AppG.isHaveJackpot && loadElement.hasOwnProperty("jpContent") && loadElement["jpContent"] === true)
                continue;

            switch (loadElement["specType"]) {
                case "language": {
                    needed && OMY.Omy.assets[loadElement["loader"]](loadElement["name"], baserUrl + loadElement["file"] +
                        (_gameConst.languageMap[OMY.Omy.language] || OMY.Omy.language) + ".json");
                    break;
                }
                case "loadAudio": {
                    if (loadElement["name"]) {
                        needed && OMY.Omy.assets[loadElement["loader"]](loadElement["name"], baserUrl + loadElement["file"], loadElement["volume"], loadElement["type"]);
                    } else {
                        for (let j = loadElement["round"][0]; j < loadElement["round"][1] + 1; j++) {
                            const name = loadElement["pref"] + String(j);
                            needed && OMY.Omy.assets[loadElement["loader"]](name, baserUrl + loadElement["url"] + name + loadElement["suf"], loadElement["volume"], loadElement["type"]);
                        }
                    }
                    break;
                }
                default: {
                    if (loadElement["name"]) {
                        needed && OMY.Omy.assets[loadElement["loader"]](loadElement["name"], baserUrl + loadElement["file"], loadElement);
                    } else {
                        for (let j = loadElement["round"][0]; j < loadElement["round"][1] + 1; j++) {
                            const name = loadElement["pref"] + String(j) + loadElement["suf"];
                            needed && OMY.Omy.assets[loadElement["loader"]](name, baserUrl + loadElement["url"], loadElement);
                        }
                    }
                    break;
                }
            }
        }
    }

    static updateGameSize(container) {
        OMY.Omy.updateGameSize(container, this.dx, this.dy, this.isScreenPortrait);
    }

    static get isProduct() {
        return _isProduct;
    }

    static get mode() {
        return _mode;
    }

    static get hostUrl() {
        return _hostUrl;
    }

    static get gameName() {
        return _gameName;
    }

    static get closeUrl() {
        return _closeUrl;
    }

    static get URL() {
        return "";
    }

    static get playingForFun() {
        return _playingForFun;
    }

    static set languageUrl(value) {
        if (value) value = value.toLowerCase();
        if (_urlLanguageList.hasOwnProperty(value)) {
            _language = OMY.Omy.language = _urlLanguageList[value];
        } else {
            if (_gameConst.getData("languageIDs").indexOf(value) !== -1) _language = OMY.Omy.language = value;
            else _language = OMY.Omy.language = _defaultLanguage;
        }
    }

    static set language(value) {
        if (_languageList.indexOf(value) !== -1) {
            _language = OMY.Omy.language = value;
        } else {
            _language = OMY.Omy.language = _defaultLanguage;
        }
    }

    static get language() {
        return _language;
    }

    static get languageList() {
        return _languageList;
    }

    /**     * @returns {GameConst}     */
    static get gameConst() {
        return _gameConst;
    }

    /**     * @returns {GameStage}     */
    static get stage() {
        return _stage;
    }

    /**     * @returns {GameStage}     */
    static set stage(value) {
        _stage = value;
    }

    /**     * @returns {WildSystem}     */
    static get wildSystem() {
        return _wildSystem;
    }

    /**     * @returns {GameWinData}     */
    static get dataWins() {
        return _dataWins;
    }

    /**     * @returns {ServerWork}     */
    static get serverWork() {
        return _serverWork;
    }

    static get totalReel() {
        return _serverWork.totalReel;
    }

    static get countFreeGame() {
        return _serverWork.countFreeGame;
    }

    static get totalFreeGame() {
        return _serverWork.totalFreeGame;
    }

    static get lastCards() {
        return _serverWork.lastCards;
    }

    static get onlyLastCard() {
        return _serverWork.onlyLastCard;
    }

    static get gameHaveFree() {
        return _gameConst.getData("gameHaveFree");
    }

    static get gameHaveGamble() {
        return _gameConst.gameHaveGamble;
    }

    static get isFreeGame() {
        return _isFreeGame;
    }

    static set isFreeGame(value) {
        _isFreeGame = value;
    }

    static get isBonusGame() {
        return _isBonusGame;
    }

    static set isBonusGame(value) {
        _isBonusGame = value;
    }

    static get winCredit() {
        if (_winValueOnCurrency) return OMY.OMath.roundNumber(_winCredit / _serverWork.creditType, 100);
        else return OMY.OMath.roundNumber(_winCredit, 100);
    }

    static set winCredit(value) {
        _winCredit = value;
        _emit.emit(AppConst.APP_EMIT_ON_WIN, _winCredit);
    }

    static get totalWinInSpin() {
        if (_winValueOnCurrency) return OMY.OMath.roundNumber(_serverWork.totalWinInSpin / _serverWork.creditType, 100);
        else return OMY.OMath.roundNumber(_serverWork.totalWinInSpin, 100);
    }

    static get totalRespinWin() {
        if (_winValueOnCurrency) return OMY.OMath.roundNumber(_serverWork.totalRespinWin / _serverWork.creditType, 100);
        else return OMY.OMath.roundNumber(_serverWork.totalRespinWin, 100);
    }

    /**
     * Format currency
     * @param {number} value
     * @param {boolean} isCurrency
     * @returns {string}
     */
    static formatCurrency(value, isCurrency = false) {
        let options = {};
        if (isCurrency) {
            options = {
                style: "currency",
                currency: AppG.currency,
            };
        }
        return new Intl.NumberFormat(localesCurrencyMap[AppG.language], options).format(value);
    }

    static get creditType() {
        return _serverWork.creditType;
    }

    static get isWin() {
        return _isWin;
    }

    static set isWin(value) {
        _isWin = value;
    }

    static get beginFreeGame() {
        return _beginFreeGame;
    }

    static set beginFreeGame(value) {
        _beginFreeGame = value;
    }

    static get isEndFree() {
        return _isEndFree;
    }

    static set isEndFree(value) {
        _isEndFree = value;
    }

    static get isMoreFreeGame() {
        return _isMoreFreeGame;
    }

    static set isMoreFreeGame(value) {
        _isMoreFreeGame = value;
    }

    static get beginBonusGame() {
        return _beginBonusGame;
    }

    static set beginBonusGame(value) {
        _beginBonusGame = value;
    }

    static get isEndBonusGame() {
        return _isEndBonusGame;
    }

    static set isEndBonusGame(value) {
        _isEndBonusGame = value;
    }

    static get autoStart() {
        return _autoStart;
    }

    static set autoStart(value) {
        _autoStart = value;
    }

    static get isAutoGame() {
        return _autoGameRules ? _autoGameRules.isAutoGame : false;
    }

    static get isRespin() {
        return _isRespin;
    }

    static set isRespin(value) {
        _isRespin = value;
    }

    static get gameHaveRespin() {
        return _gameConst.getData("gameHaveRespin");
    }

    static get isBeginRespin() {
        return _isBeginRespin;
    }

    static set isBeginRespin(value) {
        _isBeginRespin = value;
    }

    static set isEndRespin(value) {
        _isEndRespin = value;
    }

    static get isEndRespin() {
        return _isEndRespin;
    }

    static set isTurbo(value) {
        _isTurbo = value;
        _emit.emit(AppConst.APP_ON_TURBO, _isTurbo);
    }

    static get isTurbo() {
        return _isTurbo;
    }

    static set isSuperTurbo(value) {
        _isSuperTurbo = value;
        _emit.emit(AppConst.APP_ON_SUPER_TURBO, _isSuperTurbo);
    }

    static get isSuperTurbo() {
        return _isSuperTurbo;
    }

    /**
     * @returns {PIXI.utils.EventEmitter}
     */
    static get emit() {
        return _emit;
    }

    /**     * @returns {SlotStateBase}     */
    static get state() {
        return _state;
    }

    static get gameIsLoad() {
        return _gameIsLoad;
    }

    static set gameIsLoad(value) {
        _gameIsLoad = value;
    }

    static get isWarning() {
        return _isWarning;
    }

    static set isWarning(value) {
        _isWarning = value;
    }

    static get not_connection() {
        return _not_connection;
    }

    static set not_connection(value) {
        _not_connection = value;
        _emit.emit(AppConst.APP_WARNING_NO_INET, value);
    }

    static get reelsTest() {
        return _reelsTest;
    }

    static set reelsTest(value) {
        _reelsTest = value;
    }

    static get dx() {
        return _dx;
    }

    static set dx(value) {
        _dx = value;
    }

    static get dy() {
        return _dy;
    }

    static set dy(value) {
        _dy = value;
    }

    static get isScreenPortrait() {
        return _isScreenPortrait;
    }

    static set isScreenPortrait(value) {
        _isScreenPortrait = value;
    }

    static get sizeEmmit() {
        return _sizeEmmit;
    }

    static get incTimeTake() {
        return _incTimeTake;
    }

    static set forceIncTimeTake(value) {
        _incTimeTake = value;
    }

    static get winCoef() {
        return _winCoef;
    }

    static set winCoef(value) {
        _winCoef = value;
    }

    static get operatorId() {
        return _operatorId;
    }

    static get password() {
        return _password;
    }

    static get playerId() {
        return _playerId;
    }

    static get sessionId() {
        return _sessionId;
    }

    static get isLocal() {
        return _isLocal;
    }

    static get payInUrl() {
        return _payInUrl;
    }

    static get showResponsibleGame() {
        return _showResponsibleGame;
    }

    static get realityCheckTime() {
        return _realityCheckTime;
    }

    static get realityCheckElapsed() {
        return _realityCheckElapsed;
    }

    static get historyUrl() {
        return _historyUrl;
    }

    static get isNeedHome() {
        return _homeInUrl;
    }

    static set isNeedHome(value) {
        _homeInUrl = value;
    }

    static get needCollect() {
        return _needCollect;
    }

    static set needCollect(value) {
        _needCollect = value;
    }

    static get currency() {
        return /*_playingForFun ? "" : _currency*/ _currency;
    }

    static get customCurrency() {
        return _customCurrency;
    }

    static set currency(value) {
        _currency = value;
    }

    static get moveReels() {
        return _moveReels;
    }

    static set moveReels(value) {
        _moveReels = value;
    }

    static get autoGameRules() {
        return _autoGameRules;
    }

    /**     * @returns {Tournament}     */
    static get tournament() {
        return _tournament;
    }

    static get isRichSpinBegin() {
        return _isRichSpinBegin;
    }

    static set isRichSpinBegin(value) {
        _isRichSpinBegin = value;
    }

    static get isRichSpinEnd() {
        return _isRichSpinEnd;
    }

    static set isRichSpinEnd(value) {
        _isRichSpinEnd = value;
    }

    static get isRichSpin() {
        return _isRichSpin;
    }

    static set isRichSpin(value) {
        _isRichSpin = value;
    }

    static set jacpotIsShowing(value) {
        _jacpotIsShowing = value;
    }

    static get jacpotIsShowing() {
        return _jacpotIsShowing;
    }

    static get isHaveJackpot() {
        return _isHaveJackpot && _gameConst.gameHaveJackpot;
    }

    static get showIntro() {
        return _showIntro;
    }

    static get showWinTime() {
        return _showWinTime;
    }

    static set showWinTime(value) {
        _showWinTime = value;
    }

    static get locMode() {
        return _locMode;
    }

    static get notLoadSounds() {
        return _notLoadSounds;
    }

    static get skipped() {
        return _skipped;
    }

    static set skipped(value) {
        _skipped = value;
    }

    static get isMoveReels() {
        return _isMoveReels;
    }

    static set isMoveReels(value) {
        _isMoveReels = value;
    }

    static get isHaveTurbo() {
        return _isHaveTurbo;
    }

    static get isHaveAuto() {
        return _isHaveAuto;
    }

    static get isHaveSkip() {
        return _isHaveSkip;
    }

    static get country() {
        return _country;
    }

    static get gameRoundId() {
        return _gameRoundId;
    }

    static get skippedWin() {
        return _skippedWin;
    }

    static set skippedWin(value) {
        _skippedWin = value;
    }

    static get isPLayFreeSpins() {
        return _beginFreeGame || _isFreeGame || _isEndFree;
    }

    static get isPLayReSpins() {
        return _isBeginRespin || _isRespin || _isEndRespin;
    }

    static get activeSymbolList() {
        return _activeSymbolList;
    }

    static set activeSymbolList(value) {
        _activeSymbolList = value;
    }

    static get serverConsole() {
        return _serverConsole;
    }

    static get gameType() {
        return _gameType;
    }

    static get isGameSimple() {
        return _gameType === AppConst.T_GAME_SIMPLE;
    }

    static get isGameDrop() {
        return _gameType === AppConst.T_GAME_DROP;
    }

    static get isGameCrash() {
        return _gameType === AppConst.T_GAME_CRASH;
    }

    static get debugWin() {
        return window._debugWin || 0;
    }

    static get optionallyDecByValue() {
        return _optionallyDecByValue;
    }

    static get offWinEffect() {
        return _offWinEffect;
    }

    static get curacao() {
        return _curacao;
    }
}
