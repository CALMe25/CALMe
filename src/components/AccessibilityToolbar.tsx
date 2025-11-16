import { useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { getLocale } from "../paraglide/runtime.js";
import { m } from "../paraglide/messages.js";

interface AccessibilityToolbarProps {
  open: boolean;
  onClose: () => void;
}

interface MicAccessToolConfig {
  link?: string;
  contact?: string;
  buttonPosition?: "left" | "right";
  forceLang?: string;
}

interface MicAccessToolInstance {
  openBox?: () => void;
  closeBox?: () => void;
  keyboardRootEnable?: () => void;
  resetApp?: () => void;
  updateState?: () => void;
}

type MicAccessToolConstructor = {
  new (config: MicAccessToolConfig): MicAccessToolInstance;
  prototype: MicAccessToolInstance;
};

declare global {
  interface Window {
    MicAccessTool?: MicAccessToolConstructor;
    micAccessTool?: MicAccessToolInstance;
    MICTOOLBOXAPPSTATE?: {
      bodyClassList: Record<string, string>;
      fontSize: number;
      imagesTitle: boolean;
      keyboardRoot: boolean;
      initFontSize: boolean;
    };
    __calmeToolbarPatched?: boolean;
  }
}

const SCRIPT_ID = "calme-acc-toolbar-script";
const TOOLBAR_PATCH_FLAG = "__calmeToolbarPatched";
const FONT_SELECTOR =
  "body,h1,h2,h3,h4,h5,h6,p,a,button,input,textarea,li,td,th,strong,span,blockquote,div";
const KEYBOARD_SELECTOR = "h1,h2,h3,h4,h5,h6,p,a,button,input,select,textarea";
const KEYBOARD_ATTR = "data-calme-kb-tabindex";
const KEYBOARD_ORIGINAL_ATTR = "data-calme-kb-original-tabindex";

function getConfigForLanguage(language: string): MicAccessToolConfig {
  // acc_toolbar expects full locale codes like "he-IL", "en-US"
  const localeMap: Record<string, string> = {
    he: "he-IL",
    en: "en-US",
  };

  return {
    link: "https://github.com/CALMe25/CALMe/blob/main/accessibility.md",
    contact: "https://github.com/CALMe25/CALMe/issues",
    buttonPosition: language === "he" ? "left" : "right",
    forceLang: localeMap[language] || language,
  };
}

const ensureToolbarState = () => {
  window.MICTOOLBOXAPPSTATE = window.MICTOOLBOXAPPSTATE || {
    bodyClassList: {},
    fontSize: 1,
    imagesTitle: false,
    keyboardRoot: false,
    initFontSize: false,
  };
};

const clearInlineFonts = () => {
  document.querySelectorAll(FONT_SELECTOR).forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.fontSize = "";
    }
  });
};

const clearImagesTitles = () => {
  document.querySelectorAll(".mic-toolbox-images-titles").forEach((node) => {
    node.remove();
  });
};

const clearKeyboardTabbing = () => {
  document.querySelectorAll(`[${KEYBOARD_ATTR}]`).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const element = node;
    const original = element.getAttribute(KEYBOARD_ORIGINAL_ATTR);
    if (original != null && original !== "") {
      element.setAttribute("tabindex", original);
    } else {
      element.removeAttribute("tabindex");
    }
    element.removeAttribute(KEYBOARD_ATTR);
    element.removeAttribute(KEYBOARD_ORIGINAL_ATTR);
  });
};

