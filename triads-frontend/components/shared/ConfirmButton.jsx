import Link from "next/link";

const ConfirmButton = ({ setConfirmed, showModal, setShowModal }) => {
  const click = () => {
    setConfirmed(true);
    setShowModal(!showModal);
  };
  return (
    <Link href="/ownerCard">
      <div onClick={click} className="p-1.5 bg-[#00822A] rounded">
        <div className="bg-[#00C56F] text-white w-36 h-14 text-base flex items-center justify-center nes-pointer hover:opacity-80">
          Confirm
        </div>
      </div>
    </Link>
  );
};

export default ConfirmButton;
