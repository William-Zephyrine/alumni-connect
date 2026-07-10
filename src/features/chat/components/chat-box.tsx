"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  MoreVertical,
  Pencil,
  Trash2,
  Reply,
  Copy,
  X,
  Check,
  CornerDownRight,
  Activity,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/cn";
import toast from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";
import { writeToClipboard } from "@/shared/utils/clipboard";

interface Message {
  id: string;
  message: string;
  edited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  userId: string;
  user: {
    fullName: string;
    id: string;
  };
  replyTo?: {
    id: string;
    message: string;
    user: {
      fullName: string;
    };
  } | null;
}

interface ChatBoxProps {
  serverId: string;
  userId: string;
  initialMessages: Message[];
}

export function ChatBox({ serverId, userId, initialMessages }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const [loading, setLoading] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Message | null>(null);

  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.find((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleMessageUpdated = useCallback((msg: Message) => {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
  }, []);

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; mode: string; updatedMessage?: Message }) => {
      setMessages((prev) => {
        if (data.mode === "everyone" && data.updatedMessage) {
          return prev.map((m) =>
            m.id === data.messageId ? data.updatedMessage! : m
          );
        }
        return prev.filter((m) => m.id !== data.messageId);
      });
    },
    []
  );

  const { emit } = useSocket({
    serverId,
    userId,
    onNewMessage: handleNewMessage,
    onMessageUpdated: handleMessageUpdated,
    onMessageDeleted: handleMessageDeleted,
  });

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (autoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage,
          replyToId: replyingTo?.id,
        }),
      });

      if (response.ok) {
        const sentMessage: Message = await response.json();
        setMessages((prev) => [...prev, sentMessage]);
        emit("send-message", { serverId, message: sentMessage });
        setNewMessage("");
        setReplyingTo(null);
      } else {
        const result = await response.json().catch(() => ({}));
        toast.error(result?.message || "Gagal mengirim pesan");
      }
    } catch {
      toast.error("Gagal mengirim pesan");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/servers/${serverId}/chat/${messageId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: editText }),
        }
      );

      if (response.ok) {
        const updated: Message = await response.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        emit("edit-message", { serverId, message: updated });
        setEditingId(null);
        setEditText("");
        setActiveMenuId(null);
      }
    } catch {
      toast.error("Gagal mengupdate pesan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (
    messageId: string,
    mode: "me" | "everyone"
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/servers/${serverId}/chat/${messageId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        }
      );

      if (response.ok) {
        let updatedMessage: Message | undefined;
        if (mode === "everyone") {
          updatedMessage = await response.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? updatedMessage! : m
            )
          );
          emit("delete-message", {
            serverId,
            messageId,
            mode,
            updatedMessage,
          });
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        }

        setShowDeleteConfirm(null);
        setActiveMenuId(null);
        toast.success(
          mode === "everyone" ? "Pesan dihapus untuk semua" : "Pesan dihapus"
        );
      }
    } catch {
      toast.error("Gagal menghapus pesan");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async (text: string) => {
    await writeToClipboard(text);
    toast.success("Pesan disalin!");
    setActiveMenuId(null);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3"
      >
        {messages.map((msg, i) => {
          const isMe = msg.userId === userId;
          const isEditing = editingId === msg.id;
          const isDeleted = msg.isDeleted;
          const prevMsg = i > 0 ? messages[i - 1] : null;
          const showName =
            !isMe &&
            !isDeleted &&
            (!prevMsg || prevMsg.userId !== msg.userId);

          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2.5 max-w-[85%] md:max-w-[70%] group relative",
                isMe ? "ml-auto flex-row-reverse" : "mr-auto",
                showName && "mt-4"
              )}
            >
              {!isMe && !isDeleted && (
                <div className={cn("shrink-0", !showName && "invisible")}>
                  <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {msg.user.fullName.charAt(0)}
                  </div>
                </div>
              )}

              {!isDeleted && !isEditing && (
                <button
                  onClick={() =>
                    setActiveMenuId(
                      activeMenuId === msg.id ? null : msg.id
                    )
                  }
                  className={cn(
                    "p-1 rounded-full bg-white dark:bg-zinc-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2",
                    activeMenuId === msg.id &&
                      "opacity-100 bg-zinc-100 dark:bg-zinc-700"
                  )}
                >
                  <MoreVertical
                    size={14}
                    className="text-zinc-400 dark:text-zinc-500"
                  />
                </button>
              )}

              <div
                className={cn(
                  "flex flex-col",
                  isMe ? "items-end" : "items-start"
                )}
              >
                {activeMenuId === msg.id && (
                  <div
                    className={cn(
                      "absolute top-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-1.5 z-20 w-40 animate-in fade-in duration-150",
                      isMe ? "right-8" : "left-8"
                    )}
                  >
                    <button
                      onClick={() => {
                        setReplyingTo(msg);
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Reply size={14} /> Balas
                    </button>
                    <button
                      onClick={() => copyMessage(msg.message)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Copy size={14} /> Salin
                    </button>
                    {isMe && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(msg.id);
                            setEditText(msg.message);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(msg);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </>
                    )}
                  </div>
                )}

                {msg.replyTo && !isDeleted && (
                  <div
                    className={cn(
                      "mb-1 flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <CornerDownRight size={10} />
                    Membalas {msg.replyTo.user.fullName}
                  </div>
                )}

                <div
                  className={cn(
                    "relative p-3 rounded-2xl text-sm transition-all",
                    isMe
                      ? "bg-blue-600 dark:bg-blue-500 text-white rounded-tr-none"
                      : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700",
                    isDeleted &&
                      "italic opacity-60 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 border-none"
                  )}
                >
                  {msg.replyTo && !isDeleted && (
                    <div
                      className={cn(
                        "mb-2 p-2 rounded-lg border-l-4 bg-black/5 dark:bg-white/5 text-xs truncate max-w-full",
                        isMe
                          ? "border-blue-300"
                          : "border-zinc-300 dark:border-zinc-600"
                      )}
                    >
                      <p className="font-semibold opacity-70 mb-0.5">
                        {msg.replyTo.user.fullName}
                      </p>
                      <p className="truncate">{msg.replyTo.message}</p>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Input
                        ref={editInputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditMessage(msg.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] uppercase font-bold opacity-70 hover:opacity-100"
                        >
                          Batal (Esc)
                        </button>
                        <button
                          onClick={() => handleEditMessage(msg.id)}
                          className="text-[10px] uppercase font-bold flex items-center gap-1"
                        >
                          Simpan (Enter)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {showName && (
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-0.5">
                          {msg.user.fullName}
                        </span>
                      )}
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.message}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-1 self-end mt-1 text-[10px] opacity-60",
                          isMe
                            ? "text-blue-100"
                            : "text-zinc-400 dark:text-zinc-500"
                        )}
                      >
                        {msg.edited && !isDeleted && <span>(diedit)</span>}
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && !isDeleted && <Check size={12} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Hapus pesan?
            </h3>
            <div className="space-y-1">
              <Button
                onClick={() =>
                  handleDeleteMessage(showDeleteConfirm.id, "everyone")
                }
                className="w-full justify-start h-11 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border-none bg-transparent font-medium"
              >
                Hapus untuk semua orang
              </Button>
              <Button
                onClick={() =>
                  handleDeleteMessage(showDeleteConfirm.id, "me")
                }
                className="w-full justify-start h-11 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 border-none bg-transparent font-medium"
              >
                Hapus untuk saya
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-700 dark:text-zinc-300 font-medium"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 md:p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {replyingTo && (
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded-xl border-l-4 border-blue-500 animate-in slide-in-from-bottom-2 duration-200">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Membalas {replyingTo.user.fullName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {replyingTo.message}
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-end gap-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-2 focus-within:border-blue-300 dark:focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-50 dark:focus-within:ring-blue-950 transition-all">
              <textarea
                rows={1}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = "inherit";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ketik pesan..."
                className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                style={{ minHeight: "20px", maxHeight: "160px" }}
              />
              <Button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl shrink-0 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Activity className="animate-spin" size={16} />
                ) : (
                  <Send size={16} className="ml-0.5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
