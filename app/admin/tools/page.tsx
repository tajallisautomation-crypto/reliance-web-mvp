export default function Tools() {
  return (
    <div className="p-6 space-y-3">
      <div className="text-xl">Admin Tools</div>
      <div className="text-sm">Trigger Outbox worker (if cron not configured):</div>
      <a className="underline" href="/api/worker/outbox" target="_blank">Run Outbox Worker</a>
    </div>
  );
}
