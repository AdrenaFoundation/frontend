import { useState } from 'react';

import {
  MaintenanceMessage,
  useMaintenanceMessages,
} from '@/hooks/communication/useMaintenanceMessages';

import Button from '../common/Button/Button';
import Checkbox from '../common/Checkbox/Checkbox';
import Loader from '../Loader/Loader';

export default function MaintenanceAlert() {
  const orange = '#b45309';
  const blue = '#3a86ff';
  const green = '#07956b';
  const red = '#c9243a';

  const COLOR_SWATCHES = [orange, blue, green, red];

  const {
    messages,
    loading,
    error,
    createMessage,
    updateMessage,
    deleteMessage,
  } = useMaintenanceMessages();

  const [msg, setMsg] = useState('');
  const [checkedPages, setCheckedPages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMsg, setEditMsg] = useState('');
  const [editPages, setEditPages] = useState<string[]>([]);
  const [color, setColor] = useState<string>(orange);
  const [editColor, setEditColor] = useState<string>(orange);

  const PAGES = [
    'trade',
    'buy_alp',
    'stake',
    'profile',
    'monitoring',
    'ranked',
  ];

  const handleCreate = async () => {
    await createMessage(msg, checkedPages, color);
    setMsg('');
    setCheckedPages([]);
    setColor(orange);
  };

  const handleEdit = (message: MaintenanceMessage) => {
    setEditingId(message.id);
    setEditMsg(message.message);
    setEditPages(message.pages);
    setEditColor(message.color || orange);
  };

  const handleUpdate = async (id: number) => {
    await updateMessage(id, {
      message: editMsg,
      pages: editPages,
      color: editColor,
    });
    setEditingId(null);
    setEditMsg('');
    setEditPages([]);
    setEditColor(orange);
  };

  const handleDelete = async (id: number) => {
    await deleteMessage(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMsg('');
    setEditPages([]);
  };

  return (
    <div className="w-full max-w-4xl  mx-auto p-4 mt-8 border rounded-md">
      <h1 className="text-lg font-semibold mb-3 capitalize">
        Create New Maintenance Message
      </h1>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : null}

      {/* Create New Message */}
      <div className="mb-8">
        <div className="relative flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter maintenance message"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="text-sm p-3 rounded-md text-ellipsis font-semibold outline-none w-full bg-inputcolor border border-white/10"
          />
          <Button
            title="Create"
            onClick={handleCreate}
            disabled={loading || !msg.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          />
        </div>

        <p className="font-semibold mb-2 text-sm flex items-center gap-3">
          Affected Pages
        </p>
        <div className="flex flex-row flex-wrap gap-4">
          {PAGES.map((page) => (
            <div
              className="flex flex-row gap-1 items-center border rounded-md p-1 px-2 pr-4 hover:bg-third transition duration-300 cursor-pointer select-none"
              key={page}
              onClick={() => {
                setCheckedPages((prev) =>
                  prev.includes(page)
                    ? prev.filter((p) => p !== page)
                    : [...prev, page],
                );
              }}
            >
              <Checkbox
                checked={checkedPages.includes(page)}
                onChange={() => {
                  // parent component handles the state change
                }}
              />
              <span className="ml-2 text-sm font-regular">{page}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-4">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className="w-5 h-5 rounded-full border-2 border-white/20"
              style={{
                background: swatch,
                boxShadow: color === swatch ? '0 0 0 2px #fff' : undefined,
              }}
              onClick={() => setColor(swatch)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2 capitalize">
          Existing Maintenance Messages
        </h3>

        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm opacity-50">No maintenance messages found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="border rounded-md p-3 bg-third border-inputcolor"
              >
                {editingId === message.id ? (
                  /* Edit Mode */
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={editMsg}
                        onChange={(e) => setEditMsg(e.target.value)}
                        className="text-sm p-3 rounded-md font-semibold outline-none flex-1 bg-inputcolor border border-white/10"
                        placeholder="Edit message"
                      />
                      <Button
                        title="Save"
                        onClick={() => handleUpdate(message.id)}
                        disabled={loading || !editMsg.trim()}
                        className="px-4 py-2"
                      />
                      <Button
                        title="Cancel"
                        onClick={cancelEdit}
                        variant="outline"
                        className="px-4 py-2"
                      />
                    </div>

                    <div>
                      <p className="font-semibold mb-2 text-sm flex items-center gap-3">
                        Affected Pages
                      </p>
                      <div className="flex flex-row flex-wrap gap-2">
                        {PAGES.map((page) => (
                          <div
                            className="flex flex-row gap-1 items-center border rounded-md p-1 px-2 pr-3 hover:bg-third transition duration-300 cursor-pointer select-none"
                            key={page}
                            onClick={() => {
                              setEditPages((prev) =>
                                prev.includes(page)
                                  ? prev.filter((p) => p !== page)
                                  : [...prev, page],
                              );
                            }}
                          >
                            <Checkbox
                              checked={editPages.includes(page)}
                              onChange={() => {}}
                            />
                            <span className="ml-1 text-xs capitalize">
                              {page}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-4">
                      {COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch}
                          type="button"
                          className="w-5 h-5 rounded-full border-2 border-white/20"
                          style={{
                            background: swatch,
                            boxShadow:
                              editColor === swatch
                                ? '0 0 0 2px #fff'
                                : undefined,
                          }}
                          onClick={() => setEditColor(swatch)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-3 flex-1">
                        <p className="text-base font-regular">
                          {message.message}
                        </p>
                        {message.pages.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {message.pages.map((page) => (
                              <span
                                key={page}
                                className="text-xs px-2 py-1 border rounded-md border-bcolor"
                              >
                                {page}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(message)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs transition duration-300"
                          disabled={loading}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(message.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs transition duration-300"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
