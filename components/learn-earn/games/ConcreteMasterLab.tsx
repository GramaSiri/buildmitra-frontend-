import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Slider, Select, MenuItem, FormControl, InputLabel, Chip, Stack, Alert, LinearProgress, Card, CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Science as ScienceIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  Speed as GaugeIcon
} from '@mui/icons-material';
import {
  ConcreteMixInput,
  calculateSlumpTest,
  calculateCTMTest,
  NOMINAL_MIXES,
  TARGET_STRENGTHS
} from '../../../utils/games/concreteValidation';
import { GameProgressPanel } from './GameProgressPanel';

interface ConcreteMasterLabProps {
  onBackToHub: () => void;
  userCode: string;
  onProgressUpdate?: (score: number, stars: number, badges: string[]) => void;
}

export const ConcreteMasterLab: React.FC<ConcreteMasterLabProps> = ({
  onBackToHub,
  userCode,
  onProgressUpdate
}) => {
  const [grade, setGrade] = useState<string>('M20');
  const [cementParts, setCementParts] = useState(1);
  const [fineParts, setFineParts] = useState(1.5);
  const [coarseParts, setCoarseParts] = useState(3);
  const [wcRatio, setWcRatio] = useState(0.45);
  const [admixturePct, setAdmixturePct] = useState(0.5);
  const [exposure, setExposure] = useState<any>('Moderate');
  const [aggSize, setAggSize] = useState<any>(20);

  // Slump Test Animation State
  const [slumpStep, setSlumpStep] = useState<number>(0); // 0=Idle, 1=Filling 4 Layers, 2=Tamping, 3=Lifting, 4=Completed
  const [slumpTesting, setSlumpTesting] = useState(false);

  // CTM Test Animation State
  const [ctmTesting, setCtmTesting] = useState(false);
  const [ctmProgress, setCtmProgress] = useState(0); // 0 to 100% hydraulic load
  const [ctmCompleted, setCtmCompleted] = useState(false);

  const mixInput: ConcreteMixInput = {
    grade,
    cementParts,
    fineAggregateParts: fineParts,
    coarseAggregateParts: coarseParts,
    waterCementRatio: wcRatio,
    admixtureDosePct: admixturePct,
    exposureCondition: exposure,
    maxAggregateSizeMm: aggSize
  };

  const slumpRes = calculateSlumpTest(mixInput);
  const ctmRes = calculateCTMTest(mixInput);

  // Handle grade change and auto-fill nominal standard ratios
  const handleGradeChange = (g: string) => {
    setGrade(g);
    const nom = NOMINAL_MIXES[g];
    if (nom) {
      setCementParts(nom.c);
      setFineParts(nom.fa);
      setCoarseParts(nom.ca);
      setWcRatio(nom.wc);
    }
  };

  // Run Slump Cone Test Animation
  const handleRunSlumpTest = () => {
    setSlumpTesting(true);
    setSlumpStep(1);

    setTimeout(() => {
      setSlumpStep(2); // Tamping
      setTimeout(() => {
        setSlumpStep(3); // Lifting
        setTimeout(() => {
          setSlumpStep(4); // Completed
          setSlumpTesting(false);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Run Animated 150mm CTM Press Test
  const handleRunCTMTest = () => {
    setCtmTesting(true);
    setCtmCompleted(false);
    setCtmProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setCtmProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setCtmTesting(false);
        setCtmCompleted(true);

        const score = ctmRes.passedTarget ? 100 : 60;
        const stars = ctmRes.passedTarget ? 3 : 1;
        if (onProgressUpdate) onProgressUpdate(score, stars, ['concrete-technician']);
      }
    }, 100);
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
              🧪 Concrete Master Lab (Educational Simulation)
            </Typography>
          </Box>
        </Box>
      </Paper>

      <GameProgressPanel
        progress={{
          gameId: 'concrete-master',
          gameName: 'Concrete Master Lab',
          score: ctmCompleted ? (ctmRes.passedTarget ? 100 : 60) : 50,
          bestScore: ctmCompleted ? 100 : 75,
          stars: ctmCompleted && ctmRes.passedTarget ? 3 : 1,
          level: 1,
          badges: ctmCompleted ? ['concrete-technician'] : [],
          attempts: 1,
          completion: ctmCompleted ? 100 : 50
        }}
      />

      <Grid container spacing={3}>
        {/* Left Column: Mix Proportion Controls */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScienceIcon /> Concrete Mix Designer
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2.5, mt: 1 }}>
              <InputLabel>Target Grade of Concrete</InputLabel>
              <Select value={grade} label="Target Grade of Concrete" onChange={e => handleGradeChange(e.target.value)}>
                {Object.keys(TARGET_STRENGTHS).map(g => (
                  <MenuItem key={g} value={g}>{g} ({TARGET_STRENGTHS[g]} MPa Target)</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" fontWeight="bold">
              Cement : Sand : Coarse Aggregate Ratio
            </Typography>
            <Typography variant="body2" color="primary" fontWeight="bold" paragraph>
              1 : {fineParts} : {coarseParts}
            </Typography>

            {/* Sliders */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">Fine Aggregate (Sand) Parts: {fineParts}</Typography>
              <Slider value={fineParts} min={0.5} max={6} step={0.1} onChange={(_, v) => setFineParts(v as number)} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">Coarse Aggregate (Jelly) Parts: {coarseParts}</Typography>
              <Slider value={coarseParts} min={1} max={10} step={0.1} onChange={(_, v) => setCoarseParts(v as number)} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="secondary" fontWeight="bold">
                Water-Cement Ratio (w/c): {wcRatio}
              </Typography>
              <Slider value={wcRatio} min={0.30} max={0.70} step={0.01} onChange={(_, v) => setWcRatio(v as number)} color="secondary" />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">Superplasticizer Admixture Dose: {admixturePct}%</Typography>
              <Slider value={admixturePct} min={0} max={2} step={0.1} onChange={(_, v) => setAdmixturePct(v as number)} />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Max Agg Size</InputLabel>
                  <Select value={aggSize} label="Max Agg Size" onChange={e => setAggSize(Number(e.target.value))}>
                    <MenuItem value={10}>10 mm</MenuItem>
                    <MenuItem value={20}>20 mm</MenuItem>
                    <MenuItem value={40}>40 mm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Exposure</InputLabel>
                  <Select value={exposure} label="Exposure" onChange={e => setExposure(e.target.value as any)}>
                    <MenuItem value="Mild">Mild</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="Severe">Severe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column: Animated Simulations (Slump & CTM) */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            {/* 1. Animated Slump Cone Test */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  📐 Animated Slump Cone Test (IS 1199)
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<PlayIcon />}
                  onClick={handleRunSlumpTest}
                  disabled={slumpTesting}
                >
                  {slumpTesting ? 'Testing Mix...' : 'Run Slump Test'}
                </Button>
              </Box>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: '#0f172a',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      position: 'relative'
                    }}
                  >
                    {/* SVG Slump Cone Visual */}
                    <svg width="160" height="150" viewBox="0 0 160 150">
                      {/* Cone outline (Base=200mm, Top=100mm, Height=300mm) */}
                      <polygon points="50,130 110,130 95,30 65,30" fill="none" stroke="#94a3b8" strokeWidth="3" />
                      {/* Concrete fill inside cone based on step */}
                      {slumpStep > 0 && (
                        <polygon
                          points={`52,128 108,128 ${65 + (slumpStep > 2 ? slumpRes.slumpMm / 10 : 0)},${30 + (slumpStep > 2 ? slumpRes.slumpMm / 3 : 0)} ${95 - (slumpStep > 2 ? slumpRes.slumpMm / 10 : 0)},${30 + (slumpStep > 2 ? slumpRes.slumpMm / 3 : 0)}`}
                          fill="#ffb74d"
                          opacity="0.9"
                        />
                      )}
                    </svg>

                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, color: '#94a3b8' }}>
                      {slumpStep === 0 && 'Ready to fill 300mm cone'}
                      {slumpStep === 1 && 'Filling 4 equal layers...'}
                      {slumpStep === 2 && 'Tamping 25 strokes per layer...'}
                      {slumpStep === 3 && 'Lifting cone vertically...'}
                      {slumpStep === 4 && `Measured Slump: ${slumpRes.slumpMm} mm`}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="bold">Slump Results Summary:</Typography>
                  <Typography variant="h5" fontWeight="bold" color="secondary" sx={{ my: 0.5 }}>
                    {slumpRes.slumpMm} mm ({slumpRes.type})
                  </Typography>
                  <Chip label={`Workability: ${slumpRes.workability}`} color={slumpRes.isSafe ? 'success' : 'error'} size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    {slumpRes.suitability}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* 2. Animated 150mm Cube CTM Test */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  🏗️ Animated 150mm Cube CTM Compression Test
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<GaugeIcon />}
                  onClick={handleRunCTMTest}
                  disabled={ctmTesting}
                >
                  {ctmTesting ? 'Applying Load...' : 'Run CTM Press Test'}
                </Button>
              </Box>

              {ctmTesting && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption">Hydraulic Press Load: {Math.round((ctmRes.loadKn * ctmProgress) / 100)} kN</Typography>
                  <LinearProgress variant="determinate" value={ctmProgress} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              )}

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: '#1e293b',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      position: 'relative'
                    }}
                  >
                    {/* SVG 150mm Cube & Hydraulic Platens */}
                    <svg width="150" height="150" viewBox="0 0 150 150">
                      {/* Upper & Lower Hydraulic Platens */}
                      <rect x="25" y="15" width="100" height="15" fill="#64748b" />
                      <rect x="25" y="120" width="100" height="15" fill="#64748b" />

                      {/* 150mm Concrete Cube */}
                      <rect x="40" y="30" width="70" height="90" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />

                      {/* Failure Crack Lines when completed */}
                      {ctmCompleted && (
                        <path d="M40 30 L75 75 L110 120 M110 30 L75 75 L40 120" stroke="#ef5350" strokeWidth="3" strokeDasharray="4" />
                      )}
                    </svg>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  {ctmCompleted ? (
                    <Box>
                      <Typography variant="overline" color="textSecondary">28-DAY COMPRESSIVE STRENGTH</Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: ctmRes.passedTarget ? '#00c853' : '#d50000' }}>
                        {ctmRes.compressiveStrength28Day} N/mm²
                      </Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        Target Grade {grade}: <strong>{ctmRes.targetStrength28Day} MPa</strong> • Failure Load: <strong>{ctmRes.loadKn} kN</strong>
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="caption" display="block">7-Day Strength: <strong>{ctmRes.compressiveStrength7Day} MPa</strong></Typography>
                      <Typography variant="caption" display="block">14-Day Strength: <strong>{ctmRes.compressiveStrength14Day} MPa</strong></Typography>

                      <Alert severity={ctmRes.passedTarget ? 'success' : 'error'} sx={{ mt: 1, py: 0 }}>
                        {ctmRes.passedTarget ? '✅ PASSED Characteristic Strength Target' : '❌ FAILED Target Strength'}
                      </Alert>
                    </Box>
                  ) : (
                    <Alert severity="info">Click "Run CTM Press Test" to apply hydraulic load and record 28-day crushing strength.</Alert>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
