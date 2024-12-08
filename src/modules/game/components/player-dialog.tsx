import { useSubmission } from "@solidjs/router";
import { type Component, createMemo, Show } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { setPlayerDetailAction } from "~/modules/player/server/client";
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
	TextFieldErrorMessage,
	TextFieldInput,
	TextFieldLabel,
	TextFieldLabelText,
	TextFieldRoot,
} from "~/ui/text-field/text-field";
import { usePresenceState } from "../contexts/presence-state";
import { randomHexColor } from "../utils/colors";

const PlayerForm: Component = () => {
	const { t } = useI18n();

	const presence = usePresenceState();
	const defaultPlayerColor = randomHexColor();

	const submission = useSubmission(setPlayerDetailAction);

	return (
		<form
			action={setPlayerDetailAction}
			class="flex flex-col gap-4"
			method="post"
		>
			<input name="id" type="hidden" value={presence().player.id} />
			<TextFieldRoot>
				<TextFieldLabel for="userName">
					<TextFieldLabelText>{t("invite.username.label")}</TextFieldLabelText>
				</TextFieldLabel>
				<TextFieldInput
					disabled={submission.pending}
					id="name"
					name="name"
					placeholder={t("invite.username.placeholder")}
					variant="bordered"
				/>
				<Show when={submission.result?.errors?.userName}>
					<TextFieldErrorMessage>
						{submission.result?.errors?.userName}
					</TextFieldErrorMessage>
				</Show>
			</TextFieldRoot>
			<TextFieldRoot>
				<TextFieldLabel for="color">
					<TextFieldLabelText>{t("invite.color")}</TextFieldLabelText>
				</TextFieldLabel>
				<TextFieldInput
					disabled={submission.pending}
					id="color"
					name="color"
					placeholder={t("invite.color")}
					type="color"
					value={defaultPlayerColor}
					variant="bordered"
					width="full"
				/>
			</TextFieldRoot>
			<Button
				color="primary"
				size="sm"
				disabled={submission.pending}
				isLoading={submission.pending}
				type="submit"
			>
				{t("invite.button")}
			</Button>
		</form>
	);
};

export const PlayerDialog: Component = () => {
	const { t } = useI18n();

	const presence = usePresenceState();

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
							<DialogTitle>{t("invite.title")}</DialogTitle>
						</DialogHeader>
						<PlayerForm />
					</DialogContent>
				</DialogPositioner>
			</DialogPortal>
		</DialogRoot>
	);
};
