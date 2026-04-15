import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Shield, 
  User, 
  Key, 
  Globe, 
  Bell, 
  Monitor, 
  Database, 
  Download, 
  Upload,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Smartphone,
  QrCode,
  Eye,
  EyeOff
} from "lucide-react";

interface SettingsTabProps {
  brokers: any[];
  user: any;
}

export default function SettingsTab({ brokers, user }: SettingsTabProps) {
  const [activeSection, setActiveSection] = useState("brokers");
  const [brokerConnections, setBrokerConnections] = useState({
    "stockbrokers-botswana": { connected: false, username: "", password: "" },
    "imara-capital": { connected: false, username: "", password: "" },
    "motswedi-securities": { connected: false, username: "", password: "" },
  });

  const [tradingSettings, setTradingSettings] = useState({
    confirmOrders: true,
    autoSaveCharts: true,
    priceAlerts: true,
    soundNotifications: false,
    emailNotifications: true,
  });

  const [riskSettings, setRiskSettings] = useState({
    maxOrderSize: "10000",
    maxDailyLoss: "5000",
    stopLossDefault: "2",
    takeProfitDefault: "5",
    marginCallLevel: "120",
  });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState<"idle" | "enrolling" | "verifying" | "enabled">("idle");

  // Initialize 2FA state from user data
  useEffect(() => {
    if (user?.twoFactorEnabled) {
      setTwoFactorEnabled(true);
      setEnrollmentStep("idle");
    }
  }, [user]);

  const handleBrokerConnection = (brokerId: string, field: string, value: string) => {
    setBrokerConnections(prev => ({
      ...prev,
      [brokerId]: { ...prev[brokerId as keyof typeof prev], [field]: value },
    }));
  };

  const toggleBrokerConnection = (brokerId: string) => {
    setBrokerConnections(prev => ({
      ...prev,
      [brokerId]: {
        ...prev[brokerId as keyof typeof prev],
        connected: !prev[brokerId as keyof typeof prev].connected,
      },
    }));
  };

  const handleTradingSettingChange = (setting: string, value: boolean) => {
    setTradingSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleRiskSettingChange = (setting: string, value: string) => {
    setRiskSettings(prev => ({ ...prev, [setting]: value }));
  };

  // 2FA functions
  const handleEnroll2FA = async () => {
    setIsEnrolling(true);
    
    console.log("🔄 Starting 2FA enrollment...");
    console.log("📍 Current URL:", window.location.href);
    
    try {
      console.log("📤 Sending request to /api/2fa/enroll");
      
      const response = await fetch("/api/2fa/enroll", { 
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);
      
      // Try to get response body regardless of status
      let data;
      try {
        data = await response.json();
        console.log("📦 Response data:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse response JSON:", parseError);
        const text = await response.text();
        console.error("📄 Raw response:", text);
        alert(`Server error: ${response.status} - ${text || 'No response body'}`);
        return;
      }
      
      if (response.ok) {
        console.log("✅ 2FA enrollment successful!");
        console.log("🔑 Secret received:", data.secret ? "Yes" : "No");
        console.log("🖼️ QR code received:", data.qr ? `Yes (${data.qr.substring(0, 50)}...)` : "No");
        
        if (!data.qr) {
          alert("Error: No QR code received from server");
          console.error("❌ Missing QR code in response");
          return;
        }
        
        if (!data.secret) {
          alert("Error: No secret received from server");
          console.error("❌ Missing secret in response");
          return;
        }
        
        // Store the Base32 secret for manual entry
        setTwoFactorSecret(data.secret);
        setQrCodeUrl(data.qr);
        setEnrollmentStep("enrolling");
        
        console.log("✅ State updated - QR code should now be visible");
        console.log("📱 QR Code ready for Microsoft Authenticator");
      } else {
        console.error("❌ 2FA enrollment failed");
        console.error("Status:", response.status);
        console.error("Error data:", data);
        alert(`Failed to enable 2FA: ${data.message || 'Unknown error'}\n\nStatus: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Exception during 2FA enrollment:", error);
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`);
    } finally {
      setIsEnrolling(false);
      console.log("🏁 2FA enrollment process completed");
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode.trim()) {
      alert("Please enter the 6-digit code from Microsoft Authenticator");
      return;
    }
    
    if (verificationCode.length !== 6) {
      alert("Code must be exactly 6 digits");
      return;
    }
    
    setIsVerifying(true);
    
    console.log("🔄 Starting 2FA verification...");
    console.log("📤 Sending code:", verificationCode);
    
    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      console.log("📥 Verify response status:", response.status);
      
      let data;
      try {
        data = await response.json();
        console.log("📦 Verify response data:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse verify response:", parseError);
        alert("Server error - Invalid response format");
        return;
      }
      
      if (response.ok && data.success) {
        console.log("✅ 2FA verification successful!");
        
        // Update UI to show 2FA is enabled
        setTwoFactorEnabled(true);
        setEnrollmentStep("enabled");
        setVerificationCode("");
        
        console.log("🔒 2FA is now enabled and protecting your account");
        
        // Show success message
        alert(data.message || "2FA enabled successfully! Your account is now protected.");
      } else {
        console.error("❌ 2FA verification failed");
        console.error("Status:", response.status);
        console.error("Error:", data);
        alert(data.message || "Invalid code. Please check your Microsoft Authenticator app and try again.");
      }
    } catch (error) {
      console.error("❌ Exception during verification:", error);
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`);
    } finally {
      setIsVerifying(false);
      console.log("🏁 2FA verification process completed");
    }
  };

  const handleDisable2FA = async () => {
    try {
      const response = await fetch("/api/2fa/disable", { 
        method: "POST",
        credentials: "include"
      });
      if (response.ok) {
        setTwoFactorEnabled(false);
        setEnrollmentStep("idle");
        setTwoFactorSecret("");
        setQrCodeUrl("");
      } else {
        const error = await response.json();
        console.error("Failed to disable 2FA:", error);
        alert(error.message || "Failed to disable 2FA");
      }
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      alert("Failed to disable 2FA. Please try again.");
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `BWP ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const sections = [
    { id: "brokers", label: "Broker Connections", icon: Globe },
    { id: "account", label: "Account Settings", icon: User },
    { id: "security", label: "Security & 2FA", icon: Shield },
    { id: "trading", label: "Trading Preferences", icon: Settings },
    { id: "risk", label: "Risk Management", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "system", label: "System Settings", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Broker Connections Section */}
      {activeSection === "brokers" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                BSE Broker Connections
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect to your registered BSE brokers to execute trades
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {brokers.map((broker) => {
                const connection = brokerConnections[broker.id as keyof typeof brokerConnections];
                const isConnected = connection?.connected;
                
                return (
                  <div key={broker.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{broker.name}</h3>
                        <Badge variant={isConnected ? "default" : "secondary"}>
                          {isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <Button
                        variant={isConnected ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleBrokerConnection(broker.id)}
                      >
                        {isConnected ? (
                          <>
                            <WifiOff className="h-4 w-4 mr-2" />
                            Disconnect
                          </>
                        ) : (
                          <>
                            <Wifi className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`username-${broker.id}`}>Username/Account Number</Label>
                        <Input
                          id={`username-${broker.id}`}
                          type="text"
                          placeholder="Enter your broker username"
                          value={connection?.username || ""}
                          onChange={(e) => handleBrokerConnection(broker.id, "username", e.target.value)}
                          disabled={isConnected}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`password-${broker.id}`}>Password/API Key</Label>
                        <Input
                          id={`password-${broker.id}`}
                          type="password"
                          placeholder="Enter your broker password"
                          value={connection?.password || ""}
                          onChange={(e) => handleBrokerConnection(broker.id, "password", e.target.value)}
                          disabled={isConnected}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Commission Rate:</span>
                        <span className="font-medium">{formatCurrency(broker.commission)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                          {isConnected ? 'Active Trading' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Settings Section */}
      {activeSection === "account" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={user?.firstName || ""} disabled />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={user?.lastName || ""} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <Input value="Individual Trading Account" disabled />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                  <Badge variant="default" className="mt-2">Active</Badge>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verification</p>
                  <Badge variant="default" className="mt-2">Verified</Badge>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="font-medium mt-2">2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security & 2FA Section */}
      {activeSection === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Two-Factor Authentication
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Secure your account with an additional layer of protection
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current 2FA Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                  {twoFactorEnabled ? "Protected" : "Unprotected"}
                </Badge>
              </div>

              {/* Debug Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>User: {user?.email || "Not loaded"}</p>
                <p>2FA Enabled: {String(twoFactorEnabled)}</p>
                <p>Enrollment Step: {enrollmentStep}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/auth/user', { credentials: 'include' });
                      const data = await res.json();
                      console.log("Current user:", data);
                      alert(`User: ${data.email}\n2FA: ${data.twoFactorEnabled}\nSession: ${res.ok ? 'Valid' : 'Invalid'}`);
                    } catch (e) {
                      console.error("Auth check failed:", e);
                      alert("Failed to check auth status");
                    }
                  }}
                >
                  Test Auth Status
                </Button>
              </div>

              {/* 2FA Enrollment Flow */}
              {!twoFactorEnabled && enrollmentStep === "idle" && (
                <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Smartphone className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Enable Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Add an extra layer of security to your trading account
                  </p>
                  <Button onClick={handleEnroll2FA} disabled={isEnrolling}>
                    {isEnrolling ? "Setting up..." : "Enable 2FA"}
                  </Button>
                </div>
              )}

              {/* QR Code Display */}
              {enrollmentStep === "enrolling" && qrCodeUrl && (
                <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Scan QR Code</h3>
                  <div className="flex justify-center mb-4">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border border-gray-200 dark:border-gray-700 rounded-lg" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  
                  {/* Manual Entry */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Manual Entry (if QR doesn't work)</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={twoFactorSecret}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Verification Code Input */}
                  <div className="max-w-xs mx-auto">
                    <Label htmlFor="verification-code" className="text-sm font-medium">
                      Enter 6-digit code from your app
                    </Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center font-mono text-lg"
                        maxLength={6}
                      />
                      <Button onClick={handleVerify2FA} disabled={isVerifying || verificationCode.length !== 6}>
                        {isVerifying ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2FA Enabled Status */}
              {enrollmentStep === "enabled" && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                    Two-Factor Authentication Enabled!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Your account is now protected with an additional security layer
                  </p>
                  <Button variant="outline" onClick={() => setEnrollmentStep("idle")}>
                    Continue
                  </Button>
                </div>
              )}

              {/* 2FA Management */}
              {twoFactorEnabled && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        2FA is active and protecting your account
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You'll need to enter a verification code each time you sign in
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={handleDisable2FA}>
                      <Shield className="h-4 w-4 mr-2" />
                      Disable 2FA
                    </Button>
                    <Button variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR Code Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Tips */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Security Tips</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Keep your authenticator app secure and backed up</li>
                  <li>• Don't share your 2FA codes with anyone</li>
                  <li>• Consider backing up recovery codes if available</li>
                  <li>• Use 2FA on all your financial accounts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trading Preferences Section */}
      {activeSection === "trading" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Trading Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Confirm Orders Before Execution</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Require confirmation for all trade orders
                    </p>
                  </div>
                  <Switch
                    checked={tradingSettings.confirmOrders}
                    onCheckedChange={(checked) => handleTradingSettingChange("confirmOrders", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Save Chart Layouts</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically save chart configurations
                    </p>
                  </div>
                  <Switch
                    checked={tradingSettings.autoSaveCharts}
                    onCheckedChange={(checked) => handleTradingSettingChange("autoSaveCharts", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Price Alerts</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable price movement notifications
                    </p>
                  </div>
                  <Switch
                    checked={tradingSettings.priceAlerts}
                    onCheckedChange={(checked) => handleTradingSettingChange("priceAlerts", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Play sounds for trade executions
                    </p>
                  </div>
                  <Switch
                    checked={tradingSettings.soundNotifications}
                    onCheckedChange={(checked) => handleTradingSettingChange("soundNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Send email confirmations for trades
                    </p>
                  </div>
                  <Switch
                    checked={tradingSettings.emailNotifications}
                    onCheckedChange={(checked) => handleTradingSettingChange("emailNotifications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Management Section */}
      {activeSection === "risk" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Risk Management Settings
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure trading limits and risk controls
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Maximum Order Size (BWP)</Label>
                  <Input
                    type="number"
                    value={riskSettings.maxOrderSize}
                    onChange={(e) => handleRiskSettingChange("maxOrderSize", e.target.value)}
                    placeholder="10000"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum amount per single trade
                  </p>
                </div>
                
                <div>
                  <Label>Maximum Daily Loss (BWP)</Label>
                  <Input
                    type="number"
                    value={riskSettings.maxDailyLoss}
                    onChange={(e) => handleRiskSettingChange("maxDailyLoss", e.target.value)}
                    placeholder="5000"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Stop trading if daily loss exceeds this amount
                  </p>
                </div>
                
                <div>
                  <Label>Default Stop Loss (%)</Label>
                  <Input
                    type="number"
                    value={riskSettings.stopLossDefault}
                    onChange={(e) => handleRiskSettingChange("stopLossDefault", e.target.value)}
                    placeholder="2"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Automatic stop loss percentage for new positions
                  </p>
                </div>
                
                <div>
                  <Label>Default Take Profit (%)</Label>
                  <Input
                    type="number"
                    value={riskSettings.takeProfitDefault}
                    onChange={(e) => handleRiskSettingChange("takeProfitDefault", e.target.value)}
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Automatic take profit percentage for new positions
                  </p>
                </div>
                
                <div>
                  <Label>Margin Call Level (%)</Label>
                  <Input
                    type="number"
                    value={riskSettings.marginCallLevel}
                    onChange={(e) => handleRiskSettingChange("marginCallLevel", e.target.value)}
                    placeholder="120"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Warning level for margin requirements
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    Risk Warning
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  These settings help manage your trading risk. Please ensure they align with your investment strategy and risk tolerance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Section */}
      {activeSection === "notifications" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label className="font-medium">Order Executions</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Notify when orders are filled or cancelled
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label className="font-medium">Price Alerts</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Notify when stocks reach target prices
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label className="font-medium">Portfolio Updates</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Daily portfolio performance summaries
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label className="font-medium">Market News</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Important BSE market announcements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Settings Section */}
      {activeSection === "system" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Data Management</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Trading History
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Data Refresh Rate:</span>
                      <Select defaultValue="5s">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1s">1s</SelectItem>
                          <SelectItem value="5s">5s</SelectItem>
                          <SelectItem value="10s">10s</SelectItem>
                          <SelectItem value="30s">30s</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Chart Quality:</span>
                      <Select defaultValue="high">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <Button variant="outline" className="mr-2">
                  Reset to Defaults
                </Button>
                <Button>
                  Save All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
