import {AppG} from "../AppG";
import {Main} from "../../app/states/Main";
import {AppConst} from "../AppConst";
import {ResponsibleMess} from "../display/gui/ResponsibleMess";
import {SoundMess} from "../display/gui/SoundMess";

export class GameLoaderBase extends OMY.OContainer {
    constructor() {
        super();
        this._createLoaderStage();
    }

    _createLoaderStage() {
        this._loaderDiv = document.getElementById("loader-css");
        this._canvas = OMY.Omy.add.container(this, 0, 0);
        this._canvas.x = OMY.Omy.WIDTH * .5 - AppG.dx;
        this._canvas.y = OMY.Omy.HEIGHT * .5;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDGameLoader");
        OMY.Omy.add.createEntities(this._canvas, this.json);

        if (this._canvas.getChildByName("s_background"))
            this._sBackground = this._canvas.getChildByName("s_background");

        this._isResponsOpened = AppG.showResponsibleGame;
        this._loadProgress = 0;
        this._allLoaded = false;
        if (this._isResponsOpened) {
            if (this._loaderDiv)
                this._loaderDiv.style.display = "none";
            this._responsWarning = new ResponsibleMess(this._canvas.getChildByName("c_respons_warning"),
                this._onCloseRespons.bind(this));
        } else {
            this._canvas.getChildByName("c_respons_warning").destroy();
            window.game.renderer.backgroundAlpha = 0;
        }
        this._soundWarning = new SoundMess(this._canvas.getChildByName("c_sound_warning"),
            this._onSoundChoiceRespons.bind(this));
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        AppG.serverWork.connectToServer(this._onConnectToApi.bind(this));
        window.gameResize();
        this._updateGameSize();
    }

    _updateGameSize() {
        AppG.updateGameSize(this._canvas);

        this._canvas.x = OMY.Omy.WIDTH * .5;
        this._canvas.y = OMY.Omy.HEIGHT * .5;

        if (this._cSnow) {
            const m = AppG.isScreenPortrait ? "v_" : "m_";
            const scaleBGx = OMY.Omy.WIDTH / this._cSnow.json[m + "i_width"];
            const scaleBGy = OMY.Omy.HEIGHT / this._cSnow.json[m + "i_height"];
            this._cSnow.scale.set(Math.max(scaleBGx, scaleBGy));
        }
    }

    _onConnectToApi() {
        if (AppG.tournament.active) {
            OMY.Omy.assets.loadJson("TConst", AppG.tournament.BASE_PATH);
            OMY.Omy.assets.loadJson("TLoad", AppG.tournament.BASE_PATH + AppG.tournament.theme + "/");
        }
        this._loadBoot2();
    }

    /**     * @private     */
    _loadBoot2() {
        OMY.Omy.assets.once("complete", this._onLoadBootLoad2, this);
        OMY.Omy.assets.once("error", this._errorInLoad, this);
        AppG.add2Loader(OMY.Omy.assets.getJSON("BootLoad2"));
    }

    _onLoadBootLoad2() {
        OMY.Omy.add.createEntities(this._canvas, this.json[(AppG.isHaveJackpot) ? "loader_jp" : "loader"]);

        /** @type {OMY.OActorSpine} */
        this._logoCanvas = this._canvas.getChildByName("a_load");
        this._logoCanvas.gotoAndPlay(0);
        this._onPlayAllLogo = false;
        this._logoCanvas.addComplete(this._onPlayLogo, this, true);
        /** @type {OMY.OContainer} */
        this._cSnow = this._canvas.getChildByName("c_snow");
        if (this._cSnow) {
            /** @type {OMY.OActorSpine} */
            this._aSnow = this._cSnow.getChildByName("a_snow");
            this._aSnow.setMixByName(this._aSnow.json["custom_a_name"], this._aSnow.json["a_loop"], 0.1);
            this._aSnow.gotoAndPlay(0);
        }
        if (this._loaderDiv)
            this._loaderDiv.style.display = "none";
        window.game.renderer.backgroundAlpha = 1;
        let barColor = this._canvas.getChildByName("c_progress").getChildByName("s_progress_back");
        let bar = this._canvas.getChildByName("c_progress").getChildByName("s_progress");

        this._maskGraphic = OMY.Omy.add.maskRectJson(this._canvas.getChildByName("c_progress"), {
            x: barColor.x, y: barColor.y,
            width: barColor.width, height: barColor.height,
            type: "rect", name: "r_progress_mask", debug: 0,
        });
        bar.mask = this._maskGraphic;
        this._maskGraphic.scale.x = 0.01;

        if (this._canvas.getChildByName("c_respons_warning")) {
            this._canvas.addChild(this._canvas.getChildByName("c_respons_warning"));
            this._logoCanvas.alpha = 0;
            if (this._aSnow)
                this._aSnow.alpha = 0;
            this._canvas.getChildByName("c_progress").alpha = 0;
        }

        window.gameResize();
        this._updateGameSize();
        this.preload();
    }

