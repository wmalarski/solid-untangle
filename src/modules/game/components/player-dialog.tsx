import { decode } from "decode-formdata";
import { type Component, type ComponentProps, createMemo } from "solid-js";
import * as v from "valibot";
import { useI18n } from "~/modules/common/contexts/i18n";
import { Button } from "~/ui/button/button";
import {
	DialogContent,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogPositioner,
	DialogRoot,
	DialogTitle,
} from "~/ui/dialog/dialog";
import {
	TextFieldInput,
	TextFieldLabel,
	TextFieldLabelText,
	TextFieldRoot,
} from "~/ui/text-field/text-field";
import { useGameConfig } from "../contexts/game-config";
import { randomHexColor } from "../utils/colors";
import { type Player, setPlayerCookie } from "../utils/player";

type PlayerFormProps = {
	onPlayerChange: (player: Player) => void;
};

const PlayerForm: Component<PlayerFormProps> = (props) => {
	const { t } = useI18n();

	const config = useGameConfig();
	const defaultPlayerColor = randomHexColor();

	const onSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const parsed = v.parse(
			v.object({ name: v.string(), color: v.string(), id: v.string() }),
			decode(formData),
		);

		setPlayerCookie(parsed);
		props.onPlayerChange(parsed);
	};

	return (
		<form class="flex flex-col gap-4" method="post" onSubmit={onSubmit}>
			<input name="id" type="hidden" value={config().player.id} />
			<TextFieldRoot>
				<TextFieldLabel for="userName">
					<TextFieldLabelText>
						{t("board.invite.username.label")}
					</TextFieldLabelText>
				</TextFieldLabel>
				<TextFieldInput
					id="name"
					name="name"
					placeholder={t("board.invite.username.placeholder")}
					variant="bordered"
				/>
			</TextFieldRoot>
			<TextFieldRoot>
				<TextFieldLabel for="color">
					<TextFieldLabelText>{t("board.invite.color")}</TextFieldLabelText>
				</TextFieldLabel>
				<TextFieldInput
					id="color"
					name="color"
					placeholder={t("board.invite.color")}
					type="color"
					value={defaultPlayerColor}
					variant="bordered"
					width="full"
				/>
			</TextFieldRoot>
			<Button color="primary" size="sm" type="submit">
				{t("board.invite.button")}
			</Button>
		</form>
	);
};

type PlayerDialogProps = {
	onPlayerChange: (player: Player) => void;
};

export const PlayerDialog: Component<PlayerDialogProps> = (props) => {
	const { t } = useI18n();

	const presence = useGameConfig();

	const isOpen = createMemo(() => {
		const { player } = presence();
		return !player.name || !player.color;
	});

	const onOpenChange = () => {
		//
	};

	return (
		<DialogRoot modal open={isOpen()} onOpenChange={onOpenChange}>
			<DialogPortal>
				<DialogOverlay />
				<DialogPositioner>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("board.invite.title")}</DialogTitle>
						</DialogHeader>
						<PlayerForm onPlayerChange={props.onPlayerChange} />
					</DialogContent>
				</DialogPositioner>
			</DialogPortal>
		</DialogRoot>
	);
};
