'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  deleteAllMessages,
  deleteMessage,
  markAllMessagesRead,
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

const PAGE_SIZE = 20;

const MessagesContent = ({ messages, unread }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageMessages = messages.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [pageCount, page]);

  const onOpen = async (msg: MessageView) => {
    setOpenId((cur) => (cur === msg._id ? null : msg._id));
    if (!msg.read) {
      await markMessageRead({ id: msg._id });
      router.refresh();
    }
  };

  const onMarkRead = async (id: string) => {
    setBusy(true);
    const res = await markMessageRead({ id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    router.refresh();
  };

  const onMarkAllRead = async () => {
    if (unread === 0) return;
    setBusy(true);
    const res = await markAllMessagesRead();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Marked ${res.updated ?? 0} as read`);
    router.refresh();
  };

  const onDelete = async (id: string) => {
    setBusy(true);
    const res = await deleteMessage({ id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Message deleted');
    router.refresh();
  };

  const onDeleteAll = async () => {
    if (messages.length === 0) return;
    if (!confirm(`Delete all ${messages.length} message${messages.length === 1 ? '' : 's'}?`)) return;
    setBusy(true);
    const res = await deleteAllMessages();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Deleted ${res.deleted ?? 0} messages`);
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
        {pageMessages.map((msg, idx) => {
          const isOpen = openId === msg._id;
          return (
            <div
              key={msg._id}
              className={`flex flex-col px-3 py-2 ${idx < pageMessages.length - 1 && 'border-b-[2px] border-cream2'}`}
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
                {!msg.read && (
                  <button
                    type='button'
                    onClick={() => onMarkRead(msg._id)}
                    disabled={busy}
                    className='general-button px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
                    title='Mark this message as read'
                  >
                    Mark read
                  </button>
                )}
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
        {pageCount > 1 && (
          <div className='flex items-center justify-between gap-2 px-3 py-2 border-t-[2px] border-cream2 text-xs'>
            <span className='opacity-80'>
              Page <strong>{safePage + 1}</strong> of <strong>{pageCount}</strong>
              {' '}&middot; {messages.length} messages
            </span>
            <div className='flex gap-1'>
              <button type='button' onClick={() => setPage(0)}                                disabled={safePage === 0}              className='general-button px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-40'>« First</button>
              <button type='button' onClick={() => setPage((p) => Math.max(0, p-1))}          disabled={safePage === 0}              className='general-button px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-40'>‹ Prev</button>
              <button type='button' onClick={() => setPage((p) => Math.min(pageCount-1, p+1))} disabled={safePage >= pageCount-1}    className='general-button px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-40'>Next ›</button>
              <button type='button' onClick={() => setPage(pageCount - 1)}                    disabled={safePage >= pageCount-1}    className='general-button px-2 py-[2px] rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-40'>Last »</button>
            </div>
          </div>
        )}
      </div>

      {messages.length > 0 && (
        <div className='flex justify-end gap-2'>
          {unread > 0 && (
            <button
              type='button'
              onClick={onMarkAllRead}
              disabled={busy}
              className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              Mark all read ({unread})
            </button>
          )}
          <button
            type='button'
            onClick={onDeleteAll}
            disabled={busy}
            className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          >
            Delete all ({messages.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesContent;
