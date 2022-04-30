import Tile from "./Tile"

export default function Grid({gridMap, checkGotchiParam, match, setXToPlay, setYToPlay, aavegotchiContract}) {

    return (
        <div className="grid-container">
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