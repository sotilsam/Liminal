import { getLevelsForType } from '../lib/landmarks';
import styles from './LimbSelector.module.css';

export default function LimbSelector({ value, onChange }) {
  const { limbType, side, level } = value;
  const levels = getLevelsForType(limbType);

  const set = (key, val) => {
    const next = { ...value, [key]: val };
    if (key === 'limbType') next.level = val === 'leg' ? 'above_knee' : 'above_elbow';
    onChange(next);
  };

  return (
    <div className={styles.selector}>
      <div className={styles.group}>
        <span className={styles.label}>Limb type</span>
        <div className={styles.seg}>
          <button className={limbType === 'leg' ? styles.on : ''} onClick={() => set('limbType', 'leg')}>Leg</button>
          <button className={limbType === 'arm' ? styles.on : ''} onClick={() => set('limbType', 'arm')}>Arm</button>
        </div>
      </div>
      <div className={styles.group}>
        <span className={styles.label}>Injured side</span>
        <div className={styles.seg}>
          <button className={side === 'right' ? styles.on : ''} onClick={() => set('side', 'right')}>Right</button>
          <button className={side === 'left' ? styles.on : ''} onClick={() => set('side', 'left')}>Left</button>
        </div>
      </div>
      <div className={styles.group}>
        <span className={styles.label}>Amputation level</span>
        <div className={styles.seg}>
          {levels.map(l => (
            <button key={l.value} className={level === l.value ? styles.on : ''} onClick={() => set('level', l.value)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
