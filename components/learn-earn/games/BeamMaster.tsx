import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Slider, Select, MenuItem, FormControl, InputLabel, Stack, Alert, Chip, Card, CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Timeline as BeamIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  BeamType,
  SupportBlock,
  LoadBlock,
  BeamSection,
  analyzeBeam
} from '../../../utils/games/beamCalculations';
import { GameProgressPanel } from './GameProgressPanel';

interface BeamMasterProps {
  onBackToHub: () => void;
  userCode: string;
  onProgressUpdate?: (score: number, stars: number, badges: string[]) => void;
}

export const BeamMaster: React.FC<BeamMasterProps> = ({
  onBackToHub,
  userCode,
  onProgressUpdate
}) => {
  const [beamType, setBeamType] = useState<BeamType>('simply_supported');
  const [beamLength, setBeamLength] = useState<number>(6); // 6 meters
  const [loadPos, setLoadPos] = useState<number>(3); // 3m from left
  const [loadMagnitude, setLoadMagnitude] = useState<number>(20); // 20 kN
  const [udlMagnitude, setUdlMagnitude] = useState<number>(5); // 5 kN/m

  // Beam section properties
  const [widthMm, setWidthMm] = useState<number>(230); // 230 mm width
  const [depthMm, setDepthMm] = useState<number>(450); // 450 mm depth

  const section: BeamSection = {
    widthMm,
    depthMm,
    elasticModulusGpa: 25 // M25 Concrete E = 25,000 N/mm²
  };

  const loads: LoadBlock[] = [
    { id: 'load-1', type: 'point', x: loadPos, magnitude: loadMagnitude },
    { id: 'load-2', type: 'udl', x: 0, length: beamLength, magnitude: udlMagnitude }
  ];

  const supports: SupportBlock[] = [
    { id: 'sup-1', type: 'pin', x: 0 },
    { id: 'sup-2', type: 'roller', x: beamLength }
  ];

  const analysis = analyzeBeam(beamType, beamLength, supports, loads, section);

  // SVG dimensions for dynamic graphs
  const svgWidth = 600;
  const svgHeight = 140;

  // Render SFD SVG path
  const maxV = Math.max(1, Math.abs(analysis.maxShearKn));
  const sfdPath = analysis.sfdPoints.map((pt, i) => {
    const xPx = (pt.x / beamLength) * svgWidth;
    const yPx = svgHeight / 2 - (pt.v / maxV) * (svgHeight / 2.5);
    return `${i === 0 ? 'M' : 'L'} ${xPx} ${yPx}`;
  }).join(' ');

  // Render BMD SVG path
  const maxM = Math.max(1, Math.abs(analysis.maxMomentKnm));
  const bmdPath = analysis.bmdPoints.map((pt, i) => {
    const xPx = (pt.x / beamLength) * svgWidth;
    const yPx = svgHeight / 2 + (pt.m / maxM) * (svgHeight / 2.5);
    return `${i === 0 ? 'M' : 'L'} ${xPx} ${yPx}`;
  }).join(' ');

  // Render Deflection Curve SVG path
  const maxD = Math.max(1, analysis.maxDeflectionMm);
  const defPath = analysis.deflectionPoints.map((pt, i) => {
    const xPx = (pt.x / beamLength) * svgWidth;
    const yPx = 20 + (pt.d / maxD) * 60;
    return `${i === 0 ? 'M' : 'L'} ${xPx} ${yPx}`;
  }).join(' ');

  const handleRunAnalysis = () => {
    const score = analysis.isSafe ? 100 : 50;
    const stars = analysis.isSafe ? 3 : 1;
    if (onProgressUpdate) onProgressUpdate(score, stars, ['beam-analyst']);
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
              📊 Beam Master (Structural Load & SFD / BMD Analyzer)
            </Typography>
          </Box>
        </Box>
      </Paper>

      <GameProgressPanel
        progress={{
          gameId: 'beam-master',
          gameName: 'Beam Master',
          score: analysis.isSafe ? 100 : 60,
          bestScore: 100,
          stars: analysis.isSafe ? 3 : 1,
          level: 1,
          badges: ['beam-analyst'],
          attempts: 1,
          completion: 100
        }}
      />

      <Grid container spacing={3}>
        {/* Left Column: Beam Parameters & Load Controls */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BeamIcon /> Beam & Load Setup
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2, mt: 1 }}>
              <InputLabel>Beam Type</InputLabel>
              <Select value={beamType} label="Beam Type" onChange={e => setBeamType(e.target.value as any)}>
                <MenuItem value="simply_supported">Simply Supported Beam</MenuItem>
                <MenuItem value="cantilever">Cantilever Beam</MenuItem>
                <MenuItem value="fixed">Fixed Beam</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">Beam Span Length (L): {beamLength} meters</Typography>
              <Slider value={beamLength} min={2} max={12} step={0.5} onChange={(_, v) => setBeamLength(v as number)} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="secondary" fontWeight="bold">Point Load Position (x): {loadPos} m</Typography>
              <Slider value={loadPos} min={0} max={beamLength} step={0.1} onChange={(_, v) => setLoadPos(v as number)} color="secondary" />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">Point Load Magnitude (P): {loadMagnitude} kN</Typography>
              <Slider value={loadMagnitude} min={0} max={100} step={5} onChange={(_, v) => setLoadMagnitude(v as number)} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">UDL Load Magnitude (w): {udlMagnitude} kN/m</Typography>
              <Slider value={udlMagnitude} min={0} max={20} step={1} onChange={(_, v) => setUdlMagnitude(v as number)} />
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>RCC Section Dimensions:</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption">Width (b): {widthMm} mm</Typography>
                <Slider value={widthMm} min={150} max={450} step={25} onChange={(_, v) => setWidthMm(v as number)} size="small" />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption">Depth (D): {depthMm} mm</Typography>
                <Slider value={depthMm} min={230} max={750} step={25} onChange={(_, v) => setDepthMm(v as number)} size="small" />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column: Real-Time Dynamic SFD, BMD & Deflection Diagrams */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Real-time Summary Cards */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff' }}>
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={3}>
                  <Typography variant="caption" color="textSecondary">REACTION R_A</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">{analysis.reactionA} kN</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="textSecondary">REACTION R_B</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">{analysis.reactionB} kN</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="textSecondary">MAX SHEAR (V_max)</Typography>
                  <Typography variant="h6" fontWeight="bold" color="secondary">{analysis.maxShearKn} kN</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="textSecondary">MAX MOMENT (M_max)</Typography>
                  <Typography variant="h6" fontWeight="bold" color="secondary">{analysis.maxMomentKnm} kNm</Typography>
                </Grid>
              </Grid>

              <Alert severity={analysis.isSafe ? 'success' : 'warning'} sx={{ mt: 2, fontWeight: 'bold' }}>
                {analysis.statusMessage}
              </Alert>
            </Paper>

            {/* 1. Shear Force Diagram (SFD) */}
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#81d4fa" gutterBottom>
                📉 SHEAR FORCE DIAGRAM (SFD) — Max: {analysis.maxShearKn} kN
              </Typography>
              <svg width="100%" height="130" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#475569" strokeDasharray="4" />
                <path d={sfdPath} fill="none" stroke="#29b6f6" strokeWidth="3" />
              </svg>
            </Paper>

            {/* 2. Bending Moment Diagram (BMD) */}
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#ffb74d" gutterBottom>
                📈 BENDING MOMENT DIAGRAM (BMD) — Max: {analysis.maxMomentKnm} kNm
              </Typography>
              <svg width="100%" height="130" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#475569" strokeDasharray="4" />
                <path d={bmdPath} fill="none" stroke="#ffb74d" strokeWidth="3" />
              </svg>
            </Paper>

            {/* 3. Elastic Deflection Curve */}
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#00e676" gutterBottom>
                ➰ ELASTIC DEFLECTION CURVE — Actual: {analysis.maxDeflectionMm} mm (Allowable IS 456: {analysis.allowableDeflectionMm} mm)
              </Typography>
              <svg width="100%" height="100" viewBox={`0 0 ${svgWidth} 100`}>
                <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#475569" strokeDasharray="4" />
                <path d={defPath} fill="none" stroke="#00e676" strokeWidth="3" />
              </svg>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
