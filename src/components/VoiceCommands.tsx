
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const VoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [currentRecognition, setCurrentRecognition] = useState<any>(null);
  const { toast } = useToast();

  const commands: Record<string, () => void> = {
    'show users': () => {
      const element = document.querySelector('[data-value="neural-users"]') as HTMLElement;
      element?.click();
      speak("Displaying neural user matrix");
    },
    'show analytics': () => {
      const element = document.querySelector('[data-value="quantum-analytics"]') as HTMLElement;
      element?.click();
      speak("Activating quantum analytics");
    },
    'show insights': () => {
      const element = document.querySelector('[data-value="ai-insights"]') as HTMLElement;
      element?.click();
      speak("Loading AI insights");
    },
    'command center': () => {
      const element = document.querySelector('[data-value="command-center"]') as HTMLElement;
      element?.click();
      speak("Opening command center");
    },
    'export data': () => {
      speak("Initiating quantum data export");
      toast({
        title: "🚀 Voice Command Executed",
        description: "Quantum data export initiated via voice command",
      });
    },
    'system status': () => {
      speak("All systems operational. Neural networks online. Quantum efficiency at 87.6 percent.");
    },
    'help': () => {
      speak("Available commands: show users, show analytics, show insights, command center, export data, system status");
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech before starting new one
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "⚠️ Voice Recognition Unavailable",
        description: "Your browser doesn't support voice commands.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    setCurrentRecognition(recognition);

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Voice Commands Active",
        description: "Listening for quantum commands...",
      });
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();
      const confidence = result[0].confidence || 0;
      
      setLastCommand(transcript);
      setConfidence(Math.round(confidence * 100));

      if (result.isFinal && confidence > 0.7) {
        const matchedCommand = Object.keys(commands).find(cmd => 
          transcript.includes(cmd)
        );

        if (matchedCommand) {
          commands[matchedCommand]();
          toast({
            title: "✅ Command Executed",
            description: `Voice command "${matchedCommand}" processed successfully`,
          });
        } else if (transcript.length > 3) { // Only respond to meaningful input
          speak("Command not recognized. Say 'help' for available commands.");
        }
      }
    };

    recognition.onerror = (error: any) => {
      console.log('Voice recognition error:', error);
      setIsListening(false);
      setCurrentRecognition(null);
      if (error.error !== 'aborted') {
        toast({
          title: "❌ Voice Error",
          description: "Failed to process voice command. Please try again.",
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

  const stopListening = () => {
    if (currentRecognition) {
      currentRecognition.stop();
    }
    setIsListening(false);
    setCurrentRecognition(null);
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Card className="bg-black/90 backdrop-blur-xl border-2 border-purple-500/50 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full ${
                isListening 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 animate-pulse' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Badge className={`${isListening ? 'bg-red-500' : 'bg-purple-500'} animate-pulse`}>
                  {isListening ? 'LISTENING' : 'STANDBY'}
                </Badge>
                {confidence > 0 && (
                  <Badge className="bg-green-500">
                    {confidence}% CONFIDENCE
                  </Badge>
                )}
              </div>
              
              {lastCommand && (
                <p className="text-xs text-gray-300 max-w-48 truncate">
                  Last: "{lastCommand}"
                </p>
              )}
              
              <div className="text-xs text-gray-400 mt-1">
                Say: "show users", "analytics", "help"
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => speak("Voice commands are active. Neural networks are listening.")}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          {isListening && (
            <div className="flex items-center justify-center space-x-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-500 to-cyan-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCommands;
