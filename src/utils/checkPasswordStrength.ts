import zxcvbn from "zxcvbn";

const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const result = zxcvbn(password);
  const passwordStrength = password.length >= minLength && result.score >= 3;

  if (!passwordStrength) {
    throw { status: 400, message: "Password is too weak" };
  }
};

export default { validatePasswordStrength };
