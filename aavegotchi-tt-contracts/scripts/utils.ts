import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

interface Tile {
  isActive: boolean;
  tokenId: BigNumber;
  winner: string;
  bonus: number;
  bonusTraitIndex: number;
}

interface Grid {
  [index: number]: Array<Tile>;
}

export async function impersonate(address: string, contract: any) {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  let signer = await ethers.getSigner(address);
  contract = contract.connect(signer);
  return contract;
}

export function traitToValue(trait: number): number {
  if (trait <= 1 || trait >= 99) return 10;
  if ((trait >= 2 && trait <= 3) || (trait >= 97 && trait <= 98)) return 9;
  if ((trait >= 4 && trait <= 5) || (trait >= 95 && trait <= 96)) return 8;
  if ((trait >= 6 && trait <= 7) || (trait >= 93 && trait <= 94)) return 7;
  if ((trait >= 8 && trait <= 9) || (trait >= 91 && trait <= 92)) return 6;
  if ((trait >= 10 && trait <= 19) || (trait >= 81 && trait <= 90)) return 5;
  if ((trait >= 20 && trait <= 29) || (trait >= 71 && trait <= 80)) return 4;
  if ((trait >= 30 && trait <= 39) || (trait >= 61 && trait <= 70)) return 3;
  if ((trait >= 40 && trait <= 49) || (trait >= 51 && trait <= 60)) return 2;
  if (trait === 50) return 1;
  return 0;
}

export function tokenIdToIndex(
  gotchis: number[],
  tokenId: BigNumber | number
): number {
  const tokenIdNumber = BigNumber.isBigNumber(tokenId)
    ? tokenId.toNumber()
    : tokenId;
  return gotchis.findIndex((id) => id === tokenIdNumber);
}

export function calculateWinner(
  player1Traits: number[],
  player2Traits: number[],
  playerTile: any,
  opponentTile: any,
  playerTraitIndex: number,
  opponentTraitIndex: number
): string {
  const player1TraitValue = traitToValue(player1Traits[playerTraitIndex]);
  const player2TraitValue = traitToValue(player2Traits[opponentTraitIndex]);

  let player1FinalValue = player1TraitValue;
  let player2FinalValue = player2TraitValue;

  if (playerTraitIndex === playerTile.bonusTraitIndex) {
    player1FinalValue += playerTile.bonus;
  }
  if (opponentTraitIndex === opponentTile.bonusTraitIndex) {
    player2FinalValue += opponentTile.bonus;
  }

  return player1FinalValue > player2FinalValue ? "player1" : "player2";
}

export function checkAdjacentTiles(
  grid: Grid,
  y: number,
  x: number,
  player1Gotchis: number[],
  player2Gotchis: number[],
  player1GotchiParams: number[][],
  player2GotchiParams: number[][],
  playedByPlayer1: boolean
): { [key: string]: string } {
  // Create a deep copy of the grid
  const mutableGrid: Grid = JSON.parse(JSON.stringify(grid));

  const adjacentPositions = [
    { direction: "left", coords: [y, x - 1], traits: [3, 1] },
    { direction: "right", coords: [y, x + 1], traits: [1, 3] },
    { direction: "up", coords: [y - 1, x], traits: [0, 2] },
    { direction: "down", coords: [y + 1, x], traits: [2, 0] },
  ];

  const currentTile = mutableGrid[y][x];
  const currentPlayer = playedByPlayer1 ? "player1" : "player2";
  const currentPlayerGotchis = playedByPlayer1
    ? player1Gotchis
    : player2Gotchis;
  const currentPlayerParams = playedByPlayer1
    ? player1GotchiParams
    : player2GotchiParams;
  const opponentGotchis = playedByPlayer1 ? player2Gotchis : player1Gotchis;
  const opponentParams = playedByPlayer1
    ? player2GotchiParams
    : player1GotchiParams;

  const adjacentWinners: { [key: string]: string } = {};

  for (const { direction, coords, traits } of adjacentPositions) {
    const [adjY, adjX] = coords;
    if (adjY >= 0 && adjY < 3 && adjX >= 0 && adjX < 3) {
      const adjacentTile = mutableGrid[adjY][adjX];
      if (adjacentTile.isActive && adjacentTile.winner !== currentPlayer) {
        const [playerTraitIndex, opponentTraitIndex] = traits;

        const currentTokenIndex = tokenIdToIndex(
          currentPlayerGotchis,
          currentTile.tokenId
        );
        const opponentTokenIndex = tokenIdToIndex(
          opponentGotchis,
          adjacentTile.tokenId
        );

        const winner = calculateWinner(
          currentPlayerParams[currentTokenIndex],
          opponentParams[opponentTokenIndex],
          currentTile,
          adjacentTile,
          playerTraitIndex,
          opponentTraitIndex
        );

        adjacentWinners[direction] = winner;

        if (winner === currentPlayer) {
          adjacentTile.winner = currentPlayer;
        }
      }
    }
  }

  return adjacentWinners;
}

// Helper function to get adjacent coordinates
export function getAdjacentCoordinates(
  y: number,
  x: number,
  direction: string
): [number, number] {
  switch (direction) {
    case "left":
      return [y, x - 1];
    case "right":
      return [y, x + 1];
    case "up":
      return [y - 1, x];
    case "down":
      return [y + 1, x];
    default:
      throw new Error("Invalid direction");
  }
}
