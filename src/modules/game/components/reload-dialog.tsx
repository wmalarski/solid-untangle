import type { Component, ComponentProps } from "solid-js";
import { createMemo } from "solid-js";
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
import { useGameState } from "../contexts/game-state";
import { useSelectionState } from "../contexts/selection-state";

const ReloadForm: Component = () => {
	const { t } = useI18n();

	const state = useGameState();
	const selection = useSelectionState();

	const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
		event.preventDefault();

		const { positions, startNewGame } = state();
		startNewGame(Object.keys(positions).length);
		selection().clear();
	};

	return (
		<form class="flex flex-col gap-4 pt-4" method="post" onSubmit={onSubmit}>
			<Button color="primary" type="submit">
				{t("board.reload.startAgain")}
			</Button>
		</form>
	);
};

export const ReloadDialog: Component = () => {
	const { t } = useI18n();

	const store = useGameState();

	const isOpen = createMemo(() => store().hasEnded());

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
