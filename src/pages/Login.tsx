import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        {/* <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Expense Splitter</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div> */}

        {/* Sign In Card */}
        <Card className="w-full rounded-2xl shadow-md border bg-background">
        
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Expense Splitter</h2>
          </div>
          <CardContent className="p-6 flex flex-col gap-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-2 text-left">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2 text-left">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 h-12 focus-within:ring-2 focus-within:ring-ring">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Remember me & Forgot */}
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                variant="default"
                className="w-full h-12 text-base font-medium rounded-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Social login buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-lg flex items-center justify-center gap-3"
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-lg flex items-center justify-center gap-3"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                  alt="Apple"
                  className="w-5 h-5"
                />
                Continue with Apple
              </Button>
            </div>

            <p className = "text-sm text-muted-foreground mt-2">
              Don't have an account? {" "}
              <span className = "text-primary cursor-pointer hover:underline">
                Sign Up
              </span>
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
