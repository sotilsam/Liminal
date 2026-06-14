/**
 * 3D LIMB MODEL LIBRARY
 * =====================
 * Defines the GLB models available for the virtual limb.
 *
 * HOW TO ADD A NEW MODEL
 * ----------------------
 * 1. Put your .glb file in the `public/models/` folder
 *    (create the folder if it doesn't exist). e.g. public/models/arm_right.glb
 * 2. Add an entry to the MODELS array below. `url` is the public path WITHOUT
 *    the `public` prefix, e.g. "/models/arm_right.glb".
 * 3. Set `limbType` ('arm' | 'leg') and `level`
 *    ('above_elbow' | 'below_elbow' | 'above_knee' | 'below_knee') so the model
 *    shows up for the matching injury configuration.
 * 4. If the model appears ROTATED in the wrong direction, adjust `rotationOffset`
 *    (radians). Models exported from meshy.ai / Blender / etc. often come in an
 *    arbitrary orientation — try Math.PI / 2 increments on each axis until the
 *    limb hangs downward from its joint:
 *        rotationOffset: { x: Math.PI / 2, y: 0, z: 0 }
 * 5. If the model appears too big or too small, adjust `scaleMultiplier`
 *    (1.0 = no change, 1.2 = 20% bigger, 0.8 = 20% smaller).
 *
 * The convention the engine expects: the TOP of the model's bounding box is the
 * joint / attachment point, and the model extends DOWNWARD (-Y) from there.
 * `rotationOffset` is your tool to make an arbitrary GLB match that convention.
 *
 * NOTE: the entries below are PLACEHOLDERS pointing at files that may not exist
 * yet — they document the format. Selecting one before the .glb is added will
 * fall back to the built-in procedural limb.
 */

export const MODELS = [
  {
    id: 'arm_left_above',
    label: 'יד שמאל — ריאליסטית',
    url: '/models/arm_left.glb',
    limbType: 'arm',
    level: 'above_elbow',
    rotationOffset: { x: 0, y: 0, z: 0 },
    scaleMultiplier: 1.0,
  },
  {
    id: 'leg_left_above',
    label: 'רגל שמאל — ריאליסטית',
    url: '/models/leg_left.glb',
    limbType: 'leg',
    level: 'above_knee',
    rotationOffset: { x: 0, y: 0, z: 0 },
    scaleMultiplier: 1.0,
  },
  {
    id: 'leg_right_above',
    label: 'רגל ימין — ריאליסטית',
    url: '/models/leg_right.glb',
    limbType: 'leg',
    level: 'above_knee',
    rotationOffset: { x: 0, y: 0, z: 0 },
    scaleMultiplier: 1.0,
  },
];

/** All models matching the given limb type and amputation level. */
export function getModelsFor(limbType, level) {
  return MODELS.filter((m) => m.limbType === limbType && m.level === level);
}

/** Look up a single model config by its id (null if not found). */
export function getModelById(id) {
  return MODELS.find((m) => m.id === id) || null;
}

/** Look up a single model config by its url (null if not found). */
export function getModelByUrl(url) {
  return MODELS.find((m) => m.url === url) || null;
}
