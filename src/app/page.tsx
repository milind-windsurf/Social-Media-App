import { Timeline } from '@/components/Timeline';
import { ComposePost } from '@/components/ComposePost';

/**
 * Home page component that renders the main social media timeline
 */
export default function Home(): JSX.Element {
  return (
    <>
      {/* Compose post section */}
      <div className="bg-white border-x border-gray-200">
        <ComposePost />
      </div>
      
      {/* Timeline */}
      <Timeline />
    </>
  );
}
