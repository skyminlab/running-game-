// Session management using localStorage for simplicity
// In production, this would use a backend with WebSocket

const STORAGE_KEYS = {
  SESSION_CODE: 'speedRace_sessionCode',
  TEACHER_DATA: 'speedRace_teacherData',
  STUDENT_DATA: 'speedRace_studentData',
  CURRENT_USER: 'speedRace_currentUser'
};

// Generate a random access code
export function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Session Manager
export const SessionManager = {
  // Create a new session (Admin)
  createSession(accessCode) {
    // Normalize access code to uppercase
    const code = accessCode.trim().toUpperCase();
    const sessionData = {
      code: code,
      createdAt: Date.now(),
      students: [],
      gameState: null,
      broadcastMessage: null,
      lastUpdate: Date.now()
    };
    const storageKey = `${STORAGE_KEYS.TEACHER_DATA}_${code}`;
    
    try {
      // Save with retry mechanism
      let saved = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(sessionData));
          localStorage.setItem(STORAGE_KEYS.SESSION_CODE, code);
          
          // Verify it was saved immediately
          const verify = localStorage.getItem(storageKey);
          if (verify) {
            // Double check by parsing
            const parsed = JSON.parse(verify);
            if (parsed.code === code) {
              saved = true;
              break;
            }
          }
        } catch (e) {
          console.warn(`Save attempt ${attempt + 1} failed:`, e);
          if (attempt < 2) {
            // Wait a bit before retry
            const start = Date.now();
            while (Date.now() - start < 50) {} // 50ms delay
          }
        }
      }
      
      if (!saved) {
        console.error('Failed to save session to localStorage after 3 attempts');
        throw new Error('localStorage save failed');
      }
      
      // Force sync multiple times to ensure visibility
      this.syncSession(code);
      setTimeout(() => this.syncSession(code), 100);
      setTimeout(() => this.syncSession(code), 300);
      
      console.log('✅ Session created:', code, 'Key:', storageKey);
      console.log('   Verified:', localStorage.getItem(storageKey) ? 'YES' : 'NO');
      
      return sessionData;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      // Check if localStorage is available
      if (typeof Storage === 'undefined') {
        alert('localStorage를 사용할 수 없습니다. 브라우저 설정을 확인해주세요.');
      } else if (error.name === 'QuotaExceededError') {
        alert('저장 공간이 부족합니다. 브라우저 캐시를 정리해주세요.');
      } else {
        alert('세션 저장에 실패했습니다. 브라우저 콘솔을 확인해주세요.');
      }
      throw error;
    }
  },

  // Get session data - with multiple fallback strategies
  getSession(accessCode) {
    if (!accessCode) {
      console.warn('getSession called with empty accessCode');
      return null;
    }
    const code = accessCode.trim().toUpperCase();
    const storageKey = `${STORAGE_KEYS.TEACHER_DATA}_${code}`;
    
    try {
      // Strategy 1: Direct lookup
      let data = localStorage.getItem(storageKey);
      
      // Strategy 2: Try with different case variations
      if (!data) {
        const variations = [
          storageKey.toLowerCase(),
          `${STORAGE_KEYS.TEACHER_DATA}_${code.toLowerCase()}`,
          `${STORAGE_KEYS.TEACHER_DATA}_${accessCode.trim()}` // Original case
        ];
        
        for (const variant of variations) {
          data = localStorage.getItem(variant);
          if (data) {
            console.log('✅ Found session with variant key:', variant);
            break;
          }
        }
      }
      
      // Strategy 3: Search all sessions
      if (!data) {
        const found = this.findSessionByCode(code);
        if (found) {
          console.log('✅ Found session by searching all keys');
          return found;
        }
      }
      
      if (!data) {
        // Debug: List all session keys
        console.warn('❌ Session not found for code:', code);
        console.warn('   Looking for key:', storageKey);
        this.debugListAllSessions();
        return null;
      }
      
      const parsed = JSON.parse(data);
      console.log('✅ Session found:', code);
      return parsed;
    } catch (error) {
      console.error('❌ Error parsing session data:', error);
      return null;
    }
  },
  
  // Debug: List all sessions in localStorage
  debugListAllSessions() {
    console.log('🔍 Debugging: Listing all localStorage keys...');
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(STORAGE_KEYS.TEACHER_DATA)) {
        allKeys.push(key);
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          console.log(`   Found session key: ${key}, code: ${parsed.code}`);
        } catch (e) {
          console.log(`   Found key (not JSON): ${key}`);
        }
      }
    }
    if (allKeys.length === 0) {
      console.warn('   No session keys found in localStorage');
    }
    return allKeys;
  },
  
  // Find session by code (case-insensitive search)
  findSessionByCode(searchCode) {
    if (!searchCode) return null;
    const normalizedSearch = searchCode.trim().toUpperCase();
    
    // First try direct lookup
    let session = this.getSession(normalizedSearch);
    if (session) return session;
    
    // If not found, search all keys
    console.log('🔍 Searching all sessions for code:', normalizedSearch);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.TEACHER_DATA + '_')) {
        try {
          const value = localStorage.getItem(key);
          const parsed = JSON.parse(value);
          if (parsed.code && parsed.code.toUpperCase() === normalizedSearch) {
            console.log('✅ Found session by searching:', key);
            return parsed;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
    return null;
  },

  // Update session
  updateSession(accessCode, updates) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return;
    
    const session = this.getSession(code);
    if (session) {
      Object.assign(session, updates, { lastUpdate: Date.now() });
      localStorage.setItem(`${STORAGE_KEYS.TEACHER_DATA}_${code}`, JSON.stringify(session));
      // Always sync after update
      this.syncSession(code);
    }
  },

  // Sync session (trigger storage event for other tabs and custom event for same tab)
  syncSession(accessCode) {
    if (!accessCode) return;
    const code = accessCode.trim().toUpperCase();
    const syncKey = `${STORAGE_KEYS.TEACHER_DATA}_sync_${code}`;
    const syncValue = Date.now().toString();
    localStorage.setItem(syncKey, syncValue);
    
    // Trigger custom event for same-tab listeners
    window.dispatchEvent(new CustomEvent('sessionUpdate', {
      detail: { accessCode: code, syncKey, syncValue }
    }));
  },

  // Add student to session
  addStudent(accessCode, studentId, studentData) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return;
    
    const session = this.getSession(code);
    if (session) {
      const existingIndex = session.students.findIndex(s => s.id === studentId);
      const student = {
        id: studentId,
        name: studentData.name || `Student ${studentId.slice(-4)}`,
        position: studentData.position || null,
        connectedAt: Date.now(),
        lastUpdate: Date.now(),
        ...studentData
      };
      
      if (existingIndex >= 0) {
        session.students[existingIndex] = student;
      } else {
        session.students.push(student);
      }
      
      this.updateSession(code, { students: session.students });
    }
  },

  // Get students in session
  getStudents(accessCode) {
    const session = this.getSession(accessCode);
    return session ? session.students : [];
  },

  // Remove student from session
  removeStudent(accessCode, studentId) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return;
    
    const session = this.getSession(code);
    if (session) {
      session.students = session.students.filter(s => s.id !== studentId);
      this.updateSession(code, { students: session.students });
      this.syncSession(code);
    }
  },
  
  // Clear all students from session
  clearAllStudents(accessCode) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return;
    
    const session = this.getSession(code);
    if (session) {
      session.students = [];
      this.updateSession(code, { students: [] });
      this.syncSession(code);
    }
  },

  // Save student result
  saveStudentResult(accessCode, studentId, gameType, result) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return;
    
    const session = this.getSession(code);
    if (session) {
      const student = session.students.find(s => s.id === studentId);
      if (student) {
        if (!student.results) student.results = {};
        student.results[gameType] = result;
        student.lastUpdate = Date.now();
        this.updateSession(code, { students: session.students });
      }
    }
  },

  // Get all student results
  getAllResults(accessCode) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return [];
    
    const session = this.getSession(code);
    if (!session) return [];
    
    return session.students.map(student => ({
      id: student.id,
      name: student.name,
      results: student.results || {}
    }));
  },

  // Broadcast message to all students
  broadcastMessage(accessCode, message) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return;
    
    this.updateSession(code, { broadcastMessage: { text: message, timestamp: Date.now() } });
    this.syncSession(code); // Extra sync for important updates
  },

  // Get broadcast message
  getBroadcastMessage(accessCode) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return null;
    
    const session = this.getSession(code);
    return session?.broadcastMessage || null;
  },

  // Set game state
  setGameState(accessCode, gameState) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return;
    
    this.updateSession(code, { gameState });
    this.syncSession(code); // Extra sync for important updates
  },

  // Get game state
  getGameState(accessCode) {
    const code = accessCode ? accessCode.trim().toUpperCase() : null;
    if (!code) return null;
    
    const session = this.getSession(code);
    return session?.gameState || null;
  },

  // Delete session
  deleteSession(accessCode) {
    if (!accessCode) return;
    const code = accessCode.trim().toUpperCase();
    localStorage.removeItem(`${STORAGE_KEYS.TEACHER_DATA}_${code}`);
    localStorage.removeItem(`${STORAGE_KEYS.TEACHER_DATA}_sync_${code}`);
  }
};

