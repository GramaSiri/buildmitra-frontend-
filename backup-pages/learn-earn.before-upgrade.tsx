import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography,
  Tabs, Tab, Box, Container, IconButton, Badge, Card, CardContent,
  LinearProgress, Alert, Snackbar, CircularProgress, RadioGroup,
  FormControlLabel, Radio, Button, Grid, Chip, Divider,
  List, ListItem, ListItemText, ListItemIcon, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Accordion,
  AccordionSummary, AccordionDetails, Fade, Zoom,
  Fab, useTheme, useMediaQuery,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Quiz as QuizIcon, School as SchoolIcon, Games as GamesIcon,
  Gavel as GavelIcon, EmojiEvents as EmojiEventsIcon,
  Notifications as NotificationsIcon, PlayCircle as PlayCircleIcon,
  MenuBook as MenuBookIcon, NewReleases as NewReleasesIcon,
  Download as DownloadIcon, Architecture as ArchitectureIcon,
  Home as HomeIcon, Palette as PaletteIcon, Brush as BrushIcon,
  ExpandMore as ExpandMoreIcon, Apartment as ApartmentIcon,
  LocationCity as LocationCityIcon, GetApp as GetAppIcon,
  Star as StarIcon, ThreeDRotation as ThreeDRotationIcon,
  DragHandle as DragHandleIcon, Straighten as StraightenIcon,
  Podcasts as PodcastsIcon,
  Agriculture as AgricultureIcon,
  SettingsEthernet as SettingsEthernetIcon, Dashboard as DashboardIcon,
  Window as WindowIcon,
  AddCircle as AddCircleIcon, Close as CloseIcon,
  ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon,
  Chair as InteriorIcon
} from '@mui/icons-material';

// ============= THEME =============
const premiumTheme = createTheme({
  palette: {
    primary: { 
      main: '#1a237e',
      light: '#283593',
      dark: '#0d1445'
    },
    secondary: { 
      main: '#ff6f00',
      light: '#ff8f00',
      dark: '#e65100'
    },
    success: { main: '#00c853' },
    info: { main: '#0091ea' },
    warning: { main: '#ff9100' },
    error: { main: '#d50000' },
    background: {
      default: '#f8f9fe',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            transform: 'translateY(-4px)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 64,
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #1a237e, #283593)',
            color: 'white',
            '& .MuiTab-iconWrapper': {
              color: 'white'
            }
          }
        }
      }
    }
  }
});

// ============= CONTEXTS =============
const QuizContext = createContext();
const LeaderboardContext = createContext();
const CertificateContext = createContext();

