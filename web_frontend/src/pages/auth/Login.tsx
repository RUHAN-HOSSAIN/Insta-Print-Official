import loginbg from "../../assets/user/loginbg.webp";

const Login = () => {
  return (
    <div className="h-screen overflow-hidden">
      <img src={loginbg} alt="Login Background" className="w-full h-full object-cover" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-jura backdrop-blur-xs p-20 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] bg-white/5 w-120">
          <h2 className="text-2xl font-extrabold mb-4 text-white">Log In</h2>
          <form className="flex flex-col gap-4">
            <label className="text-white font-bold text-shadow-lg">Email</label>
            <input 
              type="text" 
              placeholder="Enter your Roll or student Email"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-200"
            />
            <label className="text-gray-700 font-bold">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="submit" className="font-jura bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600">
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
