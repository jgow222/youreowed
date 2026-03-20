import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, HelpCircle, FileText, Phone, Clock } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { icon: HelpCircle, text: "How do I apply for SNAP benefits?" },
  { icon: FileText, text: "What documents do I need for Medicaid?" },
  { icon: Phone, text: "Who do I contact about my Section 8 application?" },
  { icon: Clock, text: "How long does the SSDI approval process take?" },
];

// Simulated AI responses based on keywords
function generateResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("snap") && (q.includes("apply") || q.includes("how"))) {
    return "To apply for SNAP (food stamps), you can:\n\n1. **Apply online** through your state's SNAP portal. In most states, you can visit your state's Department of Social Services website.\n2. **Apply in person** at your local SNAP office or Department of Social Services.\n3. **Apply by mail** by requesting an application form.\n\n**Documents you'll typically need:**\n- Photo ID\n- Proof of income (pay stubs, benefit letters)\n- Proof of expenses (rent, utilities)\n- Social Security numbers for all household members\n\nProcessing usually takes up to 30 days, but expedited processing (within 7 days) is available if your household has very low income or resources.\n\nWould you like me to help you find your state's specific SNAP application portal?";
  }

  if (q.includes("medicaid") && (q.includes("document") || q.includes("need"))) {
    return "For a Medicaid application, you'll generally need:\n\n**Required Documents:**\n- Proof of identity (driver's license, passport, birth certificate)\n- Proof of U.S. citizenship or qualified immigration status\n- Social Security numbers for all applicants\n- Proof of income (last 30 days of pay stubs, tax returns)\n- Proof of residency (utility bill, lease agreement)\n\n**Additional documents that may help:**\n- Proof of pregnancy (if applicable)\n- Disability documentation\n- Current health insurance information\n- Proof of childcare or medical expenses\n\nMany states allow you to start the application without all documents and submit them later. You can apply through Healthcare.gov or your state's Medicaid agency.\n\nWould you like to know the specific requirements for your state?";
  }

  if (q.includes("section 8") || q.includes("housing")) {
    return "For Section 8 / Housing Choice Voucher assistance:\n\n**How to apply:**\n1. Contact your local Public Housing Authority (PHA)\n2. Apply during an open enrollment period (many PHAs have waiting lists)\n3. Complete the application and provide required documentation\n\n**Important things to know:**\n- Waiting lists can be very long (months to years depending on your area)\n- Priority is often given to families with children, elderly, disabled, and those experiencing homelessness\n- Once approved, you typically pay 30% of your adjusted income toward rent\n- The voucher covers the difference up to the Fair Market Rent for your area\n\nFind your local PHA at: https://www.hud.gov/program_offices/public_indian_housing/pha/contacts\n\nWould you like help understanding the income limits for your area?";
  }

  if (q.includes("ssdi") || (q.includes("disability") && q.includes("long"))) {
    return "The SSDI (Social Security Disability Insurance) approval process typically takes:\n\n**Timeline:**\n- **Initial application:** 3-6 months for a decision\n- **If denied (reconsideration):** Additional 3-6 months\n- **If denied again (hearing):** 12-18 months for an ALJ hearing\n- **Total if all appeals needed:** Up to 2+ years\n\n**Tips to speed up the process:**\n- Submit all medical records upfront\n- List all doctors, hospitals, and clinics that have treated you\n- Be thorough in describing how your disability limits daily activities\n- Consider hiring a disability attorney or advocate (they work on contingency)\n\n**Compassionate Allowance:** Some severe conditions qualify for expedited processing (weeks instead of months).\n\nThe 5-month waiting period for benefits starts from your established onset date, not your application date.\n\nWould you like guidance on what to include in your SSDI application?";
  }

  if (q.includes("tax") || q.includes("eitc") || q.includes("earned income")) {
    return "The Earned Income Tax Credit (EITC) is one of the most valuable tax credits for working families:\n\n**How to claim it:**\n1. File a federal tax return (even if you don't usually file)\n2. Use IRS Free File if your income is under $84,000\n3. Visit a Volunteer Income Tax Assistance (VITA) site for free help\n\n**2025 Maximum EITC amounts:**\n- No children: up to ~$632\n- 1 child: up to ~$4,213\n- 2 children: up to ~$6,960\n- 3+ children: up to ~$7,830\n\n**Key requirements:**\n- Must have earned income from work\n- Must file a tax return\n- Must have a valid SSN\n- Investment income must be under ~$11,600\n\nMany families miss out on this credit by not filing taxes. I'd recommend checking if you qualify and filing even if your income was very low.";
  }

  // Default response
  return "That's a great question. Here's what I can help with:\n\n**I can provide guidance on:**\n- How to apply for specific benefit programs\n- What documents you'll need\n- Typical processing timelines\n- How to appeal if denied\n- Finding local offices and resources\n- Understanding income limits and eligibility rules\n\n**Please note:** I'm an AI assistant and my responses are for informational purposes only. For official eligibility determinations, always contact the program directly or visit their official website.\n\nCould you provide more details about which program or benefit you'd like to know about? For example:\n- SNAP/food assistance\n- Medicaid/health coverage\n- Social Security benefits\n- Housing assistance\n- Tax credits";
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">Benefits Assistant</h1>
            <p className="text-xs text-muted-foreground">Ask questions about applying for and redeeming benefits</p>
          </div>
          <Badge variant="secondary" className="ml-auto h-5 text-[10px] gap-1">
            <Sparkles className="w-3 h-3" /> AI-Powered
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="max-w-lg mx-auto text-center py-8">
            <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-base font-semibold mb-2">How can I help?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Ask me anything about government benefits — how to apply, what documents you need,
              processing timelines, appeals, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((sq, i) => {
                const Icon = sq.icon;
                return (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-2.5 px-3 text-left justify-start gap-2 text-xs"
                    onClick={() => sendMessage(sq.text)}
                    data-testid={`button-suggested-${i}`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                    <span className="leading-snug">{sq.text}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3.5 py-2"
                : "bg-card border border-card-border rounded-2xl rounded-bl-md px-3.5 py-2"
            }`}>
              <div className="text-sm whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
                }}
              />
              <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="bg-card border border-card-border rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about benefits, applications, documents..."
            className="flex-1 h-10 text-sm"
            disabled={isTyping}
            data-testid="input-chat"
          />
          <Button type="submit" disabled={!input.trim() || isTyping} className="h-10 w-10 p-0" data-testid="button-send">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          AI assistant provides general guidance only — not legal advice. Always verify with official sources.
        </p>
      </div>
    </div>
  );
}
