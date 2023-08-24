export const CrashConst = {
    S_ROUND_START: "round_start",
    S_ROUND_END: "round_end",
    S_ROUND_RUNNING: "round_running",

    S_GAME_STATE_UPDATE: "game_state_update",

    S_MULTIPLIER: "multiplier",

    ROUND_CREATE_STATE: 4,
    ROUND_INCREASE_STATE: 3,
    ROUND_BET_STATE: 2,

    EMIT_ON_BET_SET: "on_bet_set",
    EMIT_ON_CANCEL_SET: "on_cancel_set",
    EMIT_ON_CASHOUT_SET: "on_cashout_set",

    BET_DATA_UPDATE: "bet_data_update",
    AUTO_BET: "auto_bet",
    CANCEL_AUTO_BET: "cancel_auto_bet",

    COUNT_ON_HISTORY_TABLE: 40,
    COUNT_ON_TOP_HISTORY_TABLE: 25,
    EMIT_ON_HISTORY_UPDATE: "on_history_update",
    EMIT_ON_HISTORY_TOP_UPDATE: "on_history_top_update",
    EMIT_ON_GET_ROUND: "emit_on_get_round",

    EMIT_ON_BETS_UPDATE: "on_bets_update",
    COUNT_ON_USER_BET_TABLE: 35,
    COUNT_ON_LEADER_BET_TABLE: 25,
    COUNT_ON_BET_TABLE: 100,

    EMIT_TABLE_TOGGLE: "on_table_toggle",
    T_NONE: "table_none",
    T_BET: "table_bet",
    T_HISTORY: "table_history",

    EMIT_ON_COUNT_PLAYER: "on_count_player",

    formatRoundTime :function (serverTime){
        /** @type {String} */
        let time = new Date(serverTime).toLocaleString("en-GB", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: "long",
            hour: '2-digit',
            hour12: false,
            minute: '2-digit',
            second: '2-digit'
        });
        time = time.split(",")[2];
        time = (time[0] === " ") ? time.slice(1) : time;
        return time;
    },

    formatRoundDate :function (serverTime){
        /** @type {String} */
        let time = new Date(serverTime).toLocaleString("en-GB", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: "long",
            hour: '2-digit',
            hour12: false,
            minute: '2-digit',
            second: '2-digit'
        });
        time = time.split(",")[1];
        time = (time[0] === " ") ? time.slice(1) : time;
        return time;
    },

    WARNING_BET_STATE: "warning_bet_state",
    WARNING_CRASH_CRITICAL: "warning_crash_critical",
    LOC_CONST_WARN:{
        "INVALID_TOKEN":{
            head:"warnings_title_code_1",
            text:"warnings_des_code_1"
        },
        "SAME_SESSION":{
            head:"warnings_title_code_1",
            text:"warnings_des_code_1"
        },
        "INCORRECT_GAME_STATE":{
            head:"warnings_title_code_1",
            text:"warnings_bet_3"//"warnings_des_code_1"
        },
        "SOMETHING_WENT_WRONG":{
            head:"warnings_title_code_1",
            text:"warnings_des_code_1"
        },
        "NOT_VALID_BET":{
            head:"warnings_title_code_1",
            text:"warnings_des_code_1"
        },
        "INCORRECT_BET_INDEX":{
            head:"warnings_title_code_1",
            text:"warnings_des_code_1"
        },
        "INSUFFICIENT_BALANCE":{
            head:"warnings_text1",
            text:"warnings_text2"
        },
        "BET_WAS_NOT_PLACED":{
            head:"warnings_text1",
            text:"warnings_bet_1"
        },
        "BET_WAS_ALREADY_PLACED":{
            head:"warnings_text1",
            text:"warnings_bet_2"
        },
        "MAGNIFY_MAN_IS_BUSTED":{
            head:"warnings_text1",
            text:"warnings_bet_3"
        }
    },
    WARNING_MESSAGE: "warning_message",

    KEY_MOBILE_OPEN: "key_mobile_open",
    KEY_MOBILE_CLOSE: "key_mobile_close",

    G_START_RECONNECT: "start_reconnect",
    G_END_RECONNECT: "end_reconnect",

    EMIT_ON_CASHOUT: "emit_on_cashout",
};
