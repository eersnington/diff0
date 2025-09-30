import type { ReactNode } from "react";

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => children;
