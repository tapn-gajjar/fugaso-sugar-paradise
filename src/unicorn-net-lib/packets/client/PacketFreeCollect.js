/**
 * Created by boria on 10.10.16.
 */
/**
 * Created by boria on 10.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketFreeCollect extends PacketBase{
    constructor(){
        super();
        this.kind = 'FREE_COLLECT';
    }
}