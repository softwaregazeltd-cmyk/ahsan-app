import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is a logged-in admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await admin.auth.getUser(token);
    const caller = userData?.user;
    if (!caller) return json({ error: "Not authenticated" }, 401);

    const { data: prof } = await admin.from("profiles").select("role").eq("id", caller.id).single();
    if (prof?.role !== "admin") return json({ error: "Admins only" }, 403);

    const { contact, company, email, password, phone, address } = await req.json();
    if (!contact || !email || !password || !phone) return json({ error: "Missing required fields" }, 400);

    // 1) create the auth user
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (cErr) return json({ error: cErr.message }, 400);
    const uid = created.user.id;

    // 2) profile row (role = client)
    await admin.from("profiles").insert({ id: uid, role: "client", full_name: contact });

    // 3) client row linked to the auth user
    const { error: clErr } = await admin.from("clients").insert({
      auth_id: uid, contact, company, email, phone, address,
    });
    if (clErr) return json({ error: clErr.message }, 400);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}