import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Stack, Card, CardContent, Chip, Alert, Tabs, Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  EmojiEvents as EmojiEventsIcon,
  Layers as LayersIcon,
  ViewQuilt as ElevationIcon
} from '@mui/icons-material';
import { GameProgressPanel } from './GameProgressPanel';

interface ElevationBuilderProps {
  onBackToHub: () => void;
  userCode: string;
  initialMode?: 'elevation' | 'assembly';
  onProgressUpdate?: (score: number, stars: number, badges: string[]) => void;
}

export interface AssemblyStep {
  id: string;
  name: string;
  orderIndex: number;
  description: string;
  icon: string;
}

export const CONSTRUCTION_SEQUENCE: AssemblyStep[] = [
  { id: 'step-1', name: 'Footing & Foundation', orderIndex: 1, description: 'Excavation & PCC isolated/combined footing', icon: '⚓' },
  { id: 'step-2', name: 'Column Pedestal & Rebar', orderIndex: 2, description: 'Vertical RCC column starter & longitudinal steel', icon: '🏛️' },
  { id: 'step-3', name: 'Plinth Beam', orderIndex: 3, description: 'Ground tie beam & anti-termite backfill compaction', icon: '📏' },
  { id: 'step-4', name: 'Brickwork & AAC Blockwall', orderIndex: 4, description: 'Superstructure wall masonry up to lintel height', icon: '🧱' },
  { id: 'step-5', name: 'Lintel Beam & Chajja', orderIndex: 5, description: 'Door/window opening support lintel cast', icon: '🚪' },
  { id: 'step-6', name: 'Roof Beam & Formwork', orderIndex: 6, description: 'Slab shuttering, beam cage & electrical conduits', icon: '🏗️' },
  { id: 'step-7', name: 'RCC Roof Slab Casting', orderIndex: 7, description: 'M20/M25 concrete pouring & 14-day moist curing', icon: '⬜' },
  { id: 'step-8', name: 'Staircase Flight', orderIndex: 8, description: 'Waist slab & riser/tread RCC casting', icon: '🪜' },
  { id: 'step-9', name: 'Parapet Wall & Terrace', orderIndex: 9, description: '3ft safety parapet & terrace waterproofing', icon: '🏡' }
];

