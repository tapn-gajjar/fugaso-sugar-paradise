/**
 * Created by boria on 30.06.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBlackJackHit extends PacketBase{
    constructor() {
        super();
        this.kind = 'HIT';
    }
}