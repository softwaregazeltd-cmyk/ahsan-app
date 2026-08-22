import { Redirect } from "expo-router";
import { ROLE } from "../src/role";

export default function Index() {
  if (ROLE === "client") return <Redirect href="/(public)/home" />; // client portal later
  if (ROLE === "admin") return <Redirect href="/(public)/home" />;  // admin panel later
  return <Redirect href="/(public)/home" />;
}