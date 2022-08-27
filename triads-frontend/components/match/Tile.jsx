import { ethers } from "ethers";
import Contracts from "../../contexts/contracts";
import { useContext, useEffect, useState } from "react";
import { checkGotchiParam } from "../../lib/functions";
import PlayModal from "./PlayCardModal";

const Tile = ({ x, y, isActive, tokenId, winner, match }) => {
  const { aavegotchiContract } = useContext(Contracts);
  const [params, setParams] = useState(null);
  const [url, setUrl] = useState(null);
  const [showPlay, setShowPlay] = useState(false);

  const bgN = y.toString() + x.toString();

  useEffect(() => {
    if (isActive) {
      const setPar = async () => {
        const par = await checkGotchiParam(tokenId, aavegotchiContract);
        setParams(par);
      };

      setPar();

      const checkSvg = async () => {
        let gotchiSvg = await aavegotchiContract.getAavegotchiSvg(
          parseInt(ethers.utils.formatUnits(tokenId, 0))
        );
        let blob = new Blob([gotchiSvg], { type: "image/svg+xml" });
        let url = URL.createObjectURL(blob);
        setUrl(url);
      };

      checkSvg();
    }
    if (!isActive) {
      setParams(null);
      setUrl(null);
    }
  }, [isActive]);

  const card = () => {
    return (
      <div className="flex flex-col items-center text-xs 2xl:text-sm">
        <img src={url} className={"w-3/4 mt-6"} />
        <div className="2xl:mt-4 mt-2 w-full flex flex-col pb-3 2xl:pb-5">
          <div className="self-center">{params[0]}</div>
          <div className="flex justify-around">
            <div>{params[3]}</div>
            <div>{params[1]}</div>
          </div>
          <div className="self-center">{params[2]}</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div
        onMouseEnter={() => {
          if (!isActive) {
            setShowPlay(true);
          }
        }}
        onMouseLeave={() => setShowPlay(false)}
        style={
          isActive && match !== null && winner == match.player2
            ? {
                backgroundImage: "url('/brand/CARDS/BASE_CARD_FUCSIA.png')",
              }
            : isActive && match !== null && winner == match.player1
            ? { backgroundImage: "url('/brand/CARDS/BASE_CARD_PURPLE.png')" }
            : {
                backgroundImage:
                  "url('/brand/BOARD/BASE_BOARD_" + bgN + ".png')",
              }
        }
        className={`bg-cover xl:h-48 2xl:h-56 3xl:h-64 w-full nes-pointer`}
      >
        {params && card()}
        <PlayModal showPlay={showPlay} x={x} y={y} />
      </div>
    </div>
  );
};

export default Tile;