// Student ID generator
export function generateStudentId() {
  return 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Save current user
export function saveCurrentUser(userData) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
}

// Get current user
export function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

// Clear current user
export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Poll for session updates (for real-time sync)
export function pollSession(accessCode, callback, interval = 300) {
  if (!accessCode) return () => {};
  
  const code = accessCode.trim().toUpperCase();
  let lastSync = 0;
  let lastDataHash = '';
  
  // Listen for custom events (same tab)
  const handleCustomEvent = (e) => {
    if (e.detail && e.detail.accessCode === code) {
      if (callback) callback();
    }
  };
  window.addEventListener('sessionUpdate', handleCustomEvent);
  
  // Poll for changes
  const poll = setInterval(() => {
    const syncKey = `${STORAGE_KEYS.TEACHER_DATA}_sync_${code}`;
    const syncTime = localStorage.getItem(syncKey);
    const currentSync = syncTime ? parseInt(syncTime) : 0;
    
    // Also check if session data itself changed
    const session = SessionManager.getSession(code);
    const currentDataHash = session ? JSON.stringify(session) : '';
    
    if (currentSync > lastSync || currentDataHash !== lastDataHash) {
      lastSync = currentSync;
      lastDataHash = currentDataHash;
      if (callback) callback();
    }
  }, interval);
  
  // Return cleanup function
  return () => {
    clearInterval(poll);
    window.removeEventListener('sessionUpdate', handleCustomEvent);
  };
}

