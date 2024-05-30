import React from "react";

function Advertencias({ rolIncorrecto, errorCredenciales, errorContraseña }) {
  return (
    <div>
      {rolIncorrecto && <p>Por favor, seleccione un rol válido.</p>}
      {errorCredenciales && <p>El correo electrónico o la contraseña son incorrectos.</p>}
      {errorContraseña && <p>La contraseña no cumple con los requisitos mínimos.</p>}
    </div>
  );
}

export default Advertencias;