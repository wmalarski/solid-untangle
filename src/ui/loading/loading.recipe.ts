import { twCva } from "../utils/tw-cva";

export const loadingRecipe = twCva("loading loading-spinner", {
	defaultVariants: {
		size: "md",
	},
	variants: {
		size: {
			lg: "loading-lg",
			md: "loading-md",
			sm: "loading-sm",
			xs: "loading-xs",
		},
	},
});
