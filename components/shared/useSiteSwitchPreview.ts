'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SiteSwitchDestination = 'bk' | 'kyaf';
type PreviewMode = 'hover' | 'pinned';

interface PreviewState {
  site: SiteSwitchDestination;
  mode: PreviewMode;
}

interface UseSiteSwitchPreviewOptions {
  isOpen: boolean;
  onClose: () => void;
}

const HOVER_DISMISS_DELAY_MS = 160;

export function useSiteSwitchPreview({ isOpen, onClose }: UseSiteSwitchPreviewOptions) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const previewRef = useRef<PreviewState | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldFocusPreviewLinkRef = useRef(false);
  const suppressNextFocusOpenRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewLinkRef = useRef<HTMLAnchorElement>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const updatePreview = useCallback((nextPreview: PreviewState | null) => {
    previewRef.current = nextPreview;
    setPreview(nextPreview);
  }, []);

  const showFromHover = useCallback((site: SiteSwitchDestination) => {
    clearDismissTimer();
    if (previewRef.current?.mode === 'pinned') return;
    updatePreview({ site, mode: 'hover' });
  }, [clearDismissTimer, updatePreview]);

  const showFromFocus = useCallback((site: SiteSwitchDestination, moveFocusToPreview: boolean) => {
    if (suppressNextFocusOpenRef.current) return;
    clearDismissTimer();
    shouldFocusPreviewLinkRef.current = moveFocusToPreview;
    if (previewRef.current?.mode !== 'pinned') {
      updatePreview({ site, mode: 'hover' });
    }
  }, [clearDismissTimer, updatePreview]);

  const pinPreview = useCallback((site: SiteSwitchDestination) => {
    clearDismissTimer();
    updatePreview({ site, mode: 'pinned' });
  }, [clearDismissTimer, updatePreview]);

  const dismissPreview = useCallback((restoreFocus = false) => {
    clearDismissTimer();
    shouldFocusPreviewLinkRef.current = false;
    updatePreview(null);
    if (restoreFocus) {
      suppressNextFocusOpenRef.current = true;
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
        requestAnimationFrame(() => {
          suppressNextFocusOpenRef.current = false;
        });
      });
    }
  }, [clearDismissTimer, updatePreview]);

  const scheduleHoverDismiss = useCallback(() => {
    clearDismissTimer();
    if (previewRef.current?.mode !== 'hover') return;
    dismissTimerRef.current = setTimeout(() => {
      if (previewRef.current?.mode === 'hover') updatePreview(null);
    }, HOVER_DISMISS_DELAY_MS);
  }, [clearDismissTimer, updatePreview]);

  useEffect(() => {
    if (!preview || !shouldFocusPreviewLinkRef.current) return;
    shouldFocusPreviewLinkRef.current = false;
    requestAnimationFrame(() => previewLinkRef.current?.focus());
  }, [preview]);

  useEffect(() => {
    if (!isOpen) {
      clearDismissTimer();
      shouldFocusPreviewLinkRef.current = false;
      suppressNextFocusOpenRef.current = false;
      updatePreview(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (previewRef.current) {
        event.preventDefault();
        event.stopPropagation();
        dismissPreview(true);
      } else {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [clearDismissTimer, dismissPreview, isOpen, onClose, updatePreview]);

  useEffect(() => () => clearDismissTimer(), [clearDismissTimer]);

  return {
    preview,
    triggerRef,
    previewLinkRef,
    showFromHover,
    showFromFocus,
    pinPreview,
    dismissPreview,
    cancelHoverDismiss: clearDismissTimer,
    scheduleHoverDismiss,
  };
}
