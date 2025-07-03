import type { NextApiRequest, NextApiResponse } from 'next';

import supabase from '@/supabaseServer';

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  sender_pubkey: string;
  receiver_pubkey: string;
  chatroom_id?: number;
  status: FriendRequestStatus;
  created_at?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await getFriendRequests(req, res);
    case 'POST':
      return await createFriendRequest(req, res);
    case 'PATCH':
      return await updateFriendRequestStatus(req, res);
    case 'DELETE':
      return await deleteFriendRequest(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get friend requests for a user (either sent or received)
async function getFriendRequests(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_pubkey, type, receiver_pubkey } = req.query;
    if (receiver_pubkey) {
      const isDisabled = await hasDisabledFriendReq(receiver_pubkey as string);
      if (isDisabled) {
        return res.status(500).json({
          error: 'Friend requests are disabled for this user',
        });
      }
    }

    if (!user_pubkey) {
      return res.status(500).json({ error: 'User public key is required' });
    }

    let query = supabase.from('friend_requests').select('*');

    if (type === 'sent') {
      query = query.eq('sender_pubkey', user_pubkey);
    } else if (type === 'received') {
      query = query.eq('receiver_pubkey', user_pubkey);
    } else {
      query = query.or(
        `sender_pubkey.eq.${user_pubkey},receiver_pubkey.eq.${user_pubkey}`,
      );
    }

    const { data, error } = (await query.order('created_at', {
      ascending: false,
    })) as {
      data: FriendRequest[] | null;
      error: Error | null;
    };

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ friend_requests: data });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
}

async function createFriendRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sender_pubkey, receiver_pubkey } = req.body as FriendRequest;

    if (!sender_pubkey || !receiver_pubkey) {
      return res
        .status(500)
        .json({ error: 'Sender and receiver public keys are required' });
    }

    const { data: existingRequests, error: checkError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(
        `and(sender_pubkey.eq.${sender_pubkey},receiver_pubkey.eq.${receiver_pubkey}),and(sender_pubkey.eq.${receiver_pubkey},receiver_pubkey.eq.${sender_pubkey})`,
      )
      .not('status', 'eq', 'rejected');

    if (checkError) {
      return res.status(500).json({ error: checkError.message });
    }

    if (existingRequests && existingRequests.length > 0) {
      return res
        .status(500)
        .json({ error: 'A friend request already exists between these users' });
    }

    const newFriendRequest = {
      sender_pubkey,
      receiver_pubkey,
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('friend_requests')
      .insert([newFriendRequest])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Friend request sent successfully',
      friend_request: data?.[0],
    });
  } catch (error) {
    console.error('Error creating friend request:', error);
    return res.status(500).json({ error: 'Failed to create friend request' });
  }
}

// Update friend request status (accept/reject)
async function updateFriendRequestStatus(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res
        .status(500)
        .json({ error: 'Request ID and status are required' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res
        .status(500)
        .json({ error: 'Status must be either accepted or rejected' });
    }

    const { data: requestData, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !requestData) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (status === 'accepted') {
      const { data: chatroomData, error: chatroomError } = await supabase
        .from('chatrooms')
        .insert([{ type: 'private' }])
        .select()
        .single();

      if (chatroomError || !chatroomData) {
        return res.status(500).json({ error: 'Failed to create chatroom' });
      }

      const { data: participantsData, error: participantsError } =
        await supabase
          .from('chat_participants')
          .insert([
            {
              wallet_address: requestData.sender_pubkey,
              chatroom_id: chatroomData.id,
            },
            {
              wallet_address: requestData.receiver_pubkey,
              chatroom_id: chatroomData.id,
            },
          ])
          .select();

      if (participantsError || !participantsData) {
        return res.status(500).json({ error: 'Failed to add participants' });
      }
    }

    const updateData: Partial<FriendRequest> = {
      status: status as FriendRequestStatus,
    };

    const { data, error } = await supabase
      .from('friend_requests')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: `Friend request ${status} successfully`,
      friend_request: data?.[0],
    });
  } catch (error) {
    console.error('Error updating friend request:', error);
    return res.status(500).json({ error: 'Failed to update friend request' });
  }
}

async function deleteFriendRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(500).json({ error: 'Request ID is required' });
    }

    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Friend request deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting friend request:', error);
    return res.status(500).json({ error: 'Failed to delete friend request' });
  }
}

async function hasDisabledFriendReq(walletAddress: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('settings')
    .select('wallet_address, preferences')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return false;
  }

  return data.preferences.disableFriendReq || false;
}
