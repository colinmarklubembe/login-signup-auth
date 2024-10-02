import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

const validatePasswordStrength = (password: string) => {
  const minLength = 8;

  const options = {
    translations: zxcvbnEnPackage.translations,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
  };

  zxcvbnOptions.setOptions(options);

  const result = zxcvbn(password);

  const minScore = Math.max(2, result.score);

  const hasSufficientLength = password.length >= minLength;

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  const passwordStrength =
    hasSufficientLength &&
    minScore <= result.score &&
    hasSpecialChar &&
    hasDigit &&
    hasLowercase;

  return passwordStrength;
};

export default validatePasswordStrength;
