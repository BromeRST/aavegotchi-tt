const PlayerName = ({ player }) => {
  return (
    <div className="flex relative bg-brand-darkPurple border-2 border-white rounded w-72 h-16">
      <img
        src="/brand/gotchi.png"
        className={`w-16 absolute bottom-0 ${
          player[0] === "player1" ? "left-4" : "left-50"
        }`}
      />
      <div
        className={`pt-2 ${
          player[0] === "player1" ? "pl-24" : "pl-6 text-right"
        }`}
      >
        <div className="text-brand-pink text-base">
          {player[1] &&
            player[1].substring(0, 5) + ".." + player[1].substring(39)}
        </div>
        <div className="text-white text-sm capitalize">{player[0]}</div>
      </div>
    </div>
  );
};

export default PlayerName;
