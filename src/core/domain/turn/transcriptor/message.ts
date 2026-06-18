import type { Role } from "./role";

export interface Message {
	content: string;
	role: Role;
}
