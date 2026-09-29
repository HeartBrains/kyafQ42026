'use client';

import { useState, type FormEvent } from 'react';
import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';
import { useLanguage } from '@/utils/languageContext';

type MailingListSignupProps = {
  site: 'bkkk' | 'kyaf';
};

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export function MailingListSignup({ site }: MailingListSignupProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<SubmissionState>('idle');

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
    <div className="w-full max-w-md">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] md:text-sm">
        {t('footer.joinMailingList')}
      </p>
      <form onSubmit={handleSubmit} className="flex w-full items-stretch gap-2">
        <label className="sr-only" htmlFor={`${site}-mailing-list-email`}>
          {t('footer.emailPlaceholder')}
        </label>
        <input
          id={`${site}-mailing-list-email`}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          placeholder={t('footer.emailPlaceholder')}
          disabled={state === 'submitting'}
          className="min-w-0 flex-1 border border-white/50 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none disabled:opacity-60"
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
          className="shrink-0 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/85 disabled:cursor-wait disabled:opacity-60"
          disabled={state === 'submitting'}
          type="submit"
        >
          {state === 'submitting' ? t('footer.mailingListSubmitting') : t('footer.join')}
        </button>
      </form>
      <p aria-live="polite" className="mt-2 min-h-5 text-xs text-white/75" role="status">
        {state === 'success' ? t('footer.mailingListSuccess') : null}
        {state === 'error' ? t('footer.mailingListError') : null}
      </p>
    </div>
  );
}
