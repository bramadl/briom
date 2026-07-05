"use client";

/**
 * @NOTE
 * BUKAN KAH HARUSNYA PAKAI USE QUERY YG FETCH PAKAI INTERVAL ATAU APALAH
 * DARIPADA CUSTOM BEGINI? BUAT APA KALO GITU PUNYA USE QUERY!
 */

import { unwrap } from "@briom/libs/server-action";
import { useDeliberationStore } from "@briom/room/deliberation/hooks/use-deliberation-store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { roomQueryKeys } from "../../queries/query.keys";
import { getTurn } from "../actions/get-turn.action";

const POLL_START_MS = 400;
const POLL_MAX_MS = 1000;
const POLL_BACKOFF_AFTER_MS = 15_000;

/**
 * @description
 * Matches `RoomTurnDTO["status"]` exactly (confirmed against
 * `DrizzleGetTurnQuery`) — only these 4 values ever come back non-null.
 * "abandoned" turns are filtered out at the query's `where` clause
 * (`status: { NOT: "abandoned" }`) — an abandoned turn doesn't come back
 * with a distinct status, it comes back as `{ turn: null }` entirely.
 */
interface TurnSnapshot {
	content: string;
	error: { kind: string; message: string } | null;
	status: "pending" | "streaming" | "settled" | "failed";
}

/**
 * @description
 * Polls `briom.turns.get(turnId)` for exactly one turn — the one that
 * mounted this hook. Only ever instantiated by the live branch of
 * `ParticipantTurn` (i.e. only when that instance is the store's
 * `activeTurnId`), so there is never more than one of these running at
 * once under the current sequential-turn assumption.
 *
 * Content lives in local `useState` here, not in the store — this
 * component is the only consumer of it, so there's nothing to share.
 *
 * Two independent guards can end polling:
 * 1. This hook's own read of a terminal status (settled/failed) OR a
 *    null turn (abandoned — see `TurnSnapshot` doc comment) from the
 *    poll response.
 * 2. The realtime `turn:settled`/`turn:failed`/`turn:abandoned`
 *    listeners in `useDeliberationRealtime`, which clear `activeTurnId`
 *    in the store and cause `ParticipantTurn` to unmount this hook by
 *    switching back to its static branch.
 *
 * Whichever fires first wins — the other is a no-op (store guards
 * against acting on a turnId that's no longer the active one).
 */
export function useTurnPolling(params: { roomId: string; turnId: string }) {
	const { roomId, turnId } = params;
	const queryClient = useQueryClient();

	const [snapshot, setSnapshot] = useState<TurnSnapshot>({
		content: "",
		status: "pending",
		error: null,
	});

	const settleTurn = useDeliberationStore((s) => s.settleTurn);
	const failTurn = useDeliberationStore((s) => s.failTurn);
	const abandonTurn = useDeliberationStore((s) => s.abandonTurn);

	const startedAtRef = useRef(Date.now());

	useEffect(() => {
		startedAtRef.current = Date.now();

		let cancelled = false;
		let timeoutId: ReturnType<typeof setTimeout>;

		const stopWithInvalidate = () => {
			queryClient.invalidateQueries({
				queryKey: roomQueryKeys.getRoom(roomId),
				exact: true,
			});
		};

		const tick = async () => {
			if (cancelled) return;

			try {
				const {
					data: { turn },
				} = unwrap(await getTurn({ turnId }));

				if (cancelled) return;

				if (!turn) {
					// Query filters out abandoned turns at the `where` clause
					// — a null turn here IS the abandoned signal, not a
					// shouldn't-happen edge case. This is the poll loop's own
					// (delayed, since it only surfaces on the next tick)
					// detection of abandonment, independent of whether the
					// realtime `turn:abandoned` event already caught it.
					abandonTurn(turnId);
					stopWithInvalidate();
					return;
				}

				setSnapshot({
					content: turn.content,
					status: turn.status,
					error: turn.error
						? { kind: turn.error.kind, message: turn.error.message }
						: null,
				});

				if (turn.status === "settled") {
					settleTurn(turnId);
					stopWithInvalidate();
					return;
				}

				if (turn.status === "failed") {
					failTurn(turnId);
					stopWithInvalidate();
					return;
				}

				// Still "pending" or "streaming" — schedule the next tick.
				const elapsed = Date.now() - startedAtRef.current;
				const interval =
					elapsed > POLL_BACKOFF_AFTER_MS ? POLL_MAX_MS : POLL_START_MS;

				if (!cancelled) timeoutId = setTimeout(tick, interval);
			} catch {
				if (!cancelled) timeoutId = setTimeout(tick, POLL_MAX_MS);
			}
		};

		tick();

		return () => {
			cancelled = true;
			clearTimeout(timeoutId);
		};
	}, [turnId, roomId, queryClient, settleTurn, failTurn, abandonTurn]);

	return snapshot;
}
