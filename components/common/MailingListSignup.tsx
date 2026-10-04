'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';
import { useLanguage } from '@/utils/languageContext';

type MailingListSignupProps = {
  site: 'bkkk' | 'kyaf';
  triggerClassName?: string;
};

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export function MailingListSignup({ site, triggerClassName = '' }: MailingListSignupProps) {
  const { language, t } = useLanguage();
  const [state, setState] = useState<SubmissionState>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const panelId = `${site}-mailing-list-panel`;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => emailInputRef.current?.focus(), 40);
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const website = String(formData.get('website') ?? '').trim();

    setState('submitting');

    try {
      const response = await fetch(`${PUBLIC_WP_ORIGIN}/wp-json/kyaf/v1/mailing-list`, {
        method: 'POST',
        body: new URLSearchParams({ email, source_site: site, website }),
      });

      if (!response.ok) throw new Error('Mailing-list submission failed');

      form.reset();
      setState('success');
    } catch {
      setState('error');
    }
  }

  return (
    <>
      <div className="w-fit max-w-none">
        <button
          ref={triggerRef}
          type="button"
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={() => {
            if (state === 'success') setState('idle');
            setIsOpen(true);
          }}
          className={`text-right text-sm font-normal tracking-wide transition-colors hover:text-gray-300 md:text-base ${triggerClassName}`}
        >
          {t('footer.joinMailingList')}
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          aria-label={language === 'th' ? 'ปิดหน้าต่างสมัครรับข่าวสาร' : 'Close mailing list signup'}
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 h-full w-full bg-black/60 transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        <section
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal={isOpen}
          aria-labelledby={`${panelId}-title`}
          onKeyDown={(event: ReactKeyboardEvent<HTMLElement>) => {
            if (event.key !== 'Tab' || !panelRef.current) return;
            const focusable = panelRef.current.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          className={`fixed bottom-0 right-0 z-[101] flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-black p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none md:bottom-6 md:right-6 md:top-auto md:h-auto md:max-h-[calc(100dvh-3rem)] md:w-96 md:rounded-2xl md:p-6 ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
        >
          <div className="mb-6 flex items-start justify-between gap-6">
            <h2 id={`${panelId}-title`} className="text-base font-medium uppercase tracking-[0.16em]">
              {t('footer.joinMailingList')}
            </h2>
            <button
              type="button"
              disabled={!isOpen}
              aria-label={language === 'th' ? 'ปิด' : 'Close'}
              onClick={() => setIsOpen(false)}
              className="-mr-2 -mt-2 rounded-full p-2 transition-colors hover:bg-white/10 disabled:pointer-events-none"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {state === 'success' ? (
            <div
              aria-live="polite"
              className="flex min-h-[35vh] flex-1 items-center justify-center px-4 py-8 text-center md:min-h-0"
              role="status"
            >
              <p className="max-w-sm text-lg font-medium leading-relaxed md:text-2xl">
                {t('footer.mailingListSuccess')}
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex w-full flex-col items-stretch gap-2 sm:flex-row">
                <label className="sr-only" htmlFor={`${site}-mailing-list-email`}>
                  {t('footer.emailPlaceholder')}
                </label>
                <input
                  ref={emailInputRef}
                  id={`${site}-mailing-list-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder={t('footer.emailPlaceholder')}
                  disabled={!isOpen || state === 'submitting'}
                  className="h-11 min-w-0 flex-1 border border-white/50 bg-transparent px-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none disabled:opacity-60"
                />
                <input
                  aria-hidden="true"
                  autoComplete="off"
                  className="absolute left-[-10000px] h-px w-px"
                  name="website"
                  tabIndex={-1}
                  type="text"
                />
                <button
                  className="h-11 shrink-0 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/85 disabled:cursor-wait disabled:opacity-60"
                  disabled={!isOpen || state === 'submitting'}
                  type="submit"
                >
                  {state === 'submitting' ? t('footer.mailingListSubmitting') : t('footer.join')}
                </button>
              </form>
              <p aria-live="polite" className="mt-3 min-h-5 text-xs text-white/75" role="status">
                {state === 'error' ? t('footer.mailingListError') : null}
              </p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
