'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CornerDownLeft, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}

export default function ConciergeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'model',
      text: "Welcome to NexusBazaar! I am NexusBot, your personal virtual concierge. I can answer inquiries regarding Elite memberships, active promo codes, real-time shipment routing, and vendor controls. How can I facilitate your shopping experience today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      setTimeout(() => chatInputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setErrorText(null);

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Map message history to correct Gemini API format (role: user/model)
      const formattedHistory = messages
        .filter(m => m.sender !== 'system')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error('Support system experienced a network interrupt. Please retry.');
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const modelMsgId = `model-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: modelMsgId,
        sender: 'model',
        text: data.text || 'Concierge is currently re-indexing. Please query again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting to virtual concierge failed.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const quickQuestions = [
    { label: "Elite membership status?", q: "How do I activate my free Elite membership to skip courier fees?" },
    { label: "Platform voucher code?", q: "What active coupon codes can I use at the final order checkout review?" },
    { label: "Switch to Merchant role?", q: "How can I open the Seller inventory alerts and stock manager dashboard?" },
    { label: "Logistics shipping fees?", q: "What is the standard delivery fee and when is shipping free?" }
  ];

  return (
    <>
      {/* FLOATING TRIGGER CHAT BALLOON BUTTON */}
      <button
        id="concierge-trigger-balloon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-slate-900 hover:bg-teal-600 text-white flex items-center justify-center shadow-xl hover:shadow-teal-500/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 z-40 cursor-pointer border border-slate-800"
        title="Open Nexus Concierge Chatbot"
      >
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-teal-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* DRAWER DRAWER SIDEBAR CONTAINER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop glass blur */}
          <div 
            id="concierge-backdrop"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Chat Panel Body */}
          <div 
            id="concierge-drawer-panel"
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-100 animate-slide-in-right z-50"
          >
            {/* Header branding block */}
            <div className="p-4 border-b border-slate-50 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    NexusBot <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono font-black uppercase tracking-wider">Concierge</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Global AI Support Ledger Active</p>
                </div>
              </div>
              <button
                id="concierge-close-btn"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable messages conversation stage */}
            <div 
              id="concierge-chat-history"
              className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4 text-xs"
            >
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Sender Icon Badge */}
                  <div className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center border ${
                    m.sender === 'user' 
                      ? 'bg-slate-100 border-slate-200 text-slate-700' 
                      : 'bg-teal-50 border-teal-100 text-teal-600'
                  }`}>
                    {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  {/* Message bubble */}
                  <div className="space-y-1">
                    <div className={`rounded-2xl p-3 border leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-slate-900 border-slate-800 text-white rounded-tr-none'
                        : 'bg-white border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
                    }`}>
                      <p>{m.text}</p>
                    </div>
                    <span className={`block text-[9px] text-slate-400 font-mono ${m.sender === 'user' ? 'text-right' : ''}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Bot thinking placeholder state */}
              {isTyping && (
                <div className="flex gap-2.5 max-w-[85%] animate-pulse">
                  <div className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center bg-teal-50 border border-teal-100 text-teal-600">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5 h-10">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error boundary alert */}
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[11px] leading-tight">Virtual Assistant Error</p>
                    <p className="text-[10px] text-rose-600 mt-0.5">{errorText}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Helper Questions Deck */}
            <div className="p-3 border-t border-slate-50 bg-white space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase px-1 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
                <span>Concierge Quick-Prompts</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {quickQuestions.map((qq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(qq.q)}
                    disabled={isTyping}
                    className="p-2 border border-slate-100 bg-slate-50/50 hover:bg-teal-50/20 hover:border-teal-100 hover:text-teal-700 disabled:opacity-50 text-left rounded-lg text-[10px] font-semibold text-slate-600 transition-all cursor-pointer leading-tight"
                  >
                    {qq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Form input wrapper */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="p-4 border-t border-slate-50 bg-white flex gap-2 items-center"
            >
              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask NexusBot support..."
                disabled={isTyping}
                className="flex-1 h-10 px-3.5 bg-slate-50 border border-slate-100 focus:border-teal-500 focus:bg-white text-xs rounded-xl transition-all outline-none font-medium text-slate-700"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="h-10 w-10 shrink-0 bg-slate-900 hover:bg-teal-600 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
