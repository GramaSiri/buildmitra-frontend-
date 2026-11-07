import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set up figure for professional architectural sheet (Arch D proportion)
fig, ax = plt.subplots(figsize=(14, 10), facecolor='#0b1329')
ax.set_facecolor('#0b1329')
ax.set_xlim(0, 100)
ax.set_ylim(0, 75)
ax.axis('off')

# Outer Blueprint Border
border = patches.Rectangle((2, 2), 96, 71, linewidth=2, edgecolor='#38bdf8', facecolor='none')
ax.add_patch(border)

# Header Banner
header_bg = patches.Rectangle((2, 64), 96, 9, linewidth=1, edgecolor='#38bdf8', facecolor='#1e293b')
ax.add_patch(header_bg)
ax.text(4, 68.5, "BUILDMITRA PROFESSIONAL ARCHITECTURAL WORKING DRAWING — DETAILED WALL PARTITIONS", color='#ffffff', fontsize=12, fontweight='bold', family='sans-serif')
ax.text(72, 68.5, "SCALE: 1/4\" = 1'-0\"", color='#38bdf8', fontsize=11, fontweight='bold', family='sans-serif')

# --- PLOT BOUNDARY (40' x 60' Plot Representation) ---
# Outer 9-inch thick boundary wall
outer_wall = patches.Rectangle((15, 10), 40, 50, linewidth=5, edgecolor='#38bdf8', facecolor='#172554')
ax.add_patch(outer_wall)
inner_plot = patches.Rectangle((17, 12), 36, 46, linewidth=1.5, edgecolor='#94a3b8', facecolor='#ffffff')
ax.add_patch(inner_plot)

# --- INTERNAL WALL PARTITIONS (Precise Double-Line Brick Walls) ---
# Living / Drawing Room (North-East Zone: x=17 to 53, y=34 to 58)
living_wall = patches.Rectangle((17, 34), 36, 2, linewidth=2, edgecolor='#1e40af', facecolor='#1e40af')
ax.add_patch(living_wall)
ax.text(35, 47, "LIVING / DRAWING ROOM\n16' x 14' (North-East Zone)", color='#0f172a', fontsize=10, fontweight='bold', ha='center', va='center')

# Modular Kitchen (South-East Fire Zone: x=37 to 53, y=12 to 34)
kitchen_wall = patches.Rectangle((37, 12), 2, 22, linewidth=2, edgecolor='#c2410c', facecolor='#c2410c')
ax.add_patch(kitchen_wall)
ax.text(45, 23, "MODULAR KITCHEN\n11' x 12'\n(SE Fire Zone)", color='#7c2d12', fontsize=9, fontweight='bold', ha='center', va='center')

# Staircase & Lift Core (West / NW Core)
core_wall = patches.Rectangle((17, 12), 12, 22, linewidth=2, edgecolor='#f59e0b', facecolor='#fef3c7')
ax.add_patch(core_wall)
ax.text(23, 23, "STAIRS &\nLIFT CORE\n(3'3\" Width)", color='#b45309', fontsize=9, fontweight='bold', ha='center', va='center')

# --- ARCHITECTURAL DOOR SWING ARCS ---
# Main Entry Door Swing
arc_main = patches.Arc((17, 45), 5, 5, angle=0, theta1=270, theta2=360, color='#ef4444', lw=2, ls='--')
ax.add_patch(arc_main)
ax.text(12, 46, "MAIN ENTRY 🚪", color='#ef4444', fontsize=9, fontweight='bold', family='sans-serif')

# --- CHAIN DIMENSIONING ARROWS ---
# Plot Width Top Dimension
ax.plot([15, 55], [62, 62], color='#ef4444', lw=1.5)
ax.text(35, 62.8, "40'-0\" (PLOT WIDTH)", color='#ef4444', fontsize=10, fontweight='bold', ha='center', va='center', bbox=dict(boxstyle='round,pad=0.2', fc='white', ec='none'))

# Plot Length Right Dimension
ax.plot([57, 57], [10, 60], color='#ef4444', lw=1.5)
ax.text(60.5, 35, "60'-0\" (PLOT LENGTH)", color='#ef4444', fontsize=10, fontweight='bold', ha='center', va='center', rotation=90, bbox=dict(boxstyle='round,pad=0.2', fc='white', ec='none'))

# --- TITLE BLOCK (Bottom) ---
title_block = patches.Rectangle((2, 2), 96, 12, linewidth=1.5, edgecolor='#38bdf8', facecolor='#1e293b')
ax.add_patch(title_block)
ax.text(4, 9.5, "PROJECT: Reddy Residential Project (G+3 Storeys)", color='#ffffff', fontsize=10, fontweight='bold', family='sans-serif')
ax.text(4, 5.5, "SPECIFICATIONS: Double Brick Walls (9\" Ext, 4.5\" Int), Quarter Door Swings, Vastu Aligned", color='#94a3b8', fontsize=9, family='sans-serif')
ax.text(70, 9.5, "STATUS: APPROVED FOR CONSTRUCTION", color='#22c55e', fontsize=10, fontweight='bold', family='sans-serif')
ax.text(70, 5.5, "DATE: October 2026", color='#94a3b8', fontsize=9, family='sans-serif')

plt.tight_layout()
plt.savefig('professional_wall_partition_plan.png', dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Successfully generated professional_wall_partition_plan.png locally!")