function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function requiredText(name, label) {
  return {
    name,
    check(value) {
      if (isBlank(value)) return `${label} es obligatorio`;
      return null;
    }
  };
}

function optionalText(name) {
  return {
    name,
    check(value) {
      if (value === undefined || value === null || value === '') return null;
      if (typeof value !== 'string') return `${name} debe ser texto`;
      return null;
    }
  };
}

const emailField = {
  name: 'email',
  check(value) {
    if (isBlank(value)) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'El correo no es válido';
    return null;
  }
};

const capacidadField = {
  name: 'capacidad',
  check(value) {
    if (!Number.isInteger(value) || value < 1) {
      return 'La capacidad debe ser un entero mayor que cero';
    }
    return null;
  }
};

function passwordField(required) {
  return {
    name: 'password',
    check(value) {
      if (value === undefined || value === null || value === '') {
        return required ? 'La contraseña es obligatoria' : null;
      }
      if (typeof value !== 'string' || value.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      return null;
    }
  };
}

function perfilField() {
  return {
    name: 'perfil',
    check(value) {
      if (value === undefined || value === null || value === '') return null;
      if (value !== 'Administrador' && value !== 'Cliente') {
        return 'El perfil debe ser Administrador o Cliente';
      }
      return null;
    }
  };
}

function usuarioSchema(options = {}) {
  const password = options.password || 'required';
  const fields = [
    requiredText('nombre', 'El nombre'),
    requiredText('apellido', 'El apellido'),
    emailField,
    optionalText('telefono'),
    perfilField()
  ];
  if (password === 'required') fields.push(passwordField(true));
  if (password === 'optional') fields.push(passwordField(false));
  return fields;
}

function loginSchema() {
  return [emailField, passwordField(true)];
}

function salaSchema() {
  return [
    requiredText('nombre', 'El nombre'),
    capacidadField,
    requiredText('ubicacion', 'La ubicación'),
    optionalText('descripcion')
  ];
}

function positiveInt(name) {
  return {
    name,
    check(value) {
      if (!Number.isInteger(value) || value < 1) {
        return `${name} debe ser un entero mayor que cero`;
      }
      return null;
    }
  };
}

function reservaSchema() {
  return [
    positiveInt('usuarioId'),
    positiveInt('salaId'),
    {
      name: 'fechaInicio',
      check(value) {
        if (!value || Number.isNaN(Date.parse(value))) {
          return 'fechaInicio es obligatoria y debe ser una fecha';
        }
        return null;
      }
    },
    {
      name: 'fechaFin',
      check(value, body) {
        if (!value || Number.isNaN(Date.parse(value))) {
          return 'fechaFin es obligatoria y debe ser una fecha';
        }
        if (body.fechaInicio && Date.parse(value) <= Date.parse(body.fechaInicio)) {
          return 'fechaFin debe ser posterior a fechaInicio';
        }
        return null;
      }
    }
  ];
}

function comentarioSchema() {
  return [
    {
      name: 'texto',
      check(value) {
        if (isBlank(value)) return 'El texto es obligatorio';
        return null;
      }
    }
  ];
}

function validate(schema) {
  return function validationMiddleware(req, res, next) {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const detalles = [];

    for (const field of schema) {
      const mensaje = field.check(body[field.name], body);
      if (mensaje) detalles.push({ campo: field.name, mensaje });
    }

    if (detalles.length > 0) {
      const mensaje = 'Datos inválidos';
      res.locals.detalleLog = {
        mensaje,
        descripcion: detalles.map((detalle) => `${detalle.campo}: ${detalle.mensaje}`).join('; ')
      };
      res.status(400).json({
        error: {
          mensaje,
          detalles
        }
      });
      return;
    }

    next();
  };
}

module.exports = {
  validate,
  usuarioSchema,
  loginSchema,
  salaSchema,
  reservaSchema,
  comentarioSchema
};
