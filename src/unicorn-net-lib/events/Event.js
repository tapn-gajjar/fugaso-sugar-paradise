/**
 * Created by boria on 08.08.16.
 */
export class Event{
    constructor(type,data){
        this._type = type;
        this._data = data;
    }

    get data(){
        return this._data;
    }

    get type(){
        return this._type;
    }
}