const patchToolbarBehavior = () => {
  if (window[TOOLBAR_PATCH_FLAG] === true) {
    return;
  }
  const MicAccessToolConstructor = window.MicAccessTool;
  if (MicAccessToolConstructor == null) {
    return;
  }
  const proto: MicAccessToolInstance = MicAccessToolConstructor.prototype;
  if (proto == null) {
    return;
  }
  window[TOOLBAR_PATCH_FLAG] = true;

  proto.keyboardRootEnable = function keyboardRootEnablePatched(
    this: MicAccessToolInstance,
  ) {
    ensureToolbarState();
    const targets = document.querySelectorAll(KEYBOARD_SELECTOR);
    if (window.MICTOOLBOXAPPSTATE?.keyboardRoot === true) {
      targets.forEach((node, index) => {
        if (!(node instanceof HTMLElement)) return;
        const element = node;
        if (!element.hasAttribute(KEYBOARD_ATTR)) {
          const existing = element.getAttribute("tabindex");
          if (existing !== null) {
            element.setAttribute(KEYBOARD_ORIGINAL_ATTR, existing);
          } else {
            element.setAttribute(KEYBOARD_ORIGINAL_ATTR, "");
          }
        }
        element.setAttribute(KEYBOARD_ATTR, "true");
        element.tabIndex = index + 1;
      });
    } else {
      clearKeyboardTabbing();
    }
  };

  proto.resetApp = function resetAppPatched(this: MicAccessToolInstance) {
    ensureToolbarState();
    if (window.MICTOOLBOXAPPSTATE != null) {
      Object.keys(window.MICTOOLBOXAPPSTATE.bodyClassList).forEach((cls) => {
        document.body.classList.remove(cls);
      });
    }
    document
      .querySelectorAll("#mic-init-access-tool .vi-enabled")
      .forEach((button) => {
        button.classList.remove("vi-enabled");
      });
    clearInlineFonts();
    clearImagesTitles();
    clearKeyboardTabbing();
    window.MICTOOLBOXAPPSTATE = {
      bodyClassList: {},
      fontSize: 1,
      imagesTitle: false,
      keyboardRoot: false,
      initFontSize: false,
    };
    try {
      localStorage.removeItem("MICTOOLBOXAPPSTATE");
    } catch (error) {
      console.warn("Unable to clear accessibility state", error);
    }
    if (typeof proto.updateState === "function") {
      proto.updateState.call(this);
    }
  };
};

const loadToolbarScript = async (): Promise<void> => {
  if (window.MicAccessTool) {
    return;
  }

  const foundScript = document.getElementById(SCRIPT_ID);
  let scriptElement: HTMLScriptElement;

  if (foundScript instanceof HTMLScriptElement) {
    scriptElement = foundScript;
    if (scriptElement.getAttribute("data-loaded") === "true") {
      return;
    }
    if (scriptElement.getAttribute("data-error") === "true") {
      throw new Error(
        `Failed to load accessibility toolbar script from ${scriptElement.src}. Please check if the file exists.`,
      );
    }
  } else {
    scriptElement = document.createElement("script");
    scriptElement.id = SCRIPT_ID;
    scriptElement.src = "/vendor/acc_toolbar.min.js";
    scriptElement.async = true;
    document.body.appendChild(scriptElement);
  }

  const scriptSrc = scriptElement.src;

  await new Promise<void>((resolve, reject) => {
    const handleLoad = () => {
      scriptElement.setAttribute("data-loaded", "true");
      resolve();
    };
    const handleError = () => {
      scriptElement.setAttribute("data-error", "true");
      reject(
        new Error(
          `Failed to load accessibility toolbar script from ${scriptSrc}. Please check if the file exists.`,
        ),
      );
    };

    scriptElement.addEventListener("load", handleLoad, { once: true });
    scriptElement.addEventListener("error", handleError, { once: true });
  });
};

const destroyToolbarInstance = () => {
  if (window.micAccessTool) {
    // Remove the toolbar DOM element
    const toolbarElement = document.getElementById("mic-init-access-tool");
    if (toolbarElement) {
      toolbarElement.remove();
    }
    // Clear the instance
    window.micAccessTool = undefined;
  }
};

const createToolbarInstance = (language: string, forceRecreate = false) => {
  // If language changed, destroy and recreate
  if (forceRecreate && window.micAccessTool) {
    destroyToolbarInstance();
  }

  if (window.micAccessTool) {
    return window.micAccessTool;
  }
  if (!window.MicAccessTool) {
    return null;
  }
  ensureToolbarState();
  patchToolbarBehavior();
  const config = getConfigForLanguage(language);
  window.micAccessTool = new window.MicAccessTool(config);
  return window.micAccessTool;
};

export function AccessibilityToolbar({
  open,
  onClose,
}: AccessibilityToolbarProps) {
  const { currentLocale } = useLanguage();

  // Destroy and recreate toolbar when language changes
  useEffect(() => {
    if (window.micAccessTool && window.MicAccessTool) {
      // Language changed, recreate toolbar
      destroyToolbarInstance();
      createToolbarInstance(getLocale(), true);
    }
  }, [currentLocale]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const initToolbar = async () => {
      try {
        await loadToolbarScript();
        if (cancelled) return;
        // Force recreate to ensure correct language
        const toolbar = createToolbarInstance(getLocale(), true);
        if (toolbar?.openBox) {
          toolbar.openBox();
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast.error(m.toast_accessibilityToolbarFailed(), {
            description: m.toast_accessibilityToolbarFailedDescription(),
          });
        }
      } finally {
        if (!cancelled) {
          onClose();
        }
      }
    };

    void initToolbar();

    return () => {
      cancelled = true;
    };
  }, [open, onClose, currentLocale]);

  return null;
}
