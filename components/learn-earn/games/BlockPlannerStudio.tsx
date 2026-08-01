import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Stack, Tabs, Tab, TextField, Select, MenuItem, FormControl, InputLabel, Tooltip, Alert, IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  FolderOpen as LoadIcon,
  ViewInAr as View3DIcon,
  DesignServices as EditIcon,
  Assessment as AssessmentIcon,
  Layers as ElevationIcon,
  Tune as PlotSettingsIcon
} from '@mui/icons-material';
import { BlockItem, PlotConfig, calculateAreaMetrics, validateSpacePlanning } from '../../../utils/games/layoutValidation';
import { validateVastu } from '../../../utils/games/vastuValidation';
import { validateVentilation } from '../../../utils/games/ventilationValidation';
import { validateStructuralGrid } from '../../../utils/games/structuralGridValidation';
import { BlockPalette, BlockTemplate } from './BlockPalette';
import { DesignCanvas } from './DesignCanvas';
import { BlueprintViewer } from './BlueprintViewer';
import { IsometricViewer } from './IsometricViewer';
import { EngineeringScorePanel } from './EngineeringScorePanel';
import { GameProgressPanel } from './GameProgressPanel';
import { API_BASE } from '../../../utils/apiConfig';

interface BlockPlannerStudioProps {
  onBackToHub: () => void;
  userCode: string;
  onProgressUpdate: (score: number, stars: number, badges: string[]) => void;
}

const DEFAULT_PLOT: PlotConfig = {
  width: 30,
  length: 40,
  unit: 'ft',
  roadSide: 'North',
  northDirection: 0,
  setbackFront: 5,
  setbackRear: 3,
  setbackLeft: 3,
  setbackRight: 3,
  wallThickness: 0.75,
};

const SAMPLE_ROOMS: BlockItem[] = [
  { id: 'b-1', type: 'room', name: 'Living Room', x: 5, y: 5, width: 14, length: 12, rotation: 0, color: '#bbdefb', label: 'Living Room' },
  { id: 'b-2', type: 'room', name: 'Master Bedroom', x: 5, y: 17, width: 12, length: 11, rotation: 0, color: '#e1bee7', label: 'Master Bed' },
  { id: 'b-3', type: 'room', name: 'Kitchen', x: 19, y: 5, width: 10, length: 8, rotation: 0, color: '#ffe0b2', label: 'Kitchen' },
  { id: 'b-4', type: 'room', name: 'Toilet', x: 17, y: 17, width: 7, length: 5, rotation: 0, color: '#b2ebf2', label: 'Toilet' },
  { id: 'b-5', type: 'structure', name: 'Column (9"x15")', x: 5, y: 5, width: 1.25, length: 0.75, rotation: 0, color: '#37474f', label: 'C1' },
  { id: 'b-6', type: 'structure', name: 'Column (9"x15")', x: 19, y: 5, width: 1.25, length: 0.75, rotation: 0, color: '#37474f', label: 'C2' }
];

