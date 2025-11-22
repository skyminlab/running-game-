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
    const sessionData = {
      code: accessCode,
      createdAt: Date.now(),
      students: [],
      gameState: null,
      broadcastMessage: null,
      lastUpdate: Date.now()
    };
    localStorage.setItem(`${STORAGE_KEYS.TEACHER_DATA}_${accessCode}`, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.SESSION_CODE, accessCode);
    this.syncSession(accessCode);
    return sessionData;
  },

  // Get session data
  getSession(accessCode) {
    const data = localStorage.getItem(`${STORAGE_KEYS.TEACHER_DATA}_${accessCode}`);
    return data ? JSON.parse(data) : null;
  },

  // Update session
  updateSession(accessCode, updates) {
    const session = this.getSession(accessCode);
    if (session) {
      Object.assign(session, updates, { lastUpdate: Date.now() });
      localStorage.setItem(`${STORAGE_KEYS.TEACHER_DATA}_${accessCode}`, JSON.stringify(session));
      this.syncSession(accessCode);
    }
  },

  // Sync session (trigger storage event for other tabs)
  syncSession(accessCode) {
    localStorage.setItem(`${STORAGE_KEYS.TEACHER_DATA}_sync_${accessCode}`, Date.now().toString());
  },

  // Add student to session
  addStudent(accessCode, studentId, studentData) {
    const session = this.getSession(accessCode);
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
      
      this.updateSession(accessCode, { students: session.students });
    }
  },

  // Get students in session
  getStudents(accessCode) {
    const session = this.getSession(accessCode);
    return session ? session.students : [];
  },

  // Remove student from session
  removeStudent(accessCode, studentId) {
    const session = this.getSession(accessCode);
    if (session) {
      session.students = session.students.filter(s => s.id !== studentId);
      this.updateSession(accessCode, { students: session.students });
    }
  },

  // Save student result
  saveStudentResult(accessCode, studentId, gameType, result) {
    const session = this.getSession(accessCode);
    if (session) {
      const student = session.students.find(s => s.id === studentId);
      if (student) {
        if (!student.results) student.results = {};
        student.results[gameType] = result;
        student.lastUpdate = Date.now();
        this.updateSession(accessCode, { students: session.students });
      }
    }
  },

  // Get all student results
  getAllResults(accessCode) {
    const session = this.getSession(accessCode);
    if (!session) return [];
    
    return session.students.map(student => ({
      id: student.id,
      name: student.name,
      results: student.results || {}
    }));
  },

  // Broadcast message to all students
  broadcastMessage(accessCode, message) {
    this.updateSession(accessCode, { broadcastMessage: { text: message, timestamp: Date.now() } });
  },

  // Get broadcast message
  getBroadcastMessage(accessCode) {
    const session = this.getSession(accessCode);
    return session?.broadcastMessage || null;
  },

  // Set game state
  setGameState(accessCode, gameState) {
    this.updateSession(accessCode, { gameState });
  },

  // Get game state
  getGameState(accessCode) {
    const session = this.getSession(accessCode);
    return session?.gameState || null;
  },

  // Delete session
  deleteSession(accessCode) {
    localStorage.removeItem(`${STORAGE_KEYS.TEACHER_DATA}_${accessCode}`);
    localStorage.removeItem(`${STORAGE_KEYS.TEACHER_DATA}_sync_${accessCode}`);
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
export function pollSession(accessCode, callback, interval = 500) {
  let lastSync = 0;
  const poll = setInterval(() => {
    const syncKey = `${STORAGE_KEYS.TEACHER_DATA}_sync_${accessCode}`;
    const syncTime = localStorage.getItem(syncKey);
    const currentSync = syncTime ? parseInt(syncTime) : 0;
    
    if (currentSync > lastSync) {
      lastSync = currentSync;
      if (callback) callback();
    }
  }, interval);
  
  return poll;
}

