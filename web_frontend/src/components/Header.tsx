import Logo from "../assets/Logo2.jpg"
import ThemeToggle from "../components/ThemeToggle";

const Header = () => {
  return (
    <>
      <div className="fixed shadow bg-white w-full h-18 flex items-center justify-between px-20 border-b-2 border-gray-200">
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="h-12" />
        </div>
        <div className="flex items-center gap-20 font-spaceG text-black text-lg cursor-pointer">
          <div className="text-yellow-400 hover:underline underline-offset-4">Home</div>
          <div className="hover:underline underline-offset-4">Learn</div>
          <div className="hover:underline underline-offset-4">Pricing</div>
          <div className="hover:underline underline-offset-4">FAQ</div>
          <div className="hover:underline underline-offset-4">Contact</div>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export default Header;


{/* <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#000"><path d="M640-640v-120H320v120h-80v-200h480v200h-80Zm-480 80h640-640Zm560 100q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v240H720v160Zm80-240v-160q0-17-11.5-28.5T760-560H200q-17 0-28.5 11.5T160-520v160h80v-80h480v80h80Z"/></svg>
          </div>
          <div className="flex flex-col font-spaceG font-bold text-black">
            <h2 className="text-2xl">Instra Print</h2>
            <h4 className="text-xs">Get Best, Spend less</h4>
          </div> */}