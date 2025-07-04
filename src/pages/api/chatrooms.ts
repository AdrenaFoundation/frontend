import type { NextApiRequest, NextApiResponse } from 'next';

import supabaseClient from '@/supabaseBackendClient';

export type ChatroomType = 'community' | 'private' | 'group' | 'adrena';

export interface Chatroom {
  id: number;
  created_at: string;
  name: string | null;
  type: ChatroomType;
  unread_count: number;
  last_message: Message | null;
  participants?: string[];
}

export interface Message {
  id: number;
  room_id: number;
  text: string | null;
  timestamp: string;
  wallet: string;
  username: string | null;
}

export interface ReadReceipt {
  user_pubkey: string;
  chatroom_id: number;
  last_read_message_id: number;
  last_read: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      if (req.query.type === 'chatrooms') {
        return await getChatrooms(req, res);
      } else if (req.query.type === 'messages') {
        return await getMessages(req, res);
      } else if (req.query.type === 'unread') {
        return await getUnreadCounts(req, res);
      } else {
        return res.status(400).json({ error: 'Invalid type parameter' });
      }
    case 'POST':
      if (req.query.type === 'message') {
        return await sendMessage(req, res);
      } else if (req.query.type === 'read') {
        return await markAsRead(req, res);
      } else {
        return res.status(400).json({ error: 'Invalid type parameter' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getChatrooms(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_pubkey, limit = 50 } = req.query;

    if (!user_pubkey) {
      return res.status(400).json({ error: 'User public key is required' });
    }

    // Get all community chatrooms
    const { data: communityRooms, error: communityError } = await supabaseClient
      .from('chatrooms')
      .select('*')
      .eq('type', 'community')
      .order('id', { ascending: true })
      .limit(Number(limit));
    // .offset(Number(offset));

    if (communityError) {
      return res.status(500).json({ error: communityError.message });
    }

    const { data: userRooms } = await supabaseClient
      .from('chat_participants')
      .select(
        `
        chatroom_id,
        chatrooms:chatroom_id(id, name, type, created_at),
        participants:chatroom_id(chat_participants(wallet_address))
      `,
      )
      .eq('wallet_address', user_pubkey)
      .not('chatroom_id', 'is', null);

    const privateRooms =
      userRooms?.map((room) => {
        const chatroomData = room.chatrooms;
        const participantsList =
          // @ts-expect-error chat_participants type is not working properly by supabase
          room.participants?.chat_participants?.map((p) => p.wallet_address) ||
          [];

        return {
          ...chatroomData,
          participants: participantsList,
        };
      }) || [];
    // Combine rooms
    const allRooms = [...communityRooms, ...privateRooms];

    const roomsWithUnreadCounts = await Promise.all(
      allRooms.map(async (room) => {
        const { data: latestMessage } = await supabaseClient
          .from('messages')
          .select('*')
          .eq('room_id', room.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        const { data: readReceipt } = await supabaseClient
          .from('read_receipts')
          .select('*')
          .eq('user_pubkey', user_pubkey)
          .eq('chatroom_id', room.id)
          .single();

        let unreadCount = 0;
        if (
          latestMessage &&
          (!readReceipt || readReceipt.last_read_message_id < latestMessage.id)
        ) {
          const { count, error: countError } = await supabaseClient
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .gt('id', readReceipt?.last_read_message_id || 0);

          if (!countError) {
            unreadCount = count || 0;
          }
        }

        return {
          ...room,
          unread_count: unreadCount,
          last_message: latestMessage || null,
        };
      }),
    );

    return res.status(200).json({
      chatrooms: roomsWithUnreadCounts,
      count: roomsWithUnreadCounts.length,
    });
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
    return res.status(500).json({ error: 'Failed to fetch chatrooms' });
  }
}

async function getMessages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { room_id, limit = 50 } = req.query;

    if (!room_id) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const query = supabaseClient
      .from('messages')
      .select('*')
      .eq('room_id', room_id)
      .order('id', { ascending: false })
      .limit(Number(limit));

    // [TODO]: Implement pagination logic
    // if (before_id) {
    //   query = query.lt('id', before_id);
    // }
    // else if (after_id) {
    //   query = query.gt('id', after_id);
    //   query = query.order('id', { ascending: true });
    // }

    const { data, error } = await query;

    const messages = data && data.reverse();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      messages,
      has_more: messages?.length === Number(limit),
      count: messages?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

async function getUnreadCounts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_pubkey } = req.query;

    if (!user_pubkey) {
      return res.status(400).json({ error: 'User public key is required' });
    }

    const { data: communityRooms } = await supabaseClient
      .from('chatrooms')
      .select('id')
      .eq('type', 'community');

    const { data: friendRequests } = await supabaseClient
      .from('friend_requests')
      .select('chatroom_id')
      .or(`sender_pubkey.eq.${user_pubkey},receiver_pubkey.eq.${user_pubkey}`)
      .eq('status', 'accepted')
      .not('chatroom_id', 'is', null);

    const privateRoomIds =
      friendRequests?.map((fr) => fr.chatroom_id).filter(Boolean) || [];
    const allRoomIds = [
      ...(communityRooms?.map((r) => r.id) || []),
      ...privateRoomIds,
    ];

    const { data: readReceipts } = await supabaseClient
      .from('read_receipts')
      .select('*')
      .eq('user_pubkey', user_pubkey)
      .in('chatroom_id', allRoomIds);

    const receiptsByRoom =
      readReceipts?.reduce((acc, receipt) => {
        acc[receipt.chatroom_id] = receipt;
        return acc;
      }) || {};

    const unreadCounts = await Promise.all(
      allRoomIds.map(async (roomId) => {
        const lastReadId = receiptsByRoom[roomId]?.last_read_message_id || 0;

        const { count, error } = await supabaseClient
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', roomId)
          .gt('id', lastReadId);

        if (error) {
          console.error(
            `Error counting unread messages for room ${roomId}:`,
            error,
          );
          return { room_id: roomId, count: 0 };
        }

        return { room_id: roomId, count: count || 0 };
      }),
    );

    const filteredCounts = unreadCounts.filter((room) => room.count > 0);

    return res.status(200).json({
      unread_counts: filteredCounts,
      total_unread: filteredCounts.reduce((sum, room) => sum + room.count, 0),
    });
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    return res.status(500).json({ error: 'Failed to fetch unread counts' });
  }
}

