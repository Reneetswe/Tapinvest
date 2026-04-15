import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, Globe, BarChart3, PieChart, Lock, Zap } from "lucide-react";

export default function Landing() {
  const goToSignIn = () => {
    window.location.href = "/signin";
  };

  const goToSignup = () => {
    window.location.href = "/signup";
  };

  // Demo login (for testing - creates demo account)
  const handleDemoLogin = async () => {
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Demo login success:', data);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        console.error('Demo login failed');
        alert('Failed to enter demo mode. Please try signing up instead.');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Candlestick Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {/* Candlestick Chart Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="candlesticks" x="0" y="0" width="120" height="200" patternUnits="userSpaceOnUse">
                {/* Bullish Candle 1 */}
                <line x1="20" y1="40" x2="20" y2="10" stroke="#10b981" strokeWidth="1" />
                <rect x="15" y="40" width="10" height="30" fill="#10b981" />
                <line x1="20" y1="70" x2="20" y2="90" stroke="#10b981" strokeWidth="1" />
                
                {/* Bearish Candle 2 */}
                <line x1="50" y1="30" x2="50" y2="20" stroke="#ef4444" strokeWidth="1" />
                <rect x="45" y="30" width="10" height="40" fill="#ef4444" />
                <line x1="50" y1="70" x2="50" y2="85" stroke="#ef4444" strokeWidth="1" />
                
                {/* Bullish Candle 3 */}
                <line x1="80" y1="60" x2="80" y2="35" stroke="#10b981" strokeWidth="1" />
                <rect x="75" y="60" width="10" height="25" fill="#10b981" />
                <line x1="80" y1="85" x2="80" y2="95" stroke="#10b981" strokeWidth="1" />
                
                {/* Bearish Candle 4 */}
                <line x1="110" y1="45" x2="110" y2="30" stroke="#ef4444" strokeWidth="1" />
                <rect x="105" y="45" width="10" height="35" fill="#ef4444" />
                <line x1="110" y1="80" x2="110" y2="100" stroke="#ef4444" strokeWidth="1" />
                
                {/* Second Row */}
                <line x1="20" y1="140" x2="20" y2="120" stroke="#10b981" strokeWidth="1" />
                <rect x="15" y="140" width="10" height="20" fill="#10b981" />
                <line x1="20" y1="160" x2="20" y2="175" stroke="#10b981" strokeWidth="1" />
                
                <line x1="50" y1="135" x2="50" y2="125" stroke="#ef4444" strokeWidth="1" />
                <rect x="45" y="135" width="10" height="30" fill="#ef4444" />
                <line x1="50" y1="165" x2="50" y2="180" stroke="#ef4444" strokeWidth="1" />
                
                <line x1="80" y1="150" x2="80" y2="130" stroke="#10b981" strokeWidth="1" />
                <rect x="75" y="150" width="10" height="28" fill="#10b981" />
                <line x1="80" y1="178" x2="80" y2="190" stroke="#10b981" strokeWidth="1" />
                
                <line x1="110" y1="145" x2="110" y2="135" stroke="#ef4444" strokeWidth="1" />
                <rect x="105" y="145" width="10" height="25" fill="#ef4444" />
                <line x1="110" y1="170" x2="110" y2="185" stroke="#ef4444" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#candlesticks)" />
          </svg>
        </div>
        
        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-gray-900/80"></div>
        
        {/* Animated floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BSE Trading Platform</h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={goToSignIn}>Sign In</Button>
            <Button onClick={goToSignup}>Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Marketing */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium">
            🇧🇼 Built for Botswana • Licensed BSE Brokers
          </div>
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Trade on the <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Botswana Stock Exchange</span>
          </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Your professional MetaTrader-style platform for BSE trading. Connect with registered brokers like Stockbrokers Botswana, Imara Capital, and Motswedi Securities. Trade digitally without visiting offices.
          </p>
            {/* Removed wireframe preview image per request */}
          </div>
          
          {/* Right - Auth CTAs */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
                <CardDescription>Sign in or create your BSE trading account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg" onClick={handleDemoLogin}>Sign Up (Demo)</Button>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>
                <Button className="w-full" variant="outline" size="lg" onClick={goToSignup}>Create Account</Button>
                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                  By continuing you agree to our Terms and Privacy Policy
          </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-800/50 rounded-3xl my-16">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Professional Trading Features</h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Everything you need to trade on the Botswana Stock Exchange</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-600">
            <CardHeader>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Real-Time Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">Live BSE market data with professional charts, real-time price updates, and technical indicators</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 dark:hover:border-green-600">
            <CardHeader>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-xl">Licensed & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">Connected to all 3 licensed BSE brokers: Stockbrokers Botswana, Imara Capital, Motswedi Securities</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-600">
            <CardHeader>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-10 w-10 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Local Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">Trade in BWP with leading Botswana companies: Letshego, ABSA, Chobe Holdings, FNB, and more</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300 dark:hover:border-orange-600">
            <CardHeader>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <PieChart className="h-10 w-10 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Portfolio Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">Complete portfolio tracking with P&L analysis, performance metrics, and risk management tools</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Market Status banner etc. remain as before or can be trimmed for brevity */}
      </div>
    </div>
  );
}
