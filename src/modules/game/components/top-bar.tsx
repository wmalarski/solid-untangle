import type { Component } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { Button } from "~/ui/button/button";
import { useGameState } from "../contexts/game-state";
import { AvatarsDialog } from "./avatars-dialog";

export const TopBar: Component = () => {
	const { t } = useI18n();

	const game = useGameState();

	return (
		<div class="absolute inset-x-auto top-4 right-4 flex w-min items-center gap-2 rounded-3xl bg-base-300 p-1 shadow-lg">
			<div class="flex flex-col gap-2 p-1 pl-4">
				<div class="flex items-center gap-4">
					<h1 class="grow font-bold">{t("info.title")}</h1>
				</div>
			</div>
			<Button
				onClick={() => game().startNewGame(20)}
				variant="ghost"
				size="sm"
				shape="circle"
			>
				Play
			</Button>
			<AvatarsDialog />
		</div>
	);
};
