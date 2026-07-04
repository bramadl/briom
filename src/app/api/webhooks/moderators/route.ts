import { briom } from "@briom";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @description
 * Shape of the payload Supabase Database Webhooks send for a row event.
 * We only care about INSERT on `auth.users`, so `record` is typed loosely
 * here — only the fields we actually consume are asserted.
 */
interface SupabaseDbWebhookPayload {
	old_record: unknown;
	record: {
		id: string;
		email: string | null;
		raw_user_meta_data: Record<string, unknown> | null;
	} | null;
	schema: string;
	table: string;
	type: "INSERT" | "UPDATE" | "DELETE";
}

function isAuthorized(req: NextRequest): boolean {
	const expected = process.env.SUPABASE_WEBHOOK_SECRET;
	if (!expected) return false;

	const authHeader = req.headers.get("authorization");
	return authHeader === `Bearer ${expected}`;
}

export async function POST(req: NextRequest) {
	if (!isAuthorized(req)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let payload: SupabaseDbWebhookPayload;
	try {
		payload = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (
		payload.type !== "INSERT" ||
		payload.schema !== "auth" ||
		payload.table !== "users" ||
		!payload.record
	) {
		return NextResponse.json({ ok: true, ignored: true });
	}

	const record = payload.record;
	const metadata = record.raw_user_meta_data ?? {};

	if (!record.email) {
		console.error("[webhooks/moderators] user has no email", {
			userId: record.id,
		});

		return NextResponse.json(
			{ error: "User record missing email" },
			{ status: 422 },
		);
	}

	const name =
		(metadata.name as string | undefined) ??
		(metadata.full_name as string | undefined) ??
		record.email;

	const avatar =
		(metadata.avatar_url as string | undefined) ??
		(metadata.picture as string | undefined) ??
		null;

	const result = await briom.moderators.register({
		avatar,
		email: record.email,
		id: record.id,
		name,
	});

	if (result.isError()) {
		const error = result.error();
		if (error.code === "EMAIL_ALREADY_USED") {
			return NextResponse.json({ ok: true, alreadyRegistered: true });
		}

		console.error("[webhooks/moderator-registered] register failed", {
			error,
			userId: record.id,
		});

		return NextResponse.json({ error: "Registration failed" }, { status: 500 });
	}

	return NextResponse.json({
		ok: true,
		moderatorId: result.value().moderatorId,
	});
}
