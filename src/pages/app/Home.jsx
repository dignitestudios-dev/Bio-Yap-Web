import axios from "../../axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Home = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertCoins, setConvertCoins] = useState("");
  const [wallet, setWallet] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const possibleToken = path.replace("/", "");
    if (possibleToken && possibleToken.length > 10) {
      localStorage.setItem("authToken", possibleToken);
      Cookies.set("token", possibleToken);
      setToken(possibleToken);
    } else {
      const saved = localStorage.getItem("authToken");
      if (saved) {
        setToken(saved);
        Cookies.set("token", saved);
      }
    }
  }, []);

  const checkStripeAccount = async () => {
    try {
      const response = await axios.post("/api/withdrawal/connect-account", {
        token: token,
      });
      const { onboardingUrl } = response?.data?.data || {};
      if (onboardingUrl) window.location.href = onboardingUrl;
    } catch (error) {
      console.log("Stripe connect check error:", error);
    }
  };

  const getWallet = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/inApp/getWallet");
      if (response.status === 200) {
        const walletData = response.data.data;
        if (walletData) {
          if (!walletData.stripeConnectedAccountId) checkStripeAccount();
          setWallet(walletData);
        }
      }
    } catch (error) {
      console.log("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getWallet();
  }, [token]);

  const handleWithdraw = async () => {
    const numDiamonds = Number(withdrawAmount);
    if (!numDiamonds || numDiamonds <= 0)
      return ErrorToast("Enter valid amount.");
    if (numDiamonds > wallet?.diamonds)
      return ErrorToast("Not enough diamonds.");

    setWithdrawLoading(true);
    try {
      const response = await axios.post("/api/withdrawal/request", {
        diamonds: numDiamonds,
      });
      SuccessToast(response?.data?.message || "Withdraw request successful.");
      setWithdrawAmount("");
      getWallet();
    } catch (error) {
      ErrorToast(error?.response?.data?.message || "Withdraw request failed.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleConvert = async () => {
    const numCoins = Number(convertCoins);
    if (!numCoins || numCoins <= 0) return ErrorToast("Enter valid coins.");
    if (numCoins > wallet?.coins) return ErrorToast("Not enough coins.");

    setConvertLoading(true);
    try {
      const response = await axios.post("/api/inApp/convertCoinsToDiamonds", {
        coins: numCoins,
      });
      SuccessToast(response?.data?.message || "Coins converted successfully!");
      setConvertCoins("");
      getWallet();
    } catch (error) {
      ErrorToast(error?.response?.data?.message || "Conversion failed.");
    } finally {
      setConvertLoading(false);
    }
  };

  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-300 rounded w-2/3"></div>
      <div className="h-10 bg-gray-300 rounded w-full"></div>
      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
      <div className="h-12 bg-gray-300 rounded w-full"></div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F2F4FF]">
      <div className="w-[390px] bg-white rounded-[40px] shadow-2xl px-6 py-6 mt-4">
        <h2 className="text-2xl font-bold text-center text-[#333] mb-6">
          Withdraw
        </h2>

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* Wallet Card */}
            <div className="bg-gradient-to-r from-[#FFFAE5] to-[#FFF1C2] rounded-3xl p-5 mb-8 shadow-lg">
              <div className="space-y-3">
               
                <div className="flex justify-between items-center">
                  <p className="text-[#555] text-[15px]">Diamonds</p>
                  <p className="text-xl font-bold text-[#333]">
                    {wallet?.diamonds ?? 0}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[#555] text-[15px]">Diamonds Value</p>
                  <p className="text-xl font-bold text-[#333]">
                    ${wallet?.diamondsValueInUSD ?? 0}
                  </p>
                </div>
               
              </div>
            </div>

            {/* Convert Coins */}
            {/* <div className="mb-6">
              <p className="text-[#444] text-[15px] mb-1 font-medium">
                Convert Coins to Diamonds
              </p>
              <div className="flex items-center bg-[#F7F7FF] rounded-2xl px-4 py-3 shadow-sm border border-[#E0E0FF]">
                <input
                  type="number"
                  min="0"
                  value={convertCoins}
                  onChange={(e) => setConvertCoins(e.target.value)}
                  placeholder="Enter coins"
                  className="bg-transparent outline-none w-full text-[#333] placeholder-gray-400"
                />
                <span className="text-gray-400 ml-2">Coins</span>
              </div>
              <button
                onClick={handleConvert}
                className="w-full py-3 mt-3 rounded-2xl bg-[#FFDF7F] text-[#333] font-bold shadow-md active:scale-95 transition-transform flex justify-center items-center"
              >
                {convertLoading ? (
                  <div className="h-5 w-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Convert"
                )}
              </button>
            </div> */}

            {/* Withdraw Section */}
            {/* Withdraw Section */}
            <div className="mb-6">
              <p className="text-[#444] text-[15px] mb-1 font-medium">
                Enter Diamonds to Withdraw
              </p>
              <div className="flex items-center bg-[#F7F7FF] rounded-2xl px-4 py-3 shadow-sm border border-[#E0E0FF]">
                <input
                  type="number"
                  min="0"
                  max={wallet?.diamonds ?? 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent outline-none w-full text-[#333] placeholder-gray-400"
                />
                <span className="text-gray-400 ml-2">Diamonds</span>
              </div>
            </div>
            <button
              onClick={handleWithdraw}
              className="w-full py-4 rounded-2xl bg-[#C6FF9F] text-[#333] font-bold shadow-md active:scale-95 transition-transform flex justify-center items-center"
            >
              {withdrawLoading ? (
                <div className="h-5 w-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Withdraw"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
