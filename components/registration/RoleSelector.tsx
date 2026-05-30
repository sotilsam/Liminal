"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heart, Stethoscope, Sparkles } from "lucide-react";

export type Role = "patient" | "therapist" | "experience";

interface RoleSelectorProps {
  selected: Role | null;
  onSelect: (role: Role) => void;
}

type RoleIcon = React.ComponentType<{ className?: string }>;

const roles: { id: Role; icon: RoleIcon; titleKey: string; descKey: string }[] = [
  {
    id: "patient",
    icon: Heart,
    titleKey: "patient_role",
    descKey: "patient_desc",
  },
  {
    id: "therapist",
    icon: Stethoscope,
    titleKey: "therapist_role",
    descKey: "therapist_desc",
  },
  {
    id: "experience",
    icon: Sparkles,
    titleKey: "experience_role",
    descKey: "experience_desc",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  const t = useTranslations("register");

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          {t("choose_role")}
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {roles.map(({ id, icon: Icon, titleKey, descKey }) => {
          const isSelected = selected === id;
          return (
            <motion.button
              key={id}
              variants={cardVariants}
              onClick={() => onSelect(id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={[
                "flex flex-col items-center gap-4 rounded-2xl border-2 p-7 text-center transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                ].join(" ")}
              >
                <Icon className="size-7" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {t(titleKey as keyof typeof t)}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {t(descKey as keyof typeof t)}
                </p>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                >
                  <svg
                    className="size-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
