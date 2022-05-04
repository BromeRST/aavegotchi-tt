import Tile from "./Tile"
import { forwardRef } from "react"

function Grid ({gridMap, checkGotchiParam, match, setXToPlay, setYToPlay, aavegotchiContract}, ref) {

    return (
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
    )
}

const forwardedGrid = forwardRef(Grid);

export default forwardedGrid