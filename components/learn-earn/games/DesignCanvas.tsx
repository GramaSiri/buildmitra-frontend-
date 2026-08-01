import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, IconButton, Tooltip, Stack, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  RotateRight as RotateIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  FlipToFront as FrontIcon,
  FlipToBack as BackIcon,
  Edit as EditIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusWeak as ResetZoomIcon
} from '@mui/icons-material';
import { BlockItem, PlotConfig, getBoundingBox } from '../../../utils/games/layoutValidation';

interface DesignCanvasProps {
  plot: PlotConfig;
  blocks: BlockItem[];
  selectedBlockId: string | null;
  highlightedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (updated: BlockItem) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onReorderBlock: (id: string, action: 'front' | 'back') => void;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  plot,
  blocks,
  selectedBlockId,
  highlightedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onReorderBlock
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editWidth, setEditWidth] = useState(10);
  const [editLength, setEditLength] = useState(10);
  const [editLabel, setEditLabel] = useState('');

  // Pixel scale calculation: fit plot within canvas view
  const scale = 14 * zoom; // 14 pixels per foot at zoom=1

  const activeBlock = blocks.find(b => b.id === selectedBlockId);

  // Handle Drag Start (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent, b: BlockItem) => {
    e.stopPropagation();
    if (b.isLocked) return;

    onSelectBlock(b.id);
    setDraggingId(b.id);

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickXFeet = (clientX - rect.left) / scale;
      const clickYFeet = (clientY - rect.top) / scale;

      setDragOffset({
        x: clickXFeet - b.x,
        y: clickYFeet - b.y
      });
    }
  };

  // Handle Drag Move (Pointer Move)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;

    const block = blocks.find(b => b.id === draggingId);
    if (!block || block.isLocked) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currXFeet = (e.clientX - rect.left) / scale - dragOffset.x;
    const currYFeet = (e.clientY - rect.top) / scale - dragOffset.y;

    // Snap to grid spacing (default 0.5ft or 1ft)
    const grid = plot.gridSpacing || 0.5;
    const snappedX = Math.max(0, Math.round(currXFeet / grid) * grid);
    const snappedY = Math.max(0, Math.round(currYFeet / grid) * grid);

    onUpdateBlock({
      ...block,
      x: snappedX,
      y: snappedY
    });
  };

  // Handle Drag End
  const handlePointerUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  const handleRotate = (b: BlockItem) => {
    const newRot = (b.rotation + 90) % 360;
    onUpdateBlock({ ...b, rotation: newRot });
  };

  const handleOpenEditDialog = (b: BlockItem) => {
    setEditWidth(b.width);
    setEditLength(b.length);
    setEditLabel(b.label || b.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (activeBlock) {
      onUpdateBlock({
        ...activeBlock,
        width: Math.max(1, Number(editWidth)),
        length: Math.max(1, Number(editLength)),
        label: editLabel
      });
    }
    setEditDialogOpen(false);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 520, display: 'flex', flexDirection: 'column' }}>
      {/* Canvas Floating Toolbar */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          display: 'flex',
          gap: 1,
          bgcolor: 'rgba(255,255,255,0.92)',
          p: 0.8,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton size="small" onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton size="small" onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset View">
          <IconButton size="small" onClick={() => setZoom(1)}>
            <ResetZoomIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Plot Drag Area */}
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          position: 'relative',
          overflow: 'auto',
          bgcolor: '#1e293b',
          borderRadius: 3,
          p: 3,
          display: 'flex',
          justify: 'center',
          alignItems: 'center',
          userSelect: 'none',
          touchAction: 'none'
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => onSelectBlock(null)}
      >
        {/* Plot Area */}
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            width: plot.width * scale,
            height: plot.length * scale,
            bgcolor: '#ffffff',
            border: '4px solid #0f172a',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
            backgroundSize: `${plot.gridSpacing * scale}px ${plot.gridSpacing * scale}px`
          }}
        >
          {/* North Direction Marker */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'rgba(26,35,126,0.1)',
              border: '2px solid #1a237e',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontWeight: 'bold',
              fontSize: 12,
              color: '#1a237e',
              transform: `rotate(${plot.northDirection}deg)`
            }}
          >
            N⬆
          </Box>

          {/* Road Side Line */}
          <Box
            sx={{
              position: 'absolute',
              top: plot.roadSide === 'North' ? -24 : 'auto',
              bottom: plot.roadSide === 'South' ? -24 : 'auto',
              left: plot.roadSide === 'West' ? -24 : 0,
              right: plot.roadSide === 'East' ? -24 : 0,
              height: plot.roadSide === 'North' || plot.roadSide === 'South' ? 20 : '100%',
              width: plot.roadSide === 'East' || plot.roadSide === 'West' ? 20 : '100%',
              bgcolor: '#ff9800',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              color: 'white',
              fontSize: 11,
              fontWeight: 'bold',
              letterSpacing: 1
            }}
          >
            ROAD SIDE ({plot.roadSide.toUpperCase()})
          </Box>

          {/* Setback Dotted Boundary Lines */}
          <Box
            sx={{
              position: 'absolute',
              top: plot.setbackFront * scale,
              left: plot.setbackLeft * scale,
              right: plot.setbackRight * scale,
              bottom: plot.setbackRear * scale,
              border: '2px dashed #e91e63',
              pointerEvents: 'none'
            }}
          >
            <Typography variant="caption" sx={{ color: '#e91e63', position: 'absolute', top: 2, left: 4, fontWeight: 'bold' }}>
              SETBACK BOUNDARY
            </Typography>
          </Box>

          {/* Render All Canvas Blocks */}
          {blocks.map(b => {
            const box = getBoundingBox(b);
            const isSelected = b.id === selectedBlockId;
            const isHighlighted = b.id === highlightedBlockId;

            return (
              <Box
                key={b.id}
                onPointerDown={e => handlePointerDown(e, b)}
                sx={{
                  position: 'absolute',
                  left: box.x1 * scale,
                  top: box.y1 * scale,
                  width: box.width * scale,
                  height: box.length * scale,
                  bgcolor: b.color || '#bbdefb',
                  border: isSelected ? '3px solid #1a237e' : isHighlighted ? '3px solid #d50000' : '1.5px solid #333333',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justify: 'center',
                  boxShadow: isSelected ? '0 0 12px rgba(26,35,126,0.5)' : 'none',
                  cursor: b.isLocked ? 'not-allowed' : 'grab',
                  animation: isHighlighted ? 'pulse 1s infinite alternate' : 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  '&:active': { cursor: b.isLocked ? 'not-allowed' : 'grabbing' },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.05)', boxShadow: '0 0 16px #d50000' }
                  }
                }}
              >
                <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '11px', px: 0.5, lineHeight: 1.1 }}>
                  {b.label || b.name}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>
                  {b.width}' × {b.length}'
                </Typography>

                {b.isLocked && (
                  <LockIcon sx={{ position: 'absolute', top: 2, right: 2, fontSize: 14, color: '#333' }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Selected Block Contextual Control Bar */}
      {activeBlock && (
        <Paper
          elevation={4}
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            bgcolor: '#ffffff',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={activeBlock.name} color="primary" fontWeight="bold" />
            <Typography variant="body2" color="textSecondary">
              Dimensions: <strong>{activeBlock.width}' × {activeBlock.length}'</strong> ({activeBlock.rotation}°)
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Rotate 90°">
              <IconButton size="small" color="primary" onClick={() => handleRotate(activeBlock)}>
                <RotateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Label / Dimensions">
              <IconButton size="small" color="info" onClick={() => handleOpenEditDialog(activeBlock)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate Block">
              <IconButton size="small" color="secondary" onClick={() => onDuplicateBlock(activeBlock.id)}>
                <DuplicateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={activeBlock.isLocked ? 'Unlock Position' : 'Lock Position'}>
              <IconButton size="small" onClick={() => onUpdateBlock({ ...activeBlock, isLocked: !activeBlock.isLocked })}>
                {activeBlock.isLocked ? <LockIcon color="warning" /> : <UnlockIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Bring to Front">
              <IconButton size="small" onClick={() => onReorderBlock(activeBlock.id, 'front')}>
                <FrontIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send to Back">
              <IconButton size="small" onClick={() => onReorderBlock(activeBlock.id, 'back')}>
                <BackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Block">
              <IconButton size="small" color="error" onClick={() => onDeleteBlock(activeBlock.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      )}

      {/* Edit Block Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Block Properties</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Room / Element Label"
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label={`Width (${plot.unit})`}
              type="number"
              value={editWidth}
              onChange={e => setEditWidth(Number(e.target.value))}
            />
            <TextField
              label={`Length (${plot.unit})`}
              type="number"
              value={editLength}
              onChange={e => setEditLength(Number(e.target.value))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
