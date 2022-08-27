import { useContext } from "react";
import Contracts from "../../contexts/contracts";

const ContestBtn = () => {
  const { mainContract } = useContext(Contracts);

  const contestMatch = async () => {
    await mainContract.contestMatch(matchId);
  };
  return (
    <div className="p-1.5 bg-purple-800 rounded mt-3">
      <div
        onClick={contestMatch}
        className="text-white w-36 h-14 text-base text-center flex items-center justify-center nes-pointer hover:opacity-80 bg-brand-purple"
      >
        Contest
      </div>
    </div>
  );
};

export default ContestBtn;
