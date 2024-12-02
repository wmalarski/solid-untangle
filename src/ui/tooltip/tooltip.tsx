import type { VariantProps } from "class-variance-authority";

import { Tooltip } from "@kobalte/core";
import { type Component, type ComponentProps, splitProps } from "solid-js";

import { buttonSplitProps } from "../button/button";
import { buttonRecipe } from "../button/button.recipe";
import { twCx } from "../utils/tw-cva";
import styles from "./tooltip.module.css";

export type TooltipRootProps = ComponentProps<typeof Tooltip.Root>;

export const TooltipRoot = Tooltip.Root;

export type TooltipTriggerProps = ComponentProps<typeof Tooltip.Trigger> &
	VariantProps<typeof buttonRecipe>;

export const TooltipTrigger: Component<TooltipTriggerProps> = (props) => {
	const [split, rest] = splitProps(props, buttonSplitProps);

	return <Tooltip.Trigger {...rest} class={buttonRecipe(split)} />;
};

export type TooltipPortalProps = ComponentProps<typeof Tooltip.Portal>;

export const TooltipPortal = Tooltip.Portal;

export type TooltipContentProps = ComponentProps<typeof Tooltip.Content>;

export const TooltipContent: Component<TooltipContentProps> = (props) => {
	return (
		<Tooltip.Content
			{...props}
			class={twCx(
				"z-50 rounded-lg bg-base-300 px-2 py-1 text-sm shadow",
				styles.content,
				props.class,
			)}
		/>
	);
};

export type TooltipArrowProps = ComponentProps<typeof Tooltip.Arrow>;

export const TooltipArrow: Component<TooltipArrowProps> = (props) => {
	return <Tooltip.Arrow {...props} class={twCx("", props.class)} />;
};
