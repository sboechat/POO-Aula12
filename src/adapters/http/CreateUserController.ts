import { NextFunction, Request, Response } from "express";
import { CreateUserOutput } from "../../usecases/CreateUserUsecase";
import { CreateUserDTO } from "../../usecases/ports/IRepos";
import { IUsecase } from "../../usecases/ports/IUsecase";

export class CreateUserController {
	constructor(
		private readonly usecase: IUsecase<CreateUserDTO, CreateUserOutput>
	) {}

	handle = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { name, email } = req.body ?? {};
			const result = await this.usecase.execute({ name, email });
			res.status(201).json(result);
		} catch (err) {
			next(err);
		}
	};
}
