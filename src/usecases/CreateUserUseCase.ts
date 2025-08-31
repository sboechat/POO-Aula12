import { User } from "../domain/User";
import { CreateUserDTO, IRepos } from "./ports/IRepos";
import { IUsecase } from "./ports/IUsecase";

export interface CreateUserOutput {
	message: string;
}

export class CreateUserUsecase
	implements IUsecase<CreateUserDTO, CreateUserOutput>
{
	constructor(private readonly repository: IRepos) {}

	async execute(input: CreateUserDTO): Promise<CreateUserOutput> {
		// Regras de orquestração do caso de uso (tratamento de erros incluído)
		const user = User.create(input);

		const already = await this.repository.findByEmail(user.email);
		if (already) {
			// erro de aplicação (não expõe infra)
			throw new Error("Usuário já existe com esse e-mail");
		}

		await this.repository.save(user);

		return { message: "Usuário criado com sucesso" };
	}
}
