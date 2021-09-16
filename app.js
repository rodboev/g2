const chalk = require('chalk');

const betMultiplier = 1;
const startingBalance = 300;
const tableLimit = 500;

let currentBet = 1 * betMultiplier;
let balance = startingBalance;
const bets = [];

const getWinOrLoss = () => {
  const rnd = Math.random() * 100;
  if (rnd < 48) // % chance
    return 'W';
  else // remaining %
    return 'L';
}

const iterations = 1000;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let lastResult;

let bet = {};
(async () => {
  let i = 0;
  console.log(`#\tBet\tW/L\tNet\tLeft\tBalance`);
  do {
    lastResult = getWinOrLoss();

    bet = {
      number: i,
      amount: currentBet,
      result: lastResult
    };
    if (lastResult === 'L') {
      bet.cleared = false;
      bet.net = -bet.amount;
    }
    else {
      bet.net = bet.amount;
    }
    bet.balance = balance + bet.net;
    balance = balance + bet.net;
    bets.push(bet);
    
    // If we won, clear up to 2 losses
    const findFirstUncleared = bets => bets.find(bet => bet.cleared === false);
    const findLastUncleared = bets => {
      bets.reverse();
      const loss = findFirstUncleared(bets);
      bets.reverse();
      return loss;
    }
    const getUnclearedCount = bets => bets.filter(bet => bet.cleared === false).length;

    let firstUncleared = findFirstUncleared(bets);
    let lastUncleared = findLastUncleared(bets);
    if (lastResult === 'W') {
      // clear first loss
      firstUncleared && (firstUncleared.cleared = true);
      // clear last loss
      lastUncleared && (lastUncleared.cleared = true);
      // if no unclear, reset bet to 1
      if (getUnclearedCount(bets) === 0) {
        currentBet = 1 * betMultiplier;
      }
    }

    // refresh uncleared
    firstUncleared = findFirstUncleared(bets);
    lastUncleared = findLastUncleared(bets);
    bets[bets.length - 1].unclearedCount = getUnclearedCount(bets);

    // set new bet based on 1 or 2 uncleared
    if (firstUncleared) {
      if (firstUncleared !== lastUncleared) {
        currentBet = firstUncleared.amount + lastUncleared.amount;
      }
      else {
        currentBet = firstUncleared.amount;
      }
    }

    // for (const bet of bets) {
      let netBetFormatted = bet.net.toString().padStart(2, ' ');
      if (bet.cleared) {
        netBetFormatted = chalk.strikethrough(netBetFormatted);
      }
      console.log(
        `${bet.number}\t` +
        `${bet.amount.toString().padStart(2, ' ')}\t` +
        `${bet.result}\t` +
        `${netBetFormatted}\t` +
        `${bet.unclearedCount}\t` +
        `${bet.balance}`
      );
    // }

    // await sleep(10);
    // on last line, print stats
    i++;
  } while ((i <= iterations || bet.unclearedCount > 0) && bet.amount <= tableLimit && bet.balance > 0);

  // print stats
  const getWins = () => bets.filter(bet => bet.result === 'W').length;
  const getLosses = () => bets.filter(bet => bet.result === 'L').length;
  const stats = {
    wins: getWins(),
    losses: getLosses(),
    winLossRatio: getWins() / bets.length
  }

  console.log(`\n$${balance}, W: ${stats.wins}, L: ${stats.losses}, ratio: ${(stats.winLossRatio * 100).toFixed(0)}%`);
})();