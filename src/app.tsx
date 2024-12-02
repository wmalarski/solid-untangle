import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { lazy, Suspense } from "solid-js";
import "./app.css";
import { Head } from "./modules/common/components/head";
import { I18nContextProvider } from "./modules/common/contexts/i18n";

const ToastProvider = lazy(() =>
	import("~/ui/toast/toast").then((module) => ({
		default: module.ToastProvider,
	})),
);

export default function App() {
	return (
		<Router
			root={(props) => (
				<I18nContextProvider>
					<MetaProvider>
						<Head />
						<Suspense>{props.children}</Suspense>
						<Suspense>
							<ToastProvider />
						</Suspense>
					</MetaProvider>
				</I18nContextProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
