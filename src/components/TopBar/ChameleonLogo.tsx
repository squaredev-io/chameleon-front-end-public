import Image from "next/image";
import chameleonLogo from "/public/icons/ChameleonLogo.png";

const ChameleonLogo = () => (
  <div
    className="md:leading-none gap-2 w-48"
  >
    <Image
      src={chameleonLogo}
      alt="chameleon-logo"
    />
  </div>
);

export default ChameleonLogo;
