import { useEffect, useState } from "react"
import Gotchi22133 from "../svg/Gotchi22133.svg"
import Gotchi172 from "../svg/Gotchi172.svg"
import Gotchi1454 from "../svg/Gotchi1454.svg"
import Gotchi2195 from "../svg/Gotchi2195.svg"
import Gotchi3052 from "../svg/Gotchi3052.svg"
import Gotchi9358 from "../svg/Gotchi9358.svg"
import Gotchi12409 from "../svg/Gotchi12409.svg"
import Gotchi21424 from "../svg/Gotchi21424.svg"
import Gotchi21508 from "../svg/Gotchi21508.svg"
import Gotchi22128 from "../svg/Gotchi22128.svg"
import { ethers } from "ethers";

export default function Tile({x, y, isActive, tokenId, winner, checkGotchiParam, match, setXToPlay, setYToPlay}) {
    const [params, setParams] = useState(null);

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
        }
    }, [isActive])

    return (
        <div style={
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 22133 && match !== null && winner == match[1] ?
             {backgroundImage: `url(${Gotchi22133})`, backgroundColor:"red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
             parseInt(ethers.utils.formatUnits(tokenId, 0)) === 22133 && match !== null && winner == match[0] ?
             {backgroundImage: `url(${Gotchi22133})`, backgroundColor:"blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 172 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi172})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 172 && match !== null && winner == match[0]? 
             {backgroundImage: `url(${Gotchi172})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} : 
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 1454 && match !== null && winner == match[1]? 
             {backgroundImage: `url(${Gotchi1454})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 1454 && match !== null && winner == match[0]? 
             {backgroundImage: `url(${Gotchi1454})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} : 
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 2195 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi2195})`,backgroundColor: "red", backgroundBlendMode: "hard-light",  backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 2195 && match !== null && winner == match[0] ? 
             {backgroundImage: `url(${Gotchi2195})`,backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 3052 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi3052})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 3052 && match !== null && winner == match[0] ? 
             {backgroundImage: `url(${Gotchi3052})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 9358 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi9358})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
             parseInt(ethers.utils.formatUnits(tokenId, 0)) === 9358 && match !== null && winner == match[0] ? 
             {backgroundImage: `url(${Gotchi9358})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 12409 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi12409})`, backgroundColor: "red", backgroundBlendMode: "hard-light",  backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 12409 && match !== null && winner == match[0] ? 
             {backgroundImage: `url(${Gotchi12409})`, backgroundColor: "blue", backgroundBlendMode: "hard-light",  backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 21424 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi21424})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 21424 && match !== null && winner == match[0] ? 
             {backgroundImage: `url(${Gotchi21424})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 21508 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi21508})`, backgroundColor:"red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 21508 && match !== null && winner == match[0] ? 
             {backgroundImage: `url(${Gotchi21508})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 22128 && match !== null && winner == match[1] ? 
             {backgroundImage: `url(${Gotchi22128})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
            parseInt(ethers.utils.formatUnits(tokenId, 0)) === 22128 && match !== null && winner == match[0] ? 
             {backgroundImage: `url(${Gotchi22128})`, backgroundColor: "blue", backgroundBlendMode: "hard-light",  backgroundSize: "cover", backgroundRepeat: "no-repeat"} :
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