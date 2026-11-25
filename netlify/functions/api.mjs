import { createHmac, timingSafeEqual } from "node:crypto";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

const attempts = new Map();
const SESSION_HOURS = 8;

function sign(value) {
  return createHmac("sha256", process.env.SESSION_SECRET).update(value).digest("base64url");
}
function issueToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
function verifyToken(token) {
  if (!token || !process.env.SESSION_SECRET) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(data.exp) > Date.now();
  } catch { return false; }
}

async function supabase(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("서버의 Supabase 환경변수가 설정되지 않았습니다.");
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`데이터베이스 오류 (${response.status}): ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

export const handler = async (request) => {
  if (request.httpMethod !== "POST") return json(405, { error: "POST 요청만 허용됩니다." });
  let body;
  try { body = JSON.parse(request.body || "{}"); }
  catch { return json(400, { error: "요청 형식이 올바르지 않습니다." }); }

  try {
    if (body.action === "login") {
      const ip = request.headers["x-nf-client-connection-ip"] || request.headers["x-forwarded-for"] || "unknown";
      const now = Date.now();
      const record = attempts.get(ip);
      if (record && record.until > now && record.count >= 5) {
        return json(429, { error: "비밀번호 입력 횟수가 많습니다. 15분 뒤 다시 시도해 주세요." });
      }
      const expectedPin = process.env.APP_PIN;
      if (!expectedPin) return json(500, { error: "서버 접속 비밀번호가 설정되지 않았습니다." });
      if (String(body.pin || "") !== expectedPin) {
        const next = record && record.until > now ? record : { count: 0, until: now + 15 * 60 * 1000 };
        next.count += 1;
        attempts.set(ip, next);
        return json(401, { error: "비밀번호가 올바르지 않습니다." });
      }
      attempts.delete(ip);
      return json(200, { token: issueToken(), expiresInHours: SESSION_HOURS });
    }

    const token = (request.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!verifyToken(token)) return json(401, { error: "접속 인증이 만료되었습니다. 다시 입장해 주세요." });

    if (body.action === "load") {
      const [students, records] = await Promise.all([
        supabase("students?select=*&order=student_id.asc"),
        supabase("assessment_records?select=*"),
      ]);
      return json(200, { students, records });
    }

    if (body.action === "saveStudents") {
      if (!Array.isArray(body.students) || body.students.length > 1500) return json(400, { error: "학생 명단 형식이 올바르지 않습니다." });
      if (body.students.length) {
        await supabase("students?on_conflict=student_id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify(body.students),
        });
      }
      return json(200, { ok: true });
    }

    if (body.action === "setGender") {
      const id = String(body.student_id || "");
      const gender = body.gender === "" ? null : body.gender;
      if (!id || ![null, "남", "여"].includes(gender)) return json(400, { error: "학생 번호 또는 성별 값이 올바르지 않습니다." });
      await supabase(`students?student_id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ gender, updated_at: new Date().toISOString() }),
      });
      return json(200, { ok: true });
    }

    if (body.action === "setRecord") {
      const student_id = String(body.student_id || "");
      const event_name = String(body.event_name || "");
      if (!student_id || !event_name || event_name.length > 100) return json(400, { error: "학생 번호 또는 평가 종목이 올바르지 않습니다." });
      await supabase("assessment_records?on_conflict=student_id,event_name", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          student_id, event_name,
          raw_value: body.raw_value === "" ? null : String(body.raw_value),
          updated_at: new Date().toISOString(),
        }),
      });
      return json(200, { ok: true });
    }

    return json(400, { error: "알 수 없는 요청입니다." });
  } catch (error) {
    return json(500, { error: error.message || "서버 내부 오류가 발생했습니다." });
  }
};
