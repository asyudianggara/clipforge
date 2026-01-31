## 🚀 Getting Started

### Quick Start (No API Key Required)

CLIPFORGE works out of the box with **Local Free Mode**:

1. **Clone & Install:**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/clipforge.git
   cd clipforge

   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

2. **Start Redis (Required):**
   ```bash
   # Make sure Redis server is running on localhost:6379
   redis-server
   ```

3. **Start Application:**
   ```bash
   # Terminal 1: Start Backend
   cd server
   npm run start

   # Terminal 2: Start Frontend
   cd client
   npm run dev
   ```

4. **Open Browser:**
   - Navigate to `http://localhost:3000`
   - Paste a YouTube/TikTok URL
   - **Choose Number of Clips:** Use the slider to select 1-10 clips
   - Click "Generate" - it will use **Local Free Mode** automatically!

---

## ⚙️ AI Provider Configuration (Optional)

Want faster processing? You can use your own API key from cloud providers.

### Step 1: Click Settings Button
- Click the ⚙️ icon in the top-right corner
- The Settings Modal will open

### Step 2: Choose Provider

#### Option A: Local (Free) - **DEFAULT** ✅
- **Pros:** 100% free, no API key needed, privacy-first
- **Cons:** Slower (2-3x realtime), slightly less accurate
- **Cost:** FREE
- **Setup:** Nothing! Already configured

#### Option B: OpenAI 🔥 **RECOMMENDED FOR SPEED**
- **Pros:** Fast (realtime), excellent accuracy (95%+)
- **Cons:** Requires API key, costs ~$0.02 per video
- **Cost:** $0.006/minute transcription + $0.0001/1K tokens analysis
- **Setup:**
  1. Go to https://platform.openai.com/api-keys
  2. Sign in / Create account
  3. Click "Create new secret key"
  4. Copy the key (starts with `sk-...`)
  5. Paste into CLIPFORGE Settings → Save

#### Option C: Google Gemini
- **Pros:** Free tier available, fast
- **Cons:** Regional restrictions, complex setup
- **Cost:** Free (within quota limits)
- **Setup:**
  1. Go to https://aistudio.google.com/app/apikey
  2. Sign in with Google
  3. Click "Create API Key"
  4. Copy and paste into CLIPFORGE Settings
  5. **Note:** May not work in all regions (404 errors)

#### Option D: OpenRouter
- **Pros:** Access to multiple models, flexible pricing
- **Cons:** Requires payment method even for free tier
- **Cost:** Starts at $0.01/video
- **Setup:**
  1. Go to https://openrouter.ai/keys
  2. Sign in
  3. Add payment method (required even for free credits)
  4. Create API key
  5. Paste into CLIPFORGE Settings

### Step 3: Test Connection
- Click "Test Connection" button in Settings
- Verify your API key works
- Click "Save Settings"

### Step 4: Start Processing
- Your configuration is saved in browser's localStorage
- All future videos will use your selected provider
- Switch providers anytime via Settings!

---

## 🔒 Security & Privacy

### Your API Keys Are Safe

CLIPFORGE is designed with security in mind:

- ✅ **Keys stored locally** in your browser (localStorage)
- ✅ **Zero Server Storage:** Your keys never touch our database or `.env` files (highly recommended for shared hosting)
- ✅ **Sent directly** to the AI provider you chose
- ✅ **No server-side memory** of your API keys
- ✅ **Open source** - Verify the code yourself!

### Best Practices

1. **Don't share your API keys** with anyone
2. **Use environment variables** for server-side API keys (if deploying)
3. **Rotate keys regularly** for production use
4. **Monitor usage** on your AI provider's dashboard
5. **Set spending limits** on API platforms (OpenAI, OpenRouter)

---

## 📊 Performance Comparison

| Provider | Speed | Accuracy | Cost | Setup Difficulty |
|----------|-------|----------|------|------------------|
| **Local** | ⚠️ Slow (2-3x realtime) | ✅ Good (85-90%) | ✅ FREE | ✅ Easy (zero config) |
| **OpenAI** | ✅ Fast (~realtime) | ✅ Excellent (95%+) | ⚠️ $0.02/video | ✅ Easy (just API key) |
| **Gemini** | ✅ Fast | ✅ Excellent (95%+) | ✅ Free Tier | ⚠️ Hard (region issues) |
| **OpenRouter** | ✅ Fast | ✅ Excellent (95%+) | ⚠️ $0.01+/video | ⚠️ Medium (payment required) |

### Example Processing Times (10-minute video)

- **Local Mode:** ~20-30 minutes
- **OpenAI/Cloud:** ~3-5 minutes

---

## 🐛 Troubleshooting

### Error: "Failed to download video"

**Cause:** YouTube / video platform blocking the download

**Solutions:**
1. Try a different video URL
2. Use shorter videos (< 20 minutes)
3. Try alternative platforms (Vimeo, direct MP4 links)
4. See `youtube_troubleshooting.md` for detailed guide

### Error: "Job Failed: OpenAI API Key Invalid"

**Cause:** API key is incorrect or expired

**Solutions:**
1. Open Settings ⚙️
2. Verify API key is correct
3. Test connection
4. Check API credit balance at https://platform.openai.com/usage

### Error: "429 Quota Exceeded"

**Cause:** Out of API credits

**Solutions:**
1. **OpenAI:** Top up credits at https://platform.openai.com/settings/organization/billing
2. **Alternative:** Switch to Local Mode (free) in Settings

### Local Mode is Too Slow

**Solutions:**
1. Process shorter videos (5-10 minutes)
2. Upgrade to cloud provider (OpenAI recommended)
3. Use faster hardware (SSD, more RAM)

### Settings Not Saving

**Solutions:**
1. Check browser's localStorage is enabled
2. Clear cache and reload
3. Try different browser

---

## 🚀 For Developers

### Adding a New AI Provider

1. Create provider class in `server/src/services/providers/`
2. Implement `transcribe()` and `analyzeContent()` methods
3. Add to `AIProviderFactory.createTranscriber()` and `createAnalyzer()`
4. Update `SettingsModal.tsx` with new provider option
5. Test and document!

### Environment Variables

For production deployment:

```env
# Server (.env)
PORT=5000
NODE_ENV=production
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# NOTE: API Keys are now managed via the Web UI for better security.
# No need to put them here unless you want to implement a system-wide fallback.
```

---

## 📞 Support

- **Issues:** https://github.com/yourusername/clipforge/issues
- **Discussions:** https://github.com/yourusername/clipforge/discussions
- **Email:** support@clipforge.com

---

**Happy Clip Forging!** 🎬✨
