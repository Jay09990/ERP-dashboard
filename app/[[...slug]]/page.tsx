"use client";

import { usePathname } from "next/navigation";
import { AuthApp } from "../../components/auth-app";

export default function Home() {
	const path = usePathname() || "/";
	return <AuthApp path={path} />;
}   