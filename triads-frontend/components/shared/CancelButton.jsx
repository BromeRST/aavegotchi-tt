const CancelButton = ({ showModal, setShowModal, text }) => {
  return (
    <div
      onClick={() => setShowModal(!showModal)}
      className="p-1.5 bg-brand-darkRed rounded"
    >
      <div className="bg-brand-red text-white w-36 h-14 text-base flex items-center justify-center nes-pointer hover:opacity-80">
        {text}
      </div>
    </div>
  );
};

export default CancelButton;
