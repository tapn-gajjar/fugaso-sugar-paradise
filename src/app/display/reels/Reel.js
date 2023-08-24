import {ReelBase} from "../../../casino/display/reels/ReelBase";
import {AppConst} from "../../../casino/AppConst";
import {AppG} from "../../../casino/AppG";

export class Reel extends ReelBase {
    constructor(conf, index, initCombination) {
        super(conf, index, initCombination);

        this._timeForLongReel = AppG.gameConst.getData("timeForLongReel");
        this._stoppingMoveSpeed = AppG.gameConst.getData("stoppingMoveSpeed");
        this._waitSpinEndSpeed = AppG.gameConst.getData("waitSpinEndSpeed");
        this._waitSpinEndTime = AppG.gameConst.getData("waitSpinEndTime");
        this._changeWaitSpeedOnEnd = AppG.gameConst.getData("changeWaitSpeedOnEnd");
        
    }

    stopMoveSpeed() {
        if (this.deaccelerationTween) {
            this.deaccelerationTween.kill();
            this.deaccelerationTween = null;
        }
        this.slowMoveSpeedOnEnd();
        this.deaccelerationTween = OMY.Omy.add.tween(this,
            {speed: this.otherVector * this._stoppingMoveSpeed}, this._timeForLongReel);
    }

    slowMoveSpeedOnEnd(){
        let time = this._timeForLongReel -  this._waitSpinEndTime;
        if(this._changeWaitSpeedOnEnd){
            OMY.Omy.add.timer(time, () => {
                this.deaccelerationTween = OMY.Omy.add.tween(this,
                    {speed: this.otherVector * this._waitSpinEndSpeed}, this._waitSpinEndTime);  
            }, this);
        }
    }
}
