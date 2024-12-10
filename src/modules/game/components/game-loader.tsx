import type { Component } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { Loading } from "~/ui/loading/loading";

export const GameLoader: Component = () => {
	const { t } = useI18n();

	return (
		<div class="flex size-full h-screen flex-col items-center justify-center gap-2 bg-base-100">
			<Loading size="lg" />
			{t("board.loading")}
		</div>
	);
};
