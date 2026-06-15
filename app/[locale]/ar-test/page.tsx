'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ARSession from '@/components/ar/components/ARSession';
import { ArTrainingInstructions } from '@/components/ar/ArTrainingInstructions';
import { setLastModelUrl } from '@/lib/limbSelection';
import { createClient } from '@/lib/supabase';

type LimbConfig = { limbType: string; side: string; level: string };

const LIMB_TYPES = ['leg', 'arm'];
const SIDES = ['left', 'right'];
const LEVELS = ['above_knee', 'below_knee', 'above_elbow', 'below_elbow'];

// Build the config from URL params (?limbType=&side=&level=) — the injury the
// patient already chose in Limb Selection. Falls back to a sensible default
// when a param is missing or invalid.
function initialConfig(params: URLSearchParams): LimbConfig {
  const pick = (key: string, allowed: string[], fallback: string) => {
    const v = params.get(key);
    return v && allowed.includes(v) ? v : fallback;
  };
  return {
    limbType: pick('limbType', LIMB_TYPES, 'leg'),
    side: pick('side', SIDES, 'right'),
    level: pick('level', LEVELS, 'above_knee'),
  };
}

// The .glb that matches a limb config, by naming convention
// (e.g. leg_above_left_01.glb). The engine falls back to the built-in
// procedural limb if that file isn't present.
function modelForConfig(c: LimbConfig): string {
  const lvl = c.level.startsWith('above') ? 'above' : 'below';
  return `/models/${c.limbType}_${lvl}_${c.side}_01.glb`;
}

function ARTestContent() {
  const t = useTranslations('dashboard');
  const searchParams = useSearchParams();
  // The injury is fixed for this session — read once from the URL.
  const [config] = useState<LimbConfig>(() => initialConfig(searchParams));
  // The model the camera renders. The dashboard passes the patient's chosen limb
  // via ?model=; otherwise we derive the matching model from the limb config.
  const [modelUrl] = useState(() => {
    const m = searchParams.get('model');
    return m !== null ? m : modelForConfig(config);
  });

  // Remember the model currently loaded so the dashboard can offer to reuse it,
  // scoped to the signed-in patient (not shared across accounts on this browser).
  useEffect(() => {
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const userId = data.user?.id;
        if (active && userId) setLastModelUrl(userId, modelUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [modelUrl]);

  return (
    <div style={{
      minHeight: '100vh', background: '#07070f', color: '#eef0f6',
      fontFamily: '"Heebo", sans-serif', padding: '16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 16, direction: 'ltr',
    }}>
      <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Link
          href="/dashboard/patient"
          style={{
            alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#eef0f6', textDecoration: 'none', fontSize: 14, fontWeight: 600,
            background: '#0e0e1a', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 10, padding: '9px 14px',
          }}
        >
          <ArrowLeft size={16} />
          {t('back_to_dashboard')}
        </Link>
        <ARSession limbType={config.limbType} side={config.side} level={config.level} modelUrl={modelUrl} />
      </div>
      <ArTrainingInstructions />
    </div>
  );
}

export default function ARTestPage() {
  return (
    <Suspense fallback={null}>
      <ARTestContent />
    </Suspense>
  );
}
