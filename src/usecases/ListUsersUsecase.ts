import { User } from "../domain/User";
import { IRepos } from "./ports/IRepos";
import { IUsecase } from "./ports/IUsecase";

export class ListUsersUsecase implements IUsecase<void, User[]> {
	constructor(private readonly repository: IRepos) {}

	async execute(): Promise<User[]> {
		return this.repository.findAll();
	}
}
