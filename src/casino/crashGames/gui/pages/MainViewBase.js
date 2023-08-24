import {AppConst} from "../../../AppConst";
import {AppG} from "../../../AppG";
import {GameConstStatic} from "../../../../app/GameConstStatic";
import {LogoGame} from "../../../../app/display/LogoGame";
import {PageBase} from "../../../gui/PageBase";
import {LiveBlock} from "../../display/LiveBlock";
import {CrashConst} from "../../CrashConst";
import GamePlay from "../../../../app/display/game/GamePlay";
import HistoryLine from "../../../../app/display/history/HistoryLine";
import HistoryTable from "../../../../app/display/history/HistoryTable";
import BetTable from "../../../../app/display/bet/BetTable";
import BetPanel from "../../../../app/display/bet/BetPanel";
import LoaderPlay from "../../../../app/display/game/LoaderPlay";
import WinPanel from "../../../../app/display/win/WinPanel";
import WarningPanel from "../../../../app/display/win/WarningPanel";
import {TStaticConst} from "../../../tournament/TStaticConst";

export class MainViewBase extends PageBase {
    constructor() {
        super();
        this._wName = AppConst.P_VIEW_MAIN;
        this._nameGD = (OMY.Omy.isDesktop) ? "GDMain" : "GDMainMobile";

        this.json = this._gdConf = OMY.Omy.assets.getJSON(this._nameGD);
        OMY.Omy.add.createEntities(this, this._gdConf);

        this.bg = this._bgGraphic = this.getChildByName("c_game_bg");

        AppG.emit.on(CrashConst.G_START_RECONNECT, this._reConnectStart, this);
        AppG.emit.on(CrashConst.G_END_RECONNECT, this._reConnectEnd, this);
    }

    revive() {
        super.revive();
        MainViewBase.onAir = true;

        this._createGraphic();

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

    _createGraphic() {
        if (this.getChildByName("c_logo"))
            /** @type {LogoGame} */
            this._logo = new LogoGame(this.getChildByName("c_logo"));
        if (this.getChildByName("c_gameplay"))
            /** @type {GamePlay} */
            this._gamePlay = new GamePlay(this.getChildByName("c_gameplay"));

        if (this.getChildByName("g_mask")) {
            this.getChildByName("g_mask").interactChild = false;
            this.getChildByName("g_mask").interactive = false;
        }
        if (this.getChildByName("c_loader"))
            /** @type {LoaderPlay} */
            this._loaderPlay = new LoaderPlay(this.getChildByName("c_loader"));
        if (this.getChildByName("c_history_line"))
            /** @type {HistoryLine} */
            this._historyLine = new HistoryLine(this.getChildByName("c_history_line"));
        if (this.getChildByName("c_history_table"))
            /** @type {HistoryTable} */
            this._historyTable = new HistoryTable(this.getChildByName("c_history_table"));
        if (this.getChildByName("c_bet_table"))
            /** @type {BetTable} */
            this._betTable = new BetTable(this.getChildByName("c_bet_table"));
        if (this.getChildByName("c_bet_panel"))
            /** @type {BetPanel} */
            this._betPanel = new BetPanel(this.getChildByName("c_bet_panel"));
        if (this.getChildByName("c_win_panel"))
            /** @type {WinPanel} */
            this._winPanel = new WinPanel(this.getChildByName("c_win_panel"));
        if (this.getChildByName("c_warning_panel"))
            /** @type {WarningPanel} */
            this._warningPanel = new WarningPanel(this.getChildByName("c_warning_panel"));
        if (this.getChildByName("c_live"))
            /** @type {LiveBlock} */
            this._liveBlock = new LiveBlock(this.getChildByName("c_live"));
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        AppG.updateGameSize(this);
        if (this.bg?._updateGameSize) this.bg._updateGameSize(dx, dy, isScreenPortrait);
    }

    /**     * @public     */
    resetGame() {
        AppG.tournament.emit(TStaticConst.E_SHOW_START_WINDOW);
    }

    changeBgMusic(oldM, newM, time = 2, loopForNew = true) {
        if (OMY.Omy.sound.isSoundExist(newM) && OMY.Omy.sound.isSoundPlay(oldM) && oldM !== newM) {
            OMY.Omy.sound.addFadeEvent(oldM, (a) => {
                OMY.Omy.sound.stopById(a);
            }, this, true);
            OMY.Omy.sound.fade(oldM, time, OMY.Omy.sound.getSoundVolume(oldM), 0);
            GameConstStatic.S_game_bg = newM;
            if (OMY.Omy.sound.isSoundPlay(newM)) OMY.Omy.sound.stop(newM);
            OMY.Omy.sound.play(newM, loopForNew);
            OMY.Omy.sound.fade(newM, time, 0, 1);
        }
    }

    /**     * @private     */
    _reConnectStart() {
        MainViewBase.onAir = false;
        this._logo.destroy();
        this._gamePlay.destroy();
        this._loaderPlay.destroy();
        this._historyLine.destroy();
        this._historyTable.destroy();
        this._betTable.destroy();
        this._betPanel.destroy();
        this._winPanel.destroy();
        this._warningPanel.destroy();
        this._liveBlock.destroy();
        this.callAll("destroy");
        AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    /**     * @private     */
    _reConnectEnd() {
        MainViewBase.onAir = true;
        OMY.Omy.add.createEntities(this, this._gdConf);
        this.bg = this._bgGraphic = this.getChildByName("c_game_bg");
        this._createGraphic();
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._updateGameSize();
    }

}

MainViewBase.onAir = false;
