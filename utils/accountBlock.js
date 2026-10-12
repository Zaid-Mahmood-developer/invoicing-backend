export const sendAccountBlocked = (res) => {
  const options = { httpOnly: true, secure: true, sameSite: "none", path: "/" };
  return res.clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .status(403).json({ code: "ACCOUNT_BLOCKED", message: "Your account has been blocked. Please contact your administrator." });
};
