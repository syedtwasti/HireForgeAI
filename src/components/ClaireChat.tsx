import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, Sparkles } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse } from "@google/genai";
import type { Content } from "@google/genai";
import type { Message } from '../types';

interface ClaireChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

// Custom Icon for Claire (Girl with Bob Cut & Headphones)
const ClaireIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Hair Top */}
    <path d="M4.5 11c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" />
    
    {/* Hair Sides (Bob) */}
    <path d="M4.5 11v4a3 3 0 0 0 3 3" />
    <path d="M19.5 11v4a3 3 0 0 1-3 3" />
    
    {/* Headphone Cups */}
    <rect x="2" y="9" width="3" height="6" rx="1.5" />
    <rect x="19" y="9" width="3" height="6" rx="1.5" />
    
    {/* Face/Chin */}
    <path d="M8 13v1a4 4 0 0 0 8 0v-1" />
    
    {/* Bangs */}
    <path d="M5 11c2.3 2 4.7 2 7 0c2.3 2 4.7 2 7 0" />
    
    {/* Shoulders */}
    <path d="M6 22a6 6 0 0 1 6-5h0a6 6 0 0 1 6 5" />
  </svg>
);

const renderMessageText = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} className="min-h-[1.25em]">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </div>
    );
  });
};

const ClaireChat: React.FC<ClaireChatProps> = ({ messages, setMessages }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message immediately
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Reconstruct history to include any external messages (like status updates)
      // We assume strict alternating turns are required by the API, so we merge consecutive messages of the same role.
      const history = messages.reduce((acc: Content[], msg) => {
        const last = acc[acc.length - 1];
        if (last && last.role === msg.role) {
          // Merge with previous message part to avoid "Please ensure that the turn history alternates" error
          if (last.parts && last.parts[0]) {
             last.parts[0].text += "\n\n" + msg.text;
          }
        } else {
          acc.push({ role: msg.role, parts: [{ text: msg.text }] });
        }
        return acc;
      }, []);

      // Create a fresh session with the up-to-date history
      const chatSession = createChatSession(history);
      const result = await chatSession.sendMessageStream({ message: userMessage });
      
      let fullResponse = '';
      const responseId = (Date.now() + 1).toString();
      
      // Add placeholder for AI response
      setMessages(prev => [...prev, { id: responseId, role: 'model', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullResponse += text;
        
        // Update the last message with the accumulated text
        setMessages(prev => prev.map(msg => 
          msg.id === responseId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-6 border-b border-brand-mint flex items-center gap-4 bg-white sticky top-0 z-10">
        <div className="w-16 h-16 bg-brand-rose rounded-full flex items-center justify-center border-2 border-brand-mint">
          <ClaireIcon size={32} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-deep flex items-center gap-2">
            Claire
            <span className="px-2 py-0.5 bg-brand-mint text-brand-deep text-xs rounded-full font-medium">AI Agent</span>
          </h1>
          <p className="text-sm text-slate-500">Always here to help with your career.</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-rose custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
              msg.role === 'user' ? 'bg-brand-deep' : 'bg-white border border-brand-mint'
            }`}>
              {msg.role === 'user' ? (
                <User size={16} className="text-white" />
              ) : (
                <ClaireIcon size={16} className="text-brand-primary" />
              )}
            </div>
            
            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-brand-primary text-white rounded-tr-none shadow-brand-primary/20' 
                : 'bg-white text-slate-800 border border-brand-mint rounded-tl-none'
            }`}>
              {msg.text ? renderMessageText(msg.text) : (isLoading && msg.role === 'model' ? <Loader2 className="animate-spin w-4 h-4" /> : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-brand-mint">
        <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Claire about resume tips, interview prep, or career advice..."
            className="w-full pl-6 pr-14 py-4 bg-brand-rose border border-brand-mint rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none shadow-sm transition-all text-slate-800 placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-white rounded-xl hover:bg-brand-deep disabled:opacity-50 disabled:hover:bg-brand-primary transition-colors shadow-lg shadow-brand-primary/20"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <Sparkles size={10} />
            Claire is powered by Gemini AI and can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaireChat;