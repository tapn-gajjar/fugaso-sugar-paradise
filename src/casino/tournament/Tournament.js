import {AppG} from "../AppG";
import {TConst} from "./TConst";
import {TStaticConst} from "./TStaticConst";
import {BtnWidget} from "./widget/BtnWidget";
import {TStartWindow} from "./windows/TStartWindow";
import {AppConst} from "../AppConst";
import {TFinalWindow} from "./windows/TFinalWindow";
import {TRulesWindow} from "./rules/TRulesWindow";
import {PanelWidget} from "./widget/PanelWidget";
import {TVers} from "./TVers";

export class Tournament extends OMY.OmyConst.Emit {
    constructor() {
        super();
        this._active = false;
        this._tournamnetPlaying = false;
        this._haveTournamentWin = false;
        this._isTournamentWinner = false;
        this._vers = new TVers();
        this._constJson = new TConst();

        this._winPlace = 0;
        this._tournamentName = "";
        this._winAmount = 0;
        this._debugTour = AppG.getURLParameter("test_tournament") || false;
        this._urlTheme = AppG.getURLParameter("tourTheme");
        this._offTournament = AppG.getURLParameter("offTournament") || false;
        switch (this._urlTheme) {
            case "themeMain": {
                this._theme = TStaticConst.DEF_THEME;
                break;
            }
            case "themeBlue": {
                this._theme = TStaticConst.BLUE_THEME;
                break;
            }
            case "themePurple": {
                this._theme = TStaticConst.PURPLE_THEME;
                break;
            }
            case "themeYellow": {
                this._theme = TStaticConst.YELLOW_THEME;
                break;
            }

            default: {
                this._theme = TStaticConst.DEF_THEME;
                break;
            }
        }
    }

    checkActivated(tournamentData) {
        if (this._offTournament) return;
        if (tournamentData) {
            this._tournamentData = tournamentData;
            this._tournamnetPlaying = this._tournamentData.current?.dateEnd &&
                ((this._tournamentData.current?.dateEnd - this._tournamentData.current?.dateStart) > 0);
            this._haveTournamentWin = this._tournamentData.pendingWins;
            if (this._tournamnetPlaying || this._haveTournamentWin) {
                this._active = true;
                AppG.emit.once(AppConst.ASSETS_LOADED, this._onGameLoaded, this);
                if (this._debugTour) {
                    window.testTournamentPlace = (place, win) => {
                        AppG.tournament._onUpdateWinHandler({place: place - 1, amount: win || 1000});
                        AppG.tournament.showUserWin();
                    };
                }
            }
            this._checkServerData();
        }
    }

    onLoadConst() {
        this._constJson.onLoad();
        console.info("Tournament version:", this._vers.version, "build:", this._vers.build);
        OMY.Omy.assets.getJSON("TLoad")["main"].push(this._constJson.getData("theme")[this._theme]);
    }

    /**     * @private     */
    _onGameLoaded() {
        const elementJsonName = this._constJson.getData("theme")[this._theme]["name"];
        this._elementsJson = OMY.Omy.assets.getJSON(elementJsonName);
        const json = OMY.Omy.assets.getJSON("ThemeGui")[elementJsonName];
        for (let jsonKey in json) {
            OMY.OMath.objectCopy(this._elementsJson[jsonKey], json[jsonKey], true);
        }
        if (this._tournamnetPlaying) {
            AppG.serverWork.on(AppG.serverWork.TOURNAMENT_UPDATE, this._onUpdateInfoHandler, this);
            this._btnWidget = new BtnWidget(this);
            if (OMY.Omy.isDesktop && !AppG.isGameCrash) this._panelWidget = new PanelWidget();
            OMY.Omy.viewManager.regWO(new TStartWindow(), TStaticConst.W_START_TOURNAMENT);
            OMY.Omy.viewManager.regWO(new TRulesWindow(), TStaticConst.W_RULES_TOURNAMENT);
            this.once(TStaticConst.E_SHOW_START_WINDOW, this._onCheckStartWindow, this);
        }

        OMY.Omy.assets.addChars2BitmapFont("t_start1_font", AppG.currency,
            this._constJson.getData("t_start1_font_config"));
        OMY.Omy.assets.addChars2BitmapFont("t_rules1_font", AppG.currency,
            this._constJson.getData("t_rules1_font_config"));
        OMY.Omy.viewManager.regWO(new TFinalWindow(), TStaticConst.W_FINAL_TOURNAMENT);
        AppG.serverWork.on(AppG.serverWork.TOURNAMENT_WIN, this._onUpdateWinHandler, this);
    }