// ============= QUIZ PROVIDER =============
const QuizProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(20).fill(null));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const sampleQuestions = [
    {
      id: 1,
      question: "What is the standard depth of foundation for a residential building?",
      options: ["1.5 ft", "3 ft", "5 ft", "7 ft"],
      correctAnswer: 1,
      category: "Foundation"
    },
    {
      id: 2,
      question: "Which material is most commonly used for plumbing pipes in modern construction?",
      options: ["Cast Iron", "PVC", "Copper", "Galvanized Iron"],
      correctAnswer: 1,
      category: "Plumbing"
    },
    {
      id: 3,
      question: "What is the minimum curing period for concrete?",
      options: ["3 days", "7 days", "14 days", "28 days"],
      correctAnswer: 1,
      category: "Concrete"
    },
    {
      id: 4,
      question: "What is the standard size of a modular brick?",
      options: ["190mm x 90mm x 90mm", "200mm x 100mm x 100mm", "180mm x 80mm x 80mm", "210mm x 110mm x 110mm"],
      correctAnswer: 0,
      category: "Materials"
    },
    {
      id: 5,
      question: "What is the purpose of a damp proof course (DPC)?",
      options: ["To prevent sound transmission", "To prevent moisture rising", "To provide thermal insulation", "To strengthen the wall"],
      correctAnswer: 1,
      category: "Construction"
    },
    {
      id: 6,
      question: "Which type of foundation is best for clayey soil?",
      options: ["Raft foundation", "Pile foundation", "Strip foundation", "Isolated footing"],
      correctAnswer: 0,
      category: "Foundation"
    },
    {
      id: 7,
      question: "What is the recommended water-cement ratio for high-quality concrete?",
      options: ["0.3", "0.45", "0.6", "0.75"],
      correctAnswer: 1,
      category: "Concrete"
    },
    {
      id: 8,
      question: "What does RERA stand for in Indian real estate?",
      options: ["Real Estate Regulation Authority", "Real Estate Regulatory Act", "Real Estate Revenue Authority", "Regional Estate Regulation Act"],
      correctAnswer: 1,
      category: "Regulations"
    },
    {
      id: 9,
      question: "What is the standard height of a ceiling in residential buildings?",
      options: ["8 ft", "10 ft", "12 ft", "14 ft"],
      correctAnswer: 1,
      category: "Design"
    },
    {
      id: 10,
      question: "Which type of roof is best for hot and humid climates?",
      options: ["Flat roof", "Sloped roof", "Green roof", "Metal roof"],
      correctAnswer: 1,
      category: "Roofing"
    },
    {
      id: 11,
      question: "What is the minimum thickness of a load-bearing wall?",
      options: ["4 inches", "6 inches", "9 inches", "12 inches"],
      correctAnswer: 2,
      category: "Structural"
    },
    {
      id: 12,
      question: "Which test is used to measure the compressive strength of concrete?",
      options: ["Tensile test", "Flexural test", "Compression test", "Impact test"],
      correctAnswer: 2,
      category: "Testing"
    },
    {
      id: 13,
      question: "What is the standard slope for drainage pipes?",
      options: ["1:100", "1:50", "1:200", "1:25"],
      correctAnswer: 0,
      category: "Plumbing"
    },
    {
      id: 14,
      question: "Which material is best for thermal insulation in walls?",
      options: ["Brick", "Concrete", "Glass wool", "Steel"],
      correctAnswer: 2,
      category: "Materials"
    },
    {
      id: 15,
      question: "What is the purpose of a lintel in construction?",
      options: ["To support wall above openings", "To provide foundation", "To act as a column", "To serve as a beam"],
      correctAnswer: 0,
      category: "Structural"
    },
    {
      id: 16,
      question: "Which type of cement is best for marine construction?",
      options: ["Ordinary Portland Cement", "Sulphate Resisting Cement", "Rapid Hardening Cement", "Low Heat Cement"],
      correctAnswer: 1,
      category: "Materials"
    },
    {
      id: 17,
      question: "What is the standard spacing for reinforcement bars in a slab?",
      options: ["100mm", "150mm", "200mm", "250mm"],
      correctAnswer: 1,
      category: "Structural"
    },
    {
      id: 18,
      question: "Which factor affects the workability of concrete the most?",
      options: ["Water content", "Cement content", "Aggregate size", "Temperature"],
      correctAnswer: 0,
      category: "Concrete"
    },
    {
      id: 19,
      question: "What is the life expectancy of a well-maintained plumbing system?",
      options: ["10-15 years", "20-30 years", "40-50 years", "60-70 years"],
      correctAnswer: 2,
      category: "Plumbing"
    },
    {
      id: 20,
      question: "Which is the most earthquake-resistant building structure?",
      options: ["Masonry structure", "Steel frame structure", "Concrete frame structure", "Timber structure"],
      correctAnswer: 1,
      category: "Structural"
    }
  ];

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 20));
      setAnswers(Array(20).fill(null));
      setCurrentQuestionIndex(0);
      setQuizCompleted(false);
      setScore(0);
      setShowLeaderboard(false);
    } catch (err) {
      setError('Failed to fetch quiz questions');
    } finally {
      setIsLoading(false);
    }
  };

  const setAnswer = (index, answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    try {
      setIsLoading(true);
      const correctAnswers = answers.filter((ans, idx) => ans === questions[idx]?.correctAnswer);
      const score = Math.round((correctAnswers.length / questions.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
      setQuizCompleted(true);
      setScore(score);
      setShowLeaderboard(true);
      return { score, correct: correctAnswers.length };
    } catch (err) {
      setError('Failed to submit quiz');
      return { score: 0, correct: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <QuizContext.Provider value={{
      questions, currentQuestionIndex, answers, setAnswer,
      submitQuiz, fetchQuestions, isLoading, error,
      quizCompleted, score, showLeaderboard, setShowLeaderboard
    }}>
      {children}
    </QuizContext.Provider>
  );
};

// ============= LEADERBOARD PROVIDER =============
const LeaderboardProvider = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, userName: 'Rajesh Kumar', score: 100, date: '2026-06-28', certificateId: 'CERT001' },
    { id: 2, userName: 'Priya Sharma', score: 95, date: '2026-06-27', certificateId: 'CERT002' },
    { id: 3, userName: 'Amit Singh', score: 90, date: '2026-06-26', certificateId: null },
    { id: 4, userName: 'Sneha Patel', score: 85, date: '2026-06-25', certificateId: null },
    { id: 5, userName: 'Vikram Reddy', score: 80, date: '2026-06-24', certificateId: null },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setLeaderboard(prev => [...prev].sort((a, b) => b.score - a.score));
    } catch (err) {
      setError('Failed to fetch leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const updateScore = async (score, userName = 'Current User') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEntry = {
        id: Date.now(),
        userName: userName,
        score: score,
        date: new Date().toISOString().split('T')[0],
        certificateId: score === 100 ? `CERT${Date.now()}` : null
      };
      setLeaderboard(prev => [...prev, newEntry].sort((a, b) => b.score - a.score));
      return true;
    } catch (err) {
      console.error('Error updating score:', err);
      return false;
    }
  };

  return (
    <LeaderboardContext.Provider value={{
      leaderboard, isLoading, error, fetchLeaderboard, updateScore
    }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

// ============= CERTIFICATE PROVIDER =============
const CertificateProvider = ({ children }) => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCertificate = async (userName = null) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const name = userName || 'Current User';
      const certificateId = `CERT${Date.now()}`;
      setCertificates(prev => [...prev, { id: certificateId, userName: name }]);
      alert(`🎉 Certificate ${certificateId} generated for ${name}!`);
      return { success: true, certificateId };
    } catch (err) {
      setError('Failed to generate certificate');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const getCertificate = async (certificateId) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      alert(`📄 Certificate ${certificateId} downloaded successfully!`);
      return true;
    } catch (err) {
      setError('Failed to download certificate');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CertificateContext.Provider value={{
      certificates, isLoading, error, generateCertificate, getCertificate
    }}>
      {children}
    </CertificateContext.Provider>
  );
};

