import type { MailMessage } from "./mail";

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const wrap = (body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1c241d;max-width:560px">${body}</div>`;

const button = (href: string, label: string) =>
  `<p><a href="${escapeHtml(href)}" style="display:inline-block;background:#2d7a3e;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;font-weight:bold">${escapeHtml(label)}</a></p>`;

type Content = Omit<MailMessage, "to">;

export function passwordResetEmail(p: { name: string; link: string; minutes: number }): Content {
  return {
    subject: "Reset your Mnyala admin password",
    text: `Hello ${p.name},\n\nSomeone asked to reset the password for your Mnyala admin account. Open this link within ${p.minutes} minutes to choose a new one:\n\n${p.link}\n\nIf you did not ask for this, you can ignore this email. Your password has not changed.\n`,
    html: wrap(
      `<p>Hello ${escapeHtml(p.name)},</p><p>Someone asked to reset the password for your Mnyala admin account. Use the button within ${p.minutes} minutes to choose a new one.</p>${button(p.link, "Choose a new password")}<p>If you did not ask for this, you can ignore this email. Your password has not changed.</p>`,
    ),
  };
}

export function inviteEmail(p: { name: string; inviterName: string; link: string; hours: number }): Content {
  return {
    subject: "You have been invited to the Mnyala admin",
    text: `Hello ${p.name},\n\n${p.inviterName} invited you to the Mnyala admin. Open this link within ${p.hours} hours to set your password and sign in:\n\n${p.link}\n`,
    html: wrap(
      `<p>Hello ${escapeHtml(p.name)},</p><p>${escapeHtml(p.inviterName)} invited you to the Mnyala admin. Use the button within ${p.hours} hours to set your password and sign in.</p>${button(p.link, "Set your password")}`,
    ),
  };
}

export function passwordChangedEmail(p: { name: string }): Content {
  return {
    subject: "Your Mnyala admin password was changed",
    text: `Hello ${p.name},\n\nThe password for your Mnyala admin account was just changed, and you were signed out on your other devices. If this was not you, contact a super admin straight away.\n`,
    html: wrap(
      `<p>Hello ${escapeHtml(p.name)},</p><p>The password for your Mnyala admin account was just changed, and you were signed out on your other devices.</p><p>If this was not you, contact a super admin straight away.</p>`,
    ),
  };
}

export function newMessageEmail(p: {
  fullName: string;
  email: string;
  phone: string | null;
  subjectLabel: string;
  body: string;
  link: string;
}): Content {
  const phone = p.phone ?? "not given";
  return {
    subject: `New website message from ${p.fullName}`,
    text: `From: ${p.fullName} <${p.email}>\nPhone: ${phone}\nAbout: ${p.subjectLabel}\n\n${p.body}\n\nOpen in the admin: ${p.link}\n`,
    html: wrap(
      `<p><strong>${escapeHtml(p.fullName)}</strong> (${escapeHtml(p.email)}, phone: ${escapeHtml(phone)})<br>About: ${escapeHtml(p.subjectLabel)}</p><blockquote style="margin:0;padding:0 0 0 12px;border-left:3px solid #d9d8cc;white-space:pre-wrap">${escapeHtml(p.body)}</blockquote>${button(p.link, "Open in the admin")}`,
    ),
  };
}
