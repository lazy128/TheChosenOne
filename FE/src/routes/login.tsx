import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "../components/cinema/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
