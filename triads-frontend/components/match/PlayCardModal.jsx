import PlayCardBtn from "./PlayCardBtn";

const PlayModal = ({ showPlay, x, y }) => {
  return (
    <div
      className={`${
        showPlay ? "" : "hidden"
      } flex items-center justify-center px-0.5 2xl:px-2 bg-brand-modal fixed xl:h-48 2xl:h-56 3xl:h-64 z-50`}
    >
      <div>
        <PlayCardBtn x={x} y={y} />
      </div>
    </div>
  );
};

export default PlayModal;
