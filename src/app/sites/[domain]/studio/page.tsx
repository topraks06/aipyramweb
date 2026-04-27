import { redirect } from 'next/navigation';

export default async function LegacyStudioPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const domain = params.domain;
  
  redirect(`/sites/${domain}/yonetim`);
}
