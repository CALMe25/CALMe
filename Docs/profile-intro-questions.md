# CALMe Emergency App - Onboarding & Alert System

## 🚨 CRITICAL PERMISSIONS REQUIRED (Must be first)

### Permission Sequence - NO BYPASS ALLOWED

#### 1. Override Do Not Disturb Permission
**Why Critical:** "During emergencies, CALMe needs to reach you even when your phone is on silent or Do Not Disturb mode."

**Technical:** `NotificationManager.Policy.INTERRUPTION_FILTER_ALARMS`

**User Dialog:**
- **English:** "CALMe needs permission to override 'Do Not Disturb' during red alerts. This ensures you receive life-saving guidance even when your phone is silenced."
- **Hebrew:** "CALMe זקוק להרשאה לעקוף 'נא לא להפריע' במהלך אזעקות אדומות. זה מבטיח שתקבלו הדרכה מצילת חיים גם כשהטלפון מושתק."
- **Arabic:** "يحتاج CALMe إلى إذن لتجاوز 'عدم الإزعاج' أثناء الإنذارات الحمراء. هذا يضمن حصولك على إرشادات منقذة للحياة حتى عندما يكون هاتفك صامتًا."

#### 2. Home Front Command Integration
**Why Critical:** "CALMe monitors Home Front Command alerts and needs access to coordinate with official emergency systems."

**Technical:** Deep linking to `com.amdocs.homefrontcommand` and alert broadcast receivers

**User Dialog:** "CALMe works with Home Front Command to provide coordinated emergency response. We need access to official alert data to time our response correctly."

#### 3. System Audio Control
**Why Critical:** "Once you're in your safe space, CALMe can silence repetitive alert sounds and provide calming audio guidance."

**Technical:** `AudioManager.STREAM_ALARM`, `AudioManager.STREAM_NOTIFICATION`

**User Dialog:** "CALMe needs to control system audio to silence alert sounds once you're safe and provide breathing guidance audio."

#### 4. Background Priority & Auto-Launch
**Why Critical:** "CALMe must launch automatically 1.5 minutes after red alert and stay active during emergencies."

**Technical:** `SYSTEM_ALERT_WINDOW`, `RECEIVE_BOOT_COMPLETED`, foreground service

**User Dialog:** "CALMe needs high priority access to auto-launch during alerts and remain active even if other apps are running."

#### 5. Location Services (Emergency Only)
**Why Critical:** "Verify you're in your designated safe zone and provide location-specific guidance."

**Technical:** `ACCESS_FINE_LOCATION` with emergency-only usage

**User Dialog:** "CALMe uses location only during active alerts to confirm you've reached your safe space and provide area-specific guidance."

---

## 🔴 EMERGENCY ALERT HANDLING PROTOCOL

### Alert Detection & Response Timeline

```
T+0:00  🚨 Red Alert Detected (Home Front Command)
T+0:03  📱 CALMe receives broadcast
T+0:05  ⏰ 1.5-minute countdown begins
T+0:10  🔊 Brief audio: "[Name], red alert - get to safety now"
T+1:30  🚀 CALMe AUTO-LAUNCHES (full screen)
T+1:31  🎯 Audio: "Are you in your safe space?"
T+1:35  👤 User confirms location
T+1:36  🔇 Other alert apps silenced (if user is safe)
T+1:37  🫁 Begin calming protocol
```

### Safe Space Confirmation Dialog

**Critical Questions (30 seconds max):**

1. **"Are you in your [safe space type]?"**
   - Yes → Silence other alerts, begin calming
   - No → "Keep moving to safety, I'll guide you"
   - Can't reach → Emergency protocol escalation

2. **If NOT in safe space:**
   - Continue alert sounds from other apps
   - Provide directional guidance
   - Countdown to expected shelter time
   - "You have [X] seconds, keep moving to [location]"

3. **If IN safe space:**
   - "Great, you're safe. I'm silencing other alerts now."
   - Override other emergency app notifications
   - Begin breathing/calming protocol
   - Monitor for "All Clear" signal

---

## 📋 EMERGENCY-FOCUSED ONBOARDING QUESTIONS

### 1. Identity (Quick - 10 seconds max)
**"What should I call you during emergencies?"**
- Voice recognition trained on their name
- Emergency contacts access (optional)

