import { GoogleOAuthProvider } from "@react-oauth/google";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";
import { AuthProvider } from "./components/AuthProvider.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { UnitProvider } from "./components/unit-context.tsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			// Keep cached data around long enough to rehydrate on revisit.
			gcTime: 24 * 60 * 60 * 1000,
		},
	},
});

const persister = createSyncStoragePersister({
	storage: window.localStorage,
	key: "quickpage-query-cache",
});

const addResourceHint = (rel: string, href: string, crossorigin?: boolean) => {
	const link = document.createElement("link");
	link.rel = rel;
	link.href = href;
	if (crossorigin) link.crossOrigin = "";
	document.head.appendChild(link);
};

const preconnectOrigins = [
	"https://www.googleapis.com",
	"https://tasks.googleapis.com",
	"https://classroom.googleapis.com",
	"https://accounts.google.com",
];
const dnsPrefetchOrigins = [
	"https://www.googleapis.com",
	"https://tasks.googleapis.com",
	"https://classroom.googleapis.com",
];
for (const href of preconnectOrigins) addResourceHint("preconnect", href, true);
for (const href of dnsPrefetchOrigins) addResourceHint("dns-prefetch", href);

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<meta
			name="google-site-verification"
			content="9m_yKNU69W5Y6Ukdrf5-bFkv8MpooErXyKe43ZYSzPA"
		/>
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister,
				maxAge: 24 * 60 * 60 * 1000,
			}}
		>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<UnitProvider>
					<AuthProvider>
						<GoogleOAuthProvider
							clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
						>
							<App />
							<Toaster />
						</GoogleOAuthProvider>
					</AuthProvider>
				</UnitProvider>
			</ThemeProvider>
		</PersistQueryClientProvider>
	</StrictMode>,
);
