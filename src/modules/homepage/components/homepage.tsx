import { useNavigate } from "@solidjs/router";
import type { Component, ComponentProps } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { paths } from "~/modules/common/utils/paths";
import { Button } from "~/ui/button/button";
import { Card, CardBody } from "~/ui/card/card";
import { cardTitleRecipe } from "~/ui/card/card.recipe";
import {
	TextFieldInput,
	TextFieldLabel,
	TextFieldLabelText,
	TextFieldRoot,
} from "~/ui/text-field/text-field";

export const Homepage: Component = () => {
	const { t } = useI18n();

	const navigate = useNavigate();

	const onSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		const gameId = formData.get("gameId") as string;

		navigate(paths.game(gameId));
	};

	return (
		<form onSubmit={onSubmit} class="flex w-full justify-center pt-10">
			<Card bg="base-200" class="w-full max-w-md" variant="bordered">
				<CardBody class="gap-4">
					<header class="flex items-center justify-between gap-2">
						<h2 class={cardTitleRecipe()}>{t("homepage.enterGame")}</h2>
					</header>
					<TextFieldRoot>
						<TextFieldLabel for="gameId">
							<TextFieldLabelText>{t("homepage.gameName")}</TextFieldLabelText>
						</TextFieldLabel>
						<TextFieldInput
							id="gameId"
							name="gameId"
							placeholder={t("homepage.gameName")}
							variant="bordered"
						/>
					</TextFieldRoot>
					<Button type="submit" size="sm" color="primary">
						{t("homepage.load")}
					</Button>
				</CardBody>
			</Card>
		</form>
	);
};
