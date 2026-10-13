"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageSquare, X, ChevronRight, ArrowRight, ShieldCheck } from "lucide-react";
import { FAQ_ITEMS, type FaqItem, type FaqActionLink } from "@/lib/chatbot/faq";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  actionLink?: FaqActionLink;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  sender: "bot",
  text: "Hi! Tap a question below.",
};

export function HelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Autoscroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  function handleSelectQuestion(item: FaqItem) {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: item.question,
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "bot",
      text: item.answer,
      actionLink: item.actionLink,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  }

  function handleReset() {
    setMessages([INITIAL_MESSAGE]);
  }

  return (
    <>
      {/* ── Floating Launcher Button ────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          ref={triggerButtonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? "Close help chat" : "Open help chat"}
          className="group flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-full bg-accent text-white shadow-lg hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-all duration-150 active:scale-95"
        >
          <MessageSquare className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm tracking-wide">Help</span>
        </button>
      </div>

      {/* ── Chat Modal / Floating Panel ─────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ask DYNAMIS Help Chat"
          className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 sm:w-[390px] sm:h-[580px] z-50 bg-surface border border-border-default sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border-default">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-main leading-tight">Ask DYNAMIS</h2>
                <p className="text-[11px] text-muted leading-tight">Official NBCFDC scheme answers</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-muted hover:text-main px-2 py-1 rounded hover:bg-surface-subtle transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  triggerButtonRef.current?.focus();
                }}
                aria-label="Close help"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted hover:text-main hover:bg-surface-subtle transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-page/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.sender === "user"
                      ? "bg-accent text-white rounded-tr-sm"
                      : "bg-surface border border-border-default text-main rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Optional Action Link inside bot message */}
                {msg.sender === "bot" && msg.actionLink && (
                  <div className="mt-1.5 ml-1">
                    <Link
                      href={msg.actionLink.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-strong transition-colors shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Question Chips Selection Area */}
          <div className="border-t border-border-default bg-surface p-3 flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-muted px-1 tracking-wide">
              Tap a question to ask:
            </span>
            <div className="flex flex-col gap-1.5 max-h-44 sm:max-h-40 overflow-y-auto pr-1">
              {FAQ_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectQuestion(item)}
                  className="w-full text-left text-xs font-medium px-3 py-2.5 min-h-[44px] rounded-lg border border-border-default bg-surface hover:bg-surface-subtle text-main transition-colors flex items-center justify-between group focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span className="line-clamp-2">{item.question}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted group-hover:text-main flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>

            {/* Footer Verification Badge */}
            <div className="pt-2 border-t border-border-default/60 flex items-center justify-center gap-1.5 text-[11px] text-muted text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>Answers are general guidance. Your state agency makes the final decision.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
