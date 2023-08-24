import {AppG} from "../../../AppG";
import {AppConst} from "../../../AppConst";

export default class TabBase extends OMY.OContainer {
    constructor(conf) {
        super();
        this._gdConf = this.json = conf;
        OMY.Omy.add.createEntities(this, conf);

        /** @type {OMY.OContainer} */
        this._cContent = this.getChildByName("c_page_content");
        /** @type {OMY.OGraphic} */
        this._maskContent = this.getChildByName("r_content_mask");
        if (!this._maskContent.json.edit)
            this._cContent.mask = this._maskContent;
        this._cContent.y = this._cContent.json.y;
        this._cContent.drag = false;
        this._createGraphic();
        this._updateGameSize();
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _formatContent() {
        !this._cContent.hitArea && OMY.Omy.add.hintArea(this._cContent, this._cContent.getLocalBounds(), 0, this._gdConf["debugHitArea"]);
        if (OMY.Omy.isDesktop) {
            let hitArea = this._cContent.getLocalBounds();
            this._cContent.hitArea.x = hitArea.x - 20;
            this._cContent.hitArea.y = hitArea.y;
            this._cContent.hitArea.width = hitArea.width + 40;
            this._cContent.hitArea.height = this._maskContent.height;
        } else {
            const localBounds = this._cContent.getLocalBounds();
            this._cContent.hitArea.x = -(OMY.Omy.WIDTH - localBounds.width)/2 -100;
            this._cContent.hitArea.y = 0;
            this._cContent.hitArea.width = OMY.Omy.WIDTH + 200;
            this._cContent.hitArea.height = OMY.Omy.HEIGHT;
        }
    }

    _formatCurrencyValue(value, dec = false, spaceClear = false) {
        let text = String(AppG.formatCurrency(value));
        text = OMY.StringUtils.replaceAll(text, " ", " ");
        text = OMY.StringUtils.replaceAll(text, " ", " ");
        if (spaceClear) {
            switch (AppG.language) {
                case "swe":
                case "pol":
                case "ukr":
                case "rus":
                case "nor":
                case "fra": {
                    text = OMY.StringUtils.replaceAll(text, " ", ".");
                    break;
                }
            }
        }
        if (dec && (text.charAt(text.length - 2) === "." || text.charAt(text.length - 2) === ","))
            text = text + "0";
        return text;
    }

    _createGraphic() {

    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);
        this._formatContent();
        this._cContent.emit("content_update");
    }

    kill() {
        this.parent?.removeChild(this);
        super.kill();
    }

    revive() {
        super.revive();
        this._cContent.y = this._cContent.json.y;
    }

    destroy(options) {
        AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        this._gdConf = this.json = null;
        this._cContent = null;
        this._maskContent = null;
        super.destroy(options);
    }

    get cContent() {
        return this._cContent;
    }

    get maskContent() {
        return this._maskContent;
    }
}