import { type Component, For, Show, createMemo } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { Avatar, AvatarContent, AvatarGroup } from "~/ui/avatar/avatar";
import {
	DialogCloseButton,
	DialogContent,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogPositioner,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "~/ui/dialog/dialog";
import { XIcon } from "~/ui/icons/x-icon";
import { usePresenceState } from "../contexts/presence-state";
import { getTextColor } from "../utils/colors";
import type { Player } from "../utils/player";

const getFullPlayer = (player?: Player) => {
	return player?.color && player.name
		? { ...player, color: player.color, name: player.name }
		: null;
};

type PlayerAvatarProps = {
	player: Required<Player>;
};

const PlayerAvatar: Component<PlayerAvatarProps> = (props) => {
	return (
		<Avatar>
			<AvatarContent
				placeholder
				ring="secondary"
				size="xs"
				style={{
					"--tw-ring-color": props.player.color,
					"background-color": props.player.color,
					color: getTextColor(props.player.color),
				}}
			>
				<span class="flex size-full items-center justify-center uppercase">
					{props.player.name.slice(0, 2)}
				</span>
			</AvatarContent>
		</Avatar>
	);
};

const PlayersList: Component = () => {
	const presence = usePresenceState();

	const playerIds = createMemo(() => Object.keys(presence().players));

	return (
		<div class="flex max-h-[60vh] min-w-80 flex-col gap-4 overflow-y-auto">
			<For each={playerIds()}>
				{(playerId) => (
					<Show when={getFullPlayer(presence().players[playerId])}>
						{(player) => (
							<div class="flex gap-4 p-2">
								<PlayerAvatar player={player()} />
								<span>{player().name}</span>
							</div>
						)}
					</Show>
				)}
			</For>
		</div>
	);
};

const MAX_AVATARS = 5;

const Avatars: Component = () => {
	const presence = usePresenceState();

	const playerIds = createMemo(() => {
		return Object.keys(presence().players);
	});

	return (
		<AvatarGroup>
			<For each={playerIds().slice(0, MAX_AVATARS)}>
				{(playerId) => (
					<Show when={getFullPlayer(presence().players[playerId])}>
						{(player) => <PlayerAvatar player={player()} />}
					</Show>
				)}
			</For>
			<Show when={playerIds().length > MAX_AVATARS}>
				<Avatar>
					<AvatarContent class="bg-base-300" ring="primary" size="xs">
						<span class="flex size-full items-center justify-center">
							{`+${playerIds().length - MAX_AVATARS}`}
						</span>
					</AvatarContent>
				</Avatar>
			</Show>
		</AvatarGroup>
	);
};

export const AvatarsDialog: Component = () => {
	const { t } = useI18n();

	return (
		<DialogRoot>
			<DialogTrigger shape="ellipsis" size="md" type="button" variant="ghost">
				<Avatars />
			</DialogTrigger>
			<DialogPortal>
				<DialogOverlay />
				<DialogPositioner>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("board.topBar.players")}</DialogTitle>
							<DialogCloseButton>
								<XIcon />
							</DialogCloseButton>
						</DialogHeader>
						<PlayersList />
					</DialogContent>
				</DialogPositioner>
			</DialogPortal>
		</DialogRoot>
	);
};
