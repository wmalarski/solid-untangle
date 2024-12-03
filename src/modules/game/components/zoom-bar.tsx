import type { Component } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { MinusIcon } from "~/ui/icons/minus-icon";
import { PlusIcon } from "~/ui/icons/plus-icon";
import {
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipRoot,
	TooltipTrigger,
} from "~/ui/tooltip/tooltip";
import { useTransformState } from "../contexts/transform-state";

export const ZoomBar: Component = () => {
	const { t } = useI18n();

	const transform = useTransformState();

	const center = () => {
		return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	};

	const onZoomInClick = () => {
		transform().zoomIn(center());
	};

	const onZoomOutClick = () => {
		transform().zoomOut(center());
	};

	const onZoomResetClick = () => {
		transform().reset();
	};

	return (
		<div class="absolute bottom-4 left-4 flex gap-1 rounded-3xl bg-base-300 p-1 shadow-lg">
			<TooltipRoot>
				<TooltipTrigger
					aria-label={t("board.zoom.zoomIn")}
					onClick={onZoomInClick}
					shape="circle"
					size="sm"
					variant="ghost"
				>
					<PlusIcon />
				</TooltipTrigger>
				<TooltipPortal>
					<TooltipContent>
						<TooltipArrow />
						{t("board.zoom.zoomIn")}
					</TooltipContent>
				</TooltipPortal>
			</TooltipRoot>
			<TooltipRoot>
				<TooltipTrigger
					aria-label={t("board.zoom.reset")}
					class="tabular-nums"
					onClick={onZoomResetClick}
					shape="circle"
					size="sm"
					variant="ghost"
				>
					{Math.round(transform().scale() * 100)}%
				</TooltipTrigger>
				<TooltipPortal>
					<TooltipContent>
						<TooltipArrow />
						{t("board.zoom.reset")}
					</TooltipContent>
				</TooltipPortal>
			</TooltipRoot>
			<TooltipRoot>
				<TooltipTrigger
					aria-label={t("board.zoom.zoomOut")}
					onClick={onZoomOutClick}
					shape="circle"
					size="sm"
					variant="ghost"
				>
					<MinusIcon />
				</TooltipTrigger>
				<TooltipPortal>
					<TooltipContent>
						<TooltipArrow />
						{t("board.zoom.zoomOut")}
					</TooltipContent>
				</TooltipPortal>
			</TooltipRoot>
		</div>
	);
};
