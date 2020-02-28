/**
Схема авторизации bearer-token,

Стратегия на основе этой схемы определяется так:
server.auth.strategy('strategyName', 'bearer-token', {
    validate: function (token, callback) {
        //Основная функция валидации токена
        ...
        callback(err, credentials)
    },
    errorData: function (err) {
        //необязательная подготовка данных к выводу при ошибке
        ...
        return {
            error: err
        }
    },
    errorReply: function(reply, error) {
        //необязательная функция для переопределения ошибок, заголовков и т.д. в reply при ошибке
    }
});

Ошибки по умолчанию, передаваемые в errorData:
- 'no Authorization header',
- 'Authorization is not Bearer'
* */


const Hoek = require('@hapi/hoek');

const defaults = {
  validate(header, callback) {
    callback(true, 1);
  },
  errorData(err) {
    return {
      errors: [
        { code: 1001, message: err },
      ],
    };
  },
  errorReply(reply, err) {
    return reply(err).code(401);
  },
};

module.exports = function (server, options) {
  const settings = Hoek.applyToDefaults(defaults, options);
  const ret = {
    authenticate: (request, reply) => {
      const { authorization } = request.raw.req.headers;

      if (!authorization) {
        return settings.errorReply(reply, settings.errorData('no Authorization header'));
      }

      const parts = authorization.split(/\s+/);

      if (parts[0] !== 'Bearer') {
        return settings.errorReply(reply, settings.errorData('Authorization is not Bearer'));
      }

      settings.validate.call(request, parts[1], (err, credentials) => {
        if (err) {
          return settings.errorReply(reply, settings.errorData(err, credentials));
        }

        if (!credentials) {
          credentials = {};
        }

        return reply.continue({ credentials });
      });
    },
  };

  return ret;
};
