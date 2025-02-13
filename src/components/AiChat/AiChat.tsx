import React, { useState, useEffect, useRef } from 'react';
import { AssistantStream } from 'openai/lib/AssistantStream';
import Markdown from 'react-markdown';
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
import { RequiredActionFunctionToolCall } from 'openai/resources/beta/threads/runs/runs';

type MessageProps = {
  role: 'user' | 'assistant' | 'code';
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return <div className={'text-mono'}>{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className="text-mono">
      <Markdown>{text}</Markdown>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className="font-mono bg-gray-100 p-2 rounded-md">
      {text.split('\n').map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case 'user':
      return <UserMessage text={text} />;
    case 'assistant':
      return <AssistantMessage text={text} />;
    case 'code':
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall,
  ) => Promise<string>;
};

const AiChat = ({
  functionCallHandler = () => Promise.resolve(''), // default to return empty string
}: ChatProps) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState('');
  // const [newAssistantId, setNewAssistantId] = useState('');

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // const fetchAssistantId = async () => {

  //   const response = await fetch("/api/assistants", { method: "POST" });
  //   const data = await response.json();
  //   setNewAssistantId(data.assistantId);
  //   console.log("assistantId", newAssistantId);

  // };


  // create a new threadID when chat component created
  useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: 'POST',
      });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
    // fetchAssistantId();
  }, []);

  const sendMessage = async (text: string) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          content: text,
        }),
      },
    );
    if (response.body) {
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    }
  };

  const submitActionResult = async (runId: any, toolCallOutputs: any) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      },
    );

    if (response.body) {
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    }
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', text: userInput },
    ]);
    setUserInput('');
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage('assistant', '');
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta: { value?: string; annotations?: any[] }) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // toolCallCreated - log new tool call
  const toolCallCreated = (toolCall: { type: string }) => {
    if (toolCall.type != 'code_interpreter') return;
    appendMessage('code', '');
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolCallDelta = (
    delta: { type: string; code_interpreter?: { input?: any } },
    snapshot: any,
  ) => {
    if (delta.type != 'code_interpreter') return;
    if (!delta.code_interpreter?.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction,
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall: RequiredActionFunctionToolCall) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      }),
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on('textCreated', handleTextCreated);
    stream.on('textDelta', handleTextDelta);

    // code interpreter
    stream.on('toolCallCreated', toolCallCreated);
    stream.on('toolCallDelta', toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on('event', (event) => {
      if (event.event === 'thread.run.requires_action')
        handleRequiresAction(event);
      if (event.event === 'thread.run.completed') handleRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role: 'user' | 'assistant' | 'code', text: string) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations: any[]) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };

      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  console.log('messages', messages);

  return (
    <div className="w-[700px] m-auto bg-third p-4 rounded-lg shadow-lg border border-gray-200/20">
      <div className="h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-between mt-2"
      >
        <input
          type="text"
          className="bg-secondary border rounded-lg p-2 w-full"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />

        <button
          type="submit"
          className="button"
          disabled={inputDisabled}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AiChat;
