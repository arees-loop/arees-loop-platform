const DEFAULT_MSEGAT_API_URL =
  "https://www.msegat.com/gw/sendsms.php";

export function isSmsVerificationEnabled() {
  return (
    process.env.SMS_VERIFICATION_ENABLED
      ?.trim()
      .toLowerCase() === "true"
  );
}

export function normalizeSaudiMobile(
  value: unknown,
) {
  if (typeof value !== "string") {
    return null;
  }

  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (/^05\d{8}$/.test(digits)) {
    return `966${digits.slice(1)}`;
  }

  if (/^5\d{8}$/.test(digits)) {
    return `966${digits}`;
  }

  if (/^9665\d{8}$/.test(digits)) {
    return digits;
  }

  return null;
}

function getMsegatConfig() {
  const username =
    process.env.MSEGAT_USERNAME?.trim();
  const apiKey =
    process.env.MSEGAT_API_KEY?.trim();
  const sender =
    process.env.MSEGAT_SENDER?.trim() ||
    "Arees_Loop";
  const apiUrl =
    process.env.MSEGAT_API_URL?.trim() ||
    DEFAULT_MSEGAT_API_URL;

  if (!username || !apiKey) {
    throw new Error("MSEGAT_NOT_CONFIGURED");
  }

  return {
    username,
    apiKey,
    sender,
    apiUrl,
  };
}

function extractMsegatCode(
  rawResponse: string,
) {
  const trimmed = rawResponse.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      code?: string | number;
      status?: string | number;
    };

    return String(
      parsed.code ?? parsed.status ?? "",
    ).trim();
  } catch {
    return trimmed.split(/[\s#-]/)[0] ?? "";
  }
}

export async function sendPartnerContactVerificationSms({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  if (!isSmsVerificationEnabled()) {
    throw new Error(
      "SMS_VERIFICATION_DISABLED",
    );
  }

  const normalizedPhone =
    normalizeSaudiMobile(to);

  if (!normalizedPhone) {
    throw new Error(
      "INVALID_SAUDI_MOBILE",
    );
  }

  const {
    username,
    apiKey,
    sender,
    apiUrl,
  } = getMsegatConfig();

  // Keep the Unicode SMS short to avoid multi-part message cost.
  const message =
    `رمز التحقق: ${code}\nArees Loop`;

  const body = new URLSearchParams({
    userName: username,
    apiKey,
    numbers: normalizedPhone,
    userSender: sender,
    msg: message,
    msgEncoding: "UTF8",
  });

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const rawResponse =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `MSEGAT_HTTP_${response.status}`,
    );
  }

  const resultCode =
    extractMsegatCode(rawResponse);

  if (
    resultCode !== "1" &&
    resultCode !== "M0000"
  ) {
    throw new Error(
      `MSEGAT_${resultCode || "UNKNOWN_ERROR"}`,
    );
  }

  return {
    success: true as const,
    provider: "msegat" as const,
  };
}
