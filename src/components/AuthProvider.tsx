import { createContext, type ReactNode, useContext, useState } from "react";
import { TOKEN_KEY } from "@/types";

interface AuthContextType {
	accessToken: string | null;
	setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Define props for the provider
interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [accessToken, setAccessTokenState] = useState<string | null>(() =>
		localStorage.getItem(TOKEN_KEY),
	);

	const setAccessToken = (token: string | null) => {
		setAccessTokenState(token);
		if (token) {
			localStorage.setItem(TOKEN_KEY, token);
		} else {
			localStorage.removeItem(TOKEN_KEY);
		}
	};

	return (
		<AuthContext.Provider value={{ accessToken, setAccessToken }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within a AuthProvider");
	}

	return context;
}
