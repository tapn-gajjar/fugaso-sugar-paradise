export class JpCounter {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._graphic.alignY = -1;
        this._gdConf = graphic.json;
        /** @type {OMY.OContainer} */
        this._canvas = this._graphic.canvas;
        this._canvas.getChildByName("t_currency").cacheAsBitmap = true;
        this._textValue = "0.00";
        this._tweening = false;
        this._firstUpdate = true;
        this._list = [];
        this._map = [];
        this._valuePool = [];
        let i = -1;
        while (this._canvas.getChildByName("s_" + String(++i))) {
            this._list.push(this._canvas.getChildByName("s_" + String(i)));
        }
        this._needUpdateAlign = true;
    }

    /**     * @private     */
    _updateData() {
        if (this._tweening || this._valuePool.length === 0) return;
        let haveTween = false;
        const stringValue = this._valuePool.shift();
        const countNumber = this._list.length;
        const n = stringValue.length - 1;
        for (let i = n; i >= 0; i--) {
            /** @type {OMY.OSprite} */
            let text;
            /** @type {OMY.OSprite} */
            let newText;
            /** @type {String} */
            let char = stringValue.charAt(i);
            if ((n - i) >= countNumber) {
                newText = this._getNew(n - i);
            } else {
                text = this._list[n - i];
                if (!text) {

                    OMY.Omy.error("catch", n - i);
                }
                if (text.userData !== char) {
                    if (this._firstUpdate) {
                        text.texture = text.json["_texture"] + ((char === ".") ? "dot" : char);
                        text.userData = char;
                    } else {
                        newText = this._getNew(n - i);
                        newText.x = text.x;
                        OMY.Omy.add.tween(text, {
                            y: text.y - text.height - this._gdConf["dy"],
                            ease: "none",
                            onCompleteParams: [text],
                        }, this._gdConf["time"], this._setNew.bind(this));
                    }
                }

            }

            if (newText) {
                newText.texture = newText.json["_texture"] + ((char === ".") ? "dot" : char);
                newText.userData = char;
                this._list[n - i] = newText;
                if (!this._firstUpdate) {
                    haveTween = true;
                    let tweenY = newText.y;
                    newText.y += newText.height + this._gdConf["dy"];
                    OMY.Omy.add.tween(newText, {
                        y: tweenY,
                        ease: "none",
                    }, this._gdConf["time"]);
                    if (!this._tweening) this._tweening = true;
                }
            }
        }
        if (this._list.length > stringValue.length) {
            for (let i = stringValue.length; i < this._list.length; i++) {
                this._setNew(this._list[i]);
            }
            this._list.length = stringValue.length;
        }

        if (this._firstUpdate || countNumber !== this._list.length) {
            for (let i = 1; i < this._list.length; i++) {
                let text = this._list[i];
                text.x = this._list[i - 1].x - text.width;
            }
            this._needUpdateAlign = true;
        }
        if (haveTween) OMY.Omy.add.timer(this._gdConf["time"], this._endTweening, this);
        else this._checkUpdateAlign();
        if (this._firstUpdate) this._firstUpdate = false;
    }

    /**     * @private     */
    _endTweening() {
        OMY.Omy.add.timer(this._gdConf["delay"], () => {
            this._tweening = false;
            this._updateData();
            this._checkUpdateAlign();
        }, this);
    }

    /**     * @private     */
    _checkUpdateAlign() {
        if (this._needUpdateAlign) {
            this._needUpdateAlign = false;
            if (this._firstUpdate) {
                this._graphic.updateTransform();
                this._graphic.alignContainer();
                this._graphic.alpha = 0;
                OMY.Omy.add.tween(this._graphic.parent.mask.scale, {x: 1}, 0.1);
                OMY.Omy.add.tween(this._graphic, {alpha: 1}, 0.5);
            }
            OMY.Omy.add.timer(0.03, this._graphic.alignContainer, this._graphic, 4);
        }
    }

    /**     * @private     */
    _getNew(index) {
        let result;
        if (this._map.length) {
            result = this._map.shift();
            result.revive();
            this._canvas.addChild(result);
        } else {
            result = OMY.Omy.add.spriteJson(this._canvas, this._gdConf["copy"]);
        }
        result.name = "s_" + String(index);
        result.x = 0;
        result.y = result.json.y;
        return result;
    }

    /**     * @private     */
    _setNew(sprite) {
        this._canvas.removeChild(sprite);
        sprite.kill();
        sprite.userData = null;
        this._map.push(sprite);
    }

    jpData(value, force = false) {
        //OMY.Omy.info("update jp value", value, "old", this._textValue);
        if (this._textValue !== value) {
            /*if (force) {
                console.warn("%c TODO::JpCounter ==> jpData :144: " + "",
                    "color: white; background-color: " + OMY.StringUtils.color("JpCounter", "jpData", "144"),
                    "old", this._textValue, "new", value, "count active value", this._valuePool.length, "tween", this._tweening);
            }*/
            this._textValue = value;
            if (force) this._valuePool.length = 0;
            this._valuePool.push(value);
            this._updateData();
        }
    }
}