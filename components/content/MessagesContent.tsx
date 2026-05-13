'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  deleteMessage,
  markMessageRead,
  MessageView,
  MessageKind,
} from '@/lib/actions/message/message.action';

const KIND_ICON: Record<MessageKind, string> = {
  auction: '📯',
  work: '🛠️',
  market: '🏷️',
  system: '📜',
};

interface Props {
  messages: MessageView[];
  unread: number;
}

const MessagesContent = ({ messages, unread }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const onOpen = async (msg: MessageView) => {
    setOpenId((cur) => (cur === msg._id ? null : msg._id));
    if (!msg.read) {
      await markMessageRead({ id: msg._id });
      router.refresh();
    }
  };

  const onDelete = async (id: string) => {
    setBusy(true);
    const res = await deleteMessage({ id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Message deleted');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm flex justify-between'>
        <span>Messages</span>
        <span className='text-xs opacity-90'>{unread} unread</span>
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        {messages.length === 0 && (
          <div className='px-3 py-3 italic opacity-80'>Your inbox is empty.</div>
        )}
        {messages.map((msg, idx) => {
          const isOpen = openId === msg._id;
          return (
            <div
              key={msg._id}
              className={`flex flex-col px-3 py-2 ${idx < messages.length - 1 && 'border-b-[2px] border-cream2'}`}
            >
              <div className='flex items-center gap-2'>
                <span className='text-lg'>{KIND_ICON[msg.kind]}</span>
                <button
                  type='button'
                  onClick={() => onOpen(msg)}
                  className={`flex-1 text-left ${msg.read ? '' : 'font-semibold text-red3'}`}
                >
                  {msg.title}
                </button>
                <span className='text-xs opacity-70'>
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
                <button
                  type='button'
                  onClick={() => onDelete(msg._id)}
                  disabled={busy}
                  className='general-button px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
                >
                  Delete
                </button>
              </div>
              {isOpen && (
                <div className='mt-1 text-xs px-1 py-2 bg-brown2/5 rounded-sm whitespace-pre-wrap'>
                  {msg.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessagesContent;