    /**     * @private     */
    _onCheckStartWindow() {
        let isShowStartW = localStorage.getItem(this._constJson.version + "show_start_tournament");
        if (!isShowStartW) {
            isShowStartW = "true";
            localStorage.setItem(this._constJson.version + "show_start_tournament", isShowStartW);
        }
        if (isShowStartW === "true")
            OMY.Omy.viewManager.showWindow(TStaticConst.W_START_TOURNAMENT, false,
                OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer"));
        else
            this.emit(TStaticConst.E_CREATE_BTN_WIDGET);
    }

    /**     * @private     */
    _checkServerData() {
        if (this._tournamnetPlaying) {
            if (!this._tournamentData.current) return;
            this._userBalance = this._tournamentData.current.position?.balance ?? 0;
            this._userPlace = this._tournamentData.current.position?.index + 1 ?? 0;
            this._startTime = this._tournamentData.current.dateStart;
            this._endTime = this._tournamentData.current.dateEnd;
            this._constJson.setTVersion(this._endTime);
            this._minBet = this._tournamentData.current.minBet;
            this._minBetEuro = this._tournamentData.current.minBetEuro;
            this._rate = this._tournamentData.current.rate;
            this._share = this._tournamentData.current.share;
            this._places = this._tournamentData.current.places;
            OMY.OMath.sortNumber(this._places, "balance", false);
            this._maxWinPlace = this._tournamentData.current.rewards.length;
            this._tournamentName = this._tournamentData.current.name;
            const rewardsData = this._tournamentData.current.rewards;
            this._rewards = [];
            let value = 0;
            for (let i = 0; i < rewardsData.length; i++) {
                if (i < 10) {
                    this._rewards.push({place: String(i + 1), reward: rewardsData[i]});
                } else if (value !== rewardsData[i]) {
                    if (value !== 0 && Number(this._rewards[this._rewards.length - 1].place) !== i)
                        this._rewards[this._rewards.length - 1].place += "-" + String(i);
                    value = rewardsData[i];
                    this._rewards.push({place: String(i + 1), reward: rewardsData[i]});
                } else if ((i === rewardsData.length - 1) && Number(this._rewards[this._rewards.length - 1].place) !== i) {
                    this._rewards[this._rewards.length - 1].place += "-" + String(rewardsData.length);
                }
            }
        }
    }

    /**     * @private     */
    _onUpdateInfoHandler(tournamentData) {
        this._tournamentData = tournamentData;
        this._checkServerData();
    }

    /**     * @private     */
    _onUpdateWinHandler(tournamentWinData) {
        this._winPlace = tournamentWinData.place + 1;
        this._winAmount = tournamentWinData.amount;
        this._isTournamentWinner = true;

        this._userBalance = tournamentWinData.balanceTour ?? 0;
        this._userPlace = this._winPlace ?? 0;

        if (tournamentWinData.winners) {
            this._places = tournamentWinData.winners;
            OMY.OMath.sortNumber(this._places, "balance", false);
        }
    }

    showUserWin() {
        this._isTournamentWinner = false;
        if (OMY.Omy.viewManager.getView(TStaticConst.W_RULES_TOURNAMENT)?.active)
            OMY.Omy.viewManager.hideWindow(TStaticConst.W_RULES_TOURNAMENT);
        if (OMY.Omy.viewManager.getView(TStaticConst.W_FINAL_TOURNAMENT)?.active)
            OMY.Omy.viewManager.getView(TStaticConst.W_FINAL_TOURNAMENT).updateNewTournamentData();
        else
            OMY.Omy.viewManager.showWindow(TStaticConst.W_FINAL_TOURNAMENT, false,
                OMY.Omy.viewManager.gameUI.getWindowLayer("c_tour_layer"));
    }

    get active() {
        return this._active;
    }

    get theme() {
        return this._theme;
    }

    /**
     * @returns {TConst}
     */
    get constJson() {
        return this._constJson;
    }

    /**
     * @returns {TVers}
     */
    get vers() {
        return this._vers;
    }

    get startTime() {
        return this._startTime;
    }

    get tournamentName() {
        return this._tournamentName
    }

    get endTime() {
        return this._endTime;
    }

    get minBet() {
        return this._minBet;
    }

    get minBetEuro() {
        return this._minBetEuro;
    }

    get rate() {
        return this._rate;
    }

    get share() {
        return this._share;
    }

    get places() {
        return this._places;
    }

    get rewards() {
        return this._rewards;
    }

    get maxWinPlace() {
        return this._maxWinPlace;
    }

    get winPlace() {
        return this._winPlace;
    }

    get winAmount() {
        return this._winAmount;
    }

    get isTournamentWinner() {
        return this._isTournamentWinner;
    }

    get debugTour() {
        return this._debugTour;
    }

    get elementsJson() {
        return this._elementsJson;
    }

    get BASE_PATH() {
        return "../../tournaments/";
    }

    get userBalance() {
        return this._userBalance;
    }

    get userPlace() {
        return this._userPlace;
    }
}