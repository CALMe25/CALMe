import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import "./App.css";
import { ChatMessage } from "./chat_interface/ChatMessage";
import { ChatInput } from "./chat_interface/ChatInput";
import { ScrollArea } from "./chat_interface/ui/scroll-area";
import { Logo } from "./assets/Logo";
import { Button } from "./chat_interface/ui/button";
import { Menu, Moon, Languages, UserRound, Accessibility } from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  AppsContext,
  AppsProvider,
  InnerApps,
  type AppInterface,
  quickActivityOrder,
} from "./appsContextApi";
import AppLauncher from "./AppLauncher/AppLauncher";
import { AccessibilityToolbar } from "./components/AccessibilityToolbar";
import { ConversationController } from "./conversation/ConversationController";
import { AlertTimer } from "./components/AlertTimer";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { GenderPreferenceSelect } from "./components/GenderPreference";
import { useLanguage } from "./contexts/LanguageContext";
import { useUserPreferences } from "./contexts/UserPreferencesContext";
import { useTheme } from "./contexts/ThemeContext";
import { m } from "./paraglide/messages.js";
import { useLocalizedApps } from "./hooks/useLocalizedApps";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./chat_interface/ui/sheet";

interface Message {
  id: string;
  type: "message" | "app-buttons" | "audio";
  content: string;
  timestamp: string;
  isUser: boolean;
  appsTypes?: "activities" | "games";
  audioDuration?: number;
  nodeId: string;
}

type AnyMessageFunction = (props?: Record<string, unknown>) => string;
const isMessageFunction = (value: unknown): value is AnyMessageFunction => {
  return typeof value === "function";
};

