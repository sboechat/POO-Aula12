import { User } from "../../domain/User";

export interface CreateUserDTO {
	name: string;
	email: string;
}

export interface IRepos {
	save(user: User): Promise<void>;
	findByEmail(email: string): Promise<User | null>;
	findAll(): Promise<User[]>;
}
