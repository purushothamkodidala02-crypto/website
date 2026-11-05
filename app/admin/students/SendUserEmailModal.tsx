"use client";

import { useState } from "react";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { sendDirectUserEmailAction } from "./direct-email-actions";

type SendUserEmailModalProps = {
  initialEmail?: string;
  initialName?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "button" | "icon" | "row-action";
};

export function SendUserEmailModal({
  initialEmail = "",
  initialName = "",
  triggerLabel,
  triggerClassName,
  triggerVariant = "button",
}: SendUserEmailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function handleOpen() {
    setEmail(initialEmail);
    setName(initialName);
    setSubject("");
    setMessage("");
    setErrorText("");
    setSuccessText("");
    setIsOpen(true);
  }

  function handleClose() {
    if (sending) return;
    setIsOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail) {
      setErrorText("Please enter a valid recipient email.");
      return;
    }
    if (!trimmedSubject) {
      setErrorText("Please enter an email subject.");
      return;
    }
    if (!trimmedMessage) {
      setErrorText("Please enter the email message body.");
      return;
    }

    setSending(true);
    setErrorText("");
    setSuccessText("");

    const res = await sendDirectUserEmailAction({
      recipientEmail: trimmedEmail,
      recipientName: name.trim() || undefined,
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    setSending(false);

    if (res.success) {
      setSuccessText(res.message);
    } else {
      setErrorText(res.message);
    }
  }

  return (
    <>
      {triggerVariant === "row-action" ? (
        <button
          type="button"
          onClick={handleOpen}
          className={
            triggerClassName ??
            "inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 transition hover:bg-teal-100 hover:border-teal-300"
          }
          title={initialEmail ? `Send email to ${initialEmail}` : "Send email to this user"}
        >
          <span>✉️</span>
          <span>{triggerLabel ?? "Mail User"}</span>
        </button>
      ) : triggerVariant === "icon" ? (
        <button
          type="button"
          onClick={handleOpen}
          className={
            triggerClassName ??
            "rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-700 transition"
          }
          title={initialEmail ? `Email ${initialEmail}` : "Send email to user"}
        >
          ✉️
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={
            triggerClassName ??
            "inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-900 transition hover:bg-teal-100 shadow-2xs"
          }
        >
          <span>✉️</span>
          <span>{triggerLabel ?? "Send Email to User"}</span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071f1a]/70 p-4 backdrop-blur-xs"
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-700">
                  Admin Communication
                </span>
                <h2 className="text-xl font-bold text-slate-950">
                  Compose Email to User
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Send a direct email message to any student or user from Varadhi Prep.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {errorText && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {errorText}
                </div>
              )}

              {successText && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                  ✅ {successText}
                </div>
              )}

              {!successText && (
                <>
                  <div>
                    <label
                      htmlFor="user-email-target"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      To (User Email) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="user-email-target"
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={sending}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="user-name-target"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Student / Recipient Name <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      id="user-name-target"
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={sending}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email-subject-target"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email-subject-target"
                      type="text"
                      required
                      placeholder="e.g. Important notice regarding your account"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={sending}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="email-message-target"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                      >
                        Message Body <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {message.length} chars
                      </span>
                    </div>
                    <textarea
                      id="email-message-target"
                      required
                      rows={5}
                      placeholder="Write your email message here. Paragraph breaks are supported."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sending}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs leading-5 text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:bg-slate-50"
                    />
                  </div>
                </>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={sending}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {successText ? "Close" : "Cancel"}
                </button>

                {!successText && (
                  <button
                    type="submit"
                    disabled={sending || !email.trim() || !subject.trim() || !message.trim()}
                    className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PendingButtonContent pending={sending} pendingLabel="Sending email…">
                      Send Email
                    </PendingButtonContent>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
