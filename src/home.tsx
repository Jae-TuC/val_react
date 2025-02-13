import { useState } from "react";
import ReactConfetti from "react-confetti";
import Welcome from "./components/welcome";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  //   console.log(isLoaded);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Welcome to={100} />
    </div>
  );
};

export default Home;