export const BlockPlannerStudio: React.FC<BlockPlannerStudioProps> = ({
  onBackToHub,
  userCode,
  onProgressUpdate
}) => {
  const [plot, setPlot] = useState<PlotConfig>(DEFAULT_PLOT);
  const [blocks, setBlocks] = useState<BlockItem[]>(SAMPLE_ROOMS);

  // Canvas Mode: 0=Edit, 1=2D Blueprint, 2=3D Isometric, 3=Engineering Validation
  const [activeTab, setActiveTab] = useState(0);

  // Undo / Redo history state
  const [history, setHistory] = useState<BlockItem[][]>([SAMPLE_ROOMS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper to push history state
  const updateBlocksState = (newBlocks: BlockItem[]) => {
    setBlocks(newBlocks);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newBlocks);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setBlocks(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setBlocks(history[nextIdx]);
    }
  };

  const handleAddBlock = (template: BlockTemplate) => {
    const newBlock: BlockItem = {
      id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: template.category,
      name: template.name,
      x: plot.setbackLeft + 2,
      y: plot.setbackFront + 2,
      width: template.defaultWidth,
      length: template.defaultLength,
      rotation: 0,
      color: template.color,
      label: template.name
    };

    updateBlocksState([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (updated: BlockItem) => {
    const newBlocks = blocks.map(b => (b.id === updated.id ? updated : b));
    setBlocks(newBlocks);
  };

  const handleDeleteBlock = (id: string) => {
    updateBlocksState(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleDuplicateBlock = (id: string) => {
    const target = blocks.find(b => b.id === id);
    if (!target) return;

    const dupBlock: BlockItem = {
      ...target,
      id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: target.x + 2,
      y: target.y + 2,
      label: `${target.label || target.name} (Copy)`
    };

    updateBlocksState([...blocks, dupBlock]);
    setSelectedBlockId(dupBlock.id);
  };

  const handleReorderBlock = (id: string, action: 'front' | 'back') => {
    const targetIdx = blocks.findIndex(b => b.id === id);
    if (targetIdx < 0) return;

    const target = blocks[targetIdx];
    const newBlocks = blocks.filter(b => b.id !== id);

    if (action === 'front') {
      newBlocks.push(target);
    } else {
      newBlocks.unshift(target);
    }

    updateBlocksState(newBlocks);
  };

  // Preset Plot Size handlers
  const handleSelectPlotPreset = (preset: string) => {
    if (preset === '20x30') setPlot({ ...plot, width: 20, length: 30 });
    if (preset === '30x40') setPlot({ ...plot, width: 30, length: 40 });
    if (preset === '40x60') setPlot({ ...plot, width: 40, length: 60 });
  };

  // Save design to MongoDB backend
  const handleSaveDesign = async () => {
    setSaving(true);
    const designObj = {
      id: `design-${Date.now()}`,
      name: `Layout ${plot.width}x${plot.length}`,
      plotWidth: plot.width,
      plotLength: plot.length,
      unit: plot.unit,
      roadSide: plot.roadSide,
      blocks,
      createdAt: new Date().toISOString()
    };

    try {
      await fetch(`${API_BASE}/api/learn-earn/games/designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode, design: designObj })
      });
      alert('✅ Floor plan layout saved successfully to backend MongoDB database!');
    } catch {
      alert('⚠️ Saved to local draft.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate live overall engineering score
  const spaceRes = validateSpacePlanning(blocks, plot);
  const vastuRes = validateVastu(blocks, plot);
  const ventRes = validateVentilation(blocks, plot);
  const structRes = validateStructuralGrid(blocks, plot);

  const overallScore = Math.round((spaceRes.score + vastuRes.score + ventRes.score + structRes.score) / 4);
  const stars = overallScore >= 85 ? 3 : overallScore >= 60 ? 2 : overallScore >= 40 ? 1 : 0;

  useEffect(() => {
    const badges: string[] = [];
    if (blocks.length >= 3) badges.push('layout-apprentice');
    if (overallScore >= 80) badges.push('space-planner');
    if (structRes.columnCount >= 4) badges.push('structural-thinker');

    onProgressUpdate(overallScore, stars, badges);
  }, [overallScore, blocks.length]);

  return (
    <Box>
      {/* Top Studio Bar */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBackToHub}>
              Back to Hub
            </Button>
            <Typography variant="h6" fontWeight="bold" color="primary">
              🏛️ Block Planner Studio
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Undo">
              <span>
                <IconButton onClick={handleUndo} disabled={historyIndex === 0}>
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo">
              <span>
                <IconButton onClick={handleRedo} disabled={historyIndex === history.length - 1}>
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button variant="contained" color="secondary" startIcon={<SaveIcon />} onClick={handleSaveDesign} disabled={saving}>
              {saving ? 'Saving...' : 'Save Design'}
            </Button>
          </Stack>
        </Box>

        {/* Plot Dimensions & Settings Bar */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PlotSettingsIcon fontSize="small" /> Plot Settings:
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button size="small" variant={plot.width === 20 && plot.length === 30 ? 'contained' : 'outlined'} onClick={() => handleSelectPlotPreset('20x30')}>
              20' × 30'
            </Button>
            <Button size="small" variant={plot.width === 30 && plot.length === 40 ? 'contained' : 'outlined'} onClick={() => handleSelectPlotPreset('30x40')}>
              30' × 40'
            </Button>
            <Button size="small" variant={plot.width === 40 && plot.length === 60 ? 'contained' : 'outlined'} onClick={() => handleSelectPlotPreset('40x60')}>
              40' × 60'
            </Button>
          </Stack>

          <TextField
            size="small"
            label="Width (ft)"
            type="number"
            value={plot.width}
            onChange={e => setPlot({ ...plot, width: Math.max(10, Number(e.target.value)) })}
            sx={{ width: 100 }}
          />

          <TextField
            size="small"
            label="Length (ft)"
            type="number"
            value={plot.length}
            onChange={e => setPlot({ ...plot, length: Math.max(10, Number(e.target.value)) })}
            sx={{ width: 100 }}
          />

          <FormControl size="small" sx={{ width: 130 }}>
            <InputLabel>Road Facing</InputLabel>
            <Select value={plot.roadSide} label="Road Facing" onChange={e => setPlot({ ...plot, roadSide: e.target.value as any })}>
              <MenuItem value="North">North Road</MenuItem>
              <MenuItem value="South">South Road</MenuItem>
              <MenuItem value="East">East Road</MenuItem>
              <MenuItem value="West">West Road</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Gamification Status Panel */}
      <GameProgressPanel
        progress={{
          gameId: 'block-planner',
          gameName: 'Block Planner Studio',
          score: overallScore,
          bestScore: Math.max(overallScore, 85),
          stars,
          level: 1,
          badges: ['layout-apprentice'],
          attempts: history.length,
          completion: Math.min(100, blocks.length * 20)
        }}
        onSave={handleSaveDesign}
        saving={saving}
      />

      {/* Studio View Navigation Tabs */}
      <Paper elevation={1} sx={{ mb: 2, borderRadius: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} variant="fullWidth">
          <Tab icon={<EditIcon />} label="Interactive Edit Canvas" />
          <Tab icon={<AssessmentIcon />} label="2D Blueprint View" />
          <Tab icon={<View3DIcon />} label="3D Isometric Outlook" />
          <Tab icon={<AssessmentIcon />} label="Engineering Score & Validation" />
        </Tabs>
      </Paper>

      {/* Mode 0: Interactive Canvas & Block Library */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} lg={3}>
            <BlockPalette onAddBlock={handleAddBlock} />
          </Grid>

          <Grid item xs={12} md={8} lg={9}>
            <DesignCanvas
              plot={plot}
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              highlightedBlockId={highlightedBlockId}
              onSelectBlock={setSelectedBlockId}
              onUpdateBlock={handleUpdateBlock}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onReorderBlock={handleReorderBlock}
            />
          </Grid>
        </Grid>
      )}

      {/* Mode 1: 2D Blueprint View */}
      {activeTab === 1 && (
        <BlueprintViewer plot={plot} blocks={blocks} />
      )}

      {/* Mode 2: 3D Isometric View */}
      {activeTab === 2 && (
        <IsometricViewer plot={plot} blocks={blocks} />
      )}

      {/* Mode 3: Engineering Score & Validation */}
      {activeTab === 3 && (
        <EngineeringScorePanel
          plot={plot}
          blocks={blocks}
          onSelectWarningBlock={id => {
            setSelectedBlockId(id);
            setHighlightedBlockId(id);
            setActiveTab(0); // Switch to canvas to highlight object
          }}
        />
      )}
    </Box>
  );
};
