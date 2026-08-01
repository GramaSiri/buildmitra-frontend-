import React from 'react';
import { Box, Paper, Typography, Grid, Divider, Chip, Stack } from '@mui/material';
import { BlockItem, PlotConfig, getBoundingBox, calculateAreaMetrics } from '../../../utils/games/layoutValidation';

interface BlueprintViewerProps {
  plot: PlotConfig;
  blocks: BlockItem[];
}

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ plot, blocks }) => {
  const metrics = calculateAreaMetrics(blocks, plot);
  const scale = 14; // 14 pixels per foot

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 520, display: 'flex', flexDirection: 'column' }}>
      {/* Top Engineering Blueprint Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: '#0a192f',
          color: '#64ffda',
          borderRadius: 3,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1, color: '#64ffda' }}>
            📐 ARCHITECTURAL 2D BLUEPRINT VIEW
          </Typography>
          <Typography variant="caption" color="#8892b0">
            IS Code Compliant Blueprint • Plot Size: {plot.width}' × {plot.length}' ({metrics.plotArea} sq.ft)
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Chip label={`Carpet: ${metrics.carpetArea} sq.ft`} size="small" sx={{ bgcolor: 'rgba(100,255,218,0.15)', color: '#64ffda', fontWeight: 'bold' }} />
          <Chip label={`Built-Up: ${metrics.builtUpArea} sq.ft`} size="small" sx={{ bgcolor: 'rgba(100,255,218,0.15)', color: '#64ffda', fontWeight: 'bold' }} />
          <Chip label={`Efficiency: ${metrics.efficiencyRatio}%`} size="small" sx={{ bgcolor: 'rgba(0,230,118,0.2)', color: '#00e676', fontWeight: 'bold' }} />
        </Stack>
      </Paper>

      {/* Main CAD Blueprint Canvas */}
      <Paper
        elevation={4}
        sx={{
          flexGrow: 1,
          p: 4,
          bgcolor: '#0d1b2a',
          borderRadius: 3,
          position: 'relative',
          overflow: 'auto',
          display: 'flex',
          justify: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: plot.width * scale,
            height: plot.length * scale,
            bgcolor: '#0d1b2a',
            border: '2px solid #415a77',
            backgroundImage: `
              linear-gradient(to right, rgba(65, 90, 119, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(65, 90, 119, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: `${plot.gridSpacing * scale}px ${plot.gridSpacing * scale}px`
          }}
        >
          {/* Blueprint Title Block (Bottom Right) */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              border: '1.5px solid #64ffda',
              p: 1,
              bgcolor: 'rgba(13,27,42,0.9)',
              color: '#e0e1dd',
              fontSize: 10,
              fontFamily: 'monospace'
            }}
          >
            <div>PROJECT: BUILDMITRA RESIDENTIAL</div>
            <div>DRAWING: 2D KEY PLAN & COLUMN GRID</div>
            <div>SCALE: 1:{scale} • UNIT: FEET</div>
          </Box>

          {/* North Direction Arrow */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: '#64ffda',
              fontWeight: 'bold',
              fontSize: 14,
              fontFamily: 'monospace'
            }}
          >
            NORTH ⬆
          </Box>

          {/* Setback Dotted Boundary */}
          <Box
            sx={{
              position: 'absolute',
              top: plot.setbackFront * scale,
              left: plot.setbackLeft * scale,
              right: plot.setbackRight * scale,
              bottom: plot.setbackRear * scale,
              border: '1.5px dashed #ff0055',
              pointerEvents: 'none'
            }}
          />

          {/* Render Blueprint Blocks with CAD Styling */}
          {blocks.map(b => {
            const box = getBoundingBox(b);
            const isColumn = b.name.toLowerCase().includes('column');
            const isDoor = b.name.toLowerCase().includes('door');
            const isWindow = b.name.toLowerCase().includes('window');

            return (
              <Box
                key={b.id}
                sx={{
                  position: 'absolute',
                  left: box.x1 * scale,
                  top: box.y1 * scale,
                  width: box.width * scale,
                  height: box.length * scale,
                  bgcolor: isColumn ? '#e63946' : isDoor ? 'rgba(255,183,77,0.4)' : isWindow ? 'rgba(79,195,247,0.4)' : 'rgba(27, 38, 59, 0.85)',
                  border: '1.5px solid #e0e1dd',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justify: 'center',
                  color: isColumn ? '#ffffff' : '#e0e1dd',
                  p: 0.5,
                  fontSize: 11,
                  fontFamily: 'monospace'
                }}
              >
                {!isColumn && (
                  <>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#64ffda', fontSize: '10px' }}>
                      {b.label || b.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '9px', opacity: 0.8 }}>
                      {b.width}' × {b.length}' ({box.width * box.length} sq.ft)
                    </Typography>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};
