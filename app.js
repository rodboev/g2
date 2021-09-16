const betMultiplier = 1;
const startingBalance = 5000;
const tableLimit = 500;
const iterations = 1000;
const boostBet = 1; // increment bet after first loss

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

let bet = {};
(async () => {
  let i = 0;
  console.log(`Turn\tBet\tW/L\tNet\tAccumL\tBalance`);
  do {
    bet = {
      number: i,
      amount: currentBet,
      result: getWinOrLoss()
    };
    if (bet.result === 'L') {
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
    bet.unclearedCount = getUnclearedCount(bets);

    let firstUncleared = findFirstUncleared(bets);
    let lastUncleared = findLastUncleared(bets);
    if (bet.result === 'W') {
      // clear first loss
      firstUncleared && (firstUncleared.cleared = true);
      // clear last loss
      lastUncleared && (lastUncleared.cleared = true);
      // if no unclear, reset bet to 1
    }

    // refresh uncleared
    firstUncleared = findFirstUncleared(bets);
    lastUncleared = findLastUncleared(bets);
    bet.unclearedCount = getUnclearedCount(bets);

    // set new bet based on 1 or 2 uncleared
    if (bet.unclearedCount === 0) {
      currentBet = 1 * betMultiplier;
    }
    else if (bet.unclearedCount === 1) {
      currentBet = (boostBet * betMultiplier) + firstUncleared.amount;
    }
    else { // 2 or more uncleared
      currentBet = firstUncleared.amount + lastUncleared.amount;
    }

    console.log(
      `${bet.number}\t` +
      `${bet.amount.toString().padStart(2, ' ')}\t` +
      `${bet.result}\t` +
      `${bet.net.toString().padStart(2, ' ')}\t` +
      `${bet.unclearedCount}\t` +
      `${bet.balance}`
    );

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

