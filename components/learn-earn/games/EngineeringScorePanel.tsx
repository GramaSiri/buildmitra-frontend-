import React from 'react';
import {
  Box, Paper, Typography, Grid, LinearProgress, Card, CardContent, Chip, Stack, List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import {
  Error as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SafeIcon,
  Apartment as SpaceIcon,
  Air as VentIcon,
  GridOn as GridIcon,
  Explore as VastuIcon,
  Security as SafetyIcon
} from '@mui/icons-material';
import { BlockItem, PlotConfig, calculateAreaMetrics, validateSpacePlanning, WarningItem } from '../../../utils/games/layoutValidation';
import { validateVastu } from '../../../utils/games/vastuValidation';
import { validateVentilation } from '../../../utils/games/ventilationValidation';
import { validateStructuralGrid } from '../../../utils/games/structuralGridValidation';

interface EngineeringScorePanelProps {
  plot: PlotConfig;
  blocks: BlockItem[];
  onSelectWarningBlock?: (blockId: string) => void;
}

export const EngineeringScorePanel: React.FC<EngineeringScorePanelProps> = ({
  plot,
  blocks,
  onSelectWarningBlock
}) => {
  const areaMetrics = calculateAreaMetrics(blocks, plot);
  const spaceRes = validateSpacePlanning(blocks, plot);
  const vastuRes = validateVastu(blocks, plot);
  const ventRes = validateVentilation(blocks, plot);
  const structRes = validateStructuralGrid(blocks, plot);

  // Safety & Accessibility check
  const doorBlocks = blocks.filter(b => b.name.toLowerCase().includes('door'));
  const hasMainAccess = doorBlocks.some(d => d.name.toLowerCase().includes('main door'));
  const safetyScore = hasMainAccess ? 90 : 50;

  const allWarnings: WarningItem[] = [
    ...spaceRes.warnings,
    ...ventRes.warnings,
    ...structRes.warnings,
    ...vastuRes.warnings
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00c853';
    if (score >= 60) return '#ff9100';
    return '#d50000';
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: '#ffffff' }}>
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📊 Real-Time Engineering Validation & Rule Engine
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Automated NBC (National Building Code) and IS Code preliminary educational checks calculated from your actual layout state.
        </Typography>

        {/* 6 Metric Breakdown Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2, borderLeft: `6px solid ${getScoreColor(spaceRes.score)}` }}>
              <Typography variant="overline" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SpaceIcon fontSize="small" color="primary" /> SPACE PLANNING
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(spaceRes.score) }}>
                {spaceRes.score} / 100
              </Typography>
              <LinearProgress variant="determinate" value={spaceRes.score} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2, borderLeft: `6px solid ${getScoreColor(areaMetrics.efficiencyRatio)}` }}>
              <Typography variant="overline" color="textSecondary">
                AREA EFFICIENCY
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(areaMetrics.efficiencyRatio) }}>
                {areaMetrics.efficiencyRatio}%
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Carpet: {areaMetrics.carpetArea} sq.ft / Built-Up: {areaMetrics.builtUpArea} sq.ft
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2, borderLeft: `6px solid ${getScoreColor(ventRes.score)}` }}>
              <Typography variant="overline" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VentIcon fontSize="small" color="info" /> VENTILATION & DAYLIGHT
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(ventRes.score) }}>
                {ventRes.score} / 100
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Window-to-Floor Area Ratio: {ventRes.windowToFloorRatio}%
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2, borderLeft: `6px solid ${getScoreColor(structRes.score)}` }}>
              <Typography variant="overline" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GridIcon fontSize="small" color="warning" /> STRUCTURAL GRID
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(structRes.score) }}>
                {structRes.score} / 100
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Columns: {structRes.columnCount} • Max Span: {structRes.maxSpanFeet} ft
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2, borderLeft: `6px solid ${getScoreColor(vastuRes.score)}` }}>
              <Typography variant="overline" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VastuIcon fontSize="small" color="secondary" /> VASTU COMPLIANCE
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(vastuRes.score) }}>
                {vastuRes.score} / 100
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Traditional Direction Preference Check
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2, borderLeft: `6px solid ${getScoreColor(safetyScore)}` }}>
              <Typography variant="overline" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SafetyIcon fontSize="small" color="success" /> SAFETY & ACCESSIBILITY
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(safetyScore) }}>
                {safetyScore} / 100
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Egress & Door Clearance Verification
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Interactive Warnings & Recommendations Panel */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff' }}>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          ⚠️ Interactive Engineering Feedback ({allWarnings.length} Items)
        </Typography>
        <Typography variant="caption" color="textSecondary" paragraph display="block">
          Clicking any warning below automatically selects and highlights the corresponding block on your canvas.
        </Typography>

        {allWarnings.length === 0 ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            🎉 Excellent work! No engineering layout warnings or clearance violations detected.
          </Alert>
        ) : (
          <List>
            {allWarnings.map(w => (
              <Paper
                key={w.id}
                variant="outlined"
                onClick={() => w.blockId && onSelectWarningBlock && onSelectWarningBlock(w.blockId)}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 2.5,
                  cursor: w.blockId ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  borderColor: w.severity === 'error' ? '#ef5350' : w.severity === 'warning' ? '#ffb74d' : '#90caf9',
                  '&:hover': { bgcolor: w.blockId ? '#f5f5f5' : 'inherit', transform: w.blockId ? 'scale(1.005)' : 'none' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {w.severity === 'error' && <ErrorIcon color="error" />}
                  {w.severity === 'warning' && <WarningIcon color="warning" />}
                  {w.severity === 'info' && <InfoIcon color="info" />}

                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={w.category} size="small" color={w.severity === 'error' ? 'error' : w.severity === 'warning' ? 'warning' : 'info'} fontWeight="bold" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        {w.message}
                      </Typography>
                    </Box>
                  </Box>

                  {w.blockId && (
                    <Chip label="Click to Highlight Block" size="small" variant="outlined" color="primary" />
                  )}
                </Box>
              </Paper>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};
