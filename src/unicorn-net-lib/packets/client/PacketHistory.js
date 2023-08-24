/**
 * Created by boria on 10.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketHistory extends PacketBase{
    constructor(limit) {
        super();
        this.kind = 'HISTORY';
        this.limit = limit;
    }
}