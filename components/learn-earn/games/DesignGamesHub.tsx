import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip, LinearProgress, Paper, Stack, Divider, Alert
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  ViewQuilt as ElevationIcon,
  Science as ConcreteIcon,
  Timeline as BeamIcon,
  Layers as AssemblyIcon,
  PlayArrow as PlayIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon,
  WorkspacePremium as BadgeIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { BlockPlannerStudio } from './BlockPlannerStudio';
import { ElevationBuilder } from './ElevationBuilder';
import { ConcreteMasterLab } from './ConcreteMasterLab';
import { BeamMaster } from './BeamMaster';
import { getBuildMitraUser } from '../../../utils/session';
import { API_BASE } from '../../../utils/apiConfig';

export interface GameCardInfo {
  id: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningObjective: string;
  score: number;
  bestScore: number;
  stars: number;
  completion: number;
  badges: string[];
  icon: React.ReactNode;
  color: string;
}

const DEFAULT_GAMES: GameCardInfo[] = [
  {
    id: 'block-planner',
    name: 'Block Planner Studio',
    category: 'Architecture & Floor Layout Design',
    difficulty: 'Intermediate',
    learningObjective: 'Interactive 2D & 3D floor plan layout builder. Place rooms, doors, furniture, columns, and verify real-time engineering scores.',
    score: 0,
    bestScore: 0,
    stars: 0,
    completion: 0,
    badges: [],
    icon: <ApartmentIcon sx={{ fontSize: 40 }} />,
    color: '#1a237e'
  },
  {
    id: 'elevation-puzzle',
    name: 'Elevation & Façade Puzzle Studio',
    category: 'Architectural Elevation & Building Sequence',
    difficulty: 'Intermediate',
    learningObjective: 'Build exterior building elevations with slabs, balconies, vertical fins, and solve physical construction sequence puzzles.',
    score: 0,
    bestScore: 0,
    stars: 0,
    completion: 0,
    badges: [],
    icon: <ElevationIcon sx={{ fontSize: 40 }} />,
    color: '#ff6f00'
  },
  {
    id: 'concrete-master',
    name: 'Concrete Master Lab',
    category: 'Material Science & Quality Control',
    difficulty: 'Intermediate',
    learningObjective: 'Interactive concrete mix proportioning (M5-M40), animated slump cone test, and 150mm cube hydraulic press CTM simulation.',
    score: 0,
    bestScore: 0,
    stars: 0,
    completion: 0,
    badges: [],
    icon: <ConcreteIcon sx={{ fontSize: 40 }} />,
    color: '#0091ea'
  },
  {
    id: 'beam-master',
    name: 'Beam Master',
    category: 'Structural Mechanics & SFD / BMD',
    difficulty: 'Advanced',
    learningObjective: 'Interactive beam loading analyzer. Drag point & UDL loads to plot real-time support reactions, SFD, BMD, and deflection curves.',
    score: 0,
    bestScore: 0,
    stars: 0,
    completion: 0,
    badges: [],
    icon: <BeamIcon sx={{ fontSize: 40 }} />,
    color: '#2e7d32'
  },
  {
    id: 'building-assembly',
    name: 'Building Assembly Challenge',
    category: 'Construction Management',
    difficulty: 'Beginner',
    learningObjective: 'Drag & place structural elements (Footing → Column → Beam → Slab) in correct engineering execution order.',
    score: 0,
    bestScore: 0,
    stars: 0,
    completion: 0,
    badges: [],
    icon: <AssemblyIcon sx={{ fontSize: 40 }} />,
    color: '#6a1b9a'
  }
];

