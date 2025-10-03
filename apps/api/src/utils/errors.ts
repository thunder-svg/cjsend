// apps/api/src/utils/errors.ts
export class HttpError extends Error { status:number; constructor(status:number, msg:string){ super(msg); this.status=status; } }