function App() {
  const { currentLocale } = useLanguage();
  const isRTL = currentLocale === "he";
  const { userGender } = useUserPreferences();
  const localizedApps = useLocalizedApps();
  const { cycleTheme } = useTheme();
  const [scaleValue, setScaleValue] = useState<number | null>(null);
  // Helper for dynamic conversation node message lookups
  // Only used for conversation flow where node ID is dynamic
  const getConvMessage = useCallback(
    (nodeId: string): string => {
      const messageKey = `conversation_${nodeId}`;
      // Dynamic lookup of conversation messages
      // Type-safe dynamic property access using 'in' operator
      const isValidKey = (key: string): key is keyof typeof m => {
        return key in m;
      };

      if (isValidKey(messageKey)) {
        const convFn = m[messageKey];
        if (isMessageFunction(convFn)) {
          // conversation_start is gender-aware and requires userGender parameter
          if (messageKey === "conversation_start") {
            return convFn({ userGender });
          }
          return convFn();
        }
      }
      console.warn(`Conversation node not found: conversation_${nodeId}`);
      return `[Missing: ${nodeId}]`;
    },
    [userGender],
  );
  const [conversationController] = useState(() => new ConversationController());
  const [userInput, setUserInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAlertButton, setShowAlertButton] = useState(true);
  const [alertTimer, setAlertTimer] = useState<number | null>(null);
  const [alertInterval, setAlertInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [showAppsLauncher, setShowAppsLauncher] = useState(false);
  const [shouldAutoLaunchApp, setShouldAutoLaunchApp] = useState(false);
  const [chosenApp, setChosenApp] = useState<AppInterface | undefined>();
  const [appsTimeout, setAppsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [activityReturnNode, setActivityReturnNode] = useState<string | null>(null);
  const [showQuickPanel, setShowQuickPanel] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const appsContext = useContext(AppsContext);
  const resolvedApps = appsContext ?? localizedApps;

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const ACTIVITY_PROMPT_NODES = React.useMemo(
    () => new Set(["activity_choice", "activity_choice_clarify"]),
    [],
  );

  const menuRowClasses =
    "flex w-full items-center justify-between rounded-xl border border-border/60 bg-muted/10 px-3 py-2";
  const menuLabelClasses = "flex items-center gap-3 text-sm font-medium";

  useEffect(() => {
    const initializeConversation = async () => {
      let retries = 0;
      while (!conversationController.isInitialized() && retries < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }
      if (!conversationController.isInitialized()) {
        console.error("Controller initialization timeout");
      }
      try {
        const initialNode = conversationController.getCurrentNode();
        const activityPrompt = ACTIVITY_PROMPT_NODES.has(initialNode.id);
        const content =
          getConvMessage(initialNode.id) ||
          (initialNode.content ?? "") ||
          m.conversation_helloImHereWithYou();
        setConversationHistory([
          {
            id: Date.now().toString(),
            type: activityPrompt ? "app-buttons" : "message",
            content,
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: initialNode.id,
            appsTypes: activityPrompt ? "activities" : undefined,
          },
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing conversation:", error);
        const fallbackId = "start";
        const activityPrompt = ACTIVITY_PROMPT_NODES.has(fallbackId);
        setConversationHistory([
          {
            id: Date.now().toString(),
            type: activityPrompt ? "app-buttons" : "message",
            content: m.conversation_welcomeToCalme(),
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: fallbackId,
            appsTypes: activityPrompt ? "activities" : undefined,
          },
        ]);
        setIsInitialized(true);
      }
    };
    void initializeConversation();
  }, [conversationController, ACTIVITY_PROMPT_NODES, getConvMessage]);

  // Update conversation history translations when language changes
  useEffect(() => {
    setConversationHistory((prevHistory) =>
      prevHistory.map((msg) => {
        // Keep user messages unchanged
        if (msg.isUser) return msg;

        // Re-translate bot messages using stored nodeId
        if (msg.nodeId) {
          const activityPrompt = ACTIVITY_PROMPT_NODES.has(msg.nodeId);
          const content =
            getConvMessage(msg.nodeId) || msg.content || m.conversation_letsContinue();

          return {
            ...msg,
            content,
            type: activityPrompt ? "app-buttons" : msg.type,
            appsTypes: activityPrompt ? "activities" : msg.appsTypes,
          };
        }

        // Keep other messages unchanged
        return msg;
      }),
    );
  }, [currentLocale, getConvMessage, ACTIVITY_PROMPT_NODES]);

  // Update parser with current language messages whenever language changes
  useEffect(() => {
    // Create messages object from Paraglide for parser
    const parserMessages = {
      parser: {
        affirmativeResponses: m.parser_affirmativeResponses(),
        negativeResponses: m.parser_negativeResponses(),
        uncertainResponses: m.parser_uncertainResponses(),
        stressKeywords: {
          no_stress: m.parser_stressKeywords_no_stress(),
          moderate_stress: m.parser_stressKeywords_moderate_stress(),
          high_stress: m.parser_stressKeywords_high_stress(),
        },
        safetyKeywords: {
          safe: m.parser_safetyKeywords_safe(),
          danger: m.parser_safetyKeywords_danger(),
          unsure: m.parser_safetyKeywords_unsure(),
        },
        clarifications: {
          stress: m.parser_clarifications_stress(),
          safety: m.parser_clarifications_safety(),
          location: m.parser_clarifications_location(),
          yesNo: m.parser_clarifications_yesNo(),
          activity: m.parser_clarifications_activity(),
        },
      },
    };
    conversationController.setParserMessages(parserMessages);
  }, [conversationController, currentLocale]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversationHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let startX: number | null = null;
    let startY: number | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      if (window.innerWidth >= 1024) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (startX == null || startY == null) return;
      const touch = event.changedTouches[0];
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;
      const horizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
      const threshold = 60;
      const edgeThreshold = 40;

      if (horizontalSwipe && Math.abs(diffX) > threshold) {
        if (!isRTL && startX < edgeThreshold && diffX > 0 && !mobileMenuOpen) {
          setMobileMenuOpen(true);
        } else if (
          isRTL &&
          startX > window.innerWidth - edgeThreshold &&
          diffX < 0 &&
          !mobileMenuOpen
        ) {
          setMobileMenuOpen(true);
        }
      }
      startX = null;
      startY = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRTL, mobileMenuOpen]);

  const processUserInput = useCallback(() => {
    if (!userInput.trim()) return;

    try {
      const parserType = conversationController.getCurrentParserType();
      if (parserType == null) {
        console.warn("No parser type specified for current node");
        return;
      }

      const stepResult = conversationController.runParser(parserType, userInput);
      const { nextNode, activityTrigger } = conversationController.processParserOutput(stepResult);

      const activityPrompt = ACTIVITY_PROMPT_NODES.has(nextNode.id);
      const content =
        getConvMessage(nextNode.id) || (nextNode.content ?? "") || "How can I help you?";
      const newMessage: Message = {
        id: Date.now().toString(),
        type: activityPrompt ? "app-buttons" : "message",
        content,
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: nextNode.id,
        appsTypes: activityPrompt ? "activities" : undefined,
      };

      setConversationHistory((prev) => [...prev, newMessage]);

      if (activityTrigger) {
        setActivityReturnNode(activityTrigger.returnNode);
        const targetApp = resolvedApps.find((app) => app.name === activityTrigger.activityName);

        if (targetApp) {
          if (activityTrigger.activityName === "breathing") {
            const transitionMsg: Message = {
              id: Date.now().toString() + "_transition",
              type: "message",
              content: m.conversation_breathingTransition(),
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: nextNode.id,
            };
            setConversationHistory((prev) => [...prev, transitionMsg]);
          }

          setChosenApp(targetApp);
          setShouldAutoLaunchApp(true);
          const timer = setTimeout(() => {
            setShowAppsLauncher(true);
          }, 2000);
          setAppsTimeout(timer);
        } else if (
          !["breathing", "stretching", "matching-cards", "sudoku", "puzzle", "paint"].includes(
            activityTrigger.activityName,
          )
        ) {
          // Get localized activity name
          const targetApp = localizedApps.find((app) => app.name === activityTrigger.activityName);
          const localizedName = (targetApp?.label ?? "") || activityTrigger.activityName;

          const placeholderMsg: Message = {
            id: Date.now().toString() + "_placeholder",
            type: "message",
            content: m.conversation_activityWouldBeCalled({
              activityName: localizedName,
            }),
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: nextNode.id,
          };
          setConversationHistory((prev) => [...prev, placeholderMsg]);

          setTimeout(() => {
            conversationController.moveToNode(activityTrigger.returnNode);
            const returnNode = conversationController.getCurrentNode();
            const content =
              getConvMessage(returnNode.id) ||
              (returnNode.content ?? "") ||
              m.conversation_letsContinue();
            const continueMsg: Message = {
              id: Date.now().toString() + "_continue",
              type: "message",
              content,
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: returnNode.id,
            };
            setConversationHistory((prev) => [...prev, continueMsg]);
          }, 1500);
        } else {
          // Get localized activity name
          const targetApp = localizedApps.find((app) => app.name === activityTrigger.activityName);
          const localizedName = (targetApp?.label ?? "") || activityTrigger.activityName;

          const mismatchMsg: Message = {
            id: Date.now().toString() + "_mismatch",
            type: "message",
            content: m.conversation_startingExercise({
              activityName: localizedName,
            }),
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: nextNode.id,
          };
          setConversationHistory((prev) => [...prev, mismatchMsg]);
        }
      }
    } catch (error) {
      console.error("Error processing user input:", error);
      const errorMsg: Message = {
        id: Date.now().toString() + "_error",
        type: "message",
        content: m.conversation_didntUnderstand(),
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: conversationController.getCurrentNode().id,
      };
      setConversationHistory((prev) => [...prev, errorMsg]);
    }

    setUserInput("");
  }, [
    userInput,
    conversationController,
    ACTIVITY_PROMPT_NODES,
    resolvedApps,
    getConvMessage,
    localizedApps,
  ]);

  useEffect(() => {
    if (userInput !== "" && isInitialized) {
      processUserInput();
    }
  }, [userInput, isInitialized, processUserInput]);

  const handleSendMessage = (e: string) => {
    if (!e.trim()) return;
    const currentNode = conversationController.getCurrentNode();
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "message",
      content: e,
      timestamp: new Date().toISOString(),
      isUser: true,
      nodeId: currentNode.id,
    };
    setConversationHistory((prev) => [...prev, newMessage]);
    setUserInput(e);
  };

  const closeAppLauncher = async () => {
    if (appsTimeout) {
      clearTimeout(appsTimeout);
      setAppsTimeout(null);
    }

    if (chosenApp) {
      await conversationController.recordActivityCompletion(chosenApp.name, true);
    }

    setChosenApp(undefined);
    setShowAppsLauncher(false);
    setShouldAutoLaunchApp(false);

    if (activityReturnNode != null) {
      try {
        conversationController.moveToNode(activityReturnNode);
        const returnNode = conversationController.getCurrentNode();

        const activityPrompt = ACTIVITY_PROMPT_NODES.has(returnNode.id);
        const content =
          getConvMessage(returnNode.id) ||
          (returnNode.content ?? "") ||
          m.conversation_welcomeBack();
        const returnMessage: Message = {
          id: Date.now().toString(),
          type: activityPrompt ? "app-buttons" : "message",
          content,
          timestamp: new Date().toISOString(),
          isUser: false,
          nodeId: returnNode.id,
          appsTypes: activityPrompt ? "activities" : undefined,
        };

        setConversationHistory((prev) => [...prev, returnMessage]);
        setActivityReturnNode(null);
      } catch (error) {
        console.error("Error returning from activity:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (appsTimeout) {
        clearTimeout(appsTimeout);
      }
    };
  }, [appsTimeout]);

  useEffect(() => {
    if (shouldAutoLaunchApp) {
      const breathingApp = resolvedApps.find((subapps) => subapps.name === "breathing");
      setChosenApp(breathingApp);
      setShowAppsLauncher(true);
    }
  }, [shouldAutoLaunchApp, resolvedApps]);

  const handleAppLaunch = (appToLaunch: AppInterface | undefined) => {
    if (!appToLaunch) {
      return;
    }
    setChosenApp(appToLaunch);
    setShowAppsLauncher(true);
  };

  const handleAudioPlay = () => {
    toast.success(m.toast_playingVoiceMessage(), {
      description: m.toast_audioMessage(),
    });
  };

  const handleVoiceInput = () => {
    toast.info(m.toast_voiceInputActivated());
  };

  const handleAccessibility = () => {
    setAccessibilityOpen(true);
  };

  const handleDemoAlert = () => {
    if (alertInterval) {
      clearInterval(alertInterval);
      setAlertInterval(null);
    }

    setShowAlertButton(false);
    setAlertTimer(180);

    setConversationHistory((prev) => [
      ...prev,
      {
        id: `${Date.now()}_alert_start`,
        type: "message",
        content: m.alert_alertStart(),
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: "alert_start",
      },
    ]);

    const interval = setInterval(() => {
      setAlertTimer((prev) => {
        if (prev === null) {
          return prev;
        }
        if (prev <= 1) {
          clearInterval(interval);
          setAlertInterval(null);
          setShowAlertButton(true);
          setConversationHistory((prevHistory) => [
            ...prevHistory,
            {
              id: `${Date.now()}_alert_clear`,
              type: "message",
              content: m.alert_alertClear(),
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: "alert_all_clear",
            },
          ]);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setAlertInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (alertInterval) {
        clearInterval(alertInterval);
      }
    };
  }, [alertInterval]);

  const isConversationComplete = conversationController.isComplete();

  if (isConversationComplete && !showAppsLauncher && !conversationController.isInOnboarding()) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{m.conversation_conversationComplete()}</h2>
          <p className="text-gray-600 mb-4">{m.conversation_thankYou()}</p>
          <Button
            onClick={() => {
              conversationController.reset();
              const initialNode = conversationController.getCurrentNode();
              const content =
                getConvMessage(initialNode.id) ||
                (initialNode.content ?? "") ||
                m.conversation_helloImHereWithYou();
              setConversationHistory([
                {
                  id: Date.now().toString(),
                  type: "message",
                  content,
                  timestamp: new Date().toISOString(),
                  isUser: false,
                  nodeId: initialNode.id,
                },
              ]);
            }}
          >
            {m.conversation_startNewConversation()}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppsProvider value={InnerApps}>
        <Toaster />
        <div className="flex flex-col h-full w-full mx-0 bg-background border-x border-border">
          <header
            className="flex-shrink-0 flex z-1000 items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
            style={{
              paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
              paddingRight: "max(0.75rem, env(safe-area-inset-right))",
            }}
          >
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <div className="flex w-full items-center justify-between">
                <div
                  className="flex items-center gap-2 sm:gap-3 min-w-0"
                  style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
                >
                  {isRTL ? (
                    <>
                      <Logo />
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <h1 className="text-lg sm:text-xl font-large truncate">{m.app_name()}</h1>
                        <AlertTimer timeRemaining={alertTimer} />
                      </div>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                          <Menu className="w-5 h-5" />
                          <span className="sr-only">{m.header_menu()}</span>
                        </Button>
                      </SheetTrigger>
                    </>
                  ) : (
                    <>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                          <Menu className="w-5 h-5" />
                          <span className="sr-only">{m.header_menu()}</span>
                        </Button>
                      </SheetTrigger>
                      <Logo />
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <h1 className="text-lg sm:text-xl font-large truncate">{m.app_name()}</h1>
                        <AlertTimer timeRemaining={alertTimer} />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1" />
              </div>

              <SheetContent side={isRTL ? "right" : "left"} className="w-64 sm:w-80">
                <SheetHeader>
                  <SheetTitle>{m.header_menu()}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3 mt-6">
                  <button
                    type="button"
                    className={`${menuRowClasses} text-left`}
                    onClick={() => {
                      handleAccessibility();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className={menuLabelClasses}>
                      <Accessibility className="w-4 h-4" />
                      <span>{m.header_accessibility()}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{m.common_open()}</span>
                  </button>

                  <button
                    type="button"
                    className={menuRowClasses}
                    onClick={() => {
                      cycleTheme();
                    }}
                  >
                    <div className={menuLabelClasses}>
                      <Moon className="w-4 h-4" />
                      <span>{m.header_darkMode()}</span>
                    </div>
                    <DarkModeToggle />
                  </button>

                  <div className={`${menuRowClasses} flex-col items-start gap-2`}>
                    <div className={menuLabelClasses}>
                      <UserRound className="w-4 h-4" />
                      <span>{m.preferences_gender_switcher()}</span>
                    </div>
                    <GenderPreferenceSelect showLabel={false} className="w-full px-0 gap-0" />
                  </div>

                  <div className={menuRowClasses}>
                    <div className={menuLabelClasses}>
                      <Languages className="w-4 h-4" />
                      <span>{m.common_switchLanguage()}</span>
                    </div>
                    <LanguageSwitcher variant="menu" />
                  </div>

                  {showAlertButton && (
                    <button
                      type="button"
                      className={`${menuRowClasses} bg-destructive/10 text-destructive border-destructive/50`}
                      onClick={() => {
                        handleDemoAlert();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className={`${menuLabelClasses} font-semibold`}>
                        <span>{m.header_demoAlert()}</span>
                      </div>
                      <span className="text-xs">{m.common_start()}</span>
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </header>

          {!showAppsLauncher && (
            <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-y-auto px-3 sm:px-4">
              <div className="space-y-4 pb-4 mt-2">
                {resolvedApps.length > 0 && (
                  <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3 sm:p-4 lg:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-medium text-muted-foreground">
                          {m.quickActivities_title()}
                        </h2>
                        <p className="text-xs text-muted-foreground/70 hidden xs:block">
                          {m.quickActivities_subtitle()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground flex-shrink-0"
                        onClick={() => {
                          setShowQuickPanel((prev) => !prev);
                        }}
                        aria-label={
                          showQuickPanel ? m.quickActivities_hide() : m.quickActivities_show()
                        }
                        aria-expanded={showQuickPanel}
                        aria-controls="quick-activities-panel"
                      >
                        {showQuickPanel ? "−" : "+"}
                      </Button>
                    </div>
                    {showQuickPanel && (
                      <>
                        <div
                          id="quick-activities-panel"
                          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-3"
                        >
                          {quickActivityOrder
                            .map((name) => resolvedApps.find((app) => app.name === name))
                            .filter((app): app is AppInterface => Boolean(app))
                            .map((app) => (
                              <Button
                                key={app.name}
                                onClick={() => {
                                  handleAppLaunch(app);
                                }}
                                className="flex h-auto min-h-[60px] w-full flex-col items-center justify-center gap-2 rounded-xl border-0 bg-indigo-500/90 px-4 py-3 text-xs font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-500 active:scale-95 sm:text-sm"
                                size="sm"
                              >
                                <div className="text-white scale-110">{app.icon}</div>
                                <span className="leading-tight text-white text-center">
                                  {app.label}
                                </span>
                              </Button>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {conversationHistory.map((message, index) => (
                  <ChatMessage
                    key={index}
                    id={message.id}
                    type={message.type}
                    content={message.content}
                    timestamp={message.timestamp}
                    isUser={message.isUser}
                    nodeId={message.nodeId}
                    appsTypes={message.appsTypes}
                    audioDuration={message.audioDuration}
                    onAppLaunch={handleAppLaunch}
                    onAudioPlay={handleAudioPlay}
                    showScale={index === 0}
                    scaleValue={scaleValue}
                    onScaleSelect={setScaleValue}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
          {showAppsLauncher && (
            <AppLauncher
              chosenApp={chosenApp}
              onClose={() => {
                void closeAppLauncher();
              }}
            />
          )}

          {shouldAutoLaunchApp && (
            <div className="mt-4 mx-4 rounded-lg border border-amber-400 bg-amber-100/70 p-4 text-amber-800">
              <strong>{m.conversation_highStressDetected()}</strong>{" "}
              {m.conversation_breathingAutoLaunch()}
            </div>
          )}
          {!showAppsLauncher && (
            <div
              className="flex-shrink-0 z-1000 flex flex-col w-full mx-auto bg-background border-t"
              style={{
                paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
              }}
            >
              <ChatInput onSendMessage={handleSendMessage} onVoiceInput={handleVoiceInput} />
            </div>
          )}
        </div>
        <AccessibilityToolbar
          open={accessibilityOpen}
          onClose={() => {
            setAccessibilityOpen(false);
          }}
        />
      </AppsProvider>
    </>
  );
}

export default App;
