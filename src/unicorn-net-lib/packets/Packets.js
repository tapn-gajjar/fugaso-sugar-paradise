/**
 * Created by boria on 08.08.16.
 */
export const Packets = {
    PKT_LOGIN_RS: {id: 8, name: 'PACKET_LOGIN_RS'},
    PKT_CURRENCY_RS: {id: 12, name: 'PACKET_CURRENCY_RS'},
    PKT_JOIN_RS: {id: 7, name: 'PACKET_JOIN_RS'},
    PKT_JOIN_DATA_RS: {id: 11, name: 'PACKET_JOIN_DATA_RS'},
    PKT_GAME_DATA_RS: {id: 6, name: 'PACKET_GAME_DATA_RS'},
    PKT_HISTORY_RS: {id: 0x100, name: 'PACKET_HISTORY_RS'},
    PKT_JACKPOTS_RS: {id: 0x101, name: 'PACKET_JACKPOTS_RS'},
    PKT_JACKPOTS_WIN_RS: {id: 0x102, name: 'PACKET_JACKPOTS_WIN_RS'},
    PKT_JACKPOTS_HISTORY_RS: {id: 0x102, name: 'PACKET_JACKPOTS_HISTORY_RS'},
    PKT_BALANCE_RS: {id: 0x103, name: 'PACKET_BALANCE_RS'},
    PKT_CONDITION_RS: {id: 0x104, name: 'PACKET_CONDITION_RS'},
    PKT_ERROR_RS: {id: 0x104, name: 'PACKET_ERROR_RS'},
    PKT_BONUS_RS: {id: 0x104, name: 'PACKET_BONUS_RS'},
    PKT_TOURNAMENT_INFO: {id: 0x105, name: 'PACKET_TOURNAMENT_INFO_RS'},
    PKT_TOURNAMENT_WIN: {id: 0x106, name: 'PACKET_TOURNAMENT_WIN_RS'},
    SPLITTER: 'ÿ',
}
