import axios from "../../axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Home = () => {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [bankData, setBankData] = useState([]);

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
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzI2OWUyNWU2NDUwODI4NjUzNzcwYyIsImVtYWlsIjoiYWxpY2VAeW9wbWFpbC5jb20iLCJpYXQiOjE3NjQzMjYwMDh9.vbwQEZzWIDnk_1Kg2_TyrhKGztYT-r5gsWYgUYQ9vzw",
      });

      const { onboardingUrl } = response?.data?.data || {};

      if (onboardingUrl) {
        window.location.href = onboardingUrl;
      }
    } catch (error) {
      console.log("Stripe connect check error:", error);
    }
  };

  const handleRedirect = async () => {
    try {
      const response = await axios.post("/api/withdrawal/account-status ");
      if (response?.status === 200) {
        // window.location.href = response?.data?.data?.url;
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const getWallet = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/withdrawal/account-status");
      if (response.status === 200) {
        console.log(response, "Response Data Wallet");

        // if (!isStripeCompleted) {
        //   handleRedirect();
        // } else {
        //   await getBank();
        // }
      }
    } catch (error) {
      console.log("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBank = async () => {
    try {
      const response = await axios.get("/inapp/bank");
      if (response?.status === 200) {
        setBankData(response?.data?.data);
      }
    } catch (error) {
      console.log("Error fetching bank data:", error);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      ErrorToast("Please enter a valid amount.");
      return;
    }

    if (withdrawAmount > (walletData?.dollars || 0)) {
      ErrorToast(
        `You cannot withdraw more than your available balance (${walletData?.dollars} USD).`
      );
      return;
    }

    if (!bankData?.[0]?._id) {
      ErrorToast("No bank account linked.");
      return;
    }

    setWithdrawLoading(true);
    try {
      const response = await axios.post("/inapp/withdraw", {
        bankAccount: bankData[0]._id,
        ammount: withdrawAmount,
      });

      if (response?.status === 200) {
        SuccessToast(
          `You’ve requested to withdraw ${withdrawAmount}. Your request is now under review.`
        );
        setAmount("");
        // getWallet();
      }
    } catch (error) {
      console.log("Withdraw error:", error);
      ErrorToast(
        error?.response?.data?.message ||
          "Something went wrong with withdrawal."
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      // getWallet();
      // handleRedirect()
      checkStripeAccount();
    }
  }, [token]);

  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-700 rounded w-2/3"></div>
      <div className="h-10 bg-gray-700 rounded w-full"></div>
      <div className="h-6 bg-gray-700 rounded w-1/2"></div>
      <div className="h-12 bg-gray-700 rounded w-full"></div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-[390px] h-[722px] bg-white text-white rounded-[40px]  overflow-hidden relative shadow-2xl px-6 mt-4">
        <h2 className="text-xl font-semibold mb-4 mt-4 text-center">
          Withdraw
        </h2>

        {loading ? (
          <Skeleton />
        ) : (
          <>
            <div className="mb-6">
              <p className="text-black text-[14px] font-[500] mb-1">
                Attached Bank Account
              </p>
              <div className="bg-white rounded-xl border border-black px-4 py-3 text-black select-none flex justify-between items-center">
                <span>
                  {bankData?.[0]?.routing_number
                    ? `**** **** **** ${bankData[0].routing_number.slice(-4)}`
                    : "**** **** **** ****"}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-6">
              <p className="text-black text-[14px] font-[500] mb-1">
                Available Balance
              </p>
              <p className="text-lg text-black font-semibold">
                {walletData?.diamonds} {walletData?.dollars} USD
              </p>
            </div>

            {/* Enter Amount */}
            <div className="mb-8">
              <p className="text-black text-[14px] font-[500] mb-1">
                Enter Amount
              </p>
              <div className="bg-white border border-black rounded-xl px-4 py-3 text-lg font-semibold text-white flex justify-between items-center">
                <input
                  type="number"
                  min="0"
                  max={walletData?.dollars || 0}
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (parseFloat(val) > (walletData?.dollars || 0)) {
                      setAmount((walletData?.dollars || 0).toString());
                    } else {
                      setAmount(val);
                    }
                  }}
                  placeholder="0.00"
                  className="bg-transparent outline-none w-full text-black placeholder-gray-500"
                  disabled={withdrawLoading}
                />
                <span className="text-gray-400 ml-2">USD</span>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading || !amount || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-full text-black font-semibold text-lg bg-[#B6FF6F] shadow-md active:scale-95 transition-transform duration-150 ${
                withdrawLoading || !amount || parseFloat(amount) <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {withdrawLoading ? "Processing..." : "Review Withdraw"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
