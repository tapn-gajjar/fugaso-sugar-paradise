/**
 * Created by boria on 11.08.16.
 */
import {PacketBase} from './PacketBase';

export class PacketBetLine extends PacketBase{
    constructor(bet, line) {
        super();
        this.bet = Number.parseInt(bet);
        this.line = Number.parseInt(line);
        this.kind = 'BET_LINE';
    }
}