async function sendMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatroom_id, text, wallet, username } = req.body;

    if (chatroom_id === null || !text) {
      return res
        .status(400)
        .json({ error: 'Room ID and message text are required' });
    }

    const { data: chatroom, error: chatroomError } = await supabaseClient
      .from('chatrooms')
      .select('*')
      .eq('id', chatroom_id)
      .single();

    if (chatroomError || !chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    const { data, error } = await supabaseClient
      .from('messages')
      .insert([
        {
          room_id: chatroom_id,
          text,
          wallet,
          username,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Message sent successfully',
      data,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

async function markAsRead(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_pubkey, chatroom_id, message_id } = req.body;

    if (!user_pubkey || chatroom_id === null || !message_id) {
      return res.status(400).json({
        error: 'User public key, chatroom ID, and message ID are required',
      });
    }

    const { data: existingReceipt } = await supabaseClient
      .from('read_receipts')
      .select('*')
      .eq('user_pubkey', user_pubkey)
      .eq('chatroom_id', chatroom_id)
      .single();

    let result;
    if (existingReceipt) {
      if (existingReceipt.last_read_message_id < message_id) {
        result = await supabaseClient
          .from('read_receipts')
          .update({
            last_read_message_id: message_id,
            last_read: new Date().toISOString(),
          })
          .eq('user_pubkey', user_pubkey)
          .eq('chatroom_id', chatroom_id)
          .select();
      } else {
        return res.status(200).json({
          message: 'Messages already marked as read',
          data: existingReceipt,
        });
      }
    } else {
      result = await supabaseClient
        .from('read_receipts')
        .insert([
          {
            user_pubkey,
            chatroom_id,
            last_read_message_id: message_id,
            last_read: new Date().toISOString(),
          },
        ])
        .select();
    }

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({
      message: 'Messages marked as read',
      data: result.data?.[0],
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ error: 'Failed to mark messages as read' });
  }
}
