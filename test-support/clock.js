export function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
export async function settle() { for (let i = 0; i < 24; i++) await Promise.resolve(); }
export function createClock() {
  let now = 0, sequence = 0;
  const jobs = new Map();
  return {
    get now() { return now; },
    setTimeout(callback, delay = 0) { const id = ++sequence; jobs.set(id, { callback, at: now + delay }); return id; },
    clearTimeout(id) { jobs.delete(id); },
    async advance(ms) {
      const until = now + ms;
      for (;;) {
        const next = [...jobs].filter(([, job]) => job.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at; jobs.delete(next[0]); next[1].callback(); await settle();
      }
      now = until; await settle();
    },
  };
}
