/**
 * Created by boria on 05.08.16.
 */
import {SlotNetworkManager} from './SlotNetworkManager'
import {BlackJackNetworkManager} from './BlackJackNetworkManager'
import {Packets} from './packets/Packets'
import {BlackJackPackets} from './packets/BlackJackPackets'
import {PacketGameDataType} from './packets/server/PacketGameDataRs'
import {BingoPackets} from './packets/BingoPackets'
import {BingoNetworkManager} from './BingoNetworkManager'
import {RoulettePackets} from './packets/RoulettePackets'
import {RouletteNetworkManager} from './RouletteNetworkManager'
import {RouletteBetBean} from './beans/RouletteBetBean'
import {RouletteBetCategory} from './beans/RouletteBetCategory'
import {EcoleController} from './EcoleController'
import {SimplexController} from "./SimplexController";

class PlayerController {
    constructor(session, host) {
        /*this.gameName = "bookoftattoo";
         var session = {
         "userName": "toker",
         "sessionId": "1750",
         "operatorId": "1700",
         "mode": "static",
         "gameName": this.gameName
         };*/

        this.netManager = new SlotNetworkManager(host,
            JSON.stringify(session),
            '000000', '50');
        $('#input-game').val(session.gameName);

        this.netManager.addListener(Packets.PKT_LOGIN_RS.name, e => {
            console.log('LOGIN RESPONSE: ', e.data);
        });

        this.netManager.addListener(Packets.PKT_CURRENCY_RS.name, e => {
            console.log('CURRENCY: ', e.data);
        });
        this.netManager.addListener(Packets.PKT_JOIN_RS.name, e => {
            console.log('JOIN RESPONSE ', e.data);
            var packet = e.data;
            this.tickets = packet.tickets;
        });
        this.netManager.addListener(Packets.PKT_JOIN_DATA_RS.name, e => {
            console.log('JOIN DATA: ', e.data);
        });
        this.netManager.addListener(Packets.PKT_HISTORY_RS.name, e => {
            console.log('HISTORY: ', e.data);
            $('#but-history').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_JACKPOTS_HISTORY_RS.name, e => {
            console.log('JACKPOTS HISTORY: ', e.data);
            $('#but-jackpots-history').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_JACKPOTS_RS.name, e => {
            console.log('JACKPOTS: ', e.data);
            $('#but-jackpots').attr('disabled', false);
            var jackpots = e.data.jackpots;
            $('#div-jackpots').find('input[type=text]').remove();
            $('#div-jackpots').find('p').remove();
            for (var key in jackpots) {
                $('#div-jackpots').append(`<p>${key}:</p><input type="text" value="${jackpots[key]}" readonly class="form-control">`);
            }

        });
        this.netManager.addListener(Packets.PKT_JACKPOTS_WIN_RS.name, e => {
            console.log('JACKPOTS WIN: ', e.data);
            $('#but-jackpots-check').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_BALANCE_RS.name, e => {
            console.log('BALANCE: ', e.data);
            $('#input-bal').val(e.data.balance);
        });

        this.netManager.addListener(Packets.PKT_CONDITION_RS.name, e => {
            console.log('CONDITION: ', e.data);
            $('#but-bet-line-reels').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_ERROR_RS.name, e => {
            console.log('ERROR: ', e.data);
            $('#but-connect').attr('disabled', false);
        });
        this.netManager.addListener(Packets.PKT_TOURNAMENT_INFO.name, e => {
            console.log('TOURNAMENT_INFO: ', e.data);
            $('#but-tournament-info').attr('disabled', false);
        });

        this.netManager.addListener(Packets.PKT_GAME_DATA_RS.name, e => {
            console.log('GAME DATA: ', e.data);
            var packet = e.data;
            this.balance = packet.balance;
            this.bet = packet.currBet;
            this.line = packet.currLines;
            this.denom = packet.currDenom;
            this.currReels = packet.currReels;
            $('#spin-bet').val(this.bet);
            $('#spin-line').val(this.line);
            $('#spin-denom').val(this.denom);
            $('#spin-reels').val(this.currReels);
            if (packet.freeSpins) {
                var arrFree = packet.freeSpins.split(",");
                this.freeSpins = Number.parseInt(arrFree[1]);
                this.freeDone = Number.parseInt(arrFree[2]);
            }
            $('#input-bal').val(this.balance);
            if (packet.subType === 'INITIAL') {
                //this.netManager.ping();
                //this.netManager.payIn(this.tickets);
                this.reels = packet.reels;
                if (packet.nextAct === 'FREE_SPIN') {
                    $('#but-freespin').attr('disabled', false);
                } else if (packet.nextAct === 'RESPIN') {
                    $('#but-respin').attr('disabled', false);
                } else if (packet.nextAct === 'DROP') {
                    $('#but-drop').attr('disabled', false);
                }
                $('#but-freecollect').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.freeCollect();
                });
                $('#but-respin').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.respin();
                });
                $('#but-tournament-info').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.tournamentInfo();
                });
                $('#but-spin').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    $('#but-collect').attr('disabled', true);
                    $('#but-gamble').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                    if (this.freeSpins - this.freeDone > 0) {
                        this.netManager.freeSpin();
                    } else {
                        this.netManager.spin();
                    }
                });
                $('#but-collect').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.collect();
                });
                $('#but-gamble').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.gamble();
                });
                $('#but-freespin').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.freeSpin();
                });
                $('#but-gplay').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    if ($('#radio-black').is(':checked')) {
                        this.netManager.gambleBlack();
                    } else {
                        this.netManager.gambleRed();
                    }
                });
                $('#but-bet-line').click(e => {
                    this.bet = $('#spin-bet').val();
                    this.line = $('#spin-line').val();
                    this.netManager.betLine(this.bet, this.line);
                });
                $('#but-bet-spin').click(e => {
                    this.bet = $('#spin-bet').val();
                    this.line = $('#spin-line').val();
                    this.denom = $('#spin-denom').val();
                    this.betCounter = $('#spin-bet-counter').val();
                    this.netManager.betSpin(this.bet, this.line, this.denom, this.betCounter);
                });
                $('#but-drop').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.drop();
                });
                $('#but-history').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.getHistory(10);
                });
                $('#but-jackpots').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.getJackpots();
                });
                $('#but-bet-line-reels').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.bet = $('#spin-bet').val();
                    this.line = $('#spin-line').val();
                    this.currReels = $('#spin-reels').val();
                    this.netManager.betLineReels(this.bet, this.line, this.currReels);
                });
                $('#but-jackpots-check').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.checkJackpots();
                });
                $('#but-jackpots-history').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    this.netManager.jackpotHistory();
                });
                $('#but-bonus').click(e => {
                    $(e.currentTarget).attr('disabled', true);
                    let position = $('#spin-position').val();
                    this.netManager.bonus(position);
                });
                $('#but-bonus').attr('disabled', packet.nextAct !== 'BONUS');
                this.rows = $('#input-rows').val() ? Number.parseInt($('#input-rows').val()) : 3;
                this.printPacket(packet);
            } else if (packet.subType === PacketGameDataType.TYPE_PAYIN) {

            } else if (packet.subType === 'SPIN' || packet.subType === 'COLLECT' || packet.subType === 'GAMBLE_PLAY' ||
                packet.subType === 'FREE_SPIN' || packet.subType === 'FREE_COLLECT' || packet.subType === 'RESPIN' || packet.subType === 'DROP' ||
                packet.subType === 'BONUS') {
                let matrix = packet.result.special.matrix;
                this.printPacket(packet);
                $('#but-spin').attr('disabled', false);
                $('#but-bet-spin').attr('disabled', false);
                $('#but-drop').attr('disabled', true);

                if (packet.nextAct === 'RESPIN') {
                    $('#but-respin').attr('disabled', false);
                    $('#but-spin').attr('disabled', true);
                }
                if (packet.nextAct === 'COLLECT') {
                    $('#but-collect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-bet-spin').attr('disabled', true);
                    $('#but-spin').attr('disabled', true);
                }
                if (packet.nextAct === 'FREE_COLLECT') {
                    $('#but-freecollect').attr('disabled', false);
                    $('#but-gplay').attr('disabled', false);
                    $('#but-freespin').attr('disabled', true);
                }
                if (packet.nextAct === 'FREE_SPIN') {
                    $('#but-freespin').attr('disabled', false);
                    $('#but-freecollect').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                }
                if (packet.nextAct === 'BET') {
                    $('#but-bet-spin').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                    $('#but-gplay').attr('disabled', true);
                    $('#but-bet-line-reels').attr('disabled', false);
                }
                if (packet.nextAct === 'DROP') {
                    $('#but-drop').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                }
                if (packet.nextAct === 'BONUS') {
                    $('#but-bonus').attr('disabled', false);
                    $('#but-collect').attr('disabled', true);
                }
            } else if (packet.subType === 'GAMBLE_PLAY') {
                $('#but-gplay').attr('disabled', false);
                var text = `REEL-STOPS: ${packet.result.stops} \r\nLAST-WIN: ${packet.result.total}\r\nLINES-WIN: ${packet.result.wins}\r\n` +
                    `CARDS: ${packet.result.cards}\r\nFREE-GAMES: ${packet.free}`;
                $('#text-res').val(text);
            }
        });

        this.netManager.connect(e => {
            this.netManager.login();
        }, this.onclose, this.onerror);
    }

    printPacket(packet) {
        let reels = this.reels[packet.category];
        let stops = packet.result.stops;
        let screen = new Array();
        if (packet.result.special && packet.result.special.categories) {
            let categories = packet.result.special.categories;
            for (let i = 0; i < this.rows; i++) {
                let col = "";
                for (let j = 0; j < stops.length; j++) {
                    let reels = this.reels[categories[i]];
                    let reel = reels[0];
                    col += this.getCharAt(stops[j] + i, reel) + '\t';
                }
                screen.push(col);
            }
        } else if (reels.length < 30) {
            for (let i = 0; i < this.rows; i++) {
                let col = "";
                for (let j = 0; j < stops.length; j++) {
                    let reel = reels[j];
                    col += this.getCharAt(stops[j] + i, reel) + '\t';
                }
                screen.push(col);
            }
        } else {
            for (let i = 0; i < 5; i++) {
                let col = "";
                for (let j = 0; j < 6; j++) {
                    let pos = i * 6 + j;
                    let reel = reels[pos];
                    col += this.getCharAt(stops[pos], reel) + '\t';
                }
                screen.push(col);
            }
        }
        var special = JSON.stringify(packet.result.special);
        if (packet.result.special) {
            if (packet.result.special.matrix) {
                var matrix = packet.result.special.matrix;
                if (matrix.length) {
                    var mats = new Array();
                    for (let i = 0; i < this.rows; i++) {
                        let col = "";
                        for (let j = 0; j < stops.length; j++) {
                            let pos = i * stops.length + j;
                            let reel = matrix[pos];
                            col += reel + '\t';
                        }
                        mats.push(col);
                    }
                    special = mats.join('\n');
                }
            }
        }
        var text = `REEL-STOPS: ${packet.result.stops} \r\nLAST-WIN: ${packet.result.total}\r\nLINES-WIN: ${packet.result.wins}\r\n` +
            `CARDS: ${packet.result.cards.map(c => c.suit)}\r\nFREE-GAMES: ${JSON.stringify(packet.free)}` +
            `\r\nNEXT-ACT: ${packet.nextAct}\r\nSPECIAL:\n${special}` +
            `\r\nPROMO: ${JSON.stringify(packet.promo)}` +
            `\r\nHOLDS: ${packet.result.holds}`+
            `\r\nREELS: \r\n${screen.join('\r\n')}\r\n<--------------------->`;
        $('#text-res').val(text);
    }

    getCharAt(pos, str) {
        //console.log('BEFORE: ',Math.floor(pos / str.length));
        pos -= str.length * Math.floor((pos / str.length));
        //console.log('POSITION: ',pos);
        return str.charAt(pos);
    }

    onclose() {
        console.log('CLOSED');
    }

    onerror() {
        console.log('ON ERROR');
        $('#but-connect').attr('disabled', false);
    }
}

