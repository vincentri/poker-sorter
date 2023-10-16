var readline = require('readline')
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

const data = []
const cardMapping = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
}
rl.on('line', function (line) {
  data.push(line)
})

rl.on('close', function () {
  const playerScore = {
    player1: 0,
    player2: 0,
  }
  data.map((d) => {
    const cardToArray = d.split(' ')
    const player1Card = cardToArray.slice(0, 5)
    const player2Card = cardToArray.slice(5)
    if (checkCardRank(player1Card) > checkCardRank(player2Card))
      playerScore.player1 += 1
    if (checkCardRank(player1Card) < checkCardRank(player2Card))
      playerScore.player2 += 1
    if (checkCardRank(player1Card) === checkCardRank(player2Card)) {
      const recompareResult = reCompareRank(
        player1Card,
        player2Card,
        checkCardRank(player1Card)
      )
      if (recompareResult === 1) playerScore.player1 += 1
      if (recompareResult === 2) playerScore.player2 += 1
    }
  })
  console.log(`
    Winner: ${playerScore.player1 > playerScore.player2 ? `Player 1` : `Player 2`}
    
    Score:
    - Player 1: ${playerScore.player1}
    - Player 2: ${playerScore.player2}
  `)
})

const compareHighestScore = (player1Card, player2Card) => {
  player1Card = player1Card.sort((a, b) => b - a)
  player2Card = player2Card.sort((a, b) => b - a)
  let winner
  player1Card.every((v, i) => {
    if (v == player2Card[i]) return true
    if (v > player2Card[i]) winner = 1
    if (v < player2Card[i]) winner = 2
    return false
  })
  return winner
}

const reCompareRank = (player1Card, player2Card, currentRank) => {
  const player1CardValueToNumber = player1Card
    .map((c) => cardMapping[c[0]])
    .sort((a, b) => a - b)
  const player2CardValueToNumber = player2Card
    .map((c) => cardMapping[c[0]])
    .sort((a, b) => a - b)
  if ([1, 5, 6, 9].includes(currentRank))
    return compareHighestScore(
      player1CardValueToNumber,
      player2CardValueToNumber
    )

  if (currentRank === 2) {
    const player1Pair = onePair(player1Card)
    const player2Pair = onePair(player2Card)
    if (cardMapping[player1Pair.value] > cardMapping[player2Pair.value])
      return 1
    if (cardMapping[player1Pair.value] < cardMapping[player2Pair.value])
      return 2
    return compareHighestScore(
      player1CardValueToNumber.filter(
        (v) => v != cardMapping[player1Pair.value]
      ),
      player2CardValueToNumber.filter(
        (v) => v != cardMapping[player2Pair.value]
      )
    )
  }
  if (currentRank === 3) {
    const player1Pair = twoPair(player1Card)
    const player2Pair = twoPair(player2Card)
    if (cardMapping[player1Pair.value[0]] > cardMapping[player2Pair.value[0]])
      return 1
    if (cardMapping[player1Pair.value[0]] < cardMapping[player2Pair.value[0]])
      return 2
    if (cardMapping[player1Pair.value[1]] > cardMapping[player2Pair.value[1]])
      return 1
    if (cardMapping[player1Pair.value[1]] < cardMapping[player2Pair.value[1]])
      return 2
    if (cardMapping[player1Pair.valueLeft] > cardMapping[player2Pair.valueLeft])
      return 1
    if (cardMapping[player1Pair.valueLeft] < cardMapping[player2Pair.valueLeft])
      return 2
  }
  if (currentRank === 4) {
    const player1ThreeOfKind = threeOfKind(player1Card)
    const player2ThreeOfKind = threeOfKind(player2Card)
    if (
      cardMapping[player1ThreeOfKind.value] >
      cardMapping[player2ThreeOfKind.value]
    )
      return 1
    return 2
  }

  if (currentRank === 7) {
    const player1ThreeOfKind = threeOfKind(player1Card)
    const player2ThreeOfKind = threeOfKind(player2Card)
    const player1Pair = onePair(player1Card)
    const player2Pair = onePair(player2Card)
    if (
      cardMapping[player1ThreeOfKind.value] >
      cardMapping[player2ThreeOfKind.value]
    )
      return 1
    if (
      cardMapping[player1ThreeOfKind.value] <
      cardMapping[player2ThreeOfKind.value]
    )
      return 2
    if (cardMapping[player1Pair.value] > cardMapping[player2Pair.value])
      return 1
    if (cardMapping[player1Pair.value] < cardMapping[player2Pair.value])
      return 2
  }

  if (currentRank === 8) {
    const player1FourOfKind = fourOfKind(player1Card)
    const player2FourOfKind = fourOfKind(player2Card)
    if (
      cardMapping[player1FourOfKind.value] >
      cardMapping[player2FourOfKind.value]
    )
      return 1
    if (
      cardMapping[player1FourOfKind.value] <
      cardMapping[player2FourOfKind.value]
    )
      return 2
  }
}

