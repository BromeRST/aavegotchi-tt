import { useEffect, useState } from "react"
import { ethers } from "ethers";

export default function Tile({x, y, isActive, tokenId, winner, checkGotchiParam, match, setXToPlay, setYToPlay, aavegotchiContract}) {
    const [params, setParams] = useState(null);
    const [url, setUrl] = useState(null);

    const handleTileClick = () => {
        setXToPlay(x);
        setYToPlay(y);
        console.log(x,y, isActive, parseInt(ethers.utils.formatUnits(tokenId, 0)), winner)
    }

    useEffect(() => {
        if (isActive) {
            const setPar = async () => {
                const par = await checkGotchiParam(tokenId);
                setParams(par);
            }
            
            setPar();
            
            const checkSvg = async () => {
                let gotchiSvg = await aavegotchiContract.getAavegotchiSvg(parseInt(ethers.utils.formatUnits(tokenId, 0)));
                let blob = new Blob([gotchiSvg], {type: 'image/svg+xml'});
                let url = URL.createObjectURL(blob);
                setUrl(url);
            }
            
            checkSvg();
        }
    }, [isActive])

    return (
        <div style={
            isActive && match !==null && winner == match[1] ?
            {backgroundImage: `url(${url})`, backgroundColor:"red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} : 
            isActive && match !==null && winner == match[0] ?
            {backgroundImage: `url(${url})`, backgroundColor:"blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            {background: "#e5df40"}
            } className="tile" onClick={handleTileClick}>
            {isActive && params !== null && 
                <div className="param-container">
                    <p className="up">{params[0]}</p>
                    <div className="left-right">
                        <p className="left">{params[3]}</p>
                        <p className="right">{params[1]}</p>
                    </div>
                    <p className="down">{params[2]}</p>
                </div>
            }
        </div>
    )
}