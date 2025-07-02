
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
  Sparkles,
  Zap,
  MessageCircle,
  Minimize2,
  Leaf,
  Droplets,
  Sun
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const UserAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentRecognition, setCurrentRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const aiResponses = {
    irrigation: [
      "🌱 Based on your soil moisture data, I recommend irrigating Zone A for 15 minutes with 200L of water.",
      "💧 Your current irrigation schedule looks optimal! Soil moisture levels are within the ideal range of 60-70%.",
      "🚿 Consider reducing irrigation frequency by 20% - your plants are getting adequate water based on recent sensor data."
    ],
    weather: [
      "☀️ Today's forecast shows 28°C with 65% humidity - perfect conditions for your maize crop!",
      "🌧️ Rain expected tomorrow! I suggest reducing irrigation by 50% to prevent overwatering.",
      "🌤️ Partly cloudy conditions ahead - ideal for transplanting those tomato seedlings you mentioned."
    ],
    crops: [
      "🌾 Your maize is in the tasseling stage - increase potassium fertilizer by 30% for better yield.",
      "🥬 Time to harvest your kale! Leaves are at optimal size and nutrient content.",
      "🌽 Consider crop rotation: after this maize harvest, plant legumes to improve soil nitrogen."
    ],
    general: [
      "🚜 I'm here to help optimize your farming operations! What would you like to know about?",
      "📊 Your farm efficiency has improved 23% this month based on irrigation and sensor data!",
      "🌱 Remember: sustainable farming practices lead to better long-term yields and soil health."
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      addAIMessage("🌾 Hello! I'm your AgriSmart AI Assistant. I can help you with irrigation scheduling, crop management, weather insights, and farming optimization. How can I assist you today?");
    }, 1000);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Stop speech recognition when AI starts speaking to prevent feedback
  useEffect(() => {
    if (isSpeaking && currentRecognition) {
      currentRecognition.stop();
      setIsListening(false);
    }
  }, [isSpeaking, currentRecognition]);

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
      
      // Stop any ongoing speech recognition before speaking
      if (currentRecognition) {
        currentRecognition.stop();
        setIsListening(false);
      }
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(content.replace(/[🌾🌱💧🚿☀️🌧️🌤️🥬🌽🚜📊]/g, ''));
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          // Resume listening after AI finishes speaking if it was active
          if (isListening) {
            setTimeout(() => {
              startVoiceRecognition();
            }, 500);
          }
        };
        
        speechSynthesis.speak(utterance);
      }
    }, Math.random() * 1000 + 500);
  };

  const processUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    let response = '';

    if (lowerInput.includes('irrigation') || lowerInput.includes('water') || lowerInput.includes('moisture')) {
      response = aiResponses.irrigation[Math.floor(Math.random() * aiResponses.irrigation.length)];
    } else if (lowerInput.includes('weather') || lowerInput.includes('rain') || lowerInput.includes('temperature')) {
      response = aiResponses.weather[Math.floor(Math.random() * aiResponses.weather.length)];
    } else if (lowerInput.includes('crop') || lowerInput.includes('plant') || lowerInput.includes('harvest') || lowerInput.includes('maize') || lowerInput.includes('kale')) {
      response = aiResponses.crops[Math.floor(Math.random() * aiResponses.crops.length)];
    } else {
      response = aiResponses.general[Math.floor(Math.random() * aiResponses.general.length)];
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

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "⚠️ Voice Recognition Unavailable",
        description: "Your browser doesn't support voice input.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setCurrentRecognition(recognition);

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Voice Input Active",
        description: "Listening for your farming question...",
      });
    };

    recognition.onresult = (event: any) => {
      // Only process if AI is not currently speaking
      if (!isSpeaking) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (transcript) {
          setInputMessage(transcript);
          // Auto-send the message after voice input
          setTimeout(() => {
            addUserMessage(transcript);
            processUserInput(transcript);
            setInputMessage('');
          }, 500);
        }
      }
    };

    recognition.onerror = (error: any) => {
      console.log('Speech recognition error:', error);
      setIsListening(false);
      setCurrentRecognition(null);
      if (error.error !== 'aborted') {
        toast({
          title: "❌ Voice Input Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setCurrentRecognition(null);
    };

    recognition.start();
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (currentRecognition) {
        currentRecognition.stop();
      }
      setIsListening(false);
      setCurrentRecognition(null);
      return;
    }

    // Don't start listening if AI is speaking
    if (isSpeaking) {
      toast({
        title: "🤖 AI Speaking",
        description: "Please wait for the AI to finish speaking before using voice input.",
      });
      return;
    }

    startVoiceRecognition();
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
          className="w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-2xl"
        >
          <Leaf className="w-8 h-8 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50">
      <Card className="h-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 backdrop-blur-xl border-2 border-green-500/50 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="w-6 h-6" />
              <CardTitle className="text-lg">AgriSmart AI Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500 animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                FARMING AI
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-green-500/30 shadow-sm'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-semibold">AGRI AI</span>
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
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-green-500/30 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-semibold">AGRI AI</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-green-500/30">
            <div className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about irrigation, crops, weather..."
                className="flex-1 bg-white/80 dark:bg-gray-800/80 border-green-500/30"
                disabled={isSpeaking}
              />
              <Button
                onClick={toggleVoiceInput}
                size="sm"
                disabled={isSpeaking}
                className={`${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={toggleSpeech}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                size="sm"
                disabled={isSpeaking}
                className={`bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 ${
                  isSpeaking ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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

export default UserAIAssistant;