const checkCardRank = (card) => {
  if (royalFlush(card).result === true) return 10
  if (straightFlush(card).result === true) return 9
  if (fourOfKind(card).result === true) return 8
  if (fullHouse(card).result === true) return 7
  if (flush(card).result === true) return 6
  if (straight(card).result === true) return 5
  if (threeOfKind(card).result === true) return 4
  if (twoPair(card).result === true) return 3
  if (onePair(card).result === true) return 2
  return 1
}

const onePair = (card) => {
  const value = card.map((c) => c[0])
  const countPair = {}
  value.map((v) => (countPair[v] = countPair[v] + 1 || 1))
  const objectData = Object.entries(countPair).filter((v) => v[1] === 2)
  return objectData.length === 1
    ? {
        result: true,
        value: objectData[0][0],
      }
    : {
        result: false,
      }
}

const twoPair = (card) => {
  const value = card.map((c) => c[0])
  const countPair = {}
  value.map((v) => (countPair[v] = countPair[v] + 1 || 1))
  const objectData = Object.entries(countPair).filter((v) => v[1] === 2)
  return objectData.length === 2
    ? {
        result: true,
        value: [objectData[0][0], objectData[1][0]],
        valueLeft: Object.entries(countPair).filter((v) => v[1] === 1)[0][0],
      }
    : {
        result: false,
      }
}

const threeOfKind = (card) => {
  const value = card.map((c) => c[0])
  const countPair = {}
  value.map((v) => (countPair[v] = countPair[v] + 1 || 1))
  const objectData = Object.entries(countPair).filter((v) => v[1] === 3)
  return objectData.length === 1
    ? {
        result: true,
        value: objectData[0][0],
      }
    : {
        result: false,
      }
}

const straight = (card) => {
  let isStraight = true
  card
    .map((c) => cardMapping[c[0]])
    .sort((a, b) => a - b)
    .reduce((a, b) => {
      if (a + 1 !== b) isStraight = false
      return b
    })
  return {
    result: isStraight,
  }
}

const flush = (card) => {
  const value = card.map((c) => c[1])
  const countPair = {}
  value.map((v) => (countPair[v] = countPair[v] + 1 || 1))
  const objectData = Object.entries(countPair).filter((v) => v[1] === 5)
  return objectData.length === 1
    ? {
        result: true,
      }
    : {
        result: false,
      }
}

const fullHouse = (card) => {
  return onePair(card).result === true && threeOfKind(card).result === true
    ? {
        result: true,
      }
    : {
        result: false,
      }
}

const fourOfKind = (card) => {
  const value = card.map((c) => c[0])
  const countPair = {}
  value.map((v) => (countPair[v] = countPair[v] + 1 || 1))
  const objectData = Object.entries(countPair).filter((v) => v[1] === 4)
  return objectData.length === 1
    ? {
        result: true,
        value: [objectData[0][0]],
      }
    : {
        result: false,
      }
}

const straightFlush = (card) => {
  return straight(card).result === true && flush(card).result === true
    ? {
        result: true,
      }
    : {
        result: false,
      }
}

const royalFlush = (card) => {
  const sortCard = card.map((c) => cardMapping[c[0]]).sort((a, b) => a - b)
  return straight(card).result === true &&
    flush(card).result === true &&
    sortCard[0] === 10
    ? {
        result: true,
      }
    : {
        result: false,
      }
}
