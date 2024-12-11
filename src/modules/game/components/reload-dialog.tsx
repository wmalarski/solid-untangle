import { decode } from "decode-formdata";
import type { Component, ComponentProps } from "solid-js";
import { createMemo } from "solid-js";
import * as v from "valibot";
import { useI18n } from "~/modules/common/contexts/i18n";
import {
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogPositioner,
	AlertDialogRoot,
	AlertDialogTitle,
} from "~/ui/alert-dialog/alert-dialog";
import { Button } from "~/ui/button/button";
import {
	TextFieldInput,
	TextFieldLabel,
	TextFieldLabelText,
	TextFieldRoot,
} from "~/ui/text-field/text-field";
import { useGameState } from "../contexts/game-state";
import { useSelectionState } from "../contexts/selection-state";

const ReloadForm: Component = () => {
	const { t } = useI18n();

	const game = useGameState();
	const selection = useSelectionState();

	const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const data = v.parse(
			v.object({ nodes: v.number() }),
			decode(formData, { numbers: ["nodes"] }),
		);

		const { startNewGame } = game();
		startNewGame(data.nodes);
		selection().clear();
	};

	return (
		<form class="flex flex-col gap-4 pt-4" method="post" onSubmit={onSubmit}>
			<TextFieldRoot>
				<TextFieldLabel for="nodes">
					<TextFieldLabelText>{t("board.reload.nodes")}</TextFieldLabelText>
				</TextFieldLabel>
				<TextFieldInput
					id="nodes"
					name="nodes"
					placeholder={t("board.reload.nodes")}
					variant="bordered"
					type="number"
					size="sm"
					min={10}
					value={20}
					max={50}
					required
				/>
			</TextFieldRoot>
			<Button color="primary" type="submit">
				{t("board.reload.startAgain")}
			</Button>
		</form>
	);
};

export const ReloadDialog: Component = () => {
	const { t } = useI18n();

	const game = useGameState();

	const isOpen = createMemo(() => game().hasEnded());

	const onOpenChange = () => {
		//
	};

	return (
		<AlertDialogRoot modal onOpenChange={onOpenChange} open={isOpen()}>
			<AlertDialogPortal>
				<AlertDialogOverlay />
				<AlertDialogPositioner>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{t("board.reload.title")}</AlertDialogTitle>
						</AlertDialogHeader>
						<AlertDialogDescription>
							{t("board.reload.description")}
						</AlertDialogDescription>
						<ReloadForm />
					</AlertDialogContent>
				</AlertDialogPositioner>
			</AlertDialogPortal>
		</AlertDialogRoot>
	);
};
