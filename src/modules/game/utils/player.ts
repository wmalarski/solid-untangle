import { parse, serialize } from "cookie-es";
import { nanoid } from "nanoid";
import * as v from "valibot";

const PLAYER_COOKIE_KEY = "su_player";

const playerSchema = () => {
	return v.object({
		id: v.string(),
		name: v.optional(v.string()),
		color: v.optional(v.pipe(v.string(), v.hexColor())),
	});
};

export type Player = v.InferOutput<ReturnType<typeof playerSchema>>;

export const getPlayerCookie = () => {
	const parsedCookie = parse(document.cookie);

	try {
		const parsedJson = JSON.parse(parsedCookie[PLAYER_COOKIE_KEY]);
		const parsedPlayer = v.parse(playerSchema(), parsedJson);
		return parsedPlayer as Player;
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
