"use client";

import { getSocket } from "@/lib/socket";
import React, { useEffect } from "react";

type DeliveryChatProps = {
  orderId?: string;
  deliveryBoyId?: string;
  customerId?: string;
  currentUserId: string;
};

type LocalMessage = {
  id: string;
  text: string;
  from: "me" | "other";
  time: string;
};

const DeliveryChat: React.FC<DeliveryChatProps> = ({
  orderId,
  deliveryBoyId,
  customerId,
  currentUserId,
}) => {
  const [messages, setMessages] = React.useState<LocalMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [roomId, setRoomId] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const quickEmojis = ["😀", "👍", "🙏", "🚚", "📦"];

  // Create or fetch chat room for this order + participants
  useEffect(() => {
    const setupRoom = async () => {
      if (!orderId || !deliveryBoyId || !customerId) return;

      try {
        const res = await fetch("/api/chat/createRoom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            userId: customerId,
            deliveryBoyId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.room?._id) {
          console.error("Failed to create/find chat room", data);
          return;
        }
        setRoomId(data.room._id.toString());
      } catch (err) {
        console.error("Error setting up chat room", err);
      }
    };

    setupRoom();
  }, [orderId, deliveryBoyId, customerId]);

  // Join socket room and load messages when roomId is ready
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("joinRoom", { roomId });

    const handleIncoming = (message: any) => {
      if (!message || message.roomId !== roomId) return;

      const from: "me" | "other" =
        message.senderId === currentUserId ? "me" : "other";

      setMessages((prev) => [
        ...prev,
        {
          id: message._id?.toString?.() || `${Date.now()}-${Math.random()}`,
          text: message.text,
          from,
          time: message.time,
        },
      ]);
    };

    socket.on("sendMessage", handleIncoming);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages/${roomId}`);
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to load messages", data);
          return;
        }

        const loaded: LocalMessage[] = (data.data || []).map((m: any) => ({
          id: m._id?.toString?.() || `${Date.now()}-${Math.random()}`,
          text: m.text,
          from: m.senderId === currentUserId ? "me" : "other",
          time: m.time,
        }));
        setMessages(loaded);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchMessages();

    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.off("sendMessage", handleIncoming);
    };
  }, [roomId, currentUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !roomId || !currentUserId) return;

    const socket = getSocket();
    if (!socket) return;

    const newMessage = {
      roomId,
      text: trimmed,
      senderId: currentUserId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("sendMessage", newMessage);
    setInput("");
  };

  const generateAISuggestions = async (
    message: string,
    role: "customer" | "deliveryBoy"
  ) => {
    const prompt = `
You are an assistant for a delivery chat between a customer and a delivery person.
Generate 3 short reply suggestions for the ${role} based on the message below.

Message: "${message}"

Rules:
- Each suggestion must be maximum 5 words.
- Each suggestion must include at least one emoji.
- Return ONLY the suggestions, one per line, with no numbering or extra text.
`;

    try {
      const res = await fetch("/api/chat/ai-suggestiona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("AI suggestion error", data);
        const message =
          (data as any)?.error?.message ||
          "AI suggestions are currently unavailable. Please try again in a moment.";
        setAiError(message);
        setSuggestions([]);
        return [];
      }

      setAiError(null);
      const raw: string = (data.suggestion || "").trim();
      const parsed = raw
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 5);

      setSuggestions(parsed);
      return parsed;
    } catch (err) {
      console.error("Error fetching AI suggestion", err);
      setAiError(
        "Something went wrong while getting AI suggestions. Please try again.",
      );
      setSuggestions([]);
      return [];
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40 flex flex-col h-80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Delivery Chat
          </p>
          <p className="text-sm text-slate-200">
            Chat about this order in real time.
          </p>
        </div>
        {orderId && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-medium text-slate-300">
            Order #
            {String(orderId).slice(-6)}
          </span>
        )}
      </div>

      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex-1 flex flex-wrap items-center gap-2 overflow-x-auto">
          {suggestions.length === 0 && (
            <span className="text-[11px] text-slate-400">
              Quick replies will appear here
            </span>
          )}
          {suggestions.map((sugg, index) => (
            <button
              key={`${sugg}-${index}`}
              type="button"
              onClick={() => setInput(sugg)}
              className="rounded-full bg-emerald-500/10 border border-emerald-400/60 px-3 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
            >
              {sugg}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!roomId) return;

            const role: "customer" | "deliveryBoy" =
              currentUserId === deliveryBoyId ? "deliveryBoy" : "customer";

            const lastOtherMessage = [...messages]
              .slice()
              .reverse()
              .find((m) => m.from === "other");

            const baseText =
              lastOtherMessage?.text || "Help me reply politely.";

            if (suggestions.length > 0) {
              setSuggestions([]);
              return;
            }

            await generateAISuggestions(baseText, role);
          }}
          className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 border border-emerald-400 cursor-pointer transition-colors hover:bg-emerald-400 disabled:opacity-50"
          disabled={!roomId}
        >
          <span className="text-sm">🤖</span>
          <span>AI suggest</span>
        </button>
      </div>

      {aiError && (
        <p className="mb-1 text-[11px] text-red-400">
          {aiError}
        </p>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 rounded-xl bg-slate-950/40 p-3 border border-slate-800/60">
        {messages.length === 0 && (
          <p className="text-xs text-white text-center mt-6">
            No messages yet. Start the conversation below.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                msg.from === "me"
                  ? "bg-emerald-500 text-slate-950 rounded-br-sm"
                  : "bg-slate-800 text-slate-100 rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              <p className="mt-1 text-[9px] opacity-70 text-right">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-emerald-500 px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70  focus:border-emerald-500/80"
          />
          <div className="flex items-center gap-1">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setInput((prev) => (prev || "") + emoji)}
                className="text-base leading-none rounded-full px-1.5 py-1 hover:bg-slate-800"
              >
                {emoji}
              </button>
            ))}
          </div>
          </div>
          <button
            type="submit"
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white border-2 cursor-pointer transition-colors disabled:opacity-50"
            disabled={!input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryChat;
