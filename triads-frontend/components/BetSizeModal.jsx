import { useContext } from "react";
import Contracts from "../contexts/contracts";
import CancelButton from "./shared/CancelButton";
import ConfirmButton from "./shared/ConfirmButton";

const BetSizeModal = ({ showSizes, setShowSizes, setConfirmedBet }) => {
  const betSizes = [1, 5, 10, 25, 50, 100, 200, 500];

  const { setBetSize } = useContext(Contracts);

  const click = (bet) => {
    setBetSize(bet);
  };

  return (
    <div
      className={`${
        showSizes ? "" : "hidden"
      } flex items-center justify-center font-pixel bg-brand-modal overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}
    >
      <div className="relative w-1/3 p-5 max-w-2xl h-full md:h-auto">
        <div className="min-h-[300px] flex flex-col items-center text-xl text-white relative bg-white">
          <div className="bg-brand-pink p-2.5 w-full">
            <div className="bg-brand-darkPurple h-16 flex items-center justify-center">
              Choose Bet Size
            </div>
          </div>
          <div className="bg-[#AA24B5] p-2.5 pt-0 w-full">
            <div className="bg-[#CD2DF6] p-2.5 pt-0">
              <div className="bg-brand-darkPurple flex flex-col gap-4 items-center p-4 w-full">
                {betSizes.map((bet, i) => (
                  <div
                    key={i}
                    className="nes-pointer hover:text-brand-pink"
                    onClick={() => click(bet)}
                  >
                    {bet} DAI
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <div onClick={() => setBetSize(null)}>
                    <CancelButton
                      showModal={showSizes}
                      setShowModal={setShowSizes}
                      text={"Cancel"}
                    />
                  </div>
                  <ConfirmButton
                    setConfirmed={setConfirmedBet}
                    showModal={showSizes}
                    setShowModal={setShowSizes}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetSizeModal;
