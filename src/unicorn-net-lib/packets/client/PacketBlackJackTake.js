/**
 * Created by boria on 30.06.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBlackJackTake extends PacketBase{
    constructor() {
        super();
        this.kind = 'TAKE';
    }
}