class BlackJackController {
    constructor(session, host) {
        this.gameName = "blackjack";
        this.netManager = new BlackJackNetworkManager(host,
            JSON.stringify(session),
            '000000', '50');
        $('#input-game').val(this.gameName);

        this.netManager.addListener(BlackJackPackets.LOGIN, e => {
            console.log('LOGIN RESPONSE: ', e.data);
            $('#input-bal').val(e.data.balance);
            $('#but-deal').click(e => {
                $(e.currentTarget).attr('disabled', true);
                var bets = $('#input-bets').val();
                var arr = bets.split(',').map(Number);
                this.netManager.deal(arr);
            });
            $('#but-hit').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.hit();
            });
            $('#but-stand').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.stand();
            });

            $('#but-take').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.take();
            });
            $('#but-collect').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.collect();
            })

            $('#but-double').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.double();
            });
            $('#but-insurance').click(e => {
                $(e.currentTarget).attr('disabled', true);
                var use = $('#check-insure').is(':checked');
                this.netManager.insure(use);
            })
            $('#but-even').click(e => {
                $(e.currentTarget).attr('disabled', true);
                var use = $('#check-insure').is(':checked');
                this.netManager.even(use);
            })
            $('#but-split').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.split();
            });
            $('#but-take-one').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.takeOne();
            });
            $('#but-history').click(e => {
                this.netManager.getHistory(10);
            });
            $('#but-gplay').click(e => {
                $(e.currentTarget).attr('disabled', true);
                if ($('#radio-black').is(':checked')) {
                    this.netManager.gambleBlack();
                } else {
                    this.netManager.gambleRed();
                }
            });
            $('#but-jackpots').click(e => {
                $(e.currentTarget).attr('disabled', true);
                this.netManager.getJackpots();
            });
            onData(e);
        });


        this.netManager.addListener(BlackJackPackets.CURRENCY, e => {
            console.log('CURRENCY: ', e.data);
        });


        this.netManager.addListener(BlackJackPackets.HISTORY, e => {
            console.log('HISTORY: ', e.data);
            $('#but-history').attr('disabled', false);
        });
        this.netManager.addListener(BlackJackPackets.JACKPOTS, e => {
            console.log('JACKPOTS: ', e.data);
            $('#but-jackpots').attr('disabled', false);
            var jackpots = e.data.jackpots;
            $('#div-jackpots').find('input[type=text]').remove();
            $('#div-jackpots').find('p').remove();
            for (var key in jackpots) {
                $('#div-jackpots').append(`<p>${key}:</p><input type="text" value="${jackpots[key]}" readonly class="form-control">`);
            }

        });
        this.netManager.addListener(BlackJackPackets.JACKPOTS_WIN, e => {
            console.log('JACKPOTS WIN: ', e.data);

        });
        this.netManager.addListener(BlackJackPackets.BALANCE, e => {
            console.log('BALANCE: ', e.data);
            $('#input-bal').val(e.data.balance);
        });


        var onData = e => {
            var packet = e.data;
            console.log(`${packet.kind}: `, packet);
            if (packet.nextActs) {
                $('#input-bal').val(e.data.balance);
                var text = `NEXT-ACTS: ${packet.nextActs} \r\nHAND: ${packet.hand} \nBUNCH: ${packet.bunch}\n` +
                    `WINS: ${packet.result.wins}\nPLAYER-CARDS: ${packet.result.playerCards}\nDEALER-CARDS: ${packet.result.dealerCards}\n` +
                    `PLAYER-SUMS: ${packet.result.playerSums}\nDEALER-SUM: ${packet.result.dealerSum}\n` +
                    `BETS: ${packet.result.bets}\nPAYBACK: ${packet.result.payback}\n` +
                    `NEXT-ACTION: ${packet.nextAction} \r\n`;
                $('#text-res').val(text);

                var state = packet.nextActs[packet.hand * 2 + packet.bunch];
                var insurance = state === 'INSURANCE';
                var even = state === 'EVEN';
                var collect = packet.nextActs.some(v => v === 'COLLECT' || v === 'CLOSE');
                var deal = packet.nextActs.every(v => v === 'DEAL');
                var hit = state === 'HIT' || state === 'PLAY' || state === 'SPLIT';
                var stand = state === 'HIT' || state === 'PLAY' || state === 'STAND' || state === 'SPLIT';
                var take = packet.nextActs.every(v => v === 'TAKE');
                var double = state === 'HIT' || state === 'PLAY' || state === 'SPLIT';
                var split = state === 'SPLIT' || state == 'SPLIT_ACES';
                var takeOne = state == 'TAKE_ONE';
                var gamble = packet.nextActs.some(v => v === 'COLLECT');

                $('#but-deal').attr('disabled', !deal);
                $('#but-collect').attr('disabled', !collect);
                $('#but-hit').attr('disabled', !hit || insurance);
                $('#but-stand').attr('disabled', !stand || insurance);
                $('#but-take').attr('disabled', !take);
                $('#but-double').attr('disabled', !double || insurance);
                $('#but-insurance').attr('disabled', !insurance);
                $('#but-split').attr('disabled', !split || insurance);
                $('#but-take-one').attr('disabled', !takeOne);
                $('#but-gplay').attr('disabled', !gamble);
                $('#but-even').attr('disabled', !even);
            }
        };

        this.netManager.addListener(BlackJackPackets.DEAL, onData);
        this.netManager.addListener(BlackJackPackets.HIT, onData);
        this.netManager.addListener(BlackJackPackets.STAND, onData);
        this.netManager.addListener(BlackJackPackets.TAKE, onData);
        this.netManager.addListener(BlackJackPackets.COLLECT, onData);
        this.netManager.addListener(BlackJackPackets.DOUBLE, onData);
        this.netManager.addListener(BlackJackPackets.INSURANCE, onData);
        this.netManager.addListener(BlackJackPackets.SPLIT, onData);
        this.netManager.addListener(BlackJackPackets.TAKE_ONE, onData);
        this.netManager.addListener(BlackJackPackets.GAMBLE_PLAY, onData);
        this.netManager.addListener(BlackJackPackets.EVEN, onData);

        this.netManager.connect(e => {
            this.netManager.login();
        }, this.onclose, this.onerror);
    }

    onclose() {
        console.log('CLOSED');
        $(e.currentTarget).attr('disabled', false);
    }

    onerror() {
        console.log('ON ERROR');
        $(e.currentTarget).attr('disabled', false);
    }
}

