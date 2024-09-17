import { CustomError } from './customError.ts'

class ValidationException extends CustomError {
  constructor(message: string) {
    super(message, 400)
  }
}

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

class NotificationDeniedException extends CustomError {
  constructor(message?: string) {
    super(
      message ??
        'Pessoa idosa não forneceu permissão para receber notificações. Sugiro que acesse o aplicativo Alexa para alterara permissão antes de criar o lembrete',
      422
    )
  }
}

class ServerError extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Erro interno do servidor', 500)
  }
}

export {
  ValidationException,
  UnauthorizedException,
  WithoutTokenException,
  ForbiddenException,
  NotFoundException,
  SessionExpiredException,
  UserCreationException,
  UnprocessableException,
  NotificationDeniedException,
  ServerError,
}
