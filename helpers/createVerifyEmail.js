const { BASE_URL } = process.env;
const createVerifyEmail = (to, verificationToken) => {
  const mail = {
    to,
    subject: "Confirmation your email!",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click to confirm email!<a/>`,
  };

  return mail;
};

module.exports = createVerifyEmail;
