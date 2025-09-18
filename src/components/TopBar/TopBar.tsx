import ChameleonLogo from "./ChameleonLogo";
import AiAssistant from "./AiAssistant";

const TopBar = () => (
  <div
    className="h-20 absolute w-full p-3 shadow-xl bg-chamPurple flex items-center justify-between border-chamBeige-200 border-b-2"
    style={{ zIndex: 1000 }}
  >
    <ChameleonLogo />
    <div className="w-32 flex flex-row justify-around">
      <AiAssistant />
    </div>
  </div>
);

export default TopBar;
