import { loadContent } from '@/lib/content';
import PhoneFrame from '@/components/PhoneFrame';
import TeamFlowApp from '@/components/TeamFlowApp';

/**
 * Server component: loads + validates the content bundle at build time, then
 * hands it to the client app. Phase 1 keeps all progress state client-side.
 */
export default function Page() {
  const { units, collections } = loadContent();
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        background: '#E8E6DF',
      }}
    >
      <PhoneFrame>
        <TeamFlowApp units={units} collections={collections} />
      </PhoneFrame>
    </main>
  );
}
