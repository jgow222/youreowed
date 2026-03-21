import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  User,
  Send,
  CheckCircle2,
  Circle,
  FileText,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  MessageCircle,
  AlertTriangle,
  Phone,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Scale,
  ShoppingCart,
  Lock,
} from "lucide-react";
import { useAppState } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  getGuide,
  type ApplicationGuide,
} from "@/lib/apply-knowledge";
import {
  GUIDE_PRICE,
  AI_GUIDE_PRICE,
  GUIDES,
  openCheckout,
  isStripeConfigured,
  redirectToPricing,
} from "@/lib/payments";
import { programs } from "@/lib/programs";

// ─── Hash query param parser ─────────────────────────────────────────────────

function useHashQueryParam(key: string): string | null {
  return useMemo(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf("?");
    if (qIdx === -1) return null;
    const params = new URLSearchParams(hash.slice(qIdx));
    return params.get(key);
  }, [key]);
}

// ─── AI chat response generator ──────────────────────────────────────────────

function generateResponse(
  guide: ApplicationGuide,
  currentStepIndex: number,
  question: string
): string {
  const q = question.toLowerCase();
  const step = guide.steps[currentStepIndex];

  // Documents
  if (
    q.includes("document") ||
    q.includes("need to bring") ||
    q.includes("paperwork") ||
    q.includes("what do i need")
  ) {
    return `For ${guide.programName}, you'll need these documents:\n\n${guide.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\nI'd recommend gathering all of these before you start the application. Make copies of everything you submit.`;
  }

  // Timeline / processing
  if (
    q.includes("how long") ||
    q.includes("timeline") ||
    q.includes("processing") ||
    q.includes("when will") ||
    q.includes("wait")
  ) {
    return `Processing time for ${guide.programName}: ${guide.processingTime}\n\nMake sure to respond promptly to any requests for additional information — delays on your end can reset the clock.`;
  }

  // Appeal / denial
  if (
    q.includes("denied") ||
    q.includes("appeal") ||
    q.includes("rejected") ||
    q.includes("fair hearing")
  ) {
    return `If your ${guide.programName} application is denied:\n\n${guide.appealInfo}\n\nDon't give up after a denial — many successful applicants were initially denied. The key is to appeal within the deadline and provide any missing documentation.`;
  }

  // Common mistakes
  if (
    q.includes("mistake") ||
    q.includes("avoid") ||
    q.includes("wrong") ||
    q.includes("common error") ||
    q.includes("tips")
  ) {
    return `Common mistakes to avoid with ${guide.programName}:\n\n${guide.commonMistakes.map((m, i) => `${i + 1}. ${m}`).join("\n")}\n\nAvoiding these will significantly improve your chances of approval.`;
  }

  // Phone / contact
  if (
    q.includes("phone") ||
    q.includes("call") ||
    q.includes("contact") ||
    q.includes("helpline") ||
    q.includes("number")
  ) {
    const phone = guide.helplinePhone || "your local office";
    return `You can reach ${guide.programName} support at: ${phone}\n\nYou can also visit the official website: ${guide.officialApplyUrl}\n\nIf you're having trouble with your application, calling is often the fastest way to get answers.`;
  }

  // Interview
  if (
    q.includes("interview") ||
    q.includes("questions they ask") ||
    q.includes("phone interview") ||
    q.includes("in person")
  ) {
    return `About the ${guide.programName} interview:\n\nMost interviews can be done by phone — you don't always need to go in person. They'll ask about:\n\n- Your household composition and who lives with you\n- All sources of income (jobs, benefits, support)\n- Your monthly expenses (rent, utilities, childcare)\n- Your assets (bank accounts, vehicles)\n\nBe honest and thorough. Have your documents in front of you during the call. If you don't know an exact amount, give your best estimate and say so.`;
  }

  // Eligibility
  if (
    q.includes("eligible") ||
    q.includes("qualify") ||
    q.includes("income limit") ||
    q.includes("do i qualify")
  ) {
    return `Eligibility for ${guide.programName} depends on several factors including income, household size, and specific program requirements.\n\nIf you completed our screening and got a "likely eligible" result, that's a strong indicator — but the official application is what determines final eligibility.\n\nI'd recommend applying even if you're unsure. The worst that can happen is a denial, which you can appeal.`;
  }

  // Current step context
  if (step?.tips) {
    return `Regarding "${step.title}":\n\n${step.description}\n\nTip: ${step.tips}\n\nIs there anything specific about this step you'd like me to clarify?`;
  }

  // Default helpful response
  return `That's a great question about ${guide.programName}.\n\nHere's what I'd suggest: ${step?.description || guide.steps[0].description}\n\nWould you like to know about:\n- Required documents\n- Processing timeline\n- Common mistakes to avoid\n- How to appeal if denied\n\nJust ask and I'll give you the details.`;
}