    /**     * @public     */
    preload() {
        if (this.json["edit"]) return;
        if (AppG.tournament.active) {
            AppG.tournament.onLoadConst();
            AppG.add2Loader(OMY.Omy.assets.getJSON("TLoad")["main"], AppG.tournament.BASE_PATH);
            AppG.add2Loader(OMY.Omy.assets.getJSON("TLoad")[(OMY.Omy.isDesktop) ? "desktop" : "mobile"], AppG.tournament.BASE_PATH);
        }
        OMY.Omy.assets.once("complete", this.create, this);
        OMY.Omy.assets.on("progress", this._loadingProgress, this);
        OMY.Omy.assets.once("error", this._errorInLoad, this);
        AppG.add2Loader(OMY.Omy.assets.getJSON("loadConfig")["load"]);

        let url;
        this._jsonFile = OMY.Omy.assets.getJSON("loadConfig");
        let obj;

        if (this._jsonFile.particle && this._jsonFile.particle.length) {
            this._particleJson = [];
            for (let i = 0; i < this._jsonFile.particle.length; i++) {
                url = AppConst.BASE_PATH + "assets/particles/";
                obj = this._jsonFile.particle[i];
                OMY.Omy.assets.loadJson(obj.name, url);
                this._particleJson.push(obj["name"]);
            }
        }

        OMY.Omy.assets.startLoad();
    }

    /** @private */
    _errorInLoad() {
        OMY.Omy.viewManager.getView(AppConst.W_WARNING).show(AppConst.WARNING_LOAD_ASSETS);
    }

    _loadingProgress(progress) {
        this._maskGraphic.scale.x = progress / 100;
        this._loadProgress = progress;
        // this._txtLoading.text = Math.round(progress) + "%";
    }

    /**     * @private     */
    _onPlayLogo() {
        this._onPlayAllLogo = true;
        if (this._allLoaded) {
            this._continueAllLoaded();
        } else {
            this._logoCanvas.gotoAndPlay(0, true, this._logoCanvas.json["a_loop"]);
            if (this._aSnow)
                this._aSnow.gotoAndPlay(0, true, this._aSnow.json["a_loop"]);
        }
    }

    /**     * @private     */
    _onCloseRespons() {
        if (this._logoCanvas) {
            this._logoCanvas.alpha = 1;
            if (this._aSnow)
                this._aSnow.alpha = 1;
            window.game.renderer.backgroundAlpha = 1;
            if (this._loaderDiv)
                this._loaderDiv.style.display = "none";
        } else {
            if (this._loaderDiv)
                this._loaderDiv.style.display = "flex";
            window.game.renderer.backgroundAlpha = 0;
        }
        if (this._canvas.getChildByName("c_progress"))
            this._canvas.getChildByName("c_progress").alpha = 1;
        OMY.Omy.add.timer(0.5, this._onCloseResponsFinal, this);
    }

    /**     * @private     */
    _onCloseResponsFinal() {
        this._isResponsOpened = false;
        if (this._allLoaded) this._continueAllLoaded();
    }

