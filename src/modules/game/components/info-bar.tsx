import type { Component } from "solid-js";
import { useI18n } from "~/modules/common/contexts/i18n";
import { paths } from "~/modules/common/utils/paths";
import { InfoIcon } from "~/ui/icons/info-icon";
import { XIcon } from "~/ui/icons/x-icon";
import { Link } from "~/ui/link/link";
import {
	PopoverArrow,
	PopoverCloseButton,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverPortal,
	PopoverRoot,
	PopoverTitle,
	PopoverTrigger,
} from "~/ui/popover/popover";

const InfoPopover: Component = () => {
	const { t } = useI18n();

	return (
		<PopoverRoot>
			<PopoverTrigger shape="circle" size="sm" variant="ghost">
				<InfoIcon />
			</PopoverTrigger>
			<PopoverPortal>
				<PopoverContent>
					<PopoverArrow />
					<PopoverHeader>
						<PopoverTitle>{t("info.title")}</PopoverTitle>
						<PopoverCloseButton>
							<XIcon />
						</PopoverCloseButton>
					</PopoverHeader>
					<PopoverDescription>
						<Link href={paths.repository}>{t("info.madeBy")}</Link>
					</PopoverDescription>
				</PopoverContent>
			</PopoverPortal>
		</PopoverRoot>
	);
};

export const InfoBar: Component = () => {
	return (
		<div class="absolute right-4 bottom-4 rounded-3xl bg-base-300 p-1 shadow-lg">
			<InfoPopover />
		</div>
	);
};
