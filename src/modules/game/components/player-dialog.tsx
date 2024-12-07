import { useSubmission } from "@solidjs/router";
import { nanoid } from "nanoid";
import { type Component, Show } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { setPlayerDetailAction } from "~/modules/player/server/client";
import { Button } from "~/ui/button/button";
import {
	TextFieldErrorMessage,
	TextFieldInput,
	TextFieldLabel,
	TextFieldLabelText,
	TextFieldRoot,
} from "~/ui/text-field/text-field";
import { randomHexColor } from "../utils/colors";

const PlayerForm: Component = () => {
	const { t } = useI18n();

	const defaultPlayerId = nanoid();
	const defaultPlayerColor = randomHexColor();

	const submission = useSubmission(setPlayerDetailAction);

	return (
		<form action={setPlayerDetailAction} class="flex flex-col gap-4">
			<input name="id" type="hidden" value={defaultPlayerId} />
			<TextFieldRoot>
				<TextFieldLabel for="userName">
					<TextFieldLabelText>{t("invite.username.label")}</TextFieldLabelText>
				</TextFieldLabel>
				<TextFieldInput
					disabled={submission.pending}
					id="name"
					name="userName"
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
					name="playerColor"
					placeholder={t("invite.color")}
					type="color"
					value={defaultPlayerColor}
					variant="bordered"
					width="full"
				/>
			</TextFieldRoot>
			<Button
				color="secondary"
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
	return <PlayerForm />;
};
