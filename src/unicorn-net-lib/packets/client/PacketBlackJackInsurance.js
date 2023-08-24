/**
 * Created by boria on 30.06.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBlackJackInsurance extends PacketBase{
    constructor(use) {
        super();
        this.kind = 'INSURANCE';
        this.use = use;
    }
}