export const DesignGamesHub: React.FC = () => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [games, setGames] = useState<GameCardInfo[]>(DEFAULT_GAMES);
  const [userCode, setUserCode] = useState<string>('');

  useEffect(() => {
    const user = getBuildMitraUser();
    if (user && (user.userCode || user.phone)) {
      const code = user.userCode || `USER-${user.phone}`;
      setUserCode(code);

      // Fetch user progress from backend
      fetch(`${API_BASE}/api/learn-earn/games/progress?userCode=${code}`)
        ? fetch(`${API_BASE}/api/learn-earn/games/progress?userCode=${code}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && Array.isArray(data.progress)) {
                setGames(prev =>
                  prev.map(g => {
                    const match = data.progress.find((p: any) => p.gameId === g.id);
                    if (match) {
                      return {
                        ...g,
                        score: match.score || 0,
                        bestScore: match.bestScore || 0,
                        stars: match.stars || 0,
                        completion: match.completion || 0,
                        badges: match.badges || []
                      };
                    }
                    return g;
                  })
                );
              }
            })
            .catch(() => {
              // Graceful fallback if backend offline
            })
        : null;
    }
  }, []);

  const handleUpdateGameProgress = (gameId: string, updates: Partial<GameCardInfo>) => {
    setGames(prev =>
      prev.map(g => (g.id === gameId ? { ...g, ...updates } : g))
    );

    if (userCode) {
      fetch(`${API_BASE}/api/learn-earn/games/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode,
          gameId,
          score: updates.score || 0,
          stars: updates.stars || 0,
          completion: updates.completion || 0,
          badges: updates.badges || []
        })
      }).catch(() => {});
    }
  };

  // Render specific game studio when selected
  if (activeGameId === 'block-planner') {
    return (
      <BlockPlannerStudio
        onBackToHub={() => setActiveGameId(null)}
        userCode={userCode}
        onProgressUpdate={(score, stars, badges) =>
          handleUpdateGameProgress('block-planner', { score, bestScore: Math.max(score, games[0].bestScore), stars, completion: 100, badges })
        }
      />
    );
  }

  if (activeGameId === 'elevation-puzzle' || activeGameId === 'building-assembly') {
    return (
      <ElevationBuilder
        onBackToHub={() => setActiveGameId(null)}
        userCode={userCode}
        initialMode={activeGameId === 'building-assembly' ? 'assembly' : 'elevation'}
        onProgressUpdate={(score, stars, badges) =>
          handleUpdateGameProgress(activeGameId, { score, bestScore: Math.max(score, 80), stars, completion: 100, badges })
        }
      />
    );
  }

  if (activeGameId === 'concrete-master') {
    return (
      <ConcreteMasterLab
        onBackToHub={() => setActiveGameId(null)}
        userCode={userCode}
        onProgressUpdate={(score, stars, badges) =>
          handleUpdateGameProgress('concrete-master', { score, bestScore: Math.max(score, games[2].bestScore), stars, completion: 100, badges })
        }
      />
    );
  }

  if (activeGameId === 'beam-master') {
    return (
      <BeamMaster
        onBackToHub={() => setActiveGameId(null)}
        userCode={userCode}
        onProgressUpdate={(score, stars, badges) =>
          handleUpdateGameProgress('beam-master', { score, bestScore: Math.max(score, games[3].bestScore), stars, completion: 100, badges })
        }
      />
    );
  }

  // Dashboard Overview View
  const totalStars = games.reduce((acc, g) => acc + g.stars, 0);
  const totalBadges = Array.from(new Set(games.flatMap(g => g.badges))).length;

  return (
    <Box>
      {/* Header Banner */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0d1445 0%, #1a237e 60%, #283593 100%)',
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#ffb74d' }}>
              🎮 BuildMitra Interactive Engineering & Architectural Studio
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.6 }}>
              Hands-on interactive civil engineering simulators, drag-and-drop floor planning, 3D isometric outlook, structural beam analysis, and concrete quality control testing labs.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}
            >
              <Typography variant="overline" color="#b0bec5" sx={{ letterSpacing: 1 }}>STUDIO ACCOMPLISHMENTS</Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#ffb74d">⭐ {totalStars} / 15</Typography>
                  <Typography variant="caption" color="#b0bec5">Stars Earned</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#00e676">🏆 {totalBadges}</Typography>
                  <Typography variant="caption" color="#b0bec5">Badges Unlocked</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        💡 <strong>Interactive Learning Tip:</strong> All design canvas tools support desktop mouse drag, laptop touchpad, and mobile touch gestures. Progress and custom layouts are saved to your account.
      </Alert>

      {/* Game Selection Cards */}
      <Grid container spacing={3}>
        {games.map(game => (
          <Grid item xs={12} md={6} key={game.id}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  background: game.color,
                  color: 'white',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {game.icon}
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{game.name}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>{game.category}</Typography>
                  </Box>
                </Box>
                <Chip
                  label={game.difficulty}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>

              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" color="textSecondary" paragraph sx={{ flexGrow: 1, lineHeight: 1.6 }}>
                  {game.learningObjective}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Score & Stars */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, color: '#ffb74d' }}>
                    {[1, 2, 3].map(s => (
                      <StarIcon key={s} fontSize="small" sx={{ opacity: s <= game.stars ? 1 : 0.3 }} />
                    ))}
                  </Box>

                  <Typography variant="body2" fontWeight="bold" color="primary">
                    Best Score: {game.bestScore} / 100
                  </Typography>
                </Box>

                {/* Progress bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="textSecondary">Mastery Level</Typography>
                    <Typography variant="caption" fontWeight="bold">{game.completion}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={game.completion}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={game.completion > 0 ? <CompleteIcon /> : <PlayIcon />}
                  onClick={() => setActiveGameId(game.id)}
                  sx={{
                    bgcolor: game.color,
                    fontWeight: 'bold',
                    borderRadius: 2.5,
                    py: 1.2,
                    '&:hover': { bgcolor: game.color, filter: 'brightness(0.9)' }
                  }}
                >
                  {game.completion > 0 ? 'Continue Studio Game' : 'Start Studio Game'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
