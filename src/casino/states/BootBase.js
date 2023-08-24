import {AppG} from "../AppG";
import {AppConst} from "../AppConst";
import {Warnings} from "../gui/windows/Warnings";
import {GameLoader} from "../../app/states/GameLoader";

export class BootBase extends OMY.OContainer {
    constructor() {
        super();
        this.addAssetsResolution();
        AppG.checkURL();
        AppG.init();

        window.gameResize();
        this.loadGameConst();
    }

    addAssetsResolution() {

    }

    loadGameConst() {
        if (!OMY.Omy.isDesktop)
            OMY.Omy.assets.loadImage("touch.png", AppConst.BASE_PATH + "assets/");
        OMY.Omy.assets.loadJson("GameConst", AppConst.BASE_PATH + "assets/");
        OMY.Omy.assets.loadJson("BootLoad", AppConst.BASE_PATH + "assets/");
        OMY.Omy.assets.loadJson("t_version", "../../tournaments/");

        OMY.Omy.assets.once("complete", this.preload, this);
        OMY.Omy.assets.once("error", this._errorInLoad, this);
        OMY.Omy.assets.startLoad();
        if (BootBase.LOAD_MESSAGE) {
            let style = {
                "x": 121,
                "y": 2,
                fontFamily: "Arial",
                fontSize: "30pt",
                fill: "#FFFFFF",
                type: "textFont",
                oneLine: false,
                strokeThickness: 0,
                stroke: "#000000",
                align: "center",
                alignV: "middle",
                text: "0",
                name: "txt_loading",
                debug: 0,
            };
            this._loadMessTxt = OMY.Omy.add.textJson(this, style, "LOADING\nPLEASE WAIT");
            this._loadMessTxt.x = OMY.Omy.WIDTH * .5;
            this._loadMessTxt.y = OMY.Omy.HEIGHT * .5;
        }
    }

    /**     * @public     */
    preload() {
        AppG.initGameConst();
        OMY.Omy.loc.basePath = AppConst.BASE_PATH;
        if (!OMY.Omy.isDesktop && window.overlay) {
            window.overlay.visible = true;
            window.overlay.ico = OMY.Omy.add.spriteJson(window.overlay, {
                "x": OMY.Omy.WIDTH * .5, "y": OMY.Omy.HEIGHT * .5, "anchor": 0.5,
                "type": "sprite", "texture": "touch.png", "name": "s_ico", "debug": 0,
            });
        }

        AppG.add2Loader(OMY.Omy.assets.getJSON("BootLoad"));

        OMY.Omy.assets.once("complete", this.create, this);
        OMY.Omy.assets.startLoad();
    }

    /**     * @public     */
    create() {
        OMY.Omy.assets.off("error", this._errorInLoad, this);
        OMY.Omy.loc.setLoc(OMY.Omy.assets.getJSON("language"));
        AppG.createMembers();
        OMY.Omy.loc.canChangaLanguage = AppG.gameConst.getData("haveLocalisation");

        OMY.Omy.viewManager.regWO(new Warnings(), AppConst.W_WARNING);

        this.destroy();
        OMY.Omy.game.stage.addChildAt(new GameLoader(), 0);
    }

    /** @private */
    _errorInLoad() {
        this._loadMessTxt?.destroy();
        let style = {
            "x": 121,
            "y": 2,
            fontFamily: "Arial",
            fontSize: "25pt",
            fill: "#FFFFFF",
            type: "textFont",
            oneLine: true,
            strokeThickness: 0,
            stroke: "#000000",
            align: "center",
            text: "0",
            name: "txt_round_id",
            debug: 0,
        };
        const txt = OMY.Omy.add.textJson(this, style, "NO CONNECTION, PLEASE TRY AGAIN!");
        txt.x = OMY.Omy.WIDTH * .5;
        txt.y = OMY.Omy.HEIGHT * .5;
    }

    /**     * @public     */
    destroy(options) {
        this._loadMessTxt = null;
        super.destroy(true);
    }
}

BootBase.LOAD_MESSAGE = false;
