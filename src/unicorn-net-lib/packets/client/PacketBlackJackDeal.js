/**
 * Created by boria on 30.06.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBlackJackDeal extends PacketBase{
    constructor(bets) {
        super();
        this.kind = 'DEAL';
        this.bets = bets;
    }
}