// ============= 3D BUILDING COMPONENT =============
const Building3D = () => {
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Living Room', x: 100, y: 100, width: 200, height: 150, color: '#FF6B6B' },
    { id: 2, name: 'Kitchen', x: 350, y: 100, width: 150, height: 120, color: '#4ECDC4' },
    { id: 3, name: 'Bedroom', x: 100, y: 300, width: 180, height: 160, color: '#45B7D1' },
    { id: 4, name: 'Bathroom', x: 350, y: 280, width: 120, height: 100, color: '#96CEB4' },
  ]);

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: `Room ${rooms.length + 1}`,
      x: Math.random() * 300 + 50,
      y: Math.random() * 300 + 50,
      width: 120 + Math.random() * 80,
      height: 100 + Math.random() * 60,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setRooms([...rooms, newRoom]);
  };

  const removeRoom = () => {
    if (rooms.length > 1) {
      setRooms(rooms.slice(0, -1));
    }
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: 400, 
      bgcolor: '#f0f4f8', 
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
      
      {rooms.map(room => (
        <Box
          key={room.id}
          sx={{
            position: 'absolute',
            left: room.x,
            top: room.y,
            width: room.width,
            height: room.height,
            bgcolor: room.color,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 2px rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              transform: 'scale(1.02)',
              zIndex: 10
            }
          }}
        >
          <Typography variant="caption" sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
            {room.name}
          </Typography>
        </Box>
      ))}

      <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
        <Fab size="small" color="primary" onClick={addRoom}>
          <AddCircleIcon />
        </Fab>
        <Fab size="small" color="secondary" onClick={removeRoom}>
          <CloseIcon />
        </Fab>
      </Box>
    </Box>
  );
};

