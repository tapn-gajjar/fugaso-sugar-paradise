/**
 * Created by boria on 22.09.17.
 */
export const BingoPackets = {
    LOGIN: 'LOGIN',
    CURRENCIES: 'CURRENCIES',
    BUY_TICKETS: 'BUY_TICKETS',
    /**
     * Notify about the time remained till pulling the balls.
     */
    ASK_DRAW: 'ASK_DRAW',
    /**
     * Notify about start of the new round and beginning of selling tickets.
     */
    START_ROUND: 'START_ROUND',
    /**
     * Notify about start of pulling balls. Tickets are not selling after that moment.
     */
    PULL_BALLS: 'PULL_BALLS',
    /**
     * Notify about new ball during pulling.
     */
    NEW_BALL: 'NEW_BALL',
    /**
     * Notify about catching a LINE.
     */
    LINE: 'LINE',
    /**
     * Notify about catching LINE and BINGO.
     */
    BINGO_LINE: 'BINGO_LINE',
    /**
     * Notify about catching BINGO and end of th round.
     */
    BINGO: 'BINGO',
    /**
     * Notify about end of the round if current player has no bingo in the round.
     */
    END_ROUND: 'END_ROUND',
    /**
     * Jackpots map and players online
     */
    JACKPOTS: 'JACKPOTS'
}