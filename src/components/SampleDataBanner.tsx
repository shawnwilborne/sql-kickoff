import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from '../state/progress';

/**
 * Prompts the student to load the sample dataset, which these features depend on.
 * The database starts empty, so this is how members & workouts get created.
 */
export function SampleDataBanner() {
  const { reloadSample, status } = useDatabase();
  const { recordSampleLoad, pushToast } = useProgress();

  const load = async () => {
    try {
      await reloadSample();
      recordSampleLoad();
      pushToast({ kind: 'success', text: 'Sample data loaded: members & workouts.' });
    } catch (e) {
      pushToast({
        kind: 'error',
        text: 'Could not load sample: ' + (e instanceof Error ? e.message : String(e)),
      });
    }
  };

  return (
    <div className="sample-banner">
      <span>
        These use the sample dataset. Load <code>members</code> &amp; <code>workouts</code> once to
        play.
      </span>
      <button type="button" onClick={load} disabled={status !== 'ready'}>
        ↺ Load sample data
      </button>
    </div>
  );
}
