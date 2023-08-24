/**
 * Created by boria on 10.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketCollect extends PacketBase{
    constructor() {
        super();
        this.kind = 'COLLECT';
    }
}