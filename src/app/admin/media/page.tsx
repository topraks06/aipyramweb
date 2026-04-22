import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  let assets: any[] = [];
  try {
    if (adminDb) {
      const snap = await adminDb.collection("image_library").orderBy("createdAt", "desc").limit(100).get();
      assets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error("Error fetching media library:", error);
  }

  return (
    <div className="flex-1 p-8 bg-zinc-950 text-white min-h-screen">
      <MediaLibrary initialAssets={assets} />
    </div>
  );
}
