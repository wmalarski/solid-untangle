// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-client#Typing-your-data
declare global {
	interface Liveblocks {
		// Each user's Presence, for room.getPresence, room.subscribe("others"), etc.
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		Presence: {
			// Example, real-time cursor coordinates
			// cursor: { x: number; y: number };
		};

		// The Storage tree for the room, for room.getStorage, room.subscribe(storageItem), etc.
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		Storage: {
			// Example, a conflict-free list
			// animals: LiveList<string>;
		};

		// Custom user info set when authenticating with a secret key
		UserMeta: {
			id: string;
			// biome-ignore lint/complexity/noBannedTypes: <explanation>
			info: {
				// Example properties, for room.getSelf, room.subscribe("others"), etc.
				// name: string;
				// avatar: string;
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

export {};
