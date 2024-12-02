"use server";
import { reload } from "@solidjs/router";
import type { CookieSerializeOptions } from "cookie-es";
import { decode } from "decode-formdata";
import type { RequestEvent } from "solid-js/web";
import * as v from "valibot";
import { safeParseAsync } from "valibot";
import { setCookie } from "vinxi/http";
import {
	getParsedCookie,
	getRequestEventOrThrow,
} from "~/modules/common/utils/server";
import { parseValibotIssues } from "~/modules/common/utils/validation";
import { PLAYER_QUERY_KEY } from "./const";

const PLAYER_COOKIE_NAME = "_player";
const PLAYER_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: true,
	maxAge: 1_000_000,
	sameSite: "lax",
};

const playerSchema = () => {
	return v.object({
		id: v.pipe(v.string(), v.uuid()),
		name: v.optional(v.string()),
		color: v.optional(v.pipe(v.string(), v.hexColor())),
	});
};

export type Player = v.InferOutput<ReturnType<typeof playerSchema>>;

export const getPlayerIdServerLoader = async (): Promise<Player> => {
	const event = getRequestEventOrThrow();

	const player =
		event.locals.updatedPlayer ??
		(await getParsedCookie(event, PLAYER_COOKIE_NAME, playerSchema()));

	if (player) {
		return player;
	}

	const id = crypto.randomUUID();
	const newPlayer: Player = { id };

	setPlayerCookie(event, newPlayer);

	return newPlayer;
};

const setPlayerCookie = (event: RequestEvent, player: Player) => {
	setCookie(
		event.nativeEvent,
		PLAYER_COOKIE_NAME,
		JSON.stringify(player),
		PLAYER_COOKIE_OPTIONS,
	);
};

export const setPlayerDetailsServerAction = async (formData: FormData) => {
	const event = getRequestEventOrThrow();

	const player = await getParsedCookie(
		event,
		PLAYER_COOKIE_NAME,
		playerSchema(),
	);

	if (!player) {
		throw new Error("Player not defined");
	}

	const result = await safeParseAsync(playerSchema(), decode(formData));

	if (result.issues) {
		return parseValibotIssues(result.issues);
	}

	const updatedPlayer: Player = {
		...player,
		...result.output,
	};

	event.locals.updatedPlayer = updatedPlayer;
	setPlayerCookie(event, updatedPlayer);

	throw reload({ revalidate: PLAYER_QUERY_KEY });
};

declare module "@solidjs/start/server" {
	interface RequestEventLocals {
		updatedPlayer?: Player;
	}
}