### 2. Critical Location Information
**"Where is your designated safe space?"**

**Enhanced Options:**
- 🏢 **Public Miklat:** 
  - Address/building name
  - Floor level
  - Approximate capacity
  - Backup location if full
  
- 🏠 **Private Mamad:**
  - Room location in home
  - Access method (key, code)
  - Backup plan if locked
  
- 🚪 **Stairway:**
  - Which building
  - Which floor range (safest level)
  - Alternative if crowded
  
- 📍 **Other Location:**
  - Exact description
  - Landmarks nearby
  - Why this location is safe

**CRITICAL FOLLOW-UP:**
- "How long does it take you to reach this location?"
- "What's your backup if this location is unavailable?"
- "Are there any obstacles that might slow you down?"

### 3. Emergency Accessibility Needs
**"During emergencies, do you need any special assistance?"**

- 🦽 **Mobility:** "I need extra time/assistance to reach safety"
- 👂 **Hearing:** "I need visual alerts and vibration"
- 👁️ **Vision:** "I need audio-only guidance and high contrast"
- 🧠 **Cognitive:** "I need simple, repeated instructions"
- 💊 **Medical:** "I need medication reminders during stress"
- 👥 **Dependent Care:** "I'm responsible for children/elderly/pets"

### 4. Stress Response & Calming Preferences
**"What helps you stay calm when you're scared or stressed?"**

Emergency-optimized options:
- 🫁 **Breathing:** "Guided breathing exercises with countdown"
- 🎵 **Audio:** "Calming music or nature sounds"
- 🗣️ **Voice:** "Someone talking me through it"
- 🔢 **Focus Tasks:** "Counting, simple math, word games"
- 🤲 **Physical:** "Hand exercises, safe movement"
- 📖 **Information:** "Knowing what's happening and when it will end"

### 5. Communication Preferences During Crisis
**"How do you want me to communicate with you during an emergency?"**

- 🔊 **Audio Priority:** Clear, calm voice instructions
- 📱 **Visual Priority:** Large text, simple graphics
- 🔄 **Mixed Mode:** Audio + visual reinforcement
- 🤫 **Quiet Mode:** Vibration + minimal audio (for hiding situations)

### 6. Family/Contact Integration
**"Should I contact anyone once you're safe?"**

- Emergency contacts
- Family notification preferences
- Group coordination (if multiple people use app)

---

## 🔄 EMERGENCY PROFILE VALIDATION

### Pre-Emergency Test Protocol
**"Let's test your emergency setup:"**

1. **Simulate alert sound** (low volume)
2. **Time walk to safe space** (if user wants to)
3. **Test audio guidance** in safe space
4. **Verify all systems working**
5. **Practice calming exercises**

### Profile Confirmation Script:

**"[Name], here's your emergency profile:
- 🏠 Safe space: [location] ([time] to reach)
- ♿ Accessibility: [needs]
- 🫁 Calming method: [preference]  
- 🗣️ Language: [language]
- 📞 Emergency contacts: [if any]

🚨 **EMERGENCY PROTOCOL READY:**
- I'll auto-launch 1.5 minutes after red alert
- I'll guide you to [safe space]
- Once you're safe, I'll silence other alerts
- I'll help you stay calm until 'All Clear'

Does this sound right? This setup could save your life."**

---

## 🔧 TECHNICAL IMPLEMENTATION REQUIREMENTS

### Critical System Integrations:
1. **Home Front Command API** - Real alert data
2. **Emergency Broadcast System** - Government alerts
3. **Audio System Control** - Silence/override capabilities  
4. **Location Services** - Safe zone verification
5. **Notification Management** - DND override
6. **Background Processing** - Always-ready state

### Failsafe Requirements:
- **Offline functionality** during network issues
- **Battery optimization** for extended use
- **Memory priority** during system stress
- **Hardware button integration** for accessibility
- **Multi-language TTS** that works offline

### Security & Privacy:
- **Local data storage** - No cloud dependency during emergencies
- **Encrypted profiles** - Protect personal information
- **Emergency-only location** - Not tracked during normal use
- **Audit trail** - For post-emergency analysis

This system prioritizes **life safety first**, then comfort and calming support.