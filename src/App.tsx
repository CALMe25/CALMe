import React, { useState, useEffect, useRef, useContext } from 'react'
import './App.css'
import { ChatMessage } from "./chat_interface/ChatMessage";
import { ChatInput } from "./chat_interface/ChatInput";
import { ScrollArea } from "./chat_interface/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./chat_interface/ui/avatar";
import { Logo } from './assets/Logo';
import { Button } from "./chat_interface/ui/button";
import { MoreVertical, Settings, Accessibility } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AppsContext, AppsProvider, InnerApps, type AppInterface } from './appsContextApi';
import AppLauncer from './AppLauncher/AppLauncer';
import { ConversationController } from './conversation/ConversationController';
import { AlertTimer } from './components/AlertTimer';

interface Message {
  id: string;
  type: 'message' | 'app-buttons' | 'audio';
  content: string;
  timestamp: string;
  isUser: boolean;
  appsTypes?: 'activities' | 'games';
  audioDuration?: number;
  nodeId: string;
}

function App() {
  const [conversationController] = useState(() => new ConversationController());
  const [userInput, setUserInput] = useState('');
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

  const appsContext = useContext(AppsContext);
  const resolvedApps = appsContext ?? InnerApps;
  const quickActivityOrder = React.useMemo(
    () => ['breathing', 'stretching', 'matching-cards', 'sudoku', 'paint'] as const,
    []
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const ACTIVITY_PROMPT_NODES = React.useMemo(
    () => new Set(['activity_choice', 'activity_choice_clarify']),
    []
  );

  useEffect(() => {
    const initializeConversation = async () => {
      let retries = 0;
      while (!conversationController.isInitialized() && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      if (!conversationController.isInitialized()) {
        console.error('Controller initialization timeout');
      }
      try {
        const initialNode = conversationController.getCurrentNode();
        const activityPrompt = ACTIVITY_PROMPT_NODES.has(initialNode.id);
        setConversationHistory([{
          id: Date.now().toString(),
          type: activityPrompt ? 'app-buttons' : 'message',
          content: initialNode.content || "Hello! I'm here with you.",
          timestamp: new Date().toISOString(),
          isUser: false,
          nodeId: initialNode.id,
          appsTypes: activityPrompt ? 'activities' : undefined,
        }]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing conversation:', error);
        const fallbackId = 'start';
        const activityPrompt = ACTIVITY_PROMPT_NODES.has(fallbackId);
        setConversationHistory([{
          id: Date.now().toString(),
          type: activityPrompt ? 'app-buttons' : 'message',
          content: "Welcome to CALMe. I'm here to support you.",
          timestamp: new Date().toISOString(),
          isUser: false,
          nodeId: fallbackId,
          appsTypes: activityPrompt ? 'activities' : undefined,
        }]);
        setIsInitialized(true);
      }
    };
    initializeConversation();
  }, [conversationController]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversationHistory]);

  useEffect(() => {
    if (userInput !== '' && isInitialized) {
      processUserInput();
    }
  }, [userInput, isInitialized]);

  const processUserInput = () => {
    if (!userInput.trim()) return;

    try {
      const parserType = conversationController.getCurrentParserType();
      if (!parserType) {
        console.warn('No parser type specified for current node');
        return;
      }

      const stepResult = conversationController.runParser(parserType, userInput);
      const { nextNode, activityTrigger } = conversationController.processParserOutput(stepResult);

      const activityPrompt = ACTIVITY_PROMPT_NODES.has(nextNode.id);
      const newMessage: Message = {
        id: Date.now().toString(),
        type: activityPrompt ? 'app-buttons' : 'message',
        content: nextNode.content || "How can I help you?",
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: nextNode.id,
        appsTypes: activityPrompt ? 'activities' : undefined,
      };

      setConversationHistory(prev => [...prev, newMessage]);

      if (activityTrigger) {
        setActivityReturnNode(activityTrigger.returnNode);
        const targetApp = appsContext?.find((app) => app.name === activityTrigger.activityName);

        if (targetApp) {
          if (activityTrigger.activityName === 'breathing') {
            const transitionMsg: Message = {
              id: Date.now().toString() + '_transition',
              type: 'message',
              content: "You seem like you could use a moment to relax. Let's try some breathing exercises.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: nextNode.id
            };
            setConversationHistory(prev => [...prev, transitionMsg]);
          }

          setChosenApp(targetApp);
          setShouldAutoLaunchApp(true);
          const timer = setTimeout(() => {
            setShowAppsLauncher(true);
          }, 2000);
          setAppsTimeout(timer);
        } else if (!['breathing', 'stretching', 'matching-cards', 'sudoku', 'puzzle', 'paint'].includes(activityTrigger.activityName)) {
          const placeholderMsg: Message = {
            id: Date.now().toString() + '_placeholder',
            type: 'message',
            content: `Activity "${activityTrigger.activityName}" would be called, but is still in development.`,
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: nextNode.id
          };
          setConversationHistory(prev => [...prev, placeholderMsg]);

          setTimeout(() => {
            conversationController.moveToNode(activityTrigger.returnNode);
            const returnNode = conversationController.getCurrentNode();
            const continueMsg: Message = {
              id: Date.now().toString() + '_continue',
              type: 'message',
              content: returnNode.content || "Let's continue.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: returnNode.id
            };
            setConversationHistory(prev => [...prev, continueMsg]);
          }, 1500);
        } else {
          const mismatchMsg: Message = {
            id: Date.now().toString() + '_mismatch',
            type: 'message',
            content: `Starting ${activityTrigger.activityName} exercise...`,
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: nextNode.id
          };
          setConversationHistory(prev => [...prev, mismatchMsg]);
        }
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      const errorMsg: Message = {
        id: Date.now().toString() + '_error',
        type: 'message',
        content: "I didn't quite understand that. Could you rephrase?",
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: conversationController.getCurrentNode().id
      };
      setConversationHistory(prev => [...prev, errorMsg]);
    }

    setUserInput('');
  };

  const handleSendMessage = (e: string) => {
    if (!e.trim()) return; 
    const currentNode = conversationController.getCurrentNode();
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'message',
      content: e,
      timestamp: new Date().toISOString(),
      isUser: true,
      nodeId: currentNode.id
    };
    setConversationHistory(prev => [...prev, newMessage]);
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

    if (activityReturnNode) {
      try {
        conversationController.moveToNode(activityReturnNode);
        const returnNode = conversationController.getCurrentNode();

        const activityPrompt = ACTIVITY_PROMPT_NODES.has(returnNode.id);
        const returnMessage: Message = {
          id: Date.now().toString(),
          type: activityPrompt ? 'app-buttons' : 'message',
          content: returnNode.content || "Welcome back! How was that?",
          timestamp: new Date().toISOString(),
          isUser: false,
          nodeId: returnNode.id,
          appsTypes: activityPrompt ? 'activities' : undefined,
        };

        setConversationHistory(prev => [...prev, returnMessage]);
        setActivityReturnNode(null);
      } catch (error) {
        console.error('Error returning from activity:', error);
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
    if (shouldAutoLaunchApp){
      const breathingApp = appsContext?.find((subapps)=>(subapps.name==='breathing'));
      setChosenApp(breathingApp);
      setShowAppsLauncher(true);
    }
  }, [shouldAutoLaunchApp]);

  const handleAppLaunch = (appToLaunch: AppInterface | undefined) => {
    if (!appToLaunch) {
      return;
    }
    setChosenApp(appToLaunch)
    setShowAppsLauncher(true);
  };

  const handleAudioPlay = (_messageId: string) => {
    toast.success('Playing voice message...', {
      description: 'Audio: "I need to take a break and relax"',
    });
  };

  const handleVoiceInput = () => {
    toast.info('Voice input activated');
  };

  const handleAccessibility = () => {
    toast.info('Accessibility options');
  };

  const handleSettings = () => {
    toast.info('Opening settings');
  };

  const handleDemoAlert = () => {
    if (alertInterval) {
      clearInterval(alertInterval);
      setAlertInterval(null);
    }

    setShowAlertButton(false);
    setAlertTimer(180);

    setConversationHistory(prev => [
      ...prev,
      {
        id: `${Date.now()}_alert_start`,
        type: 'message',
        content: "We've entered alert mode. Stay sheltered—we'll get through the next few minutes together.",
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: 'alert_start'
      }
    ]);

    const interval = setInterval(() => {
      setAlertTimer(prev => {
        if (prev === null) {
          return prev;
        }
        if (prev <= 1) {
          clearInterval(interval);
          setAlertInterval(null);
          setShowAlertButton(true);
          setConversationHistory(prevHistory => [
            ...prevHistory,
            {
              id: `${Date.now()}_alert_clear`,
              type: 'message',
              content: "Look at that, we made it! It's safe to step out whenever you feel ready.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: 'alert_all_clear'
            }
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Conversation Complete</h2>
          <p className="text-gray-600 mb-4">Thank you for using CALMe. Take care!</p>
          <Button onClick={() => {
            conversationController.reset();
            const initialNode = conversationController.getCurrentNode();
            setConversationHistory([{
              id: Date.now().toString(),
              type: 'message',
              content: initialNode.content || "Hello! I'm here with you.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: initialNode.id
            }]);
          }}>
            Start New Conversation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppsProvider value={InnerApps}>
        <Toaster />
        <div 
        className="flex flex-col h-screen w-full mx-0 bg-background border-x border-border"
        >
        {!showAppsLauncher && (
        <header 
        className="flex-shrink-0 flex z-1000 items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
        >
          <div className="flex items-center gap-3">
            <Logo/>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-large">CALMe</h1>
              <AlertTimer timeRemaining={alertTimer} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showAlertButton && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDemoAlert}
                className="bg-red-600 hover:bg-red-700"
              >
                Demo - RED ALERT
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8" onClick={handleAccessibility}>
              <Accessibility className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8" onClick={handleSettings}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </header>
        )}

        {!showAppsLauncher &&
        <ScrollArea ref={scrollAreaRef} 
        className="flex-1 overflow-y-auto px-4"
        >
          <div className="space-y-4 pb-4 mt-2">
            {resolvedApps.length > 0 && (
              <div className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground">Quick Activities</h2>
                    <p className="text-xs text-muted-foreground/70">Launch an activity any time</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setShowQuickPanel((prev) => !prev)}
                    aria-label={showQuickPanel ? 'Hide quick activities' : 'Show quick activities'}
                  >
                    {showQuickPanel ? '−' : '+'}
                  </Button>
                </div>
                {showQuickPanel && (
                  <div className="grid grid-cols-2 gap-3">
                    {quickActivityOrder
                      .map(name => resolvedApps.find(app => app.name === name))
                      .filter((app): app is AppInterface => Boolean(app))
                      .map(app => (
                        <Button
                          key={app.name}
                          onClick={() => handleAppLaunch(app)}
                          className="flex h-auto flex-col items-center gap-2 rounded-xl border-0 bg-indigo-500/90 px-4 py-3 text-xs font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-500"
                          size="sm"
                        >
                          {app.icon}
                          <span className="leading-tight text-white">{app.label}</span>
                        </Button>
                      ))}
                  </div>
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
              />
            ))}
          </div>
        </ScrollArea>
        }
        
        {showAppsLauncher && (
        <AppLauncer chosenApp={chosenApp} onClose={closeAppLauncher} />
        )}

        {shouldAutoLaunchApp && (
            <div className="mt-4 mx-4 rounded-lg border border-amber-400 bg-amber-100/70 p-4 text-amber-800">
              <strong>High stress detected.</strong> A breathing exercise will launch automatically to help you calm down.
            </div>
          )}
        {!showAppsLauncher && (
        <div 
        className="fixed z-1000 bottom-0 flex flex-col w-full mx-auto bg-background border-t self-center"
        >
          <ChatInput
            onSendMessage={handleSendMessage}
            onVoiceInput={handleVoiceInput}
          />
        </div>
        )}
        </div>
        </AppsProvider>
    </>
  )
}

export default App
