"use client";

import { useEffect } from "react";

interface HtmlAttributesProps {
  locale: string;
}

export function HtmlAttributes({ locale }: HtmlAttributesProps) {
  useEffect(() => {
    const dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