    /**     * @public     */
    create() {
        this._loadingProgress(100);

        OMY.Omy.assets.off("progress", this._loadingProgress, this);
        OMY.Omy.assets.off("error", this._errorInLoad, this);

        if (this._jsonFile.spriteSheetEff && this._jsonFile.spriteSheetEff.length) {
            OMY.Omy.assets.addCustomEffect(this._jsonFile.spriteSheetEff);
        }
        if (this._jsonFile.particle) {
            for (let i = 0; i < this._jsonFile.particle.length; i++) {
                OMY.Omy.assets.initBundle(this._jsonFile.particle[i].name);
            }
            if (OMY.Omy.debugMode && this._particleJson) {
                for (let j = 0; j < this._particleJson.length; j++) {
                    let json = OMY.Omy.assets.getJSON(this._particleJson[j]);
                    OMY.Omy.groupCollapsed('RevoltFS: ' + this._particleJson[j]);
                    if (json.emitters) {
                        const listNames = [];
                        for (let i = 0; i < json.emitters.length; i++) {
                            listNames.push(json.emitters[i].name);
                        }
                        OMY.Omy.info("particles emitters: ", listNames);
                    }
                    if (json.sequences) {
                        const listNames = [];
                        for (let i = 0; i < json.sequences.length; i++) {
                            listNames.push(json.sequences[i].name);
                        }
                        OMY.Omy.info("particles sequences: ", listNames);
                    }
                    OMY.Omy.groupEnd();
                }
            }
        }

        // let graphic = Omy.add.container();
        // graphic.addChild(Omy.add.tint(0, 0, 1, 0x000000));
        // Omy.add.sprite(graphic, Omy.WIDTH * .5, Omy.HEIGHT * .5, 'LogoSprite').setAnchor(.5, .5);
        // Omy.loc.addGraphic(graphic);
        if (AppG.locMode) {
            OMY.Omy.error("on localisation mode. pls use key 5 and 6 to change language. " +
                "And console method changeLoc(loc_const)");

            window.changeLoc = function (loc) {
                let index = AppG.languageList.indexOf(loc);
                if (index < 0) {
                    index = 0;
                    OMY.Omy.error('not correct lang', loc);
                }
                OMY.Omy.warn("change to " + AppG.languageList[index]);
                OMY.Omy.loc.changeLauguage(AppG.languageList[index]);
                AppG.language = AppG.languageList[index];
                OMY.Omy.navigateBtn.unBlockingScreen();
            };

            this._decLanguage = function () {
                let index = AppG.languageList.indexOf(OMY.Omy.language);
                if (--index < 0)
                    index = AppG.languageList.length - 1;
                OMY.Omy.warn("change to " + AppG.languageList[index]);
                OMY.Omy.loc.changeLauguage(AppG.languageList[index]);
                AppG.language = AppG.languageList[index];
                OMY.Omy.navigateBtn.unBlockingScreen();
            };
            this._incLanguage = function () {
                let index = AppG.languageList.indexOf(OMY.Omy.language);
                if (++index > AppG.languageList.length - 1)
                    index = 0;
                OMY.Omy.warn("change to " + AppG.languageList[index]);
                OMY.Omy.loc.changeLauguage(AppG.languageList[index]);
                AppG.language = AppG.languageList[index];
                OMY.Omy.navigateBtn.unBlockingScreen();
            };
            OMY.Omy.keys.registerFunction(OMY.Key._5, this._decLanguage, this);
            OMY.Omy.keys.registerFunction(OMY.Key._6, this._incLanguage, this);
        }
        let render = OMY.Omy.assets.getJSON("Render");
        render && OMY.Omy.assets.generateTextures(render["render"]);

        if (this._jsonFile.neutrino?.length) {
            this._particleNeutrinoJson = [];
            for (let i = 0; i < this._jsonFile.neutrino.length; i++) {
                this._particleNeutrinoJson.push(this._jsonFile.neutrino[i]["name"]);
            }
            OMY.Omy.assets.once("complete", this._onNeutrinoComplete, this);
            // OMY.Omy.assets.on("progress", this._loadingProgress, this);
            OMY.Omy.assets.once("error", this._errorInLoad, this);
            AppG.add2Loader(this._jsonFile.neutrino);
            return;
        }
        this._continueAllLoaded();
    }

    /**     * @private     */
    _onNeutrinoComplete() {
        OMY.Omy.assets.off("progress", this._onNeutrinoComplete, this);
        OMY.Omy.assets.off("error", this._errorInLoad, this);
        if (OMY.Omy.debugMode && this._particleNeutrinoJson) {
            OMY.Omy.groupCollapsed('Neutrino: ');
            OMY.Omy.info("particles names: ", this._particleNeutrinoJson);
            OMY.Omy.groupEnd();
        }
        this._continueAllLoaded();
    }

    /**     * @private     */
    _continueAllLoaded() {
        this._allLoaded = true;
        if (this._isResponsOpened) return;
        if (!this._onPlayAllLogo) return;
        AppG.emit.emit(AppConst.ASSETS_LOADED);

        this._timerLogo?.destroy();
        this._timerLogo = null;
        this._logoCanvas.alpha = 0;
        if (this._aSnow)
            this._aSnow.alpha = 0;
        this._canvas.getChildByName("c_progress").alpha = 0;
        this._soundWarning.show();
    }

    /**     * @private     */
    _onSoundChoiceRespons() {
        AppG.createTxtRound();
        OMY.Omy.add.timer(AppG.gameConst.getData("delayStartMain"), this.destroy, this);
        OMY.Omy.add.timer(0.02, this._createMain, this);
    }

    _createBitmapFont(json) {
        for (let bitmapFontJsonKey in json) {
            if (json[bitmapFontJsonKey].currency) {
                for (let i = 0; i < AppG.currency.length; i++) {
                    json[bitmapFontJsonKey].chars += AppG.currency.charAt(i) + " ";
                }
            }
        }
        OMY.Omy.assets.createBitmapFont(json);
    }

    _createMain() {
        OMY.Omy.assets.cacheAnimations(() => {
            new Main();
        });
    }

    /**     * @public     */
    destroy(options = true) {
        AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        if (this._loaderDiv)
            this._loaderDiv.remove();
        this._maskGraphic = null;
        this._canvas = null;
        this._sBackground = null;
        this._txtLoading = null;
        this._logoCanvas = null;
        this._aSnow = null;
        this._cSnow = null;
        this._responsWarning = null;
        this._soundWarning = null;
        super.destroy(options);
    }
}
