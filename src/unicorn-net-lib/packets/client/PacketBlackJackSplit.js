/**
 * Created by boria on 30.06.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBlackJackSplit extends PacketBase{
    constructor() {
        super();
        this.kind = 'SPLIT';
    }
}