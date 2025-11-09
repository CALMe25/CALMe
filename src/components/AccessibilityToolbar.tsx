import { useEffect } from 'react';

interface AccessibilityToolbarProps {
  open: boolean;
  onClose: () => void;
}

interface MicAccessToolConfig {
  link?: string;
  contact?: string;
  buttonPosition?: 'left' | 'right';
  forceLang?: string;
}

interface MicAccessToolInstance {
  openBox?: () => void;
  closeBox?: () => void;
}

declare global {
  interface Window {
    MicAccessTool?: new (config: MicAccessToolConfig) => MicAccessToolInstance;
    micAccessTool?: MicAccessToolInstance;
    MICTOOLBOXAPPSTATE?: {
      bodyClassList: Record<string, string>;
      fontSize: number;
      imagesTitle: boolean;
      keyboardRoot: boolean;
      initFontSize: boolean;
    };
  }
}

const SCRIPT_ID = 'calme-acc-toolbar-script';
const TOOLBAR_PATCH_FLAG = '__calmeToolbarPatched';
const FONT_SELECTOR = 'body,h1,h2,h3,h4,h5,h6,p,a,button,input,textarea,li,td,th,strong,span,blockquote,div';
const KEYBOARD_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,a,button,input,select,textarea';
const KEYBOARD_ATTR = 'data-calme-kb-tabindex';
const KEYBOARD_ORIGINAL_ATTR = 'data-calme-kb-original-tabindex';

const CONFIG: MicAccessToolConfig = {
  link: 'https://www.calme.org/accessibility',
  contact: 'mailto:accessibility@calme.org',
  buttonPosition: 'right',
  forceLang: typeof navigator !== 'undefined' ? navigator.language : 'en',
};

const ensureToolbarState = () => {
  window.MICTOOLBOXAPPSTATE =
    window.MICTOOLBOXAPPSTATE || {
      bodyClassList: {},
      fontSize: 1,
      imagesTitle: false,
      keyboardRoot: false,
      initFontSize: false,
    };
};

const clearInlineFonts = () => {
  document.querySelectorAll(FONT_SELECTOR).forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.fontSize = '';
    }
  });
};

const clearImagesTitles = () => {
  document.querySelectorAll('.mic-toolbox-images-titles').forEach(node => node.remove());
};

const clearKeyboardTabbing = () => {
  document.querySelectorAll(`[${KEYBOARD_ATTR}]`).forEach(node => {
    const element = node as HTMLElement;
    const original = element.getAttribute(KEYBOARD_ORIGINAL_ATTR);
    if (original && original !== '') {
      element.setAttribute('tabindex', original);
    } else {
      element.removeAttribute('tabindex');
    }
    element.removeAttribute(KEYBOARD_ATTR);
    element.removeAttribute(KEYBOARD_ORIGINAL_ATTR);
  });
};

const patchToolbarBehavior = () => {
  if ((window as any)[TOOLBAR_PATCH_FLAG]) {
    return;
  }
  const proto = window.MicAccessTool?.prototype;
  if (!proto) {
    return;
  }
  (window as any)[TOOLBAR_PATCH_FLAG] = true;

  proto.keyboardRootEnable = function keyboardRootEnablePatched(this: MicAccessToolInstance) {
    ensureToolbarState();
    const targets = document.querySelectorAll(KEYBOARD_SELECTOR);
    if (window.MICTOOLBOXAPPSTATE?.keyboardRoot) {
      targets.forEach((node, index) => {
        const element = node as HTMLElement;
        if (!element.hasAttribute(KEYBOARD_ATTR)) {
          const existing = element.getAttribute('tabindex');
          if (existing !== null) {
            element.setAttribute(KEYBOARD_ORIGINAL_ATTR, existing);
          } else {
            element.setAttribute(KEYBOARD_ORIGINAL_ATTR, '');
          }
        }
        element.setAttribute(KEYBOARD_ATTR, 'true');
        element.tabIndex = index + 1;
      });
    } else {
      clearKeyboardTabbing();
    }
  };

  proto.resetApp = function resetAppPatched(this: MicAccessToolInstance) {
    ensureToolbarState();
    Object.keys(window.MICTOOLBOXAPPSTATE!.bodyClassList).forEach(cls => {
      document.body.classList.remove(cls);
    });
    document
      .querySelectorAll('#mic-init-access-tool .vi-enabled')
      .forEach(button => button.classList.remove('vi-enabled'));
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
      localStorage.removeItem('MICTOOLBOXAPPSTATE');
    } catch (error) {
      console.warn('Unable to clear accessibility state', error);
    }
    if (typeof proto.updateState === 'function') {
      proto.updateState.call(this);
    }
  };
};

const loadToolbarScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.MicAccessTool) {
      resolve();
      return;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = '/vendor/acc_toolbar.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error('Failed to load accessibility toolbar script'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
  });

const createToolbarInstance = () => {
  if (window.micAccessTool) {
    return window.micAccessTool;
  }
  if (!window.MicAccessTool) {
    return null;
  }
  ensureToolbarState();
  patchToolbarBehavior();
  window.micAccessTool = new window.MicAccessTool(CONFIG);
  return window.micAccessTool;
};

export function AccessibilityToolbar({ open, onClose }: AccessibilityToolbarProps) {
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const initToolbar = async () => {
      try {
        await loadToolbarScript();
        if (cancelled) return;
        patchToolbarBehavior();
        const toolbar = createToolbarInstance();
        if (toolbar?.openBox) {
          toolbar.openBox();
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          onClose();
        }
      }
    };

    initToolbar();

    return () => {
      cancelled = true;
    };
  }, [open, onClose]);

  return null;
}
