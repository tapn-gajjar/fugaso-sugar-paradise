import {AppG} from "../AppG";

export class MainBase {
    constructor() {
        AppG.gameIsLoad = true;
        let isFpsActive = localStorage.getItem(AppG.gameConst.langID + "is_fps_active");
        if (isFpsActive === null) isFpsActive = "false";
        OMY.OMY_SETTING.RENDER_FPS = (isFpsActive === "true") ? 30 : 60;
        OMY.Omy.game.updateRenderSetting();

        if (!OMY.Omy.isDesktop)
            OMY.Omy.game.addGameActive(this._onActiveGame, this);
        AppG.state.showGame();
    }

    _onActiveGame() {
        OMY.Omy.add.timer(.5, window.gameResize, window, 15);
        // window.gameResize();
    }
}