export const POSE = {
  SHOULDER_L: 11, SHOULDER_R: 12,
  ELBOW_L: 13,    ELBOW_R: 14,
  WRIST_L: 15,    WRIST_R: 16,
  HIP_L: 23,      HIP_R: 24,
  KNEE_L: 25,     KNEE_R: 26,
  ANKLE_L: 27,    ANKLE_R: 28,
};

export const LIMB_CONFIGS = {
  leg: {
    above_knee: {
      label: 'Above knee',
      right: { anchor: POSE.HIP_R,  chain: [POSE.HIP_R, POSE.KNEE_R, POSE.ANKLE_R] },
      left:  { anchor: POSE.HIP_L,  chain: [POSE.HIP_L, POSE.KNEE_L, POSE.ANKLE_L] },
    },
    below_knee: {
      label: 'Below knee',
      right: { anchor: POSE.KNEE_R, chain: [POSE.KNEE_R, POSE.ANKLE_R] },
      left:  { anchor: POSE.KNEE_L, chain: [POSE.KNEE_L, POSE.ANKLE_L] },
    },
  },
  arm: {
    above_elbow: {
      label: 'Above elbow',
      right: { anchor: POSE.SHOULDER_R, chain: [POSE.SHOULDER_R, POSE.ELBOW_R, POSE.WRIST_R] },
      left:  { anchor: POSE.SHOULDER_L, chain: [POSE.SHOULDER_L, POSE.ELBOW_L, POSE.WRIST_L] },
    },
    below_elbow: {
      label: 'Below elbow',
      right: { anchor: POSE.ELBOW_R, chain: [POSE.ELBOW_R, POSE.WRIST_R] },
      left:  { anchor: POSE.ELBOW_L, chain: [POSE.ELBOW_L, POSE.WRIST_L] },
    },
  },
};

export function getIntactConfig(limbType, level, affectedSide) {
  const intact = affectedSide === 'right' ? 'left' : 'right';
  return LIMB_CONFIGS[limbType]?.[level]?.[intact];
}

export function getAffectedConfig(limbType, level, affectedSide) {
  return LIMB_CONFIGS[limbType]?.[level]?.[affectedSide];
}

export function getLevelsForType(limbType) {
  if (limbType === 'leg') return [
    { value: 'above_knee', label: 'Above knee' },
    { value: 'below_knee', label: 'Below knee' },
  ];
  return [
    { value: 'above_elbow', label: 'Above elbow' },
    { value: 'below_elbow', label: 'Below elbow' },
  ];
}
