import {AppG} from "../../../../casino/AppG";
import {MenuPaytablePageBase} from "../../../../casino/gui/windows/menu/MenuPaytablePageBase";

export class MenuPaytablePage extends MenuPaytablePageBase {
    constructor(source) {
        super(source);
        this._renderLines(source.getChildByName("c_page_content")
            .getChildByName("c_lines").getChildByName("c_lines_render"));
        this._renderLines(source.getChildByName("c_page_content")
            .getChildByName("c_lines").getChildByName("c_lines_render_v"));
        // this._renderLines(source.getChildByName("c_page_content")
        //     .getChildByName("c_lines").getChildByName("c_lines_render_port1"));
        // this._renderLines(source.getChildByName("c_page_content")
        //     .getChildByName("c_lines").getChildByName("c_lines_render_port2"));
        if (source.getChildByName("c_page_content")
            .getChildByName("c_1").getChildByName("c_pays")) {
            /** @type {OMY.OContainer} */
            let container = source.getChildByName("c_page_content")
                .getChildByName("c_1").getChildByName("c_pays");
            // let i = 2;
            /* while (container.getChildByName("t_multi_" + String(++i))) {
                 /** @type {OMY.OContainer} */
            /*    let multi = OMY.OMath.int(AppG.serverWork.paytable.getPayTableData("@_" + String(i)).cash / AppG.serverWork.currLines);
                container.getChildByName("t_multi_" + String(i)).text = String(multi) + "x";
            }*/
        }

        this._wildAnimContainer = this._cPageContent.getChildByName("c_1").getChildByName("c_paytable_feature");
        this._wildAnim = this._wildAnimContainer.getChildByName("a_paytable_feature");

    }

    _onCheckGraphic() {
        super._onCheckGraphic();
        this._spriteLocList = [];

        if (this._spriteLocList.length) {
            OMY.Omy.loc.addUpdate(this._onLocChange, this);
            this._onLocChange();
        }
        /** @type {OMY.OTextBitmap} */
        this._tRtp = this._cPageContent.getChildByName("c_5").getChildByName("t_rtp");
    }

    /**     * @private     */
    _onLocChange() {
        for (let i = 0; i < this._spriteLocList.length; i++) {
            let sprite = this._spriteLocList[i];
            for (let key in sprite.json["loc"]) {
                if (OMY.OMath.inArray(sprite.json["loc"][key], AppG.language)) {
                    sprite.texture = key;
                    break;
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    destroy() {
        if (this._spriteLocList.length) {
            OMY.Omy.loc.removeUpdate(this._onLocChange, this);
        }
        this._spriteLocList.length = 0;
        this._spriteLocList = null;
        super.destroy();
    }

    revive() {
        super.revive();
        if (this._wildAnim?.parent) {
            this._wildAnimContainer.addChild(this._wildAnim);
            this._wildAnim.gotoAndPlay(0, true);            
        }
    }

    kill() {
        if (this._wildAnim?.parent) {
            this._wildAnimContainer.removeChild(this._wildAnim);
            this._wildAnim.stop();
        }
        super.kill();
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}
