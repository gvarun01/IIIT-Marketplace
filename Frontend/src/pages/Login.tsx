import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import ReCAPTCHA from "react-google-recaptcha";

const CAS_LOGIN_URL = "https://login.iiit.ac.in/cas/login";
const SERVICE_URL = `${window.location.origin}/login/callback`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  interface LocationState {
    from: string;
  }

  const from = (location.state as LocationState)?.from || "/";

  useEffect(() => {
    const validateAndLogin = async (ticket: string) => {
      try {
        setIsLoading(true);
        
        // First validate the CAS ticket
        const validationResponse = await axios.post("/api/users/validate-cas", {
          ticket,
          service: SERVICE_URL
        });
        
        const { email: casEmail } = validationResponse.data;
        
        // Proceed with CAS login
        const loginResponse = await axios.post('/api/users/cas-login', {
          email: casEmail
        });

        const { accessToken, refreshToken } = loginResponse.data.data;
        
        // Remove existing cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Set new cookies
        Cookies.set('accessToken', accessToken, {
          path: '/'
        });
        
        Cookies.set('refreshToken', refreshToken, {
          path: '/'
        });
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        navigate(from, { replace: true });
        
      } catch (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.response?.data?.message || "Something went wrong",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Handle CAS callback
    const ticket = new URLSearchParams(location.search).get("ticket");
    if (ticket && location.pathname === "/login/callback") {
      validateAndLogin(ticket);
    }
  }, [location, navigate, from]);

  const handleRegularLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      setIsLoading(true);
      const response = await axios.post("/api/users/login", {
        email,
        password,
        recaptchaValue,
      });

      const { accessToken, refreshToken } = response.data.data;

      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      
      Cookies.set('accessToken', accessToken, {
        path: '/'
      });
      
      Cookies.set('refreshToken', refreshToken, {
        path: '/'
      });
      
      const storedAccessToken = Cookies.get('accessToken');
      
      if (!storedAccessToken) {
        throw new Error('Failed to set cookies');
      }
  
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCasLogin = () => {
    const casUrl = `${CAS_LOGIN_URL}?service=${encodeURIComponent(SERVICE_URL)}`;
    window.location.href = casUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3] px-4">
      <Card className="w-full max-w-md p-8 bg-white border border-[#E8B4A2]/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2A363B]">Welcome Back</h1>
          <p className="text-[#4A5859] mt-2">Please sign in to continue</p>
        </div>

        <Button
          onClick={handleCasLogin}
          className="w-full mb-6 bg-[#2A363B] hover:bg-[#1a242b] text-white flex items-center justify-center"
          type="button"
        >
          Continue with IIIT Account
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8B4A2]/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#4A5859]">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleRegularLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="mt-4">
            <ReCAPTCHA
              sitekey='6Lffp7YqAAAAANGT5CICP7uXtZNxJuVefyUg2u2o'
              onChange={(value) => setRecaptchaValue(value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#99B898] hover:bg-[#7a9479] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-[#4A5859]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#99B898] hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
