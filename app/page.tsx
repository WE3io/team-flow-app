import TeamFlowApp from '@/components/TeamFlowApp';
import { loadContent } from '@/lib/content';

/**
 * Server component: loads + validates the content bundle at build time, then
 * hands it to the client app. Phase 1 keeps all progress state client-side.
 *
 * The app is a real full-viewport web app: a centred, tablet-width column
 * (`max-width: 768px`) with the canvas colour filling the space around it on
 * wider screens. The mobile-first layout inside the column is unchanged.
 */
export default function Page() {
  const { units, collections } = loadContent();
  return (
    <main className="app-shell">
      <div className="app-column">
        <TeamFlowApp units={units} collections={collections} />
      </div>
    </main>
  );
}