// ============= MAIN LAYOUT =============
const MainLayout = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const tabs = [
    { label: 'Quiz', icon: <QuizIcon />, path: '/' },
    { label: 'Education', icon: <SchoolIcon />, path: '/education' },
    { label: '3D Design', icon: <ThreeDRotationIcon />, path: '/3d-design' },
    { label: 'Puzzle Games', icon: <GamesIcon />, path: '/puzzles' },
    { label: 'Guidelines', icon: <GavelIcon />, path: '/guidelines' },
    { label: 'Leaderboard', icon: <EmojiEventsIcon />, path: '/leaderboard' },
  ];
  
  const [value, setValue] = useState(() => {
    const currentPath = router.pathname;
    const index = tabs.findIndex(tab => tab.path === currentPath);
    return index !== -1 ? index : 0;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    router.push(tabs[newValue].path);
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ 
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1a237e 100%)',
        borderRadius: 0
      }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6f00, #ff8f00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 12px rgba(255,111,0,0.3)'
            }}>
              <ConstructionIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.5px',
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}>
              BuildMitra
              <Box component="span" sx={{ 
                display: 'block',
                fontSize: '0.6rem',
                opacity: 0.7,
                fontWeight: 400,
                letterSpacing: '1px'
              }}>
                Learn & Earn Premium
              </Box>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="inherit" sx={{ color: 'white' }}>
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Chip 
              label="Premium" 
              size="small" 
              sx={{ 
                bgcolor: '#ff6f00', 
                color: 'white',
                fontWeight: 'bold',
                '& .MuiChip-label': { px: 2 }
              }} 
            />
          </Box>
        </Toolbar>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              minHeight: 56,
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.15)',
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              bgcolor: '#ff6f00',
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.path}
              label={isMobile ? '' : tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minHeight: 56 }}
            />
          ))}
        </Tabs>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {children}
      </Container>
    </>
  );
};

