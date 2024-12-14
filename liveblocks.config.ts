// Define Liveblocks types for your application

import type { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import type { Player } from "~/modules/game/utils/player";
import type { Connection, Point2D } from "~/modules/game/utils/types";

// https://liveblocks.io/docs/api-reference/liveblocks-client#Typing-your-data
declare global {
	interface Liveblocks {
		// Each user's Presence, for room.getPresence, room.subscribe("others"), etc.
		Presence: {
			cursor: (Point2D & { nodeId: string | null }) | null;
			player: Player | null;
		};

		// The Storage tree for the room, for room.getStorage, room.subscribe(storageItem), etc.
		Storage: {
			// Example, a conflict-free list
			connections: LiveList<Connection>;
			positions: LiveMap<string, LiveObject<Point2D>>;
		};

		// Custom user info set when authenticating with a secret key
		UserMeta: {
			id: string;
			info: {
				// Example properties, for room.getSelf, room.subscribe("others"), etc.
				color: string;
				name: string;
			};
		};

		// Custom events, for room.broadcastEvent, room.subscribe("event")
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		RoomEvent: {};
		// Example has two events, using a union
		// | { type: "PLAY" }
		// | { type: "REACTION"; emoji: "🔥" };

		// Custom metadata set on threads, for use in React
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		ThreadMetadata: {
			// Example, attaching coordinates to a thread
			// x: number;
			// y: number;
		};

		// Custom room info set with resolveRoomsInfo, for use in React
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		RoomInfo: {
			// Example, rooms with a title and url
			// title: string;
			// url: string;
		};
	}
}
