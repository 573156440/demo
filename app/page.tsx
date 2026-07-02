import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

const DOCS = [
  {
    href: "/docs/mqtt-reboot",
    title: "MQTT Reboot 后 event-values 告警丢失 — 排查与修复说明",
    type: "HTML",
  },
  {
    href: "/docs/2300plus-install",
    title: "智能动环监控单元安装指南 2300plus",
    type: "PDF",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="user-bar">
        <span>当前用户：{user?.email}</span>
        <LogoutButton />
      </div>

      <h1>技术文档</h1>
      <p>登录后可查看内部与客户共享的说明文档。</p>
      <ul>
        {DOCS.map((doc) => (
          <li key={doc.href}>
            <a href={doc.href}>{doc.title}</a>{" "}
            <span className="tag">（{doc.type}）</span>
          </li>
        ))}
      </ul>
      <p className="meta">部署于 Vercel + Supabase · 推送后自动更新</p>
    </>
  );
}
