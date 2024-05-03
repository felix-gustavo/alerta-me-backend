import { CustomError } from './customError'

class UnauthorizedException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Não autorizado', 401)
  }
}

class WithoutTokenException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Token de acesso ausente', 403)
  }
}

class ForbiddenException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Recurso não disponível', 403)
  }
}

class NotFoundException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Recurso não encontrado', 404)
  }
}

class SessionExpiredException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Sessão expirada', 440)
  }
}

class UserCreationException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Erro ao criar usuário', 422)
  }
}

class UnprocessableException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'O servidor não conseguiu processar', 422)
  }
}

class AuthorizationCreationException extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Erro ao registrar pedido de autorização', 422)
  }
}

class ServerError extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Erro interno do servidor', 500)
  }
}

export {
  UnauthorizedException,
  WithoutTokenException,
  ForbiddenException,
  NotFoundException,
  SessionExpiredException,
  UserCreationException,
  UnprocessableException,
  AuthorizationCreationException,
  ServerError,
}
