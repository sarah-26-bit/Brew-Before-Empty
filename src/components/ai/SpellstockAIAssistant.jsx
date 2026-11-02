import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useInventory } from '../../context/InventoryContext';
import { AICompanionOrb } from '../../assets/illustrations/scenes';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Package,
  Layers,
  Flame,
  Bot
} from 'lucide-react';

const INITIAL_GREETING = {
  id: 'msg-initial',
  sender: 'assistant',
  text: `Greetings, Alchemist. I am **SPELLSTOCK INTELLIGENCE**, your intelligent inventory companion.\n\nI monitor your live ingredient levels, consumption rates, stockout forecasts, anomalies, and restock needs in real time.\n\nHow may I assist your sanctum operations today?`,
  source: 'SPELLSTOCK Intelligence Core',
  chips: [
    'Which ingredients are running low?',
    'What should I restock today?',
    'Which ingredient might run out first?',
    'Show me the current inventory status.'
  ]
};

const SUGGESTION_CHIPS = [
  'Which ingredients are running low?',
  'What should I restock today?',
  'Which ingredient might run out first?',
  'Show me the current inventory status.',
  'Which ingredients have the highest consumption?',
  'Explain the latest inventory anomaly.',
  'What happens if demand increases by 40%?',
  'Give me a summary of inventory risks.'
];

export default function SpellstockAIAssistant() {
  const { setActiveTab, triggerGlobalRefresh, showToast } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [executingAction, setExecutingAction] = useState(false);
  const [chatLog, setChatLog] = useState([INITIAL_GREETING]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input when opened
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [chatLog, isOpen, loading]);

  // Clear chat conversation
  const handleClearChat = () => {
    setChatLog([
      {
        ...INITIAL_GREETING,
        id: `msg-${Date.now()}`
      }
    ]);
    if (showToast) {
      showToast('Conversation cleared.', 'info');
    }
  };

  // Safe Action Execution: Confirm Restock Order
  const handleConfirmAction = async (action, messageId) => {
    if (!action) return;
    setExecutingAction(true);

    try {
      if (action.type === 'CONFIRM_RESTOCK') {
        const payload = {
          ingredientIds: action.ingredientIds || []
        };
        const res = await api.executeRestock(payload);

        // Update message to reflect executed state
        setChatLog(prev => prev.map(m => {
          if (m.id === messageId) {
            return {
              ...m,
              actionExecuted: true,
              executionSummary: `✅ Restock order confirmed and executed. Added to vault ledger (${action.itemCount} items replenished).`
            };
          }
          return m;
        }));

        // Refresh global state across the app
        if (triggerGlobalRefresh) triggerGlobalRefresh();
        if (showToast) {
          showToast(`Restock executed successfully for ${action.itemCount} ingredients.`, 'success');
        }

        // Add follow-up assistant confirmation
        setChatLog(prev => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: `✅ **Restock Successfully Recorded into Ledger**\n\nAll ${action.itemCount} ingredients have been replenished to their target safety thresholds in the database. Inventory levels and health scores are updated.`,
            source: 'SPELLSTOCK Core Inventory Ledger',
            chips: [
              'Show me the current inventory status.',
              'Which ingredient might run out first?'
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Action execution failed:', err);
      if (showToast) {
        showToast('Failed to record restock action. Please try again.', 'error');
      }
    } finally {
      setExecutingAction(false);
    }
  };

  // Safe Action Dismissal
  const handleDismissAction = (messageId) => {
    setChatLog(prev => prev.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          actionExecuted: true,
          executionSummary: '❌ Action cancelled. Inventory levels remain untouched.'
        };
      }
      return m;
    }));
  };

  // Primary Query Handler
  const handleQuery = async (queryText) => {
    if (!queryText || !queryText.trim() || loading) return;

    const trimmed = queryText.trim();
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      // Build lightweight message history for conversational context
      const history = chatLog.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // Call the backend /api/chat endpoint
      const res = await api.sendChatMessage(trimmed, history);

      if (res && res.data) {
        const { reply, source, requiresConfirmation, action, suggestedChips } = res.data;
        setChatLog(prev => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: reply,
            source: source || 'SPELLSTOCK Intelligence',
            requiresConfirmation,
            action,
            chips: suggestedChips || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('Empty response received from assistant');
      }
    } catch (err) {
      console.warn('API chat query error, falling back to local grounded inspection:', err);

      // Graceful fallback: inspect live client-side data
      try {
        const [ingRes, restockRes] = await Promise.all([
          api.getIngredients(),
          api.getRestockRecommendations().catch(() => ({ data: { recommendations: [] } }))
        ]);

        const ingredients = ingRes?.data || [];
        const restock = restockRes?.data?.recommendations || [];
        const low = ingredients.filter(i => i.isLowStock || i.currentStock <= i.minThreshold);

        let fallbackText = '';
        const lower = trimmed.toLowerCase();

        if (lower.includes('low') || lower.includes('shortage')) {
          fallbackText = low.length > 0
            ? `⚠️ There are ${low.length} low-stock ingredients:\n${low.map(i => `• ${i.name} (${i.currentStock} ${i.unit})`).join('\n')}`
            : '✨ All ingredients are currently above safe safety thresholds.';
        } else if (lower.includes('restock') || lower.includes('reorder')) {
          fallbackText = restock.length > 0
            ? `📦 Recommended reorders for ${restock.length} ingredients:\n${restock.slice(0, 4).map(r => `• ${r.name}: +${r.suggestedRestockQty} ${r.unit}`).join('\n')}`
            : '✨ No restock orders currently required.';
        } else {
          fallbackText = `📊 SPELLSTOCK Inventory Snapshot:\n• Monitored Ingredients: ${ingredients.length}\n• Low-stock Items: ${low.length}\n• Pending Reorders: ${restock.length}`;
        }

        setChatLog(prev => [
          ...prev,
          {
            id: `asst-fallback-${Date.now()}`,
            sender: 'assistant',
            text: fallbackText,
            source: 'SPELLSTOCK Client Ledger Fallback',
            chips: ['Which ingredients are running low?', 'What should I restock today?'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (fallbackErr) {
        setChatLog(prev => [
          ...prev,
          {
            id: `asst-err-${Date.now()}`,
            sender: 'assistant',
            text: '⚠️ Unable to connect to the SPELLSTOCK inventory ledger. Please ensure the backend server is running on port 5001.',
            source: 'SPELLSTOCK Intelligence Core',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to format text with bold and linebreaks
  const renderMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold rendering for markdown **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block min-h-[1.2em]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-warm-ivory">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING CHATBOT TRIGGER BUTTON (Bottom-Right Corner) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open SPELLSTOCK Intelligence Assistant"
          className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-deep-forest to-midnight border border-emerald-600/50 shadow-2xl hover:border-antique-gold/70 hover:shadow-emerald-900/40 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Subtle animated aura */}
          <span className="absolute -inset-0.5 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />

          {/* AI Orb Avatar */}
          <div className="relative">
            <AICompanionOrb className="w-7 h-7 shrink-0" active={true} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-midnight animate-ping pointer-events-none" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-midnight" />
          </div>

          {/* Label visible on desktop */}
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-[11px] font-mono font-bold text-antique-gold uppercase tracking-wider flex items-center gap-1.5">
              SPELLSTOCK INTELLIGENCE
            </span>
            <span className="text-[10px] text-sage-green font-medium">
              Alchemical Inventory AI
            </span>
          </div>
        </button>
      </div>

      {/* 2. FLOATING CHAT WINDOW (Non-disruptive, stays above page content) */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="chatbot-title"
          className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[430px] max-w-[440px] h-[580px] max-h-[82vh] bg-midnight/95 backdrop-blur-xl border border-emerald-900/70 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* HEADER */}
          <div className="p-3.5 bg-deep-forest/90 border-b border-emerald-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center shrink-0">
                <AICompanionOrb className="w-6 h-6" active={true} />
              </div>
              <div>
                <h3
                  id="chatbot-title"
                  className="text-xs font-serif font-bold text-warm-ivory tracking-wide flex items-center gap-1.5"
                >
                  SPELLSTOCK INTELLIGENCE
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-sage-green">
                  Your Intelligent Inventory Companion.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear Chat Button */}
              <button
                onClick={handleClearChat}
                title="Clear conversation history"
                className="p-1.5 text-moonlight-muted hover:text-warm-ivory hover:bg-emerald-950/60 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat window"
                className="p-1.5 text-moonlight-muted hover:text-warm-ivory hover:bg-emerald-950/60 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE CONVERSATION AREA */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
            {chatLog.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Icon */}
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-antique-gold" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-warm-ivory rounded-br-xs shadow-md font-medium'
                      : 'bg-deep-forest/80 border border-emerald-900/50 text-moonlight rounded-bl-xs shadow-md'
                  }`}
                >
                  {/* Message Content */}
                  <div className="space-y-1 text-xs">
                    {renderMessageContent(msg.text)}
                  </div>

                  {/* Safe Interaction: Confirmation Required Box */}
                  {msg.requiresConfirmation && msg.action && !msg.actionExecuted && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-midnight/90 border border-antique-gold/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-antique-gold text-[11px] font-semibold">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-antique-gold" />
                        <span>Confirmation Required</span>
                      </div>
                      <p className="text-[11px] text-sage-green leading-snug">
                        Executing this order will restock {msg.action.itemCount} items ({msg.action.totalCost} ⟡) and update your real inventory database.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={executingAction}
                          onClick={() => handleConfirmAction(msg.action, msg.id)}
                          className="flex-1 text-[11px] py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 border border-antique-gold/50"
                        >
                          {executingAction ? 'Recording...' : 'Confirm Restock'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={executingAction}
                          onClick={() => handleDismissAction(msg.id)}
                          className="text-[11px] py-1.5"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Executed status banner if action was decided */}
                  {msg.actionExecuted && msg.executionSummary && (
                    <div className="mt-1 text-[11px] font-mono text-sage-green border-t border-emerald-900/40 pt-1.5">
                      {msg.executionSummary}
                    </div>
                  )}

                  {/* Suggestion Chips inside assistant message */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-emerald-900/30">
                      {msg.chips.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuery(chip)}
                          className="px-2 py-0.5 rounded-md bg-midnight/80 border border-emerald-800/40 text-[10px] text-sage-green hover:text-warm-ivory hover:border-antique-gold/60 hover:bg-emerald-950/60 transition-all text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer / Source info */}
                  {msg.source && msg.sender === 'assistant' && (
                    <div className="text-[9px] font-mono text-moonlight-muted/60 flex items-center justify-between pt-1">
                      <span>{msg.source}</span>
                      {msg.timestamp && <span>{msg.timestamp}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-antique-gold animate-spin" />
                </div>
                <div className="p-3 rounded-2xl rounded-bl-xs bg-deep-forest/80 border border-emerald-900/50 text-sage-green flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-mono">Analyzing inventory ledger...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK SUGGESTIONS CAROUSEL */}
          <div className="px-3 py-1.5 bg-deep-forest/50 border-t border-emerald-900/30 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {SUGGESTION_CHIPS.slice(0, 4).map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuery(chip)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-midnight/90 border border-emerald-800/40 text-[10px] text-sage-green hover:text-warm-ivory hover:border-antique-gold/50 transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div className="p-2.5 bg-midnight border-t border-emerald-900/60 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuery(inputQuery);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask SPELLSTOCK INTELLIGENCE about stock, restocks, burn rates..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading}
                style={{ backgroundColor: 'rgba(10, 18, 14, 0.75)', color: '#F3F0E6' }}
                className="flex-1 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs placeholder:text-ivory/40 focus:border-gold/60 focus:outline-none transition-all shadow-inner backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                aria-label="Send message"
                className="p-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-warm-ivory border border-antique-gold/40 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
