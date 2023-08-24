/**
 * Created by boria on 10.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketBetSpin extends PacketBase {
    constructor(bet, line, denom, betCounter) {
        super();
        this.bet = Number.parseInt(bet);
        this.line = Number.parseInt(line);
        this.denom = Number.parseInt(denom);
        this.betCounter  = Number.parseInt(betCounter);
        this.kind = 'BET_SPIN';
    }
}