/**
 * Created by boria on 23.09.17.
 */
import {PacketBase} from './PacketBase';

export class PacketBingoBuyTickets extends PacketBase{
    constructor(count) {
        super();
        this.kind = 'BUY_TICKETS';
        this.count = count;
    }
}