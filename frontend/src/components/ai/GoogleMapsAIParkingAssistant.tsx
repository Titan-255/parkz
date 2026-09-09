import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, MapPin, ArrowRight, Star, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../api/client';
import { AIChatResponse, RecommendedParking } from '../../types';
import { useNavigate } from 'react-router-dom';

export const GoogleMapsAIParkingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    recommendations?: RecommendedParking[];
    actions?: string[];
  }>>([
    {
      sender: 'ai',
      text: "Hello! I'm your **ParkZ Google Maps AI Assistant**. Tell me where you're heading, your vehicle type, or what you're looking for, and I'll find the best verified parking for you!",
      actions: [
        'Find cheapest parking in Chennai',
        'Top rated parking near T. Nagar',
        '2-Wheeler spots near Marina Beach',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setIsLoading(true);

    try {
      const response: AIChatResponse = await api.queryAIAssistant({
        message: textToSend,
        latitude: 13.0827,
        longitude: 80.2707,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.reply,
          recommendations: response.recommended_parkings,
          actions: response.suggested_actions,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I couldn't reach the parking intelligence engine right now. Please try again or use standard search.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-5 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-full shadow-popover hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs cursor-pointer border border-white/20"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
        <span className="hidden sm:inline">Google Maps AI</span>
      </button>

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-lg h-[85vh] sm:h-[650px] bg-white rounded-t-3xl sm:rounded-3xl shadow-popover flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold">Google Maps AI Assistant</h3>
                    <span className="bg-primary text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">Live</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Real-time parking inventory & smart routing</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat conversation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-primary text-white font-medium rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-subtle'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>

                  {/* Recommendations Cards */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="w-full mt-3 space-y-2">
                      {m.recommendations.map((spot) => (
                        <div
                          key={spot.id}
                          className="bg-white border border-slate-200 rounded-xl p-3 shadow-subtle flex items-center justify-between gap-3 hover:border-primary transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-dark truncate">
                              <MapPin className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{spot.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{spot.address}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-600 font-semibold">
                              <span>{spot.recommendation_reason}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-black text-primary">₹{spot.price_per_hour}/hr</div>
                            <Button
                              size="sm"
                              className="mt-1.5 text-[11px] h-7 px-2.5"
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/app/parking/${spot.id}`);
                              }}
                            >
                              Book
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested quick prompt chips */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act)}
                          className="text-[11px] bg-white hover:bg-primary-50 hover:text-primary hover:border-primary border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-all text-left flex items-center gap-1 cursor-pointer"
                        >
                          <span>{act}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-max shadow-subtle">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Scanning parking spaces & Google Maps routes...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI: e.g., 'Cheapest parking near Anna Nagar'"
                  className="flex-1 bg-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="h-9 px-3 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
