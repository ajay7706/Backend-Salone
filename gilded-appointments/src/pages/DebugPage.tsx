import { useState } from "react";
import { request, API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";

const DebugPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await request("/api/status");
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await request("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: `test${Date.now()}@example.com`,
          phone: "9876543210",
          password: "test123",
        }),
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
      <div className="space-y-4">
        <p className="text-sm"><strong>API URL:</strong> {API_URL}</p>
        <Button onClick={testAPI} disabled={loading}>
          {loading ? "Testing..." : "Test API Status"}
        </Button>
        <Button onClick={testSignup} disabled={loading}>
          {loading ? "Testing..." : "Test Signup"}
        </Button>
        {error && <p className="text-red-500">Error: {error}</p>}
        {result && <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default DebugPage;
