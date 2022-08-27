import Link from "next/link";
import Card from "../components/match/Card";
import { useContext, useEffect, useState } from "react";
import Contracts from "../contexts/contracts";
import { register } from "../lib/functions";

const OwnerCard = () => {
  const {
    playerIdsToSvgs,
    playerAllGotchiParams,
    setTokenIds,
    betSize,
    confirmedBet,
    mainContract,
    tokenIds,
    confirmedIds,
    setConfirmedIds,
    setConfirmedBet,
    setBetSize,
  } = useContext(Contracts);

  const [cardsToPlay, setCardsToPlay] = useState([]);
  const [gridCards, setGridCards] = useState([
    <img src="/brand/BOARD/BASE_BOARD_11.png" />,
    <img src="/brand/BOARD/BASE_BOARD_11.png" />,
    <img src="/brand/BOARD/BASE_BOARD_11.png" />,
    <img src="/brand/BOARD/BASE_BOARD_11.png" />,
    <img src="/brand/BOARD/BASE_BOARD_11.png" />,
  ]);

  const goBack = () => {
    setBetSize(null);
    setConfirmedIds(false);
    setConfirmedBet(false);
    setTokenIds([]);
  };

  const addCard = (card) => {
    if (cardsToPlay.length < 5) {
      setCardsToPlay((prevCards) => {
        for (let i = 0; i < prevCards.length; i++) {
          if (card.id === prevCards[i].id) {
            return [...prevCards];
          }
        }
        return [...prevCards, card];
      });
    }
  };

  useEffect(() => {
    if (
      betSize &&
      tokenIds.length === 5 &&
      mainContract &&
      confirmedBet &&
      confirmedIds
    ) {
      register(mainContract, betSize, tokenIds);
      setConfirmedBet(false);
      setConfirmedIds(false);
      setBetSize(null);
    }
  }, [betSize, tokenIds, mainContract, confirmedBet, confirmedIds]);

  useEffect(() => {
    if (cardsToPlay.length > 0) {
      setGridCards((prevCards) => prevCards.filter((value, i) => i !== 0));
    }
  }, [cardsToPlay]);

  console.log("c", cardsToPlay);

  return (
    <div className="bg-mainBg h-screen font-pixel text-white flex flex-col justify-around items-center">
      <div className="flex flex-col items-center w-3/4">
        <div className="border-4 border-[#8C17F9] px-11 py-4 bg-[#12052D] w-full">
          Results:
        </div>
        <div className="min-h-[300px] py-6 border-4 border-t-0 border-[#722CF0] bg-[#12052D] flex justify-center w-full">
          <div className="grid grid-cols-5 gap-10">
            {playerIdsToSvgs?.map((gotchi, i) => {
              const card = {
                id: i,
                card: (
                  <Card
                    player={["owner", "check"]}
                    gotchi={gotchi}
                    gotchiPar={playerAllGotchiParams[i]}
                    setTokenId={setTokenIds}
                  />
                ),
              };
              return (
                <div key={i} onClick={() => addCard(card)}>
                  {card.card}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-center gap-14">
        <Link href="/">
          <div onClick={goBack} className="p-1.5 bg-[#846800] w-fit rounded">
            <div className="bg-[#DDAD00] w-44 h-14 text-sm flex items-center justify-center nes-pointer hover:opacity-80">
              {"<<"} Go Back
            </div>
          </div>
        </Link>
        <div className="w-fit bg-yellow-200 p-1">
          <div className="bg-[#51441E] p-1">
            <div className="p-2.5 bg-yellow-200">
              <div className="p-1.5 bg-[#51441E]">
                <div className="flex gap-1 w-full h-[227px]">
                  {cardsToPlay.map((card) => card.card)}
                  {cardsToPlay.length < 5 && gridCards.map((card) => card)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setConfirmedIds(true)}
          className="p-1.5 bg-[#00822A] w-fit rounded"
        >
          <div className="bg-[#00C56F] w-44 h-14 text-sm flex items-center justify-center nes-pointer hover:opacity-80">
            Confirm {">>"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;
