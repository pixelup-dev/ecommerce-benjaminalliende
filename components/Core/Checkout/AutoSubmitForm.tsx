import React, { useEffect } from "react";

interface AutoSubmitFormProps {
  action: string;
  method: "get" | "post" | "put" | "delete";
  token: string;
}

const AutoSubmitForm: React.FC<AutoSubmitFormProps> = ({
  action,
  method,
  token,
}) => {
  useEffect(() => {
    const form = document.createElement("form");
    form.method = method;
    form.action = action;
    form.style.display = "none";

    const tokenInput = document.createElement("input");
    tokenInput.type = "hidden";
    tokenInput.name = "token_ws";
    tokenInput.value = token;
    form.appendChild(tokenInput);

    document.body.appendChild(form);
    form.submit();

    return () => {
      document.body.removeChild(form);
    };
  }, [action, method, token]);

  return null;
};

export default AutoSubmitForm;
