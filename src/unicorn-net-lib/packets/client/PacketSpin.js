/**
 * Created by boria on 10.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketSpin extends PacketBase{
    constructor() {
        super();
        this.kind = 'SPIN';
    }
}