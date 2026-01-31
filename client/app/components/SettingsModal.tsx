"use client";

import { useState, useEffect } from "react";

interface AIConfig {
  provider: "local" | "openai" | "gemini" | "openrouter";
  apiKey: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
}

interface ProviderDetail {
  name: string;
  description: string;
  needsKey: boolean;
  speed: string;
  cost: string;
  accuracy: string;
  helpUrl?: string;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [provider, setProvider] = useState<AIConfig["provider"]>("local");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load saved config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("clipforge_ai_config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setProvider(config.provider || "local");
        setApiKey(config.apiKey || "");
      } catch (e) {
        console.error("Failed to load saved config", e);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    const config: AIConfig = { provider, apiKey: provider === "local" ? "" : apiKey };
    
    // Save to localStorage
    localStorage.setItem("clipforge_ai_config", JSON.stringify(config));
    
    // Notify parent
    onSave(config);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simple test: create a mock request to validate the key format
      if (provider === "local") {
        setTestResult({
          success: true,
          message: "Mode lokal - Tidak perlu tes koneksi. Siap digunakan!"
        });
      } else if (!apiKey || apiKey.trim() === "") {
        setTestResult({
          success: false,
          message: "Silakan masukkan kunci API terlebih dahulu"
        });
      } else {
        // For OpenAI, basic format validation
        if (provider === "openai" && !apiKey.startsWith("sk-")) {
          setTestResult({
            success: false,
            message: "Kunci API OpenAI harus dimulai dengan 'sk-'"
          });
        } else {
          setTestResult({
            success: true,
            message: "Format kunci API terlihat valid! (Akan diuji sepenuhnya saat memproses video)"
          });
        }
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Tes koneksi gagal"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const providerInfo: Record<AIConfig["provider"], ProviderDetail> = {
    local: {
      name: "Lokal (Gratis)",
      description: "Menggunakan pemrosesan lokal. Gratis tetapi lebih lambat (2-3x).",
      needsKey: false,
      speed: "Lambat",
      cost: "GRATIS",
      accuracy: "Baik (85-90%)"
    },
    openai: {
      name: "OpenAI",
      description: "Cepat dan akurat. Memerlukan kunci API dan kredit.",
      needsKey: true,
      speed: "Cepat",
      cost: "$0.02/video",
      accuracy: "Sangat Baik (95%+)",
      helpUrl: "https://platform.openai.com/api-keys"
    },
    gemini: {
      name: "Google Gemini",
      description: "Cepat dengan opsi gratis. Mungkin ada batasan wilayah.",
      needsKey: true,
      speed: "Cepat",
      cost: "Tersedia Opsi Gratis",
      accuracy: "Sangat Baik (95%+)",
      helpUrl: "https://aistudio.google.com/app/apikey"
    },
    openrouter: {
      name: "OpenRouter",
      description: "Akses ke berbagai model AI. Harga fleksibel.",
      needsKey: true,
      speed: "Cepat",
      cost: "$0.01+/video",
      accuracy: "Sangat Baik (95%+)",
      helpUrl: "https://openrouter.ai/keys"
    }
  };

  if (!isOpen) return null;

  const currentInfo = providerInfo[provider];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ⚙️ Pengaturan AI
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Provider Selection */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-300">
            Pilih Penyedia AI
          </label>
          
          {(Object.keys(providerInfo) as Array<AIConfig["provider"]>).map((p) => (
            <div
              key={p}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                provider === p
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
              }`}
              onClick={() => setProvider(p)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={provider === p}
                      onChange={() => setProvider(p)}
                      className="text-purple-500"
                    />
                    <span className="font-semibold text-white">
                      {providerInfo[p].name}
                    </span>
                    {p === "local" && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        GRATIS
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 ml-6">
                    {providerInfo[p].description}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-2 ml-6">
                    <span>Kecepatan: {providerInfo[p].speed}</span>
                    <span>Biaya: {providerInfo[p].cost}</span>
                    <span>Akurasi: {providerInfo[p].accuracy}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Key Input (if needed) */}
        {currentInfo.needsKey && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kunci API
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan kunci API Anda..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                {showKey ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
            {currentInfo.helpUrl && (
              <p className="text-xs text-gray-500 mt-2">
                Belum punya kunci?{" "}
                <a
                  href={currentInfo.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  Dapatkan di sini →
                </a>
              </p>
            )}
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              testResult.success
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isTesting ? "Sedang Mengetes..." : "Tes Koneksi"}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
          >
            Simpan Pengaturan
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>Kunci API Anda disimpan secara lokal</strong> di browser Anda dan dikirim
            langsung ke penyedia AI. CLIPFORGE tidak pernah menyimpan kunci Anda di server kami.
          </p>
        </div>
      </div>
    </div>
  );
}
