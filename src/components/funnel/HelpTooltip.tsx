'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useFunnelStore } from '@/lib/state';
import { detectBrowserLocale } from '@/lib/utm';
import { cn } from '@/lib/utils';

/**
 * Help tooltip — a small "?" trigger that opens a native-language
 * explanation of the funnel. Positioned next to the theme toggle in the
 * funnel chrome header.
 *
 * Language selection order:
 *   1. UTM `lang_hint` (already hydrated into `ui_locale_hint`)
 *   2. `ui_locale_hint` already stored (sticky across refresh)
 *   3. `navigator.language` two-letter prefix
 *   4. English fallback
 *
 * When we detect a locale we also persist it to state so the choice survives
 * across re-mounts without re-reading the browser.
 */

type SupportedLocale =
  | 'es'
  | 'pt'
  | 'fr'
  | 'ru'
  | 'zh'
  | 'ko'
  | 'ar'
  | 'ja'
  | 'en';

const TRANSLATIONS: Record<SupportedLocale, { heading: string; body: string }> = {
  es: {
    heading: '¿Necesitas ayuda?',
    body:
      'Esto es un cuestionario de 10 preguntas para armar tu plan de aprendizaje de inglés. La app está en inglés — las preguntas están escritas para que sean fáciles de leer.',
  },
  pt: {
    heading: 'Precisa de ajuda?',
    body:
      'Este é um questionário de 10 perguntas para montar o seu plano de aprendizado de inglês. O app está em inglês — as perguntas estão escritas para serem fáceis de ler.',
  },
  fr: {
    heading: 'Besoin d’aide ?',
    body:
      'Ceci est un questionnaire de 10 questions pour construire votre plan d’apprentissage de l’anglais. L’application est en anglais — les questions sont rédigées pour être faciles à lire.',
  },
  ru: {
    heading: 'Нужна помощь?',
    body:
      'Это опрос из 10 вопросов, чтобы собрать ваш план изучения английского. Приложение на английском — вопросы написаны простым языком.',
  },
  zh: {
    heading: '需要帮助？',
    body:
      '这是一份10个问题的问卷，用于为你定制英语学习计划。应用界面是英文 — 每个问题都写得简单易懂。',
  },
  ko: {
    heading: '도움이 필요하신가요?',
    body:
      '이 10개의 질문은 당신의 영어 학습 계획을 만들기 위한 것입니다. 앱은 영어로 제공되지만, 각 질문은 읽기 쉽게 작성되었습니다.',
  },
  ar: {
    heading: 'هل تحتاج إلى مساعدة؟',
    body:
      'هذا استبيان من 10 أسئلة لبناء خطة تعلم الإنجليزية المخصصة لك. التطبيق باللغة الإنجليزية — الأسئلة مكتوبة بشكل بسيط ليسهل قراءتها.',
  },
  ja: {
    heading: 'お困りですか？',
    body:
      'これはあなた専用の英語学習プランを作るための10問のアンケートです。アプリは英語ですが、各質問はわかりやすく書かれています。',
  },
  en: {
    heading: 'Need help?',
    body:
      'This is a 10-question quiz that builds a personalized English learning plan. The app is in English — each question is written to be easy to read.',
  },
};

const isSupported = (code: string | undefined): code is SupportedLocale =>
  typeof code === 'string' && (code in TRANSLATIONS);

/** Right-to-left languages for the popover direction. */
const RTL_LOCALES = new Set<SupportedLocale>(['ar']);

export function HelpTooltip({ className }: { className?: string }) {
  const uiLocaleHint = useFunnelStore((s) => s.answers.ui_locale_hint);
  const setUiLocaleHint = useFunnelStore((s) => s.setUiLocaleHint);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  // Lazy-detect locale once if the store hasn't been seeded yet.
  useEffect(() => {
    if (uiLocaleHint) return;
    const detected = detectBrowserLocale();
    if (detected) setUiLocaleHint(detected);
  }, [uiLocaleHint, setUiLocaleHint]);

  // Close on click-outside / Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current || !buttonRef.current) return;
      const target = e.target as Node;
      if (
        !panelRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const locale: SupportedLocale = isSupported(uiLocaleHint)
    ? uiLocaleHint
    : 'en';
  const copy = TRANSLATIONS[locale];
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Help — available in your language"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-muted text-ink',
          'transition-colors hover:bg-surface-elevated',
          'focus-visible:outline-none focus-visible:shadow-focus',
        )}
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.25, 1, 0.35, 1] }}
            role="dialog"
            aria-modal="false"
            aria-label={copy.heading}
            dir={dir}
            className={cn(
              'absolute right-0 top-12 z-40 w-[min(280px,80vw)] rounded-lg border border-ink/10 bg-surface-elevated p-4 shadow-lg',
            )}
          >
            <p className="text-body-sm font-semibold text-ink">
              {copy.heading}
            </p>
            <p className="mt-1 text-body-sm text-ink-muted">{copy.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
