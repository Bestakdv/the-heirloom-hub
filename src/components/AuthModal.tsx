import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Mail, Lock, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState("");

  const validatePassword = (password: string) => {
    const validations = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return validations;
  };

  const isPasswordValid = (password: string) => {
    const validations = validatePassword(password);
    return Object.values(validations).every(Boolean);
  };

  const getPasswordErrorMessage = (error: string) => {
    if (error.toLowerCase().includes("password") && error.toLowerCase().includes("short")) {
      return "Password must be at least 8 characters long.";
    }
    if (error.toLowerCase().includes("password") && error.toLowerCase().includes("weak")) {
      return "Password is too weak. Please use a stronger password with a mix of letters, numbers, and symbols.";
    }
    if (error.toLowerCase().includes("password") && (error.toLowerCase().includes("format") || error.toLowerCase().includes("invalid"))) {
      return "Password format is invalid. Please use at least 8 characters.";
    }
    if (error.toLowerCase().includes("signup") && error.toLowerCase().includes("disabled")) {
      return "Account creation is currently disabled. Please contact support.";
    }
    if (error.toLowerCase().includes("email") && error.toLowerCase().includes("invalid")) {
      return "Please enter a valid email address.";
    }
    if (error.toLowerCase().includes("email") && error.toLowerCase().includes("taken")) {
      return "An account with this email already exists. Please try signing in instead.";
    }
    return error;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please check your email and click the confirmation link before signing in.");
        setPendingConfirmationEmail(loginData.email);
        setShowResendConfirmation(true);
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please check your credentials and try again.");
      } else {
        toast.error(error.message);
      }
    } else if (data?.user) {
      toast.success("Welcome back!");
      onAuthSuccess();
      onClose();
      setShowResendConfirmation(false);
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side password validation
    if (!isPasswordValid(signupData.password)) {
      toast.error("Please ensure your password meets all requirements.");
      return;
    }
    
    setIsLoading(true);
    
    const { data, error } = await signUp(signupData.email, signupData.password, signupData.name);
    
    if (error) {
      const friendlyErrorMessage = getPasswordErrorMessage(error.message);
      toast.error(friendlyErrorMessage);
    } else if (data?.user) {
      // Mock success - no email confirmation needed
      toast.success("Account created and logged in successfully!");
      onAuthSuccess();
      onClose();
    }
    
    setIsLoading(false);
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    const { error } = await resendConfirmation(pendingConfirmationEmail);
    
    if (error) {
      toast.error("Failed to resend confirmation email.");
    } else {
      toast.success("Confirmation email sent! Please check your inbox.");
    }
    
    setIsLoading(false);
  };

  const passwordValidations = validatePassword(signupData.password);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-amber-600" />
            <DialogTitle className="text-2xl text-amber-900">The Heirloom Hub</DialogTitle>
          </div>
        </DialogHeader>

        {showResendConfirmation ? (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <Mail className="w-12 h-12 text-amber-600 mx-auto" />
              <h3 className="text-lg font-semibold text-amber-900">Check Your Email</h3>
              <p className="text-amber-700">
                We sent a confirmation link to <strong>{pendingConfirmationEmail}</strong>
              </p>
              <p className="text-sm text-amber-600">
                Click the link in your email to activate your account, then return here to sign in.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={handleResendConfirmation}
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isLoading ? "Sending..." : "Resend Confirmation Email"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowResendConfirmation(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Your password"
                      className="pl-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      className="pl-10"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      className="pl-10"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  {/* Password requirements checklist */}
                  {signupData.password && (
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-2 ${passwordValidations.minLength ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordValidations.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidations.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordValidations.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidations.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordValidations.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidations.hasDigit ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordValidations.hasDigit ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One digit
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidations.hasSymbol ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordValidations.hasSymbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One symbol (!@#$%^&*)
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading || !isPasswordValid(signupData.password)}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
