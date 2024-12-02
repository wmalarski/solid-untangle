import type { VariantProps } from "class-variance-authority";

import { type Component, type ComponentProps, splitProps } from "solid-js";

import { linkRecipe } from "./link.recipe";

export type LinkProps = ComponentProps<"a"> & VariantProps<typeof linkRecipe>;

export const Link: Component<LinkProps> = (props) => {
	const [split, rest] = splitProps(props, ["color", "hover", "size"]);

	return <a {...rest} class={linkRecipe({ class: props.class, ...split })} />;
};
