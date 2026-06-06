import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
		},
	},
});

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<meta
			name="google-site-verification"
			content="9m_yKNU69W5Y6Ukdrf5-bFkv8MpooErXyKe43ZYSzPA"
		/>
		<QueryClientProvider client={queryClient}>
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
		</QueryClientProvider>
	</StrictMode>,
);
