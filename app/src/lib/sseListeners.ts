import { AppState, Store } from "$lib/stores.svelte";
import type { Category, CategoryFull, ChannelWithMessages, SSEChannel, SSEMessage, SSEUser } from "$lib/types";

export const registerSSEListeners = (source: EventSource) => {
  // ------ USERS ------

  source.addEventListener('user:edit', (event: MessageEvent) => {
    console.info('Received SSE: user:edit');
    const data = JSON.parse(event.data) as SSEUser;

    Store.users.edit(data.user);
  });

  // ------ MESSAGES ------

  source.addEventListener('message:create', (event: MessageEvent) => {
    console.info('Received SSE: message:create');
    const data = JSON.parse(event.data) as SSEMessage;

    Store.channels.sendMessage(data.message);
  });

  source.addEventListener('message:edit', (event: MessageEvent) => {
    console.info('Received SSE: message:edit');
    const data = JSON.parse(event.data) as SSEMessage;

    Store.messages.edit(data.message);
  });

  source.addEventListener('message:delete', (event: MessageEvent) => {
    console.info('Received SSE: message:delete');
    const data = JSON.parse(event.data) as SSEMessage;

    Store.messages.delete(data.message.channel_id, data.message.id);
  });

  // ------ CATEGORIES ------

  source.addEventListener('category:create', (event: MessageEvent) => {
    console.info('Received SSE: category:create');
    const data = JSON.parse(event.data) as Category;
    let newCat: CategoryFull = {
      ...data,
      channels: [],
    };

    Store.categories.add(newCat);
  });

  source.addEventListener('category:edit', (event: MessageEvent) => {
    console.info('Received SSE: category:edit');
    const data = JSON.parse(event.data) as Category;

    const cat = Store.categories.findById(data.id);
    if (!cat) return;

    let newCat: CategoryFull = {
      ...data,
      channels: cat.channels,
    };

    Store.categories.replace(newCat);
  });

  source.addEventListener('category:delete', (event: MessageEvent) => {
    console.info('Received SSE: category:edit');
    const data = JSON.parse(event.data) as Category;

    const cat = Store.categories.findById(data.id);
    if (!cat) return;

    Store.categories.delete(cat.id);
  });

  // ------ CHANNELS ------

  source.addEventListener('channel:create', (event: MessageEvent) => {
    console.info('Received SSE: channel:create');
    const data = JSON.parse(event.data) as SSEChannel;
    let newChan: ChannelWithMessages = {
      ...data.channel,
      messages: [],
      typedMessage: '',
    };

    // If this is the first channel created, set it as the current channel
    if (!AppState.currentChannelId) {
      AppState.currentChannelId = data.channel.id;
    }

    Store.channels.add(data.categoryId, newChan);
  });

  source.addEventListener('channel:edit', (event: MessageEvent) => {
    console.info('Received SSE: channel:edit');
    const data = JSON.parse(event.data) as SSEChannel;

    const channel = Store.channels.findById(data.channel.id);
    if (!channel) return;

    let newChan: ChannelWithMessages = {
      ...data.channel,
      messages: channel.messages,
      typedMessage: channel.typedMessage,
    };

    Store.channels.replace(data.categoryId, newChan);
  });

  source.addEventListener('channel:delete', (event: MessageEvent) => {
    console.info('Received SSE: channel:delete');
    const data = JSON.parse(event.data) as SSEChannel;

    const channel = Store.channels.findById(data.channel.id);
    if (!channel) return;

    Store.channels.delete(data.categoryId, channel.id);
  });

  // ------ OTHER ------

  source.onerror = () => {
    console.error('SSE error, browser will auto-retry');
  };
}