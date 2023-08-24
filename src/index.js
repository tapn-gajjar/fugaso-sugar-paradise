import "pixi-layers";
import {AppConst} from "./casino/AppConst";
import {AppG} from "./casino/AppG";
import {Boot} from "./app/states/Boot";
import * as vers from "./version";
import {GameConstStatic} from "./app/GameConstStatic";
import {BootBase} from "./casino/states/BootBase";
import {GameStage} from "./app/tools/GameStage";

function startGame(div_name = "game-content", width = GameConstStatic.GAME_WIDTH, height = GameConstStatic.GAME_HEIGHT, bgcolor = 0x000000, basepath = "") {
    let container = document.getElementById(div_name);
    if (!container) {
        return;
    } else {
        window.removeEventListener("load", onLoadJs);
    }

    let conf;

    // const vConsole = require('./vconsole.min');

    AppConst.BASE_PATH = basepath;

    // Load them google fonts before starting...!
    window.WebFontConfig = {
        custom: {
            families: [
                "NimbusFont",
                "Prompt-Bold",
                "BebasFont",
                "Mangal"
            ],
            urls: [AppConst.BASE_PATH + "css/stylesheet.css"],
        },

        active: function () {
            console.log("fonts have loaded");
            let gameName = "fugaso-sugar-paradise";
            let initGame = function () {
                console.info("Game v." + vers.version);
                if ((location.hostname.indexOf("sounds.fugaso.com") !== -1 || location.hostname.indexOf("game-proqram.com") !== -1)
                    && (!localStorage.getItem(gameName + "gameVersion") || localStorage.getItem(gameName + "gameVersion") !== vers.version)) {
                    localStorage.setItem(gameName + "gameVersion", vers.version);
                    alert("game was updated. Ver.: " + vers.version);
                }
                console.info("Start in mobile platform: " + PIXI.utils.isMobile.any);
                OMY.OmyConst.vers = vers;

                let config = {
                    width: GameConstStatic.GAME_WIDTH,
                    height: GameConstStatic.GAME_HEIGHT,
                    antialias: false,
                    autoResize: true,
                    backgroundAlpha: false,
                    legacy: true,
                    resolution: /*window.devicePixelRatio*/2,
                };

                if (PIXI.utils.isMobile.any) {
                    OMY.Omy.assetsURL = AppConst.BASE_PATH + "assets/mobile/";
                    config.width = GameConstStatic.MOB_WIDTH;
                    config.height = GameConstStatic.MOB_HEIGHT;
                    OMY.Omy.scale = 1;
                } else {
                    OMY.Omy.assetsURL = AppConst.BASE_PATH + "assets/desktop/";
                    config.width = GameConstStatic.DESK_WIDTH;
                    config.height = GameConstStatic.DESK_HEIGHT;
                    OMY.Omy.scale = 1;
                }

                PIXI.settings.RESOLUTION = config.resolution;
                PIXI.settings.RENDER_OPTIONS.legacy = true;
                OMY.Omy.skipHello();
                console.log("Lib version: ", OMY.Omy.version);

                OMY.OMY_SETTING.WEBP_SUPPORT = true;
                OMY.OMY_SETTING.OGG_SUPPORT = false;
                OMY.OMY_SETTING.TEXT_NUMBER_SHOW_CENT = false;
                OMY.OMY_SETTING.VERBOSE_BUTTONS_STATE = true;
                OMY.OMY_SETTING.ALLOW_DESK_SIZE = true;
                OMY.OMY_SETTING.CACHE_SPINE_ON_START = true;
                BootBase.LOAD_MESSAGE = false;
                PIXINeutrino.registerPlugins();
                config.neutrino = {
                    texturesBasePath: "assets/main/Single/", // Prefix for textures
                };

                if (PIXI.utils.isMobile.apple.phone || PIXI.utils.isMobile.apple.tablet) {
                    PIXI.settings.PRECISION_FRAGMENT = "highp";
                }

                window.game = new OMY.OmyGame(config, new GameStage());
                container.appendChild(window.game.view);
                const ctx = PIXI.Texture.WHITE.baseTexture.resource.source.getContext("2d");
                ctx.fillRect(0, 0, 1, 1);
                AppG.stage = window.game.stage;
                OMY.Omy.showFPS = AppG.getURLParameter("fps") && AppG.getURLParameter("fps") === "true";
                /*OMY.Omy.assets.addFontLocMap({
                    "BebasFont": {
                        "hin": "Mangal",
                        "gre": "Arial",
                        "kor": "Arial",
                    }
                });*/

                let renderer = window.game;
                let conf = config;

                // AppConst.GAME_CONTAINER = (OMY.Omy.isDesktop) ? document.querySelector("body") : container;
                AppConst.GAME_CONTAINER = document.querySelector("body");

                renderer.view.style["position"] = "static";
                renderer.view.style["margin-left"] = "auto";
                renderer.view.style["margin-right"] = "auto";
                renderer.view.style.display = "block";

                window.onresize = null;
                let _showedOverlay = false;
                let fullScreen = true;
                if (AppG.getURLParameter("mobileFullScreen"))
                    fullScreen = AppG.getURLParameter("mobileFullScreen") === "true";

                function _changeFullScreen() {
                    if (_showedOverlay) {
                        _showedOverlay = false;
                        if (window.overlay.parent) OMY.Omy.stage.removeChild(window.overlay);
                    }
                    OMY.Omy.scaleManager.startFullScreen(AppConst.GAME_CONTAINER);
                }

                function androidOverlay() {
                    if (!fullScreen) return;
                    if (!OMY.Omy.scaleManager.isFullScreen) {
                        if (!_showedOverlay) {
                            _showedOverlay = true;
                            OMY.Omy.stage.addChild(window.overlay);
                        }
                        window.overlay.rect.width = OMY.Omy.WIDTH;
                        window.overlay.rect.height = OMY.Omy.HEIGHT;
                        window.overlay.ico?.setXY(OMY.Omy.WIDTH * .5, OMY.Omy.HEIGHT * .5);
                    }
                }

                if (!OMY.Omy.isDesktop && fullScreen) {
                    if (!OMY.Omy.OS.iPhone) {
                        /** @type {OMY.OContainer} */
                        window.overlay = OMY.Omy.add.container(null);
                        window.overlay.visible = false;
                        window.overlay.rect = OMY.Omy.add.rectJson(window.overlay,
                            {x: 0, y: 0, width: 300, height: 200, color: "0x000000"});
                        window.overlay.addUp(_changeFullScreen, this);
                        OMY.Omy.scaleManager.addFullChange(androidOverlay, this);
                    }
                }

                function resize() {
                    if (OMY.Omy.isDesktop) {
                        let w, h;
                        if (OMY.Omy.isDesktop && OMY.Omy.scaleManager.isFullScreen) {
                            w = window.innerWidth;
                            h = window.innerHeight;
                        } else if (container && container.clientWidth) {
                            w = container.clientWidth;
                            h = container.clientHeight;
                        } else {
                            w = document.body.offsetWidth;
                            h = document.body.offsetHeight;
                        }

                        if (w === this._prevW && h === this._prevH) return;
                        this._prevW = w;
                        this._prevH = h;

                        doDesktopResize(w, h);
                        OMY.Omy.stage.rotation = 0;
                        OMY.Omy.stage.x = 0;

                        function doDesktopResize(w, h) {
                            let hProportion, vProportion;
                            let resWidth, resHeight;
                            hProportion = w / GameConstStatic.GAME_WIDTH;
                            vProportion = h / GameConstStatic.GAME_HEIGHT;
                            resWidth = GameConstStatic.GAME_WIDTH;
                            resHeight = GameConstStatic.GAME_HEIGHT;

                            if (hProportion < vProportion) {
                                resHeight = Math.ceil(h / hProportion);
                                OMY.Omy.scale = hProportion;
                            } else {
                                resWidth = Math.ceil(w / vProportion);
                                OMY.Omy.scale = vProportion;
                            }
                            OMY.Omy.WIDTH = conf.width = resWidth;
                            OMY.Omy.HEIGHT = conf.height = resHeight;
                            AppG.dx = conf.width - GameConstStatic.GAME_WIDTH;
                            AppG.dy = conf.height - GameConstStatic.GAME_HEIGHT;

                            AppG.sizeEmmit.emit(AppConst.EMIT_RESIZE, AppG.dx, AppG.dy, AppG.isScreenPortrait);

                            let scale = Math.min(w / conf.width, h / conf.height);
                            let renderWidth = conf.width;
                            let renderHeight = conf.height;

                            OMY.Omy.game.renderer.resize(renderWidth, renderHeight);

                            let canvasWidth = Math.ceil(renderWidth * scale);
                            let canvasHeight = Math.ceil(renderHeight * scale);

                            renderer.view.style.width = `${canvasWidth}px`;
                            renderer.view.style.height = `${canvasHeight}px`;
                        }
                    } else {
                        AppG.isScreenPortrait = window.innerHeight >= window.innerWidth;

                        let w, h;
                        if (container && container.clientWidth) {
                            w = container.clientWidth;
                            h = container.clientHeight;
                        } else {
                            w = document.body.offsetWidth;
                            h = document.body.offsetHeight;
                        }

                        if (w === this._prevW && h === this._prevH) return;
                        this._prevW = w;
                        this._prevH = h;

                        doResize(w, h);
                        OMY.Omy.stage.rotation = 0;
                        OMY.Omy.stage.x = 0;
                        if (OMY.Omy.OS.iPhone) {
                        } else {
                            androidOverlay();
                        }

                        function doResize(w, h) {
                            let hProportion, vProportion;
                            let resWidth, resHeight;
                            if (AppG.isScreenPortrait) {
                                hProportion = w / GameConstStatic.MOB_WIDTH_V;
                                vProportion = h / GameConstStatic.MOB_HEIGHT_V;
                                resWidth = GameConstStatic.MOB_WIDTH_V;
                                resHeight = GameConstStatic.MOB_HEIGHT_V;
                            } else {
                                hProportion = w / GameConstStatic.MOB_WIDTH;
                                vProportion = h / GameConstStatic.MOB_HEIGHT;
                                resWidth = GameConstStatic.MOB_WIDTH;
                                resHeight = GameConstStatic.MOB_HEIGHT;
                            }

                            if (hProportion < vProportion) {
                                resHeight = Math.ceil(h / hProportion);
                                OMY.Omy.scale = hProportion;
                            } else {
                                resWidth = Math.ceil(w / vProportion);
                                OMY.Omy.scale = vProportion;
                            }
                            OMY.Omy.WIDTH = conf.width = resWidth;
                            OMY.Omy.HEIGHT = conf.height = resHeight;
                            if (AppG.isScreenPortrait) {
                                AppG.dx = conf.width - GameConstStatic.MOB_WIDTH_V;
                                AppG.dy = conf.height - GameConstStatic.MOB_HEIGHT_V;
                            } else {
                                AppG.dx = conf.width - GameConstStatic.MOB_WIDTH;
                                AppG.dy = conf.height - GameConstStatic.MOB_HEIGHT;
                            }

                            AppG.sizeEmmit.emit(AppConst.EMIT_RESIZE, AppG.dx, AppG.dy, AppG.isScreenPortrait);

                            let scale = Math.min(w / conf.width, h / conf.height);
                            let renderWidth = conf.width;
                            let renderHeight = conf.height;

                            OMY.Omy.game.renderer.resize(renderWidth, renderHeight);

                            let canvasWidth = Math.ceil(renderWidth * scale);
                            let canvasHeight = Math.ceil(renderHeight * scale);

                            renderer.view.style.width = `${canvasWidth}px`;
                            renderer.view.style.height = `${canvasHeight}px`;
                        }
                    }
                }

                window.gameResize = resize;

                let repeatResize = null;
                if (!OMY.Omy.isDesktop) {
                    repeatResize = function () {
                        OMY.Omy.remove.timer(window.timerResize);
                        window.timerResize = OMY.Omy.add.timer(0.1, window.gameResize, window, 3);
                    };
                } else {
                    repeatResize = function () {
                        window.gameResize();
                    };
                }

                const isLoaderAvailable = window.hasOwnProperty("game_resize_event");
                if (isLoaderAvailable) {
                    window.addEventListener("game_resize", repeatResize.bind(this), false);
                } else {
                    window.addEventListener("resize", repeatResize.bind(this), false);
                }

                if (OMY.Omy.isDesktop) {
                    let fullChange = function () {
                        window.gameResize();
                    };
                    OMY.Omy.scaleManager.addFullChange(fullChange, this);
                }

                OMY.Omy.scaleManager.newResizeHandler();
                window.gameResize();

                console.info("Game size:", config.width, config.height,
                    window.screen.width, window.screen.height, config.resolution, window.devicePixelRatio);

                let onOmyInitDelay = function () {
                    OMY.Omy.game.stage.addChildAt(new Boot(), 0);
                };
                OMY.Omy.add.timer(.2, onOmyInitDelay, this);
            };

            if (window.loaded) {
                initGame();
            } else {
                window.onload = initGame;
            }
        },
    };

    if (window.WebFontConfig.custom.families.length) {
        // include the web-font loader script
        /* jshint ignore:start */
        (function loadFonts() {
            let wf = document.createElement("script");
            wf.src = "https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
            wf.type = "text/javascript";
            wf.async = "true";
            let s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(wf, s);
        })();
        /* jshint ignore:end */
    } else {
        window.WebFontConfig.active();
    }
}

window.loaded = false;

function onLoadJs() {
    window.loaded = true;
    startGame();
}

window.addEventListener("load", onLoadJs);

window.lime = window.lime || {};
window.lime.embed = function embed(div_name, width, height, bgcolor, basepath) {
    window.loaded = true;
    startGame(div_name, width, height, bgcolor, basepath);
};

(function () {
    function pad(number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }

    Date.prototype.toISOString = function () {
        return this.getUTCFullYear() + "-" + pad(this.getUTCMonth() + 1) + "-" + pad(this.getUTCDate());
    };
})();
