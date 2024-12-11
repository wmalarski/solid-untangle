import { Head } from "~/modules/common/components/head";
import { useI18n } from "~/modules/common/contexts/i18n";

export default function NotFound() {
	const { t } = useI18n();

	return (
		<main class="mx-auto p-4 text-center">
			<Head title={t("notFound.title")} />
			<h1 class="my-16 font-thin text-6xl uppercase">{t("notFound.title")}</h1>
		</main>
	);
}
