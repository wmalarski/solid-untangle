import type { VariantProps } from "class-variance-authority";

import { AlertDialog } from "@kobalte/core";
import { type Component, type ComponentProps, splitProps } from "solid-js";

import { buttonRecipe } from "../button/button.recipe";
import { twCx } from "../utils/tw-cva";
import styles from "./alert-dialog.module.css";

export type AlertDialogRootProps = ComponentProps<typeof AlertDialog.Root>;

export const AlertDialogRoot = AlertDialog.Root;

export type AlertDialogTriggerProps = ComponentProps<
	typeof AlertDialog.Trigger
> &
	VariantProps<typeof buttonRecipe>;

export const AlertDialogTrigger: Component<AlertDialogTriggerProps> = (
	props,
) => {
	const [split, rest] = splitProps(props, [
		"color",
		"isLoading",
		"shape",
		"size",
		"variant",
	]);

	return (
		<AlertDialog.Trigger
			{...rest}
			class={buttonRecipe({ class: props.class, ...split })}
		/>
	);
};

export type AlertDialogPortalProps = ComponentProps<typeof AlertDialog.Portal>;

export const AlertDialogPortal = AlertDialog.Portal;

export type AlertDialogOverlayProps = ComponentProps<
	typeof AlertDialog.Overlay
>;

export const AlertDialogOverlay: Component<AlertDialogOverlayProps> = (
	props,
) => {
	return (
		<AlertDialog.Overlay
			{...props}
			class={twCx(
				"fixed inset-0 z-50 bg-base-200 bg-opacity-80",
				styles.overlay,
				props.class,
			)}
		/>
	);
};

export type AlertDialogPositionerProps = ComponentProps<"div">;

export const AlertDialogPositioner: Component<AlertDialogPositionerProps> = (
	props,
) => {
	return (
		<div
			{...props}
			class={twCx(
				"fixed inset-0 z-50 flex items-center justify-center",
				props.class,
			)}
		/>
	);
};

export type AlertDialogContentProps = ComponentProps<
	typeof AlertDialog.Content
>;

export const AlertDialogContent: Component<AlertDialogContentProps> = (
	props,
) => {
	return (
		<AlertDialog.Content
			{...props}
			class={twCx(
				"z-50 max-w-lg bg-base-100 p-8 shadow-xl",
				styles.content,
				props.class,
			)}
		/>
	);
};

export type AlertDialogHeaderProps = ComponentProps<"header">;

export const AlertDialogHeader: Component<AlertDialogHeaderProps> = (props) => {
	return (
		<header
			{...props}
			class={twCx("mb-3 flex items-center justify-between", props.class)}
		/>
	);
};

export type AlertDialogCloseButtonProps = ComponentProps<
	typeof AlertDialog.CloseButton
> &
	VariantProps<typeof buttonRecipe>;

export const AlertDialogCloseButton: Component<AlertDialogCloseButtonProps> = (
	props,
) => {
	const [split, rest] = splitProps(props, [
		"color",
		"isLoading",
		"shape",
		"size",
		"variant",
	]);

	return (
		<AlertDialog.CloseButton
			{...rest}
			class={buttonRecipe({ class: props.class, ...split })}
		/>
	);
};

export type AlertDialogTitleProps = ComponentProps<typeof AlertDialog.Title>;

export const AlertDialogTitle: Component<AlertDialogTitleProps> = (props) => {
	return (
		<AlertDialog.Title
			{...props}
			class={twCx("font-medium text-xl", props.class)}
		/>
	);
};

export type AlertDialogDescriptionProps = ComponentProps<
	typeof AlertDialog.Description
>;

export const AlertDialogDescription: Component<AlertDialogDescriptionProps> = (
	props,
) => {
	return (
		<AlertDialog.Description
			{...props}
			class={twCx("text-base", props.class)}
		/>
	);
};
