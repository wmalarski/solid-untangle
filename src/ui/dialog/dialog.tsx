import type { VariantProps } from "class-variance-authority";

import { Dialog } from "@kobalte/core";
import { type Component, type ComponentProps, splitProps } from "solid-js";

import { buttonSplitProps } from "../button/button";
import { buttonRecipe } from "../button/button.recipe";
import { twCx } from "../utils/tw-cva";
import styles from "./dialog.module.css";

export type DialogRootProps = ComponentProps<typeof Dialog.Root>;

export const DialogRoot = Dialog.Root;

export type DialogTriggerProps = ComponentProps<typeof Dialog.Trigger> &
	VariantProps<typeof buttonRecipe>;

export const DialogTrigger: Component<DialogTriggerProps> = (props) => {
	const [split, rest] = splitProps(props, buttonSplitProps);

	return <Dialog.Trigger {...rest} class={buttonRecipe(split)} />;
};

export type DialogPortalProps = ComponentProps<typeof DialogPortal>;

export const DialogPortal = Dialog.Portal;

export type DialogOverlayProps = ComponentProps<typeof Dialog.Overlay>;

export const DialogOverlay: Component<DialogOverlayProps> = (props) => {
	return (
		<Dialog.Overlay
			{...props}
			class={twCx(
				"fixed inset-0 z-50 bg-base-300 bg-opacity-50",
				styles.overlay,
				props.class,
			)}
		/>
	);
};

export type DialogPositionerProps = ComponentProps<"div">;

export const DialogPositioner: Component<DialogPositionerProps> = (props) => {
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

export type DialogContentProps = ComponentProps<typeof Dialog.Content>;

export const DialogContent: Component<DialogContentProps> = (props) => {
	return (
		<Dialog.Content
			{...props}
			class={twCx(
				"z-50 max-w-lg rounded-2xl bg-base-100 p-8 shadow-xl",
				styles.content,
				props.class,
			)}
		/>
	);
};

export type DialogHeaderProps = ComponentProps<"header">;

export const DialogHeader: Component<DialogHeaderProps> = (props) => {
	return (
		<header
			{...props}
			class={twCx("mb-3 flex items-baseline justify-between", props.class)}
		/>
	);
};

export type DialogCloseButtonProps = ComponentProps<typeof Dialog.CloseButton>;

export const DialogCloseButton: Component<DialogCloseButtonProps> = (props) => {
	return <Dialog.CloseButton {...props} class={twCx("h-4 w-4", props.class)} />;
};

export type DialogTitleProps = ComponentProps<typeof Dialog.Title>;

export const DialogTitle: Component<DialogTitleProps> = (props) => {
	return (
		<Dialog.Title {...props} class={twCx("font-medium text-xl", props.class)} />
	);
};

export type DialogDescriptionProps = ComponentProps<typeof Dialog.Description>;

export const DialogDescription: Component<DialogDescriptionProps> = (props) => {
	return (
		<Dialog.Description {...props} class={twCx("text-base", props.class)} />
	);
};