// ============= QUIZ TAB =============
const QuizTab = () => {
  const { questions, currentQuestionIndex, answers, setAnswer, submitQuiz,
    fetchQuestions, isLoading, error, quizCompleted, score } = useContext(QuizContext);
  const { generateCertificate } = useContext(CertificateContext);
  const { updateScore, leaderboard } = useContext(LeaderboardContext);

  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const savedQuiz = localStorage.getItem('buildmitra_quiz_completed');
    const lastAttempt = localStorage.getItem('buildmitra_quiz_attempt_date');

    if (savedQuiz === 'true' && lastAttempt) {
      const daysSince = Math.floor((Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 30) {
        setAlertMessage(`You've already completed the quiz. Please wait ${30 - daysSince} days to retake.`);
        setAlertSeverity('info');
        setShowAlert(true);
        return;
      }
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (quizCompleted || isLoading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizCompleted, isLoading]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const allAnswered = answers.every(ans => ans !== null);
    if (!allAnswered) {
      setAlertMessage('Please answer all questions before submitting.');
      setAlertSeverity('warning');
      setShowAlert(true);
      return;
    }
    const { score, correct } = await submitQuiz();
    await updateScore(score, 'Current User');

    if (correct === 20) {
      await generateCertificate();
      setAlertMessage('🎉 Congratulations! You scored 100%! Your premium certificate has been generated!');
      setAlertSeverity('success');
    } else {
      setAlertMessage(`You scored ${score}%. Keep learning and try again!`);
      setAlertSeverity('info');
    }
    setShowAlert(true);
    setShowSidebar(true);
    localStorage.setItem('buildmitra_quiz_completed', 'true');
    localStorage.setItem('buildmitra_quiz_attempt_date', new Date().toISOString());
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  
  if (quizCompleted && showSidebar) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f8f9fe 0%, #e8eaf6 100%)',
            border: '2px solid',
            borderColor: score === 100 ? 'success.main' : 'info.main'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {score === 100 ? (
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                ) : (
                  <EmojiEventsIcon sx={{ fontSize: 48, color: 'info.main' }} />
                )}
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {score === 100 ? '🎉 Perfect Score!' : '✅ Quiz Completed'}
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {score}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {score === 100 
                      ? 'You answered all 20 questions correctly! Premium certificate generated!' 
                      : `You answered ${Math.round(score/5)} questions correctly. Keep practicing!`}
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<EmojiEventsIcon />}
                onClick={() => setShowSidebar(false)}
                sx={{ mt: 2 }}
              >
                View Full Leaderboard
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                🏆 Top Performers
              </Typography>
              {leaderboard.slice(0, 5).map((entry, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  py: 1,
                  borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                  <Typography variant="body2" sx={{ minWidth: 30, color: 'rgba(255,255,255,0.7)' }}>
                    #{index + 1}
                  </Typography>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    {entry.userName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {entry.userName}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: '#ff8f00' }}>
                    {entry.score}%
                  </Typography>
                  {entry.score === 100 && <EmojiEventsIcon sx={{ fontSize: 16, color: '#ffd700' }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  if (!questions || questions.length === 0) {
    return <Alert severity="info" sx={{ mt: 2 }}>No questions available. Please try again later.</Alert>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  return (
    <Box>
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8f9fe 0%, #e8eaf6 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Question {currentQuestionIndex + 1} of 20
              </Typography>
              <Chip 
                label={currentQuestion?.category || 'General'} 
                size="small" 
                color="primary" 
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                icon={<EmojiEventsIcon />} 
                label={`${answers.filter(a => a !== null).length}/20 answered`} 
                variant="outlined"
              />
              <Typography variant="h6" color={timeLeft < 60 ? 'error' : 'textPrimary'} fontWeight="bold">
                ⏱️ {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(currentQuestionIndex / 20) * 100} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #1a237e, #283593)',
                borderRadius: 4
              }
            }} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            {currentQuestion?.question}
          </Typography>

          <RadioGroup value={answers[currentQuestionIndex] ?? ''} onChange={(e) => setAnswer(currentQuestionIndex, parseInt(e.target.value))}>
            {currentQuestion?.options?.map((option, index) => (
              <Paper 
                key={index}
                elevation={answers[currentQuestionIndex] === index ? 2 : 0}
                sx={{ 
                  mb: 1, 
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: answers[currentQuestionIndex] === index ? 'primary.main' : 'transparent',
                  bgcolor: answers[currentQuestionIndex] === index ? 'rgba(26,35,126,0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(26,35,126,0.05)',
                    borderColor: 'rgba(26,35,126,0.2)'
                  }
                }}
              >
                <FormControlLabel 
                  value={index} 
                  control={<Radio />} 
                  label={option} 
                  sx={{ 
                    width: '100%', 
                    p: 1,
                    '& .MuiFormControlLabel-label': {
                      fontWeight: answers[currentQuestionIndex] === index ? 600 : 400
                    }
                  }}
                />
              </Paper>
            ))}
          </RadioGroup>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
            <Button 
              variant="outlined" 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              startIcon={<ArrowBackIcon />}
            >
              Previous
            </Button>
            {currentQuestionIndex === 19 ? (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubmit}
                endIcon={<CheckCircleIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #1a237e, #283593)',
                  px: 4
                }}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                disabled={answers[currentQuestionIndex] === null}
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ============= EDUCATION TAB =============
const EducationTab = () => {
  const [selectedVideo, setSelectedVideo] = useState({
    id: 1,
    title: 'Plot Marking & Site Preparation',
    description: 'Learn the essential steps for marking plots and preparing the construction site.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Site Work'
  });

  const videos = [
    { id: 1, title: 'Plot Marking & Site Preparation', description: 'Essential steps for marking plots.', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Site Work' },
    { id: 2, title: 'Foundation & Footing Construction', description: 'Understanding different types of foundations.', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Foundation' },
    { id: 3, title: 'Superstructure & Framing', description: 'Building the superstructure and framing.', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Structural' },
    { id: 4, title: 'Finishing Works & Handover', description: 'Finishing works and project handover.', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Finishing' },
  ];

  const latestVideos = [
    { id: 5, title: 'AI in Construction Management', description: 'AI revolutionizing construction management.', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Technology' },
    { id: 6, title: 'Sustainable Building Materials 2026', description: 'Latest eco-friendly materials.', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Materials' },
  ];

  const ebooks = [
    { id: 1, title: 'Complete Guide to Building Construction', author: 'Dr. Rajesh Kumar', pages: 450, category: 'Construction', premium: true },
    { id: 2, title: 'Modern Plumbing Systems in Buildings', author: 'Prof. Meena Sharma', pages: 320, category: 'Plumbing', premium: false },
    { id: 3, title: 'Green Building Materials Handbook', author: 'Ar. Vikram Singh', pages: 280, category: 'Materials', premium: true },
  ];

  const latestMaterials = [
    { id: 1, title: 'AI-Powered Construction Management Tool', description: 'Revolutionary AI tool for construction monitoring.', date: '2026-06-25', type: 'Technology', hot: true },
    { id: 2, title: 'Sustainable Building Materials Expo 2026', description: 'International expo for eco-friendly materials.', date: '2026-07-15', type: 'Event', hot: true },
    { id: 3, title: 'Carbon-Negative Concrete', description: 'New concrete that absorbs CO2 during curing.', date: '2026-06-20', type: 'Materials', hot: true },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #1a237e, #283593)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        📚 Construction Education
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ overflow: 'hidden' }}>
            <Box component="iframe" width="100%" height="400" src={selectedVideo.url}
              title={selectedVideo.title} sx={{ border: 'none' }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={selectedVideo.category} size="small" color="primary" />
                <Chip label="HD" size="small" color="secondary" />
              </Box>
              <Typography variant="h6">{selectedVideo.title}</Typography>
              <Typography variant="body2" color="textSecondary">{selectedVideo.description}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Videos</Typography>
          <List>
            {[...videos, ...latestVideos].map((video) => (
              <ListItem key={video.id} button selected={selectedVideo.id === video.id}
                onClick={() => setSelectedVideo(video)}
                sx={{ 
                  borderRadius: 2, 
                  mb: 1,
                  bgcolor: selectedVideo.id === video.id ? 'rgba(26,35,126,0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(26,35,126,0.05)' }
                }}>
                <ListItemIcon>
                  <PlayCircleIcon color={selectedVideo.id === video.id ? 'primary' : 'action'} />
                </ListItemIcon>
                <ListItemText 
                  primary={video.title}
                  secondary={video.category}
                  primaryTypographyProps={{ fontWeight: selectedVideo.id === video.id ? 600 : 400 }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>📚 E-Books Collection</Typography>
        <Grid container spacing={3}>
          {ebooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <MenuBookIcon sx={{ fontSize: 40, color: book.premium ? 'primary.main' : 'action' }} />
                    <Box>
                      <Typography variant="h6" noWrap>{book.title}</Typography>
                      <Typography variant="body2" color="textSecondary">{book.author}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={book.category} size="small" />
                    <Chip label={`${book.pages} pages`} size="small" variant="outlined" />
                    {book.premium && <Chip label="Premium" size="small" color="primary" />}
                  </Box>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      background: book.premium ? 'linear-gradient(135deg, #ff6f00, #ff8f00)' : 'linear-gradient(135deg, #1a237e, #283593)'
                    }}
                  >
                    {book.premium ? 'Download Premium' : 'Download Free'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>🆕 Latest Materials</Typography>
        <Grid container spacing={3}>
          {latestMaterials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card sx={{ position: 'relative', overflow: 'visible' }}>
                {material.hot && (
                  <Chip 
                    label="🔥 HOT" 
                    color="error" 
                    sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      right: 10, 
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(211,47,47,0.3)'
                    }} 
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>{material.title}</Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {material.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={material.type} size="small" color={material.type === 'Technology' ? 'info' : 'success'} />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(material.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

// ============= 3D DESIGN TAB =============
const ThreeDDesignTab = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #e65100, #ff6f00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🎨 3D Building Designer
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <ToggleButtonGroup value="floorplan" exclusive size="small">
              <ToggleButton value="floorplan"><WindowIcon /> Floor Plan</ToggleButton>
              <ToggleButton value="3d"><ThreeDRotationIcon /> 3D View</ToggleButton>
              <ToggleButton value="interior"><InteriorIcon /> Interior</ToggleButton>
            </ToggleButtonGroup>
            
            <Divider orientation="vertical" flexItem />
            
            <ToggleButtonGroup value="move" exclusive size="small">
              <ToggleButton value="move"><DragHandleIcon /> Move</ToggleButton>
              <ToggleButton value="resize"><StraightenIcon /> Resize</ToggleButton>
              <ToggleButton value="add"><AddCircleIcon /> Add Room</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Building3D />
        </CardContent>
      </Card>
    </Box>
  );
};

// ============= PUZZLE GAMES TAB =============
const PuzzleGamesTab = () => {
  const games = [
    { id: 'elevation', title: 'Building Elevation Designer', icon: <ArchitectureIcon sx={{ fontSize: 40 }} />,
      description: 'Design the perfect building elevation.', duration: '5 minutes', difficulty: 'Medium' },
    { id: 'furniture', title: 'Furniture Placement Challenge', icon: <HomeIcon sx={{ fontSize: 40 }} />,
      description: 'Arrange furniture optimally in a room layout.', duration: '4 minutes', difficulty: 'Easy' },
    { id: 'colors', title: 'Wall Paint Color Puzzle', icon: <PaletteIcon sx={{ fontSize: 40 }} />,
      description: 'Choose perfect color combinations for walls.', duration: '3 minutes', difficulty: 'Medium' },
    { id: 'artwork', title: 'Artwork & Decor Placement', icon: <BrushIcon sx={{ fontSize: 40 }} />,
      description: 'Place artwork and decorative elements.', duration: '4 minutes', difficulty: 'Hard' },
  ];

  const [activeGame, setActiveGame] = useState(null);
  const [gameState, setGameState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  const startGame = (gameId) => {
    const game = games.find(g => g.id === gameId);
    setActiveGame(game);
    setGameState('playing');
    setTimeLeft(parseInt(game.duration) * 60);
    setScore(0);
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { setGameState('completed'); clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'idle') {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>🧩 Puzzle Games</Typography>
        <Grid container spacing={3}>
          {games.map((game) => (
            <Grid item xs={12} md={6} key={game.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>{game.icon}</Box>
                    <Box>
                      <Typography variant="h6">{game.title}</Typography>
                      <Chip label={game.difficulty} size="small"
                        color={game.difficulty === 'Easy' ? 'success' : game.difficulty === 'Medium' ? 'warning' : 'error'}
                        sx={{ mr: 1 }} />
                      <Chip label={game.duration} size="small" variant="outlined" />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>{game.description}</Typography>
                  <Button variant="contained" fullWidth onClick={() => startGame(game.id)}>Play Game</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (gameState === 'playing') {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{activeGame?.title}</Typography>
            <Typography variant="h6" color={timeLeft < 60 ? 'error' : 'textPrimary'}>
              ⏱️ {formatTime(timeLeft)}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1">Interactive Game Content</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((opt, i) => (
                <Button key={i} variant="outlined" onClick={() => setScore(prev => prev + 10)}>{opt}</Button>
              ))}
            </Box>
            <Typography sx={{ mt: 2 }}>Score: {score}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>🎉 Game Completed!</Typography>
        <Typography variant="h4" color="primary">Your Score: {score} points</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => { setGameState('idle'); setActiveGame(null); }}>
          Play Another Game
        </Button>
      </CardContent>
    </Card>
  );
};

// ============= GUIDELINES TAB =============
const GuidelinesTab = () => {
  const [tabValue, setTabValue] = useState(0);

  const guidelinesData = [
    {
      title: '🏛️ RERA Guidelines',
      icon: <GavelIcon sx={{ fontSize: 32, color: '#1a237e' }} />,
      sections: [
        { title: 'Registration Requirements', content: 'All real estate projects must be registered with RERA before marketing or selling.' },
        { title: 'Buyer Protection', content: 'RERA ensures timely possession, quality construction, and financial transparency.' },
        { title: 'Project Disclosure', content: 'Developers must disclose all project details including layout plans and approvals.' },
      ]
    },
    {
      title: '🏗️ BDA Rules',
      icon: <LocationCityIcon sx={{ fontSize: 32, color: '#00695c' }} />,
      sections: [
        { title: 'Land Use Regulations', content: 'Properties must comply with BDA land use classifications and zoning regulations.' },
        { title: 'Building Approval', content: 'All building plans must be approved by BDA with proper documentation.' },
      ]
    },
    {
      title: '🌆 GBA Guidelines',
      icon: <ApartmentIcon sx={{ fontSize: 32, color: '#4a148c' }} />,
      sections: [
        { title: 'GBA Registration', content: 'All building construction projects must register with the Greater Bangalore Authority.' },
        { title: 'Construction Standards', content: 'Buildings must adhere to structural safety and quality standards.' },
      ]
    },
    {
      title: '📍 BMRDA Regulations',
      icon: <DashboardIcon sx={{ fontSize: 32, color: '#bf360c' }} />,
      sections: [
        { title: 'Metropolitan Area Planning', content: 'BMRDA oversees development in the metropolitan area ensuring planned growth.' },
        { title: 'Infrastructure Standards', content: 'Development must meet infrastructure standards for roads, water, and drainage.' },
      ]
    },
    {
      title: '📊 Revenue Land',
      icon: <AgricultureIcon sx={{ fontSize: 32, color: '#2e7d32' }} />,
      sections: [
        { title: 'Land Revenue Records', content: 'Maintain up-to-date land revenue records for all agricultural and non-agricultural lands.' },
        { title: 'Land Classification', content: 'Understand classification of land for different uses including agricultural and residential.' },
      ]
    },
    {
      title: '🏭 Industrial Land',
      icon: <SettingsEthernetIcon sx={{ fontSize: 32, color: '#e65100' }} />,
      sections: [
        { title: 'Industrial Land Acquisition', content: 'Guidelines for acquiring industrial land including permits and zoning.' },
        { title: 'Industrial Development', content: 'Requirements for developing industrial land including infrastructure and clearances.' },
      ]
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #bf360c, #e65100)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        📋 Guidelines & Regulations
      </Typography>

      <Tabs 
        value={tabValue} 
        onChange={(e, v) => setTabValue(v)} 
        variant="scrollable" 
        scrollButtons="auto" 
        sx={{ mb: 3 }}
      >
        {guidelinesData.map((item, i) => (
          <Tab 
            key={i} 
            label={item.title.split(' ').slice(1).join(' ')} 
            icon={item.icon} 
            iconPosition="start"
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Tabs>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            {guidelinesData[tabValue].icon}
            <Typography variant="h5">{guidelinesData[tabValue].title}</Typography>
          </Box>
          <Grid container spacing={2}>
            {guidelinesData[tabValue].sections.map((section, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Accordion sx={{ 
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    {section.title}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">{section.content}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// ============= LEADERBOARD TAB =============
const LeaderboardTab = () => {
  const { leaderboard, isLoading, error, fetchLeaderboard } = useContext(LeaderboardContext);
  const { getCertificate } = useContext(CertificateContext);

  useEffect(() => { fetchLeaderboard(); }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <StarIcon sx={{ color: 'gold', fontSize: 28 }} />;
    if (rank === 2) return <StarIcon sx={{ color: 'silver', fontSize: 24 }} />;
    if (rank === 3) return <StarIcon sx={{ color: '#cd7f32', fontSize: 20 }} />;
    return null;
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!leaderboard || leaderboard.length === 0) {
    return <Alert severity="info" sx={{ mt: 2 }}>No scores available yet. Complete the quiz to be featured!</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #1a237e, #ff6f00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🏆 Leaderboard
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(135deg, #1a237e, #283593)',
                }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Participant</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.id} sx={{ bgcolor: index === 0 ? '#FFF8E1' : 'inherit' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRankIcon(index + 1)}
                        <Typography variant="body1">#{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'grey.500' }}>
                          {entry.userName.charAt(0)}
                        </Avatar>
                        <Typography variant="body1">{entry.userName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${entry.score}%`} 
                        color={entry.score >= 80 ? 'success' : entry.score >= 60 ? 'warning' : 'default'}
                      />
                      {entry.score === 100 && <EmojiEventsIcon sx={{ ml: 1, color: 'gold' }} />}
                    </TableCell>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {entry.certificateId && (
                        <Button 
                          size="small" 
                          startIcon={<GetAppIcon />} 
                          onClick={() => getCertificate(entry.certificateId)}
                          variant="contained"
                          color="success"
                        >
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

// ============= MAIN PAGE =============
export default function LearnEarnPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    const currentPath = router.pathname;
    const tabs = ['/', '/education', '/3d-design', '/puzzles', '/guidelines', '/leaderboard'];
    const index = tabs.findIndex(tab => tab === currentPath);
    return index !== -1 ? index : 0;
  });

  const renderTabContent = () => {
    switch(activeTab) {
      case 0: return <QuizTab />;
      case 1: return <EducationTab />;
      case 2: return <ThreeDDesignTab />;
      case 3: return <PuzzleGamesTab />;
      case 4: return <GuidelinesTab />;
      case 5: return <LeaderboardTab />;
      default: return <QuizTab />;
    }
  };

  return (
    <ThemeProvider theme={premiumTheme}>
      <CssBaseline />
      <QuizProvider>
        <LeaderboardProvider>
          <CertificateProvider>
            <MainLayout>
              {renderTabContent()}
            </MainLayout>
          </CertificateProvider>
        </LeaderboardProvider>
      </QuizProvider>
    </ThemeProvider>
  );
}