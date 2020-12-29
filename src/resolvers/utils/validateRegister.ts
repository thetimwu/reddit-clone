import { UsernamePasswordInput } from "../UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];
  }

  if (options.password.length < 3) {
    return [
      {
        field: "password",
        message: "Password must be at greater than 2",
      },
    ];
  }

  if (options.username.length < 3) {
    return [
      {
        field: "username",
        message: "Username must be at greater than 2",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Cannot include an @",
      },
    ];
  }

  return null;
};