export const ElevationBuilder: React.FC<ElevationBuilderProps> = ({
  onBackToHub,
  userCode,
  initialMode = 'elevation',
  onProgressUpdate
}) => {
  const [activeTab, setActiveTab] = useState(initialMode === 'assembly' ? 1 : 0);

  // Façade studio elements state
  const [facadeElements, setFacadeElements] = useState<{ id: string; name: string; y: number; color: string }[]>([
    { id: 'el-1', name: 'Ground Floor Slab', y: 320, color: '#37474f' },
    { id: 'el-2', name: 'Modern Wall Panel', y: 220, color: '#eceff1' },
    { id: 'el-3', name: 'First Floor Balcony', y: 200, color: '#ffb74d' },
    { id: 'el-4', name: 'Vertical Wooden Fins', y: 120, color: '#8d6e63' },
    { id: 'el-5', name: 'Terrace Parapet', y: 90, color: '#cfd8dc' }
  ]);

  // Assembly Puzzle user placed order
  const [userSequence, setUserSequence] = useState<AssemblyStep[]>([]);
  const [puzzleSubmitted, setPuzzleSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');

  const handleAddAssemblyStep = (step: AssemblyStep) => {
    if (userSequence.some(s => s.id === step.id)) return;
    setUserSequence(prev => [...prev, step]);
    setPuzzleSubmitted(false);
  };

  const handleRemoveStep = (id: string) => {
    setUserSequence(prev => prev.filter(s => s.id !== id));
    setPuzzleSubmitted(false);
  };

  const handleResetPuzzle = () => {
    setUserSequence([]);
    setPuzzleSubmitted(false);
    setIsCorrect(false);
    setValidationMsg('');
  };

  const handleValidateAssembly = () => {
    setPuzzleSubmitted(true);
    if (userSequence.length !== CONSTRUCTION_SEQUENCE.length) {
      setIsCorrect(false);
      setValidationMsg(`Incomplete sequence! Place all ${CONSTRUCTION_SEQUENCE.length} building execution steps.`);
      return;
    }

    let correct = true;
    let failedReason = '';

    for (let i = 0; i < userSequence.length; i++) {
      if (userSequence[i].orderIndex !== i + 1) {
        correct = false;
        failedReason = `Incorrect step at position #${i + 1}: "${userSequence[i].name}" cannot be executed before "${CONSTRUCTION_SEQUENCE[i].name}".`;
        break;
      }
    }

    setIsCorrect(correct);
    if (correct) {
      setValidationMsg('🎉 PERFECT ENGINEERING SEQUENCE! Footing → Column → Beam → Slab sequence validated under IS 456.');
      if (onProgressUpdate) onProgressUpdate(100, 3, ['elevation-artist', 'site-engineer']);
    } else {
      setValidationMsg(`⚠️ Sequence Violation: ${failedReason}`);
      if (onProgressUpdate) onProgressUpdate(40, 1, []);
    }
  };

  return (
    <Box>
      {/* Top Header */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBackToHub}>
              Back to Hub
            </Button>
            <Typography variant="h6" fontWeight="bold" color="primary">
              🎨 Elevation & Façade Puzzle Studio
            </Typography>
          </Box>
        </Box>
      </Paper>

      <GameProgressPanel
        progress={{
          gameId: 'elevation-puzzle',
          gameName: 'Elevation & Façade Puzzle',
          score: isCorrect ? 100 : 50,
          bestScore: isCorrect ? 100 : 75,
          stars: isCorrect ? 3 : 1,
          level: 1,
          badges: isCorrect ? ['elevation-artist', 'site-engineer'] : [],
          attempts: 1,
          completion: isCorrect ? 100 : 50
        }}
      />

      <Paper elevation={1} sx={{ mb: 2, borderRadius: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} variant="fullWidth">
          <Tab icon={<ElevationIcon />} label="Architectural Façade Elevation Studio" />
          <Tab icon={<LayersIcon />} label="Building Assembly Sequence Puzzle" />
        </Tabs>
      </Paper>

      {/* Tab 0: Façade Elevation Studio */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                🧩 Façade Palette
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Drag or click elements to compose a balanced front elevation.
              </Typography>

              <Stack spacing={1}>
                {[
                  { name: 'Cantilever Balcony', color: '#ffb74d' },
                  { name: 'Vertical Wooden Fins', color: '#8d6e63' },
                  { name: 'Glass Curtain Wall', color: '#81d4fa' },
                  { name: 'Entrance Canopy', color: '#90a4ae' },
                  { name: 'Pergola Roof Feature', color: '#a1887f' }
                ].map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    fullWidth
                    onClick={() => setFacadeElements([...facadeElements, { id: `el-${Date.now()}`, name: item.name, y: 150, color: item.color }])}
                    sx={{ justifyContent: 'flex-start', fontWeight: 'bold' }}
                  >
                    + Add {item.name}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={4} sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 3, minHeight: 450, textAlign: 'center' }}>
              <Typography variant="subtitle1" color="#ffb74d" fontWeight="bold" gutterBottom>
                FRONT ELEVATION FAÇADE PREVIEW
              </Typography>

              <svg width="400" height="380" viewBox="0 0 400 380" style={{ margin: 'auto', background: '#0f172a', borderRadius: 12 }}>
                {/* Ground */}
                <rect x="0" y="340" width="400" height="40" fill="#334155" />
                <text x="200" y="365" fill="#94a3b8" fontSize="12" textAnchor="middle">GROUND LEVEL (PLINTH)</text>

                {/* Building Main Frame */}
                <rect x="80" y="60" width="240" height="280" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />

                {/* Dynamic Placed Elevation Elements */}
                {facadeElements.map(el => (
                  <g key={el.id}>
                    <rect x="100" y={el.y} width="200" height="30" fill={el.color} rx="4" stroke="#334155" strokeWidth="1.5" />
                    <text x="200" y={el.y + 20} fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">{el.name}</text>
                  </g>
                ))}
              </svg>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Construction Sequence Puzzle */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                🏗️ Unassembled Construction Steps
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Tap the building steps in the correct physical execution order from foundation to terrace.
              </Typography>

              <Grid container spacing={1.5}>
                {CONSTRUCTION_SEQUENCE.map(step => {
                  const isAdded = userSequence.some(s => s.id === step.id);
                  return (
                    <Grid item xs={12} key={step.id}>
                      <Card
                        variant="outlined"
                        onClick={() => handleAddAssemblyStep(step)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: isAdded ? 'not-allowed' : 'pointer',
                          bgcolor: isAdded ? '#f5f5f5' : '#ffffff',
                          opacity: isAdded ? 0.5 : 1,
                          border: isAdded ? '1px dashed #ccc' : '1px solid #1a237e',
                          '&:hover': { bgcolor: isAdded ? '#f5f5f5' : '#e8eaf6' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h5">{step.icon}</Typography>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">{step.name}</Typography>
                              <Typography variant="caption" color="textSecondary">{step.description}</Typography>
                            </Box>
                          </Box>
                          <Button size="small" variant="contained" disabled={isAdded}>
                            {isAdded ? 'Placed' : '+ Select'}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  📋 Your Execution Sequence
                </Typography>
                <Button size="small" startIcon={<RefreshIcon />} onClick={handleResetPuzzle}>
                  Clear All
                </Button>
              </Box>

              <Box sx={{ flexGrow: 1, minHeight: 320 }}>
                {userSequence.length === 0 ? (
                  <Alert severity="info">Tap steps from the left panel to build your construction sequence.</Alert>
                ) : (
                  <Stack spacing={1}>
                    {userSequence.map((step, idx) => (
                      <Paper key={step.id} sx={{ p: 1.5, borderLeft: '5px solid #1a237e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Chip label={`#${idx + 1}`} color="primary" size="small" fontWeight="bold" />
                          <Typography variant="subtitle2" fontWeight="bold">{step.icon} {step.name}</Typography>
                        </Box>
                        <Button size="small" color="error" onClick={() => handleRemoveStep(step.id)}>Remove</Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              {puzzleSubmitted && (
                <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mt: 2, fontWeight: 'bold' }}>
                  {validationMsg}
                </Alert>
              )}

              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                startIcon={<CheckIcon />}
                onClick={handleValidateAssembly}
                sx={{ mt: 2, fontWeight: 'bold', py: 1.5, borderRadius: 2 }}
              >
                Validate Construction Sequence
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
