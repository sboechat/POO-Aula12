import { NextFunction, Request, Response } from "express";

export function httpErrorMiddleware(
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	const message = err?.message ?? "Erro inesperado";
	const status =
		message.includes("já existe") || message.includes("inválid")
			? 400
			: 500;

	res.status(status).json({ error: message });
}
