#!/bin/bash
# Quick setup script for LLM integration

echo "🚀 AI Observability - LLM Setup Script"
echo "======================================"
echo ""

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
else
    echo "📦 Installing Ollama..."
    brew install ollama
fi

echo ""
echo "🤖 Choose your LLM provider:"
echo "1. Ollama (Free, Local, Private) - RECOMMENDED"
echo "2. Groq (Fast, Free tier, Cloud)"
echo "3. OpenAI (Most accurate, Paid, Cloud)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🦙 Setting up Ollama..."
        
        # Start Ollama service
        echo "Starting Ollama service..."
        ollama serve &
        sleep 3
        
        # Pull model
        echo "Downloading Llama 3.2 model (this may take a few minutes)..."
        ollama pull llama3.2
        
        # Set environment variables
        echo ""
        echo "✅ Ollama setup complete!"
        echo ""
        echo "Add these to your ~/.zshrc or ~/.bashrc:"
        echo "export LLM_PROVIDER=\"ollama\""
        echo "export LLM_MODEL=\"llama3.2\""
        echo "export LLM_ANALYSIS_ENABLED=\"true\""
        echo ""
        
        # Temporary export for current session
        export LLM_PROVIDER="ollama"
        export LLM_MODEL="llama3.2"
        export LLM_ANALYSIS_ENABLED="true"
        
        echo "✅ Environment variables set for this session"
        ;;
        
    2)
        echo ""
        echo "⚡ Setting up Groq..."
        echo ""
        echo "1. Go to https://console.groq.com"
        echo "2. Sign up (free)"
        echo "3. Get your API key"
        echo ""
        read -p "Enter your Groq API key: " groq_key
        
        echo ""
        echo "Add these to your ~/.zshrc or ~/.bashrc:"
        echo "export GROQ_API_KEY=\"$groq_key\""
        echo "export LLM_PROVIDER=\"groq\""
        echo "export LLM_MODEL=\"llama-3.1-70b-versatile\""
        echo "export LLM_ANALYSIS_ENABLED=\"true\""
        echo ""
        
        export GROQ_API_KEY="$groq_key"
        export LLM_PROVIDER="groq"
        export LLM_MODEL="llama-3.1-70b-versatile"
        export LLM_ANALYSIS_ENABLED="true"
        
        echo "✅ Environment variables set for this session"
        ;;
        
    3)
        echo ""
        echo "🤖 Setting up OpenAI..."
        echo ""
        echo "1. Go to https://platform.openai.com/api-keys"
        echo "2. Create an API key"
        echo ""
        read -p "Enter your OpenAI API key: " openai_key
        
        echo ""
        echo "Add these to your ~/.zshrc or ~/.bashrc:"
        echo "export OPENAI_API_KEY=\"$openai_key\""
        echo "export LLM_PROVIDER=\"openai\""
        echo "export LLM_MODEL=\"gpt-4o-mini\""
        echo "export LLM_ANALYSIS_ENABLED=\"true\""
        echo ""
        
        export OPENAI_API_KEY="$openai_key"
        export LLM_PROVIDER="openai"
        export LLM_MODEL="gpt-4o-mini"
        export LLM_ANALYSIS_ENABLED="true"
        
        echo "✅ Environment variables set for this session"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔄 Restarting backend with LLM enabled..."
echo ""

# Kill existing backend
pkill -f "python.*app.py"
sleep 2

# Start backend
cd "/Users/sneh/Observability AI"
source venv/bin/activate
python app.py &

sleep 5

# Test LLM integration
echo ""
echo "🧪 Testing LLM integration..."
echo ""

response=$(curl -s http://localhost:8000/api/agents/status | grep -o '"llm_analysis":"[^"]*"')

if [[ $response == *"enabled"* ]]; then
    echo "✅ LLM is ENABLED and ready!"
    echo ""
    echo "🎉 Setup complete! Your AI observability platform now has:"
    echo "   - AI-powered threat detection"
    echo "   - Contextual analysis"
    echo "   - Natural language explanations"
    echo ""
    echo "📊 Test it at: http://localhost:3000/dashboard"
else
    echo "⚠️  LLM setup needs verification. Check backend logs."
fi

echo ""
echo "💡 Pro tip: To make env variables permanent, add them to ~/.zshrc"

