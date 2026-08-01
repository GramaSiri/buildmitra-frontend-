import React, { useState } from 'react';
import { Box, Paper, Typography, Slider, Stack, Chip, FormControlLabel, Switch, Tooltip } from '@mui/material';
import { BlockItem, PlotConfig, getBoundingBox } from '../../../utils/games/layoutValidation';
import { WbSunny as SunIcon, Height as HeightIcon } from '@mui/icons-material';

interface IsometricViewerProps {
  plot: PlotConfig;
  blocks: BlockItem[];
}

export const IsometricViewer: React.FC<IsometricViewerProps> = ({ plot, blocks }) => {
  const [wallHeight, setWallHeight] = useState(10); // 10 ft standard floor height
  const [sunAngle, setSunAngle] = useState(45);
  const [showRoof, setShowRoof] = useState(false);
  const [showShadows, setShowShadows] = useState(true);

  // Isometric 2.5D projection matrix formulas:
  // isoX = (x - y) * cos(30deg)
  // isoY = (x + y) * sin(30deg) - z
  const isoScale = 12;
  const cos30 = Math.cos(Math.PI / 6); // ~0.866
  const sin30 = Math.sin(Math.PI / 6); // 0.5

  const projectIso = (xFeet: number, yFeet: number, zFeet: number = 0) => {
    const px = (xFeet - yFeet) * cos30 * isoScale;
    const py = (xFeet + yFeet) * sin30 * isoScale - zFeet * isoScale * 0.7;
    return { x: px + 350, y: py + 120 };
  };

  const roomBlocks = blocks.filter(b => b.type === 'room');
  const columnBlocks = blocks.filter(b => b.name.toLowerCase().includes('column'));
  const furnitureBlocks = blocks.filter(b => b.type === 'furniture');

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 560, display: 'flex', flexDirection: 'column' }}>
      {/* 3D Outlook Controls Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: '#1a237e',
          color: 'white',
          borderRadius: 3,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffb74d' }}>
            🏢 DYNAMIC 3D ISOMETRIC OUTLOOK
          </Typography>
          <Typography variant="caption" color="#e0e0e0">
            Real-Time 3D Architectural Volume Projection • Updates live with block movements
          </Typography>
        </Box>

        <Stack direction="row" spacing={3} alignItems="center">
          <Box sx={{ width: 140 }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HeightIcon fontSize="small" /> Wall Height: <strong>{wallHeight} ft</strong>
            </Typography>
            <Slider
              size="small"
              value={wallHeight}
              min={6}
              max={15}
              onChange={(_, v) => setWallHeight(v as number)}
              sx={{ color: '#ffb74d' }}
            />
          </Box>

          <Box sx={{ width: 140 }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SunIcon fontSize="small" /> Sunlight: <strong>{sunAngle}°</strong>
            </Typography>
            <Slider
              size="small"
              value={sunAngle}
              min={0}
              max={180}
              onChange={(_, v) => setSunAngle(v as number)}
              sx={{ color: '#ffb74d' }}
            />
          </Box>

          <FormControlLabel
            control={<Switch checked={showRoof} onChange={e => setShowRoof(e.target.checked)} color="warning" />}
            label={<Typography variant="caption">Show Terrace Slab</Typography>}
          />
        </Stack>
      </Paper>

      {/* 3D SVG Projection Screen */}
      <Paper
        elevation={4}
        sx={{
          flexGrow: 1,
          bgcolor: '#0f172a',
          borderRadius: 3,
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justify: 'center',
          alignItems: 'center'
        }}
      >
        <svg width="750" height="500" viewBox="0 0 700 480" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#cfd8dc" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="10" dy="15" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Base Ground Plot Footprint */}
          {(() => {
            const p1 = projectIso(0, 0, 0);
            const p2 = projectIso(plot.width, 0, 0);
            const p3 = projectIso(plot.width, plot.length, 0);
            const p4 = projectIso(0, plot.length, 0);
            return (
              <polygon
                points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="2"
              />
            );
          })()}

          {/* Render 3D Rooms & Walls */}
          {roomBlocks.map(b => {
            const box = getBoundingBox(b);

            // Ground base points
            const g1 = projectIso(box.x1, box.y1, 0);
            const g2 = projectIso(box.x2, box.y1, 0);
            const g3 = projectIso(box.x2, box.y2, 0);
            const g4 = projectIso(box.x1, box.y2, 0);

            // Top roof points
            const t1 = projectIso(box.x1, box.y1, wallHeight);
            const t2 = projectIso(box.x2, box.y1, wallHeight);
            const t3 = projectIso(box.x2, box.y2, wallHeight);
            const t4 = projectIso(box.x1, box.y2, wallHeight);

            return (
              <g key={b.id} filter={showShadows ? 'url(#dropShadow)' : undefined}>
                {/* Floor Slab Base */}
                <polygon
                  points={`${g1.x},${g1.y} ${g2.x},${g2.y} ${g3.x},${g3.y} ${g4.x},${g4.y}`}
                  fill={b.color || '#90caf9'}
                  stroke="#475569"
                  strokeWidth="1.5"
                  opacity="0.9"
                />

                {/* Left Wall Face */}
                <polygon
                  points={`${g1.x},${g1.y} ${g4.x},${g4.y} ${t4.x},${t4.y} ${t1.x},${t1.y}`}
                  fill="#94a3b8"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.85"
                />

                {/* Front Wall Face */}
                <polygon
                  points={`${g4.x},${g4.y} ${g3.x},${g3.y} ${t3.x},${t3.y} ${t4.x},${t4.y}`}
                  fill="#cbd5e1"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.95"
                />

                {/* Right Wall Face */}
                <polygon
                  points={`${g2.x},${g2.y} ${g3.x},${g3.y} ${t3.x},${t3.y} ${t2.x},${t2.y}`}
                  fill="#64748b"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* Top Terrace Slab if enabled */}
                {showRoof && (
                  <polygon
                    points={`${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y} ${t4.x},${t4.y}`}
                    fill="#e2e8f0"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                )}

                {/* Room Label Text floating in 3D */}
                <text
                  x={(t1.x + t3.x) / 2}
                  y={(t1.y + t3.y) / 2}
                  fill="#0f172a"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {b.label || b.name}
                </text>
              </g>
            );
          })}

          {/* Render 3D Column Posts */}
          {columnBlocks.map(c => {
            const box = getBoundingBox(c);
            const g1 = projectIso(box.x1, box.y1, 0);
            const t1 = projectIso(box.x1, box.y1, wallHeight);
            return (
              <g key={c.id}>
                <line x1={g1.x} y1={g1.y} x2={t1.x} y2={t1.y} stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                <circle cx={t1.x} cy={t1.y} r="4" fill="#ff9800" />
              </g>
            );
          })}
        </svg>
      </Paper>
    </Box>
  );
};
