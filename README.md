# Speed Learning App

An interactive science learning web application for 5th-grade students (2015 Korean curriculum) that teaches speed comparison through two engaging race games.

## Features

### 🎮 Two Game Modes

1. **100m Race (Fixed Distance)**
   - Measure time to travel 100 meters
   - Compare speeds by completion time
   - Each key press = 1 meter

2. **10-second Race (Fixed Time)**
   - Measure distance traveled in 10 seconds
   - Compare speeds by distance covered
   - Each key press = random distance (0.8m - 1.2m)

### 👨‍🏫 Admin/Teacher Features

- Create sessions with access codes
- Broadcast messages to all students
- View all student results
- Start games for all students simultaneously
- Reset student progress

### 👨‍🎓 Student Features

- Join sessions with access code
- Choose nickname
- Play interactive race games
- View results with speed calculations
- Learn speed formula: Speed = Distance ÷ Time

### 🛡️ Anti-Cheating

- Prevents key auto-repeat
- Requires key release before next press
- Minimum interval between key presses

## Getting Started

### Installation

```bash
cd speed-learning-app
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## How to Use

### For Teachers

1. Open the app and select "Teacher/Admin"
2. Click "Create New Session" to generate an access code
3. Share the access code with students
4. Wait for students to join
5. Select a game (100m Race or 10-second Race)
6. Click "Start Game" to begin for all students
7. View results in the Admin Panel

### For Students

1. Open the app and select "Student"
2. Enter the access code provided by the teacher
3. Optionally enter a nickname
4. Wait for the teacher to start a game
5. When the game starts, use your assigned key:
   - **Player 1**: `Q` key
   - **Player 2**: `Spacebar`
   - **Player 3**: `Right Arrow` key
6. Press your key repeatedly to run!
7. View your results and learn about speed calculation

## Technical Details

- **Framework**: React with Vite
- **State Management**: localStorage-based session management
- **Real-time Updates**: Polling mechanism (can be upgraded to WebSocket)
- **Keyboard Handling**: Custom anti-cheating key handler
- **Styling**: CSS with gradient backgrounds and animations

## Project Structure

```
speed-learning-app/
├── src/
│   ├── components/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── StudentLogin.jsx
│   │   ├── GameSelection.jsx
│   │   ├── Race100m.jsx
│   │   ├── Race10s.jsx
│   │   ├── Results.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── sessionManager.js
│   │   └── keyHandler.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Educational Goals

- Understand speed as distance divided by time
- Compare speeds using two different methods:
  - Fixed distance (time comparison)
  - Fixed time (distance comparison)
- Engage students with interactive gameplay
- Visualize speed concepts through racing

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

## License

This project is created for educational purposes.
