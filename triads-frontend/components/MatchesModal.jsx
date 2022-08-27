import Link from "next/link";
import CancelButton from "./shared/CancelButton";

const MatchesModal = ({
  setMatchId,
  showMatches,
  setShowMatches,
  playerMatchesId,
}) => {
  const click = (id) => {
    setMatchId(id);
    setShowMatches(!showMatches);
  };

  return (
    <div
      className={`${
        showMatches ? "" : "hidden"
      } flex items-center justify-center bg-brand-modal font-pixel overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}
    >
      <div className="relative w-1/4 max-w-2xl h-full md:h-auto">
        <div className="flex flex-col items-center text-xl text-white relative bg-white">
          <div className="bg-brand-pink p-2.5 w-full">
            <div className="bg-brand-darkPurple h-16 flex items-center justify-center">
              Choose Match
            </div>
          </div>
          <div className="bg-[#AA24B5] p-2.5 pt-0 w-full">
            <div className="bg-[#CD2DF6] p-2.5 pt-0">
              <div className="bg-brand-darkPurple min-h-[200px] flex flex-col gap-4 items-center justify-center p-4 w-full">
                {playerMatchesId?.map((match, i) => (
                  <Link key={i} href={"/match/" + match} passHref>
                    <div
                      className="nes-pointer hover:text-brand-pink"
                      onClick={() => click(match)}
                    >
                      {match}
                    </div>
                  </Link>
                ))}
                <CancelButton
                  showModal={showMatches}
                  setShowModal={setShowMatches}
                  text={"Go Back"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchesModal;
