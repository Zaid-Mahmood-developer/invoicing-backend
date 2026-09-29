export const isEmailBlocked = (email) => {
  const blockedEmails = (process.env.BLOCKED_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return blockedEmails.includes(
    String(email || "").trim().toLowerCase()
  );
};

export const sendPaymentOverdue = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(403)
    .json({
      code: "PAYMENT_OVERDUE",
      message: "Your payment is overdue. Please contact your administrator.",
    });
};