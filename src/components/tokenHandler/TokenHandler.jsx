import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

function TokenRedirectHandler() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      // redirect to home
      navigate("/");
    }
  }, [token, navigate]);

  return <div className="text-white text-center mt-20">Redirecting...</div>;
}

export default TokenRedirectHandler;
