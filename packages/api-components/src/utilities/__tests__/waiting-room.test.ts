import { describe, expect, it } from 'vitest';
import { waitingRoomHref } from '../waiting-room.js';

/** An invented host and path — not a real waiting room, and nobody's (PHI-002). */
const WAITING_ROOM = 'https://video.example.test/waiting-room/abc123';

describe('waitingRoomHref', () => {
  it('passes an absolute https: URL through', () => {
    expect(waitingRoomHref(WAITING_ROOM)).toBe(WAITING_ROOM);
  });

  it('trims surrounding whitespace', () => {
    expect(waitingRoomHref(`  ${WAITING_ROOM}\n`)).toBe(WAITING_ROOM);
  });

  /*
   * In-person appointments come back with an explicit `null` (live-verified), and a missing
   * field is the same answer.
   */
  it('returns undefined for null, undefined, and blank', () => {
    expect(waitingRoomHref(null)).toBeUndefined();
    expect(waitingRoomHref(undefined)).toBeUndefined();
    expect(waitingRoomHref('   ')).toBeUndefined();
  });

  /*
   * The field is named a *path* and documented as a *url*. A bare path would resolve against
   * the embedding page's host, which is a link to somewhere that is not the waiting room.
   */
  it('rejects a bare path rather than resolving it against the host page', () => {
    expect(waitingRoomHref('/waiting-room/abc123')).toBeUndefined();
    expect(waitingRoomHref('waiting-room/abc123')).toBeUndefined();
  });

  it('rejects every scheme but https:', () => {
    expect(waitingRoomHref('javascript:alert(1)')).toBeUndefined();
    expect(waitingRoomHref('http://video.example.test/waiting-room/abc123')).toBeUndefined();
    expect(waitingRoomHref('data:text/html,hi')).toBeUndefined();
  });

  it('rejects a value that does not parse as a URL', () => {
    expect(waitingRoomHref('https://')).toBeUndefined();
    expect(waitingRoomHref('not a url')).toBeUndefined();
  });
});