function getSuggestedQuestions(
  guide: ApplicationGuide,
  stepIndex: number
): string[] {
  const step = guide.steps[stepIndex];
  const title = step?.title.toLowerCase() || "";

  const base: string[] = [];

  if (title.includes("application") || title.includes("form") || title.includes("apply")) {
    base.push("What documents do I need?", "How long does it take to fill out?");
  }
  if (title.includes("interview")) {
    base.push("What questions will they ask?", "Can I do the interview by phone?");
  }
  if (title.includes("verification") || title.includes("document")) {
    base.push("What if I'm missing a document?", "Can I submit documents online?");
  }
  if (title.includes("decision") || title.includes("receive") || title.includes("wait")) {
    base.push("How long until I hear back?", "What if I'm denied?");
  }
  if (title.includes("appeal")) {
    base.push("Should I get a lawyer?", "What's my chance of winning on appeal?");
  }

  // Always add general questions
  base.push("What are common mistakes to avoid?");
  if (guide.helplinePhone) {
    base.push("What's the helpline number?");
  }

  return base.slice(0, 4);
}

// ─── Chat message types ──────────────────────────────────────────────────────

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

// ─── Steps Sidebar ───────────────────────────────────────────────────────────

function StepsSidebar({
  guide,
  currentStep,
  completedSteps,
  onStepClick,
}: {
  guide: ApplicationGuide;
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (i: number) => void;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Application Steps
      </h3>
      {guide.steps.map((step, i) => {
        const isCompleted = completedSteps.has(i);
        const isCurrent = i === currentStep;
        return (
          <button
            key={i}
            onClick={() => onStepClick(i)}
            className={`w-full flex items-start gap-2.5 p-2.5 rounded-md text-left cursor-pointer transition-colors ${
              isCurrent
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : isCurrent ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary mt-0.5 flex-shrink-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium leading-tight ${
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-muted-foreground"
                      : ""
                }`}
              >
                Step {i + 1}
              </p>
              <p
                className={`text-xs leading-tight truncate ${
                  isCompleted ? "text-muted-foreground line-through" : ""
                }`}
              >
                {step.title}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Step Detail Panel ───────────────────────────────────────────────────────

function StepDetail({
  guide,
  stepIndex,
  isCompleted,
  onMarkComplete,
  onPrev,
  onNext,
  isFirst,
  isLast,
}: {
  guide: ApplicationGuide;
  stepIndex: number;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [showMistakes, setShowMistakes] = useState(false);
  const step = guide.steps[stepIndex];

  return (
    <div className="space-y-4">
      {/* Step header */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          Step {stepIndex + 1} of {guide.steps.length}
        </p>
        <h2 className="text-lg font-bold">{step.title}</h2>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed">{step.description}</p>

      {/* Tips callout */}
      {step.tips && (
        <Card className="p-3 border-primary/20 bg-primary/[0.04]">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary mb-0.5">
                Pro Tip
              </p>
              <p className="text-xs leading-relaxed">{step.tips}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Required documents (show on first 2 steps) */}
      {stepIndex < 2 && (
        <Card className="p-3 border border-card-border">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold">
              Documents You'll Need for This Step
            </p>
          </div>
          <ul className="space-y-1.5">
            {guide.requiredDocuments
              .slice(0, stepIndex === 0 ? 3 : undefined)
              .map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
          </ul>
          {stepIndex === 0 && guide.requiredDocuments.length > 3 && (
            <p className="text-[10px] text-muted-foreground mt-2">
              +{guide.requiredDocuments.length - 3} more — see Documents tab for
              full checklist
            </p>
          )}
        </Card>
      )}

      {/* Common mistakes (collapsible) */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setShowMistakes(!showMistakes)}
        >
          <AlertTriangle className="w-3 h-3" />
          Common mistakes to avoid
          {showMistakes ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
        {showMistakes && (
          <Card className="mt-2 p-3 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <ul className="space-y-1.5">
              {guide.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onPrev}
          disabled={isFirst}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous
        </Button>
        <Button
          size="sm"
          className="gap-1.5 flex-1"
          onClick={onMarkComplete}
          variant={isCompleted ? "secondary" : "default"}
          data-testid="button-mark-complete"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </>
          ) : isLast ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Complete
            </>
          ) : (
            <>
              Mark Complete & Next
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
        {!isLast && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onNext}
          >
            Skip
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Document Checklist ──────────────────────────────────────────────────────

function DocumentChecklist({
  guide,
  checkedDocs,
  onToggleDoc,
}: {
  guide: ApplicationGuide;
  checkedDocs: Set<number>;
  onToggleDoc: (i: number) => void;
}) {
  const total = guide.requiredDocuments.length;
  const done = checkedDocs.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Required Documents</h3>
          <Badge variant="secondary" className="text-xs">
            {done} of {total} ready
          </Badge>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      <div className="space-y-2">
        {guide.requiredDocuments.map((doc, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2.5 rounded-md hover:bg-muted/30 cursor-pointer"
            onClick={() => onToggleDoc(i)}
          >
            <Checkbox
              checked={checkedDocs.has(i)}
              onCheckedChange={() => onToggleDoc(i)}
              className="mt-0.5"
            />
            <span
              className={`text-sm leading-tight ${
                checkedDocs.has(i) ? "line-through text-muted-foreground" : ""
              }`}
            >
              {doc}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-3 border border-card-border">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Make copies of every document before submitting. Take photos as
            backup. Keep originals in a safe place.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── AI Chat Panel ───────────────────────────────────────────────────────────

function ChatPanel({
  guide,
  currentStepIndex,
}: {
  guide: ApplicationGuide;
  currentStepIndex: number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `I'm here to help you apply for ${guide.programName}. I can answer questions about documents, deadlines, and the application process. What do you need help with?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = useMemo(
    () => getSuggestedQuestions(guide, currentStepIndex),
    [guide, currentStepIndex]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Simulate AI response delay
      setTimeout(() => {
        const response = generateResponse(guide, currentStepIndex, text);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response },
        ]);
        setIsTyping(false);
      }, 600 + Math.random() * 800);
    },
    [guide, currentStepIndex]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-2 p-3 border-b">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">AI Assistant</span>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {guide.programName}
        </Badge>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-primary/10"
                  : "bg-muted"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-3.5 h-3.5 text-primary" />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-lg p-2.5 text-xs leading-relaxed whitespace-pre-line ${
                msg.role === "assistant"
                  ? "bg-muted/50 border border-card-border"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-muted/50 border border-card-border rounded-lg p-2.5 text-xs">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-[10px] px-2 py-1 rounded-full border border-primary/20 text-primary hover:bg-primary/5 cursor-pointer transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about this application..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm bg-muted/30 border border-card-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
            data-testid="input-chat"
          />
          <Button
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            data-testid="button-send-chat"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Chat Overlay ─────────────────────────────────────────────────────

function MobileChatOverlay({
  guide,
  currentStepIndex,
  onClose,
}: {
  guide: ApplicationGuide;
  currentStepIndex: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatPanel guide={guide} currentStepIndex={currentStepIndex} />
      </div>
    </div>
  );
}

// ─── Guided Application Experience (Mode 2) ──────────────────────────────────

function GuidedExperience({
  guide,
  programId,
}: {
  guide: ApplicationGuide;
  programId: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set()
  );
  const [checkedDocs, setCheckedDocs] = useState<Set<number>>(
    () => new Set()
  );
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeTab, setActiveTab] = useState("steps");

  const program = useMemo(
    () => programs.find((p) => p.id === programId),
    [programId]
  );

  const totalSteps = guide.steps.length;
  const completedCount = completedSteps.size;
  const stepProgress = Math.round((completedCount / totalSteps) * 100);

  const handleMarkComplete = useCallback(() => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(currentStep)) {
        next.delete(currentStep);
      } else {
        next.add(currentStep);
        // Advance to next incomplete step
        if (currentStep < totalSteps - 1) {
          setTimeout(() => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1)), 200);
        }
      }
      return next;
    });
  }, [currentStep, totalSteps]);

  const handleToggleDoc = useCallback((i: number) => {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  return (
    <div className="h-full">
      {/* Header bar */}
      <div className="p-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/apply-guide">
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                <ArrowLeft className="w-3 h-3" />
                All Guides
              </button>
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium">{guide.programName}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-base font-bold">
                {guide.programName} Application Guide
              </h1>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {totalSteps} steps completed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={stepProgress} className="w-24 h-2" />
                <span className="text-xs font-medium">{stepProgress}%</span>
              </div>
              {guide.helplinePhone && (
                <a
                  href={`tel:${guide.helplinePhone}`}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Phone className="w-3 h-3" />
                  {guide.helplinePhone}
                </a>
              )}
              <a
                href={guide.officialApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  Official Site <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </div>
          <Progress value={stepProgress} className="h-1.5 mt-3 sm:hidden" />
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-4">
          {/* Left column: steps sidebar + detail */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="steps" className="text-xs gap-1.5">
                  <FileText className="w-3 h-3" />
                  Steps
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Documents ({checkedDocs.size}/{guide.requiredDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="info" className="text-xs gap-1.5">
                  <Clock className="w-3 h-3" />
                  Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="steps">
                <div className="flex gap-4">
                  {/* Steps sidebar (hidden on mobile) */}
                  <div className="hidden md:block w-48 flex-shrink-0">
                    <StepsSidebar
                      guide={guide}
                      currentStep={currentStep}
                      completedSteps={completedSteps}
                      onStepClick={setCurrentStep}
                    />
                  </div>

                  {/* Mobile step indicator */}
                  <div className="md:hidden w-full">
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                      {guide.steps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentStep(i)}
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                            completedSteps.has(i)
                              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                              : i === currentStep
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {completedSteps.has(i) ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            i + 1
                          )}
                        </button>
                      ))}
                    </div>
                    <StepDetail
                      guide={guide}
                      stepIndex={currentStep}
                      isCompleted={completedSteps.has(currentStep)}
                      onMarkComplete={handleMarkComplete}
                      onPrev={() =>
                        setCurrentStep((s) => Math.max(0, s - 1))
                      }
                      onNext={() =>
                        setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))
                      }
                      isFirst={currentStep === 0}
                      isLast={currentStep === totalSteps - 1}
                    />
                  </div>

                  {/* Desktop step detail */}
                  <div className="hidden md:block flex-1">
                    <StepDetail
                      guide={guide}
                      stepIndex={currentStep}
                      isCompleted={completedSteps.has(currentStep)}
                      onMarkComplete={handleMarkComplete}
                      onPrev={() =>
                        setCurrentStep((s) => Math.max(0, s - 1))
                      }
                      onNext={() =>
                        setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))
                      }
                      isFirst={currentStep === 0}
                      isLast={currentStep === totalSteps - 1}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <DocumentChecklist
                  guide={guide}
                  checkedDocs={checkedDocs}
                  onToggleDoc={handleToggleDoc}
                />
              </TabsContent>

              <TabsContent value="info">
                <div className="space-y-4">
                  {/* Processing time */}
                  <Card className="p-4 border border-card-border">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold mb-1">
                          Processing Time
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {guide.processingTime}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Appeal info */}
                  <Card className="p-4 border border-card-border">
                    <div className="flex items-start gap-2.5">
                      <Scale className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold mb-1">
                          If You're Denied
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {guide.appealInfo}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Contact */}
                  {guide.helplinePhone && (
                    <Card className="p-4 border border-card-border">
                      <div className="flex items-start gap-2.5">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold mb-1">
                            Helpline
                          </h3>
                          <a
                            href={`tel:${guide.helplinePhone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {guide.helplinePhone}
                          </a>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Official link */}
                  <Card className="p-4 border border-card-border">
                    <div className="flex items-start gap-2.5">
                      <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold mb-1">
                          Official Application
                        </h3>
                        <a
                          href={guide.officialApplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {guide.officialApplyUrl}
                        </a>
                      </div>
                    </div>
                  </Card>

                  {/* Program details if available */}
                  {program && (
                    <Card className="p-4 border border-card-border">
                      <h3 className="text-sm font-semibold mb-1">
                        About {program.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        {program.description}
                      </p>
                      {program.estimatedMonthlyBenefit && (
                        <Badge
                          variant="outline"
                          className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        >
                          ${program.estimatedMonthlyBenefit.min.toLocaleString()} – $
                          {program.estimatedMonthlyBenefit.max.toLocaleString()}/mo
                        </Badge>
                      )}
                      {!program.estimatedMonthlyBenefit &&
                        program.estimatedAnnualBenefit && (
                          <Badge
                            variant="outline"
                            className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          >
                            ${program.estimatedAnnualBenefit.min.toLocaleString()} – $
                            {program.estimatedAnnualBenefit.max.toLocaleString()}/yr
                          </Badge>
                        )}
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column: chat (desktop only) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card className="border border-card-border overflow-hidden h-[calc(100vh-220px)] flex flex-col sticky top-4">
              <ChatPanel guide={guide} currentStepIndex={currentStep} />
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile chat FAB */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Button
          size="lg"
          className="h-12 w-12 rounded-full p-0 shadow-lg"
          onClick={() => setShowMobileChat(true)}
          data-testid="button-mobile-chat"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile chat overlay */}
      {showMobileChat && (
        <MobileChatOverlay
          guide={guide}
          currentStepIndex={currentStep}
          onClose={() => setShowMobileChat(false)}
        />
      )}

      {/* Completion card */}
      {completedCount === totalSteps && (
        <div className="max-w-6xl mx-auto px-4 pb-6">
          <Card className="p-5 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold mb-1">
              All Steps Complete!
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              You've reviewed all the steps for applying to{" "}
              {guide.programName}. Ready to submit your application?
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href={guide.officialApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="gap-2">
                  Go to Official Application
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
              <Link href="/screener">
                <Button variant="outline" className="gap-2">
                  Check More Programs
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Generic Guide Listing (Mode 1) ─────────────────────────────────────────

function GuideCard({
  guideConfig,
  guide,
  onPurchased,
}: {
  guideConfig: (typeof GUIDES)[number];
  guide?: ApplicationGuide;
  onPurchased?: (programId: string) => void;
}) {
  const { toast } = useToast();
  const { state } = useAppState();
  const [purchasing, setPurchasing] = useState<"guide" | "ai" | null>(null);
  const tier = state.user?.subscriptionTier || "free";
  const isPro = tier === "premium" || tier === "pro";
  const isBasic = tier === "basic";
  const isPaid = isPro || isBasic;

  const handlePurchase = async (type: "guide" | "ai") => {
    setPurchasing(type);
    if (isStripeConfigured()) {
      openCheckout(guideConfig.stripeLink);
      setPurchasing(null);
    } else {
      setPurchasing(null);
      toast({ title: "Coming soon", description: "Payment processing is being set up. Check back shortly." });
    }
  };

  return (
    <Card className="p-5 border border-card-border flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold">{guideConfig.name}</h3>
        <Badge variant="secondary" className="text-[10px] gap-1 flex-shrink-0">
          <Bot className="w-3 h-3" />
          AI-guided walkthrough
        </Badge>
      </div>
      {guide && (
        <p className="text-xs text-muted-foreground mb-1">
          {guide.steps.length} steps &middot;{" "}
          {guide.requiredDocuments.length} documents &middot;{" "}
          {guide.processingTime.split(".")[0]}
        </p>
      )}
      <p className="text-xs text-muted-foreground mb-4 flex-1">
        {guide
          ? `Step-by-step walkthrough with document checklist, tips, and common mistakes to avoid. Includes AI assistant for personalized guidance.`
          : "Complete application guide with document checklist and AI assistance."}
      </p>
      <div className="flex items-center gap-2">
        {/* Pro/Family: AI guidance is free */}
        {isPro ? (
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs h-9"
            onClick={() => handlePurchase("ai")}
            disabled={purchasing !== null}
            data-testid={`button-start-${guideConfig.programId}`}
          >
            {purchasing === "ai" ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Start AI-Guided Walkthrough
              </>
            )}
          </Button>
        ) : isBasic ? (
          /* Basic: $5 per guide */
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs h-9"
            onClick={() => handlePurchase("guide")}
            disabled={purchasing !== null}
            data-testid={`button-buy-guide-${guideConfig.programId}`}
          >
            {purchasing === "guide" ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" />
                Get AI Guide — $5
              </>
            )}
          </Button>
        ) : (
          /* Free: show upgrade prompt */
          <Link href="/pricing" className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs h-9"
              data-testid={`button-upgrade-${guideConfig.programId}`}
            >
              <Lock className="w-3 h-3" />
              Subscribe to access
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

function GuideListing({ onStartGuide }: { onStartGuide?: (programId: string) => void }) {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/screener">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to screener
        </button>
      </Link>

      <div>
        <h1 className="text-xl font-bold">Application Guides</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-guided walkthroughs to help you successfully apply for benefits.
          Each guide includes step-by-step instructions, document checklists,
          and an AI assistant.
        </p>
      </div>

      {/* What's included */}
      <Card className="p-4 border border-card-border bg-primary/[0.02]">
        <h3 className="text-sm font-semibold mb-2">Every guide includes:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { icon: FileText, text: "Document checklist" },
            { icon: ArrowRight, text: "Step-by-step walkthrough" },
            { icon: Sparkles, text: "Pro tips per step" },
            { icon: AlertTriangle, text: "Common mistakes to avoid" },
            { icon: Clock, text: "Processing timeline" },
            { icon: Scale, text: "Appeal instructions" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <item.icon className="w-3 h-3 text-primary flex-shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Guide cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GUIDES.map((guideConfig) => {
          const guide = getGuide(guideConfig.programId);
          return (
            <GuideCard
              key={guideConfig.id}
              guideConfig={guideConfig}
              guide={guide}
              onPurchased={onStartGuide}
            />
          );
        })}
      </div>

      {/* CTA */}
      <Card className="p-5 text-center border-2 border-primary/20 bg-primary/[0.02]">
        <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
        <h3 className="text-sm font-bold mb-1">
          Not sure which programs you qualify for?
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Run a free screening first, then get guides for the programs
          you're eligible for.
        </p>
        <Link href="/screener">
          <Button className="gap-2">Start Free Screening</Button>
        </Link>
      </Card>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ApplyGuidePage() {
  const urlProgramId = useHashQueryParam("program");
  const [activeProgramId, setActiveProgramId] = useState<string | null>(urlProgramId);

  const guide = useMemo(() => {
    const pid = activeProgramId || urlProgramId;
    if (!pid) return null;
    return getGuide(pid) || null;
  }, [activeProgramId, urlProgramId]);

  const effectiveProgramId = activeProgramId || urlProgramId;

  if (!effectiveProgramId || !guide) {
    return <GuideListing onStartGuide={(programId: string) => setActiveProgramId(programId)} />;
  }

  return (
    <GuidedExperience
      guide={guide}
      programId={effectiveProgramId}
    />
  );
}
