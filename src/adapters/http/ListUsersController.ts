import { NextFunction, Request, Response } from "express";
import { User } from "../../domain/User";
import { IUsecase } from "../../usecases/ports/IUsecase";

export class ListUsersController {
	constructor(private readonly usecase: IUsecase<void, User[]>) {}

	handle = async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const users = await this.usecase.execute();
			res.json(users);
		} catch (err) {
			next(err);
		}
	};
}
