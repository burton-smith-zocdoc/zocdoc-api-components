import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isBooked } from './booking-status.ts';

test('confirmed and pending count as booked', () => {
  assert.equal(isBooked('confirmed'), true);
  assert.equal(isBooked('pending_booking'), true);
});

test('booking_failed on a 200 is not booked', () => {
  assert.equal(isBooked('booking_failed'), false);
  assert.equal(isBooked('cancelled'), false);
});
