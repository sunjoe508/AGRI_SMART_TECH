
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  Sparkles,
  Zap,
  MessageCircle,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // AI responses database
  const aiResponses = {
    greeting: [
      "🚀 Greetings, Commander! I'm ARIA, your Advanced Reasoning Intelligence Assistant. How may I enhance your agricultural command operations today?",
      "🌟 Welcome to the quantum realm! I'm your AI companion, ready to navigate the complexities of modern agriculture with you.",
      "⚡ Neural networks online! I'm here to provide intelligent insights and seamless navigation through your admin portal."
    ],
    navigation: [
      "🗺️ I can guide you through any section of the command center. Would you like to explore user management, quantum analytics, or AI insights?",
      "🎯 Navigation protocols activated! Simply tell me where you'd like to go, and I'll teleport you there instantly.",
      "🧭 Your wish is my command! I can help you access any feature in the quantum admin portal."
    ],
    analytics: [
      "📊 Analyzing quantum data streams... Your agricultural network shows optimal performance with 98.7% efficiency!",
      "🔍 Processing neural patterns... I detect significant growth potential in user engagement metrics.",
      "📈 Real-time analysis indicates your irrigation systems are operating at peak quantum efficiency!"
    ],
    users: [
      "👥 Your farmer network spans across Kenya's quantum grid with exceptional connectivity rates!",
      "🌾 User engagement patterns suggest high satisfaction with the AgriSmart ecosystem.",
      "🚀 The neural user matrix shows strong growth trajectories across all agricultural sectors."
    ],
    help: [
      "💡 I'm equipped with advanced AI capabilities to assist with navigation, data analysis, user management, and system optimization.",
      "🤖 My neural networks are trained on agricultural data patterns, quantum computing principles, and user experience optimization.",
      "✨ From simple navigation to complex analytics, I'm your intelligent companion in this futuristic admin experience."
    ],
    default: [
      "🤔 Interesting query! Let me process that through my neural networks...",
      "🧠 That's a fascinating question! My AI algorithms are analyzing multiple data points to provide you with the best response.",
      "⚡ Processing your request through quantum pathways... Stand by for optimized results!"
    ]
  };

  useEffect(() => {
    // Welcome message
    setTimeout(() => {
      addAIMessage(aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)]);
    }, 1000);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addAIMessage = (content: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
      
      // Text-to-speech for AI responses
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(content.replace(/[🚀🌟⚡🗺️🎯🧭📊🔍📈👥🌾💡🤖✨🤔🧠]/g, ''));
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
      }
    }, Math.random() * 1000 + 500);
  };

  const processUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    let response = '';

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('greeting')) {
      response = aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
    } else if (lowerInput.includes('navigate') || lowerInput.includes('go to') || lowerInput.includes('show me')) {
      response = aiResponses.navigation[Math.floor(Math.random() * aiResponses.navigation.length)];
    } else if (lowerInput.includes('analytics') || lowerInput.includes('data') || lowerInput.includes('stats')) {
      response = aiResponses.analytics[Math.floor(Math.random() * aiResponses.analytics.length)];
    } else if (lowerInput.includes('users') || lowerInput.includes('farmers') || lowerInput.includes('people')) {
      response = aiResponses.users[Math.floor(Math.random() * aiResponses.users.length)];
    } else if (lowerInput.includes('help') || lowerInput.includes('what can you do') || lowerInput.includes('assistance')) {
      response = aiResponses.help[Math.floor(Math.random() * aiResponses.help.length)];
    } else {
      response = aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
    }

    addAIMessage(response);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addUserMessage(inputMessage);
    processUserInput(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "⚠️ Voice Recognition Unavailable",
        description: "Your browser doesn't support voice input.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Voice Input Active",
        description: "Listening for your command...",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "❌ Voice Input Error",
        description: "Failed to recognize speech. Please try again.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-2xl"
        >
          <Bot className="w-8 h-8 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50">
      <Card className="h-full bg-black/90 backdrop-blur-xl border-2 border-cyan-500/50 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <CardTitle className="text-lg">ARIA - AI Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500 animate-pulse">
                <Brain className="w-3 h-3 mr-1" />
                ONLINE
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(true)}
                className="text-white hover:bg-white/20"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-cyan-500/30'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-cyan-400 font-semibold">ARIA</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-cyan-500/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400 font-semibold">ARIA</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-cyan-500/30">
            <div className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask ARIA for assistance..."
                className="flex-1 bg-black/50 border-cyan-500/30 text-white placeholder-gray-400"
              />
              <Button
                onClick={toggleVoiceInput}
                size="sm"
                className={`${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={toggleSpeech}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
