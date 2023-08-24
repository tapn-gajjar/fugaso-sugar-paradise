/**
 * Created by boria on 07.10.16.
 */
export class PacketBaseRs{
    constructor(data){
        for(let key in data){
            this[key] = data[key];
        }
    }
}