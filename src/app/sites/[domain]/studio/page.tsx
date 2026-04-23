import StudioLayout from '@/components/node-perde/studio/StudioLayout';
import StudioContent from '@/components/node-perde/studio/StudioContent';

export default async function StudioPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const basePath = `/sites/${domain}/studio`;

    return (
        <StudioLayout>
            <StudioContent basePath={basePath} />
        </StudioLayout>
    );
}
