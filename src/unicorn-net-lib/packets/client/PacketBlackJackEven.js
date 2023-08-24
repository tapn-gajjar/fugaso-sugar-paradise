/**
 * Created by boria on 30.06.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBlackJackEven extends PacketBase{
    constructor(use) {
        super();
        this.kind = 'EVEN';
        this.use = use;
    }
}