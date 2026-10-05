import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  sendChatQuery,
  ChatMessage as ApiChatMessage,
  fetchAiStatus,
  AiServiceStatus
} from '../services/aiService';
import {
  BrainCircuit,
  Plus,
  Trash2,
  Send,
  RotateCcw,
  Sparkles,
  Target,
  Compass,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  HelpCircle,
  Radio,
  FileText
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini-live' | 'local-deterministic';
  modelUsed?: string;
  isError?: boolean;
}

export const AiAnalysis: React.FC = () => {
  const {
    telemetry,
    targets,
    aiStatus,
    setSelectedTarget
  } = useSimulation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [thinkingIndex, setThinkingIndex] = useState<number>(0);
  const [liveStatus, setLiveStatus] = useState<AiServiceStatus>(aiStatus);

  const chatLogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cycling thinking messages
  const thinkingMessages = [
    'Analyzing seafloor sensor readings...',
    'Cross-referencing RM3100 magnetometer data...',
    'Checking survey line transect history...',
    'Synthesizing subsea intelligence recommendation...',
  ];

  // Refresh status on mount
  useEffect(() => {
    fetchAiStatus().then(setLiveStatus).catch(() => {});
  }, []);

  // Thinking text cycling animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isThinking) {
      setThinkingIndex(0);
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % thinkingMessages.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  // Auto-scroll chat log to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTo({
        top: chatLogRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isThinking]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Build current mission context for Gemini
  const buildMissionContext = () => {
    return {
      telemetry: {
        depth: telemetry.depth,
        pressure: telemetry.pressure,
        temperature: telemetry.temperature,
        roll: telemetry.roll,
        pitch: telemetry.pitch,
        yaw: telemetry.yaw,
        metalResponse: telemetry.metalResponse,
        baselineResponse: telemetry.baselineResponse,
        threshold: telemetry.threshold,
        surveyDistance: telemetry.surveyDistance,
        areaSurveyed: telemetry.areaSurveyed,
        currentLine: telemetry.currentLine,
        completedLines: telemetry.completedLines,
        totalLines: telemetry.totalLines,
        sensorLatitude: telemetry.sensorLatitude,
        sensorLongitude: telemetry.sensorLongitude,
        status: telemetry.status,
      },
      targets: targets.map((t) => ({
        id: t.id,
        code: t.code,
        classification: t.classification,
        depth: t.depth,
        signalStrength: t.signalStrength,
        coordinates: t.coordinates,
        surveyLine: t.surveyLine,
        detectionDuration: t.detectionDuration,
        status: t.status,
      })),
      rm3100: {
        bx: 18.4,
        by: -12.1,
        bz: telemetry.metalResponse >= 0.65 ? 39.8 : 36.5,
        totalField: telemetry.metalResponse >= 0.65 ? 44.8 : 42.1,
        baselineField: 42.5,
        deviation: telemetry.metalResponse >= 0.65 ? 1.90 : 0.45,
        threshold: 1.20,
      },
    };
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!text || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsThinking(true);

    try {
      // Format history for backend API
      const apiHistory = nextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const context = buildMissionContext();
      const response = await sendChatQuery(apiHistory, context);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: response.source,
        modelUsed: response.modelUsed,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to communicate with the subsea intelligence layer. Please check connection and retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  // Handle enter key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  // Render markdown text into semantic HTML
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let bulletList: string[] = [];

    const flushBullets = (keyPrefix: string) => {
      if (bulletList.length > 0) {
        elements.push(
          <ul key={`${keyPrefix}-ul`} className="my-2 ml-5 space-y-1 list-disc text-xs text-[#1F4B60]">
            {bulletList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
            ))}
          </ul>
        );
        bulletList = [];
      }
    };

    const inlineMarkdown = (str: string) => {
      return str
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#1F4B60]">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-[#50717B]">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-[#F2F6F6] text-[#2A7C7A] font-mono text-[11px]">$1</code>');
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Heading 3 / 4
      if (trimmed.startsWith('### ')) {
        flushBullets(`flush-${idx}`);
        elements.push(
          <h4 key={idx} className="font-sans font-bold text-xs uppercase tracking-wide text-[#1F4B60] mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2A7C7A]" />
            {trimmed.replace('### ', '')}
          </h4>
        );
        return;
      }

      // Bullet items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        bulletList.push(trimmed.slice(2));
        return;
      }

      // Table line (simple markdown table row detection)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushBullets(`flush-${idx}`);
        // If it's a separator line | :--- | :--- | skip or render subtle line
        if (trimmed.includes('---')) {
          return;
        }
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        elements.push(
          <div key={idx} className="grid grid-cols-4 gap-2 py-1 border-b border-[#E7E5E2] font-mono text-[11px] text-[#1F4B60]">
            {cells.map((cell, cIdx) => (
              <span key={cIdx} className={cIdx === 0 ? 'font-semibold' : ''} dangerouslySetInnerHTML={{ __html: inlineMarkdown(cell) }} />
            ))}
          </div>
        );
        return;
      }

      // Normal text paragraph
      if (trimmed) {
        flushBullets(`flush-${idx}`);
        elements.push(
          <p
            key={idx}
            className="my-1.5 text-xs text-[#1F4B60] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: inlineMarkdown(trimmed) }}
          />
        );
      } else {
        flushBullets(`flush-${idx}`);
      }
    });

    flushBullets('final');
    return elements;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.75rem)] max-w-6xl mx-auto p-4 md:p-6 select-none font-sans">
      {/* 1. CHAT HEADER */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#CBD9DA]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#E2EFF0] border border-[#CBD9DA] flex items-center justify-center text-[#2A7C7A]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-sans font-bold tracking-wide text-[#1F4B60]">
                  SAGAR AI
                </h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#E2EFF0] text-[#2A7C7A] border border-[#CBD9DA]">
                  MISSION INTELLIGENCE ASSISTANT
                </span>
              </div>
              <p className="text-[11px] text-[#60868C] font-sans">
                Mission Intelligence Assistant &bull; Seafloor Analysis and Geospatial Assessment
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            title="Start new conversation"
            className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] border border-[#CBD9DA] text-xs font-sans font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#2A7C7A]" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              title="Clear message history"
              className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#FFFFFF] hover:bg-[#FBEBEB] text-[#B85C5C] border border-[#CBD9DA] text-xs font-sans font-medium transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CHAT PANEL / LOG CONTAINER */}
      <div className="flex-1 flex flex-col bg-[#FFFFFF] rounded-[10px] border border-[#CBD9DA] shadow-sm overflow-hidden relative">
        <div
          ref={chatLogRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* EMPTY STATE / WELCOME SCREEN (When no messages) */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto my-auto py-4 flex flex-col items-center gap-5 text-center">
              {/* Bot Avatar Icon */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#E2EFF0] border border-[#2A7C7A]/30 flex items-center justify-center text-[#2A7C7A] shadow-sm mb-2">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-sans font-bold text-[#1F4B60]">
                  How can I help with your seafloor mission?
                </h2>
                <p className="text-xs text-[#60868C] mt-1 max-w-md">
                  Ask about detected targets, RM3100 magnetometer readings, inductive metal anomalies, or survey transect lines.
                </p>
              </div>

              {/* Mission-Aware Status Card (SAGAR subsea status card) */}
              <div className="w-full bg-[#F8F9FA] rounded-[10px] border border-[#CBD9DA] p-3.5 text-left shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2] mb-2.5">
                  <span className="text-[10px] font-sans font-bold tracking-wider text-[#2A7C7A] uppercase flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#2A7C7A]" />
                    CURRENT POD &amp; SURVEY STATUS
                  </span>
                  <span className="text-[10px] font-mono text-[#60868C]">
                    TETHER UMBILICAL &bull; 120 VDC NOMINAL
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#FFFFFF] p-2 rounded-[6px] border border-[#CBD9DA]">
                    <span className="text-[9.5px] font-sans text-[#60868C] uppercase block">POD DEPTH</span>
                    <span className="text-xs font-mono font-bold text-[#1F4B60]">
                      {Math.round(telemetry.depth).toLocaleString()} m
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] p-2 rounded-[6px] border border-[#CBD9DA]">
                    <span className="text-[9.5px] font-sans text-[#60868C] uppercase block">METAL RESPONSE</span>
                    <span className="text-xs font-mono font-bold text-[#B78332]">
                      {telemetry.metalResponse.toFixed(2)} mV/V
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] p-2 rounded-[6px] border border-[#CBD9DA]">
                    <span className="text-[9.5px] font-sans text-[#60868C] uppercase block">RM3100 MAG DEV</span>
                    <span className="text-xs font-mono font-bold text-[#20526B]">
                      1.90 µT (Threshold 1.2)
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] p-2 rounded-[6px] border border-[#CBD9DA]">
                    <span className="text-[9.5px] font-sans text-[#60868C] uppercase block">ACTIVE TRANSECT</span>
                    <span className="text-xs font-mono font-bold text-[#2A7C7A]">
                      Line {telemetry.currentLine} (7/12)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Suggestion Chips (SAGAR AI suggestion-chip UX) */}
              <div className="w-full text-center">
                <span className="text-[10px] font-sans font-bold tracking-wider text-[#60868C] uppercase block mb-2.5">
                  YOU COULD ASK
                </span>

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleSendMessage('Which target should we investigate first?')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F4F8F5] text-[#1B4931] border border-[#27734B]/25 hover:bg-[#E8F4ED] hover:border-[#27734B] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Target className="w-3.5 h-3.5 text-[#27734B]" />
                    <span>Prioritize Targets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Why is Target A-03 considered significant?')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F1F8F6] text-[#0F5B55] border border-[#0F766E]/25 hover:bg-[#E3F3F0] hover:border-[#0F766E] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Explain A-03 Anomaly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Compare Target A-03 and Target A-05')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FEFAF0] text-[#854D0E] border border-[#B45309]/25 hover:bg-[#FDF3DC] hover:border-[#B45309] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Compare A-03 &amp; A-05</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('What happened on survey line L-07?')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F6F8F2] text-[#3B531E] border border-[#557929]/25 hover:bg-[#EEF4E6] hover:border-[#557929] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#557929]" />
                    <span>Analyze Line L-07</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('What are the recommended operational next steps?')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1E40AF] border border-[#3B82F6]/25 hover:bg-[#DBEAFE] hover:border-[#3B82F6] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>What Should We Do Next?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Explain the RM3100 magnetic anomaly readings')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F5F3FF] text-[#5B21B6] border border-[#7C3AED]/25 hover:bg-[#EDE9FE] hover:border-[#7C3AED] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Explain RM3100 Readings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Why was Target A-04 classified as an unclassified anomaly?')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F8F9FA] text-[#475569] border border-[#CBD5E1] hover:bg-[#F1F5F9] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Why A-04 is Background</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Which area has the highest resource potential?')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FDF2F8] text-[#9D174D] border border-[#EC4899]/25 hover:bg-[#FCE7F3] hover:border-[#EC4899] hover:-translate-y-0.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Highest Resource Potential</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MESSAGE LOG BUBBLES */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div
                    className="max-w-[80%] md:max-w-[70%] bg-[#1F4B60] text-[#FFFFFF] rounded-[14px] rounded-br-[4px] px-4 py-3 shadow-xs"
                    style={{ animation: 'userMsgFadeUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                  >
                    <p className="text-xs leading-relaxed font-sans">{msg.content}</p>
                    <div className="text-[9.5px] font-mono text-[#A8C8CF] text-right mt-1 opacity-80">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            }

            // Assistant message bubble
            return (
              <div key={msg.id} className="flex justify-start">
                <div
                  className={`max-w-[88%] md:max-w-[80%] rounded-[14px] rounded-bl-[4px] p-4 border shadow-xs ${
                    msg.isError
                      ? 'bg-[#FDF2F2] border-[#F8B4B4] border-l-[3px] border-l-[#E02424]'
                      : 'bg-[#FFFFFF] border-[#CBD9DA] border-l-[3px] border-l-[#2A7C7A]'
                  }`}
                  style={{ animation: 'assistantMsgFadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                >
                  {/* Assistant Message Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E7E5E2] text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#E2EFF0] flex items-center justify-center text-[#2A7C7A]">
                        <BrainCircuit className="w-3 h-3" />
                      </div>
                      <span className="font-sans font-bold text-[#1F4B60] text-xs">
                        SAGAR AI
                      </span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#E2EFF0] text-[#2A7C7A] font-semibold">
                        {msg.source === 'gemini-live' ? 'GEMINI' : 'MISSION ENGINE'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#60868C]">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Assistant Body */}
                  <div className="space-y-1">
                    {renderFormattedContent(msg.content)}
                  </div>

                  {/* Error Retry Option */}
                  {msg.isError && (
                    <button
                      onClick={() => handleSendMessage(messages[messages.length - 2]?.content || 'Repeat query')}
                      className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#CBD9DA] text-xs font-sans font-medium text-[#1F4B60] hover:bg-[#F2F6F6] transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-[#2A7C7A]" />
                      <span>Retry query</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* THINKING INDICATOR BUBBLE (SAGAR AI pulse animation) */}
          {isThinking && (
            <div className="flex justify-start">
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] bg-[#F8F9FA] border border-[#CBD9DA] border-l-[3px] border-l-[#2A7C7A] shadow-2xs"
                style={{ animation: 'assistantMsgFadeUp 0.15s ease-out both' }}
              >
                {/* 3 Animated Bouncing Dots */}
                <div className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#2A7C7A] inline-block"
                    style={{ animation: 'thinkPulse 1.4s infinite ease-in-out both' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#2A7C7A] inline-block"
                    style={{ animation: 'thinkPulse 1.4s infinite ease-in-out both 0.2s' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#2A7C7A] inline-block"
                    style={{ animation: 'thinkPulse 1.4s infinite ease-in-out both 0.4s' }}
                  />
                </div>

                {/* Dynamic Thinking Status Label */}
                <span className="text-xs font-sans font-semibold text-[#1F4B60]">
                  {thinkingMessages[thinkingIndex]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. CHAT COMPOSER (Bottom Input Box) */}
        <div className="p-3 bg-[#FFFFFF] border-t border-[#CBD9DA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#FFFFFF] border-[1.5px] border-[#CBD9DA] focus-within:border-[#2A7C7A] focus-within:ring-2 focus-within:ring-[#2A7C7A]/15 rounded-[14px] px-3 py-1.5 transition-all shadow-xs"
          >
            <div className="text-[#60868C] pl-1">
              <Sparkles className="w-4 h-4 text-[#2A7C7A]" />
            </div>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
              placeholder="Ask SAGAR AI about the mission..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-xs text-[#1F4B60] placeholder-[#60868C] font-sans py-1.5 max-h-[120px] leading-relaxed"
            />

            {/* Send Button using send arrow path */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              aria-label="Send message"
              title="Send message"
              className={`w-8 h-8 rounded-[9px] flex items-center justify-center transition-all ${
                !inputValue.trim() || isThinking
                  ? 'bg-[#E2EFF0] text-[#60868C] opacity-40 cursor-not-allowed'
                  : 'bg-[#1F4B60] hover:bg-[#2A7C7A] text-[#FFFFFF] shadow-sm hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19C4 13.5 7.5 9 14.5 9V5L21 11.5L14.5 18V14C9.5 14 6.5 15.8 4 19Z" />
              </svg>
            </button>
          </form>

          {/* Quick Guidance Micro-Footer */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#60868C] pt-1.5 px-1">
            <span>Press Enter to send &bull; Shift + Enter for new line</span>
            <span>Tethered Pod Telemetry Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAnalysis;
