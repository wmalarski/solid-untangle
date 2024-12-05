import type { Component } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { ShareIcon } from "~/ui/icons/share-icon";
import { showToast } from "~/ui/toast/toast";
import {
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipRoot,
	TooltipTrigger,
} from "~/ui/tooltip/tooltip";
import { AvatarsDialog } from "./avatars-dialog";

const ShareButton: Component = () => {
	const { t } = useI18n();

	const onShare = async () => {
		const url = location.href;

		if (typeof navigator.share !== "undefined") {
			await navigator.share({ url });
			return;
		}

		navigator.clipboard.writeText(url);

		showToast({
			description: t("board.share.title"),
			title: t("board.share.copy"),
			variant: "success",
		});
	};

	return (
		<TooltipRoot>
			<TooltipTrigger
				aria-label={t("board.share.title")}
				onClick={onShare}
				shape="circle"
				size="sm"
				type="button"
				variant="ghost"
			>
				<ShareIcon class="size-5" />
			</TooltipTrigger>
			<TooltipPortal>
				<TooltipContent>
					<TooltipArrow />
					{t("board.share.title")}
				</TooltipContent>
			</TooltipPortal>
		</TooltipRoot>
	);
};

export const TopBar: Component = () => {
	const { t } = useI18n();

	return (
		<div class="absolute inset-x-auto top-4 right-4 flex w-min items-center gap-2 rounded-3xl bg-base-300 p-1 shadow-lg">
			<div class="flex flex-col gap-2 p-1 pl-4">
				<div class="flex items-center gap-4">
					<h1 class="grow font-bold">{t("info.title")}</h1>
					<ShareButton />
				</div>
			</div>
			<AvatarsDialog />
		</div>
	);
};
