import { ethers } from "ethers";
import Tile from "./Tile";

const Grid = ({ gridMap, match, matchId }) => {
  if (match)
    return (
      <div className="text-white 2xl:text-2xl p-5 flex flex-col items-center gap-5 h-full w-full">
        <div>Bet size is: {ethers.utils.formatUnits(match.betsize, 0)} DAI</div>
        <div className="w-full xl:w-5/6 2xl:w-4/5 bg-yellow-200 3xl:w-5/6 3xl:p-1">
          <div className="bg-[#51441E] 3xl:p-1">
            <div className="p-2 bg-yellow-200 2xl:p-2.5">
              <div className="p-1 bg-[#51441E] 2xl:p-1.5">
                <div className="grid grid-cols-3 grid-rows-3 gap-0.5 2xl:gap-1 w-full h-max">
                  {gridMap.map((map, y) =>
                    map.map((tile, x) => (
                      <Tile
                        key={x + 1}
                        x={x}
                        y={y}
                        isActive={tile.isActive}
                        tokenId={tile.tokenId}
                        winner={tile.winner}
                        match={match}
                        matchId={matchId}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Grid;
