import { action, query } from "@solidjs/router";

import { PLAYER_QUERY_KEY } from "./const";
import {
	getPlayerIdServerLoader,
	setPlayerDetailsServerAction,
} from "./server";

export const getPlayerLoader = query(getPlayerIdServerLoader, PLAYER_QUERY_KEY);
export const setPlayerDetailAction = action(setPlayerDetailsServerAction);
