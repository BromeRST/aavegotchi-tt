import RemoveBtn from "./RemoveBtn";

const PlayModal = ({ showRemove }) => {
  return (
    <div
      className={`${
        showRemove ? "" : "hidden"
      } flex items-center justify-center px-0.5 2xl:px-2 bg-brand-modal fixed xl:h-48 2xl:h-56 3xl:h-64 z-50`}
    >
      <div>
        <RemoveBtn />
      </div>
    </div>
  );
};

export default PlayModal;
