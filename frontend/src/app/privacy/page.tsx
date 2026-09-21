'use client';
import { useT } from '@/i18n';
import { LegalPage } from '@/components/LegalPage';

export default function PrivacyPage() {
  const { t } = useT();
  return <LegalPage doc={(t) => t.legal.privacy} />;
}
