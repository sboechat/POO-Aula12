export interface IUsecase<I, O> {
	execute(input: I): Promise<O>;
}