class BingoController {
    constructor(session, host) {
        this.gameName = "blackjack";
        this.netManager = new BingoNetworkManager(host,
            JSON.stringify(session),
            '000000', '50');
        $('#input-game').val(this.gameName);

        this.netManager.addListener(BingoPackets.LOGIN, e => {
            console.log(e.data);
            $('#input-bal').val(e.data.balance);
            $('#but-tickets').click(e => {
                var count = Number.parseInt($('#input-tickets').val());
                this.netManager.buyTickets(count);
            });
            $('#but-ask-draw').click(e => {
                this.netManager.askDraw();
            });
            $('#but-jackpots').click(e => {
                this.netManager.getJackpots();
            });
        });

        this.netManager.addListener(BingoPackets.CURRENCIES, e => {
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.START_ROUND, e => {
            $('#input-bal').val(e.data.balance);
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.NEW_BALL, e => {
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.BUY_TICKETS, e => {
            $('#input-bal').val(e.data.balance);
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.BINGO, e => {
            $('#input-bal').val(e.data.balance);
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.BINGO_LINE, e => {
            $('#input-bal').val(e.data.balance);
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.LINE, e => {
            $('#input-bal').val(e.data.balance);
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.ASK_DRAW, e => {
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.END_ROUND, e => {
            console.log(e.data);
        });
        this.netManager.addListener(BingoPackets.JACKPOTS, e => {
            console.log(e.data);
        });

        this.netManager.connect(e => {
            this.netManager.login();
        }, this.onclose, this.onerror);
    }

    onclose() {
        console.log('CLOSED');
    }

    onerror() {
        console.log('ON ERROR');
    }
}

class RouletteController {
    constructor(session, host) {
        this.gameName = "europeanroulette";
        this.netManager = new RouletteNetworkManager(host,
            JSON.stringify(session),
            '000000', '50');
        $('#input-game').val(this.gameName);

        for (let cat in RouletteBetCategory) {
            $('#slt-category')
                .append($("<option></option>")
                    .text(cat));
        }

        this.netManager.addListener(RoulettePackets.LOGIN, e => {
            console.log(e.data);
            $('#input-bal').val(e.data.balance);
            $('#but-play').click(e => {
                let bets = new Array();
                let category = $('#slt-category').val();
                let amount = Number.parseInt($('#input-bet').val());
                let numbs = $('#input-numbers').val();
                let empty = $('#input-empty').prop('checked');
                if (!empty)
                    if (numbs) {
                        let numbers = numbs.split(',').filter(v => v).map(v => Number.parseInt(v));
                        bets.push(new RouletteBetBean(amount, category, numbers));
                    } else {
                        bets.push(new RouletteBetBean(amount, category, null));
                    }
                this.netManager.play(bets);
            });
            $('#but-jackpots').click(e => {
                this.netManager.getJackpots();
            });
            $('#but-collect').click(e => {
                this.netManager.collect();
            });
            $('#but-gplay').click(e => {
                $(e.currentTarget).attr('disabled', true);
                if ($('#radio-black').is(':checked')) {
                    this.netManager.gambleBlack();
                } else {
                    this.netManager.gambleRed();
                }
            });
            $('#but-stats').click(e => {
                this.netManager.getStats();
            });
            $('#but-history').click(e => {
                this.netManager.getHistory(10);
            });
        });

        this.netManager.addListener(RoulettePackets.PLAY, e => {
            console.log(e.data);
            $('#input-bal').val(e.data.balance);
            let collect = e.data.nextAct === 'COLLECT' || e.data.nextAct === 'CLOSE';
            let gamble = e.data.nextAct === 'COLLECT';
            $('#but-collect').attr('disabled', false);
            $('#but-gplay').attr('disabled', !gamble);
        });

        this.netManager.addListener(RoulettePackets.COLLECT, e => {
            console.log(e.data);
            $('#but-collect').attr('disabled', true);
            $('#but-gplay').attr('disabled', true);
            $('#input-bal').val(e.data.balance);
        });

        this.netManager.addListener(RoulettePackets.GAMBLE_PLAY, e => {
            console.log(e.data);
            let collect = e.data.nextAct === 'COLLECT' || e.data.nextAct === 'CLOSE';
            let gamble = e.data.nextAct === 'COLLECT';
            $('#but-collect').attr('disabled', !collect);
            $('#but-gplay').attr('disabled', !gamble);
        });

        this.netManager.addListener(RoulettePackets.ERROR, e => {
            console.log(e.data);
        });
        this.netManager.addListener(RoulettePackets.JACKPOTS, e => {
            console.log(e.data);
        });
        this.netManager.addListener(RoulettePackets.STATISTICS, e => {
            console.log(e.data);
        });
        this.netManager.addListener(RoulettePackets.HISTORY, e => {
            console.log(e.data);
        });
        this.netManager.connect(e => {
            this.netManager.login();
        }, this.onclose, this.onerror);
    }

    onclose() {
        console.log('CLOSED');
    }

    onerror() {
        console.log('ON ERROR');
        $('#but-connect').attr('disabled', false);
    }
}

$(document).ready(e => {
    $('#but-connect').click(e => {
        $(e.currentTarget).attr('disabled', true);
        const session = {
            "userName": "toker",
            "sessionId": "17500",
            "operatorId": "20",
            "mode": "external",
            "gameName": ""
        };
        session.userName = $('#input-user').val();
        session.sessionId = $('#input-session').val();
        session.operatorId = $('#input-operator').val();
        session.gameName = $('#input-gamename').val();
        session.mode = $('#input-mode').val();
        const host = $('#input-host').val();

        const title = $(document).attr('title');
        if (title.indexOf('BLACKJACK') === 0) {
            const player = new BlackJackController(session, host);
        } else if (title.indexOf('BINGO') === 0) {
            const player = new BingoController(session, host);
        } else if (title.indexOf('ROULETTE') === 0) {
            const player = new RouletteController(session, host);
        } else if (title.indexOf('ECOLE') === 0) {
            const player = new EcoleController(session, host);
        }else if (title.indexOf('SLOT-SIMPLEX') === 0) {
            const player = new SimplexController(session, host);
        } else {
            const player = new PlayerController(session, host);
        }
        //
    });
});





