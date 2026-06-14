import { getModelsFor } from '../lib/limbModels';
import styles from './ModelSelector.module.css';

/**
 * Visual picker for the virtual limb's 3D model.
 * Shows the models matching the current limbType/level plus a "Placeholder"
 * option (built-in procedural limb). Emits the selected model URL via onChange;
 * the placeholder emits '' so the engine falls back to the procedural limb.
 */
export default function ModelSelector({ limbType, level, value = '', onChange }) {
  const models = getModelsFor(limbType, level);

  return (
    <div className={styles.selector}>
      <span className={styles.label}>דגם תלת-מימד</span>
      <div className={styles.grid}>
        <button
          type="button"
          className={`${styles.card} ${value === '' ? styles.on : ''}`}
          onClick={() => onChange('')}
        >
          <span className={styles.cardTitle}>ברירת מחדל</span>
          <span className={styles.cardSub}>דגם מובנה</span>
        </button>

        {models.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`${styles.card} ${value === m.url ? styles.on : ''}`}
            onClick={() => onChange(m.url)}
          >
            <span className={styles.cardTitle}>{m.label}</span>
            <span className={styles.cardSub}>{m.url.split('/').pop()}</span>
          </button>
        ))}

        {models.length === 0 && (
          <span className={styles.empty}>אין דגמים זמינים לסוג גפה זה</span>
        )}
      </div>
    </div>
  );
}
