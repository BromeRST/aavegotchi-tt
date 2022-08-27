import CancelButton from "./shared/CancelButton";

const SwapModal = ({ showModal, setShowModal }) => {
  return (
    <div
      className={`${
        showModal ? "" : "hidden"
      } flex items-center justify-center font-pixel bg-brand-modal overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}
    >
      <div className="relative w-1/3 p-5 max-w-2xl h-full md:h-auto">
        <div className="min-h-[300px] flex flex-col items-center text-xl text-white relative bg-white">
          <div className="bg-brand-pink p-2.5 w-full">
            <div className="bg-brand-darkPurple h-16 flex items-center justify-center capitalize">
              swap your tokens
            </div>
          </div>
          <div className="bg-[#AA24B5] p-2.5 pt-0 w-full">
            <div className="bg-[#CD2DF6] p-2.5 pt-0">
              <div className="bg-brand-darkPurple flex flex-col gap-4 items-center p-4 w-full">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://legacy.quickswap.exchange/#/swap?inputCurrency=0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7&outputCurrency=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
                  className="hover:text-brand-pink cursor-pointer mt-6"
                >
                  Swap GHST-DAI
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://legacy.quickswap.exchange/#/swap?inputCurrency=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&outputCurrency=0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7"
                  className="hover:text-brand-pink cursor-pointer"
                >
                  Swap DAI-GHST
                </a>
                <div className="flex gap-4 pt-4">
                  <CancelButton
                    showModal={showModal}
                    setShowModal={setShowModal}
                    text={"Go Back"}
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

export default SwapModal;
