import {GameConstBase} from "../../casino/tools/GameConstBase";
import {AppG} from "../../casino/AppG";

export class GameConst extends GameConstBase {
    constructor() {
        super();
    }

    get gameHaveIntro() {
        return this._data["gameHaveIntro"] && AppG.showIntro;
    }

    get gameHaveIntroInformation() {
        this.introCheckBoxFlag = localStorage.getItem(AppG.gameConst.langID + "show_intro")
        if(this.introCheckBoxFlag === "false"){
            this.openGame = true
        }else{
            this.openGame = false
        }
        return super.gameHaveIntroInformation && AppG.showIntro && (this.openGame ||this.introCheckBoxFlag == null ) ;
    }
}
