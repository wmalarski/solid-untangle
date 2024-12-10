import type { VariantProps } from "class-variance-authority";

import { type Component, type ComponentProps, splitProps } from "solid-js";

import { loadingRecipe } from "./loading.recipe";

export type LoadingProps = ComponentProps<"span"> &
	VariantProps<typeof loadingRecipe>;

export const Loading: Component<LoadingProps> = (props) => {
	const [split, rest] = splitProps(props, ["size"]);

	return (
		<span {...rest} class={loadingRecipe({ class: props.class, ...split })} />
	);
};
