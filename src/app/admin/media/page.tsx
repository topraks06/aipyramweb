import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default function MediaLibraryPage() {
  return (
    <div className="flex-1 p-8 bg-zinc-950 text-white min-h-screen">
      <MediaLibrary />
    </div>
  );
}
