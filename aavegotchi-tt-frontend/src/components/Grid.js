import { ethers } from "ethers";
import Tile from "./Tile"
import { forwardRef } from "react"

function Grid ({gridMap, checkGotchiParam, match, setXToPlay, setYToPlay, aavegotchiContract, checkedWinner, winner}, ref) {

    return (
        <div className="grid">
            <p className="match-betsize">This match betsize is: {ethers.utils.formatUnits(match.betsize, 0)} DAI</p>
            {checkedWinner && <h3 className="match-betsize">{winner}</h3>}
            <div className="grid-container" ref={ref}>
                {gridMap.map((map, x) => map.map((tile, y) => 
                    <Tile 
                        key={y}
                        x={x} 
                        y={y} 
                        isActive={tile.isActive} 
                        tokenId={tile.tokenId} 
                        winner={tile.winner}
                        checkGotchiParam={checkGotchiParam}
                        match={match}
                        setXToPlay={setXToPlay}
                        setYToPlay={setYToPlay}
                        aavegotchiContract={aavegotchiContract}
                    />
                ))}
            </div>
        </div>
    )
}

const forwardedGrid = forwardRef(Grid);

export default forwardedGrid