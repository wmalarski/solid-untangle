import { parse, serialize } from "cookie-es";
import { nanoid } from "nanoid";
import type { Player } from "~/modules/player/server/server";

const PLAYER_COOKIE_KEY = "su_player";

export const getPlayerCookie = () => {
	const parsed = parse(document.cookie);

	const serialized = parsed[PLAYER_COOKIE_KEY];

	try {
		const value = JSON.parse(serialized);
		return value as Player;
	} catch {
		return { id: nanoid() };
	}
};

export const setPlayerCookie = (player: Player) => {
	const cookie = serialize(PLAYER_COOKIE_KEY, JSON.stringify(player), {
		maxAge: 1_000_000,
		sameSite: "lax",
	});
	document.cookie = cookie;
};
