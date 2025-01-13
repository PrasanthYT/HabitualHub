import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/auth/signup");
  };

  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    const gitCloneCommand = "git clone https://github.com/your-repo.git"; // Replace with your repo URL
    navigator.clipboard.writeText(gitCloneCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    });
  };

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const guideMessages = [
    {
      type: "assistant",
      content:
        "Hi! I'll help you integrate GitHub with Habitual Hub. Let's start by getting your GitHub Personal Access Token (PAT).",
    },
    {
      type: "assistant",
      content:
        "Here's how to create a GitHub Personal Access Token that never expires:",
    },
    {
      type: "assistant",
      content: `
1. Go to GitHub.com and sign in
2. Click your profile picture → Settings
3. Scroll down to Developer settings (bottom of left sidebar)
4. Click Personal access tokens → Tokens (classic)
5. Click "Generate new token" → "Generate new token (classic)"
6. Name: "Habitual Hub Integration"
7. Expiration: "No expiration"
8. Select these scopes:
   - repo (all)
   - workflow
   - read:org
9. Click "Generate token"
10. Copy your token immediately - you won't see it again!`,
    },
    {
      type: "assistant",
      content:
        "⚠️ Important: Store your token securely. Never share it or commit it to your code.",
    },
  ];

  const typeMessage = useCallback((message, callback) => {
    setIsTyping(true);
    let currentChar = 0;
    setDisplayedText("");

    const typingInterval = setInterval(() => {
      if (currentChar < message.length) {
        setDisplayedText((prev) => prev + message[currentChar]);
        currentChar++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        if (callback) callback();
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, []);

  const showNextMessage = useCallback(() => {
    if (currentMessageIndex < guideMessages.length) {
      const message = guideMessages[currentMessageIndex];
      typeMessage(message.content, () => {
        setMessages((prev) => [
          ...prev,
          { ...message, content: message.content },
        ]);
        setCurrentMessageIndex((prev) => prev + 1);
        setDisplayedText("");
      });
    }
  }, [currentMessageIndex, typeMessage]);

  const handleStartGuide = () => {
    setIsGuideOpen(true);
    setMessages([]);
    setCurrentMessageIndex(0);
    showNextMessage();
  };

  useEffect(() => {
    if (
      isGuideOpen &&
      !isTyping &&
      currentMessageIndex < guideMessages.length &&
      messages.length < guideMessages.length
    ) {
      const timer = setTimeout(showNextMessage, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    isGuideOpen,
    currentMessageIndex,
    isTyping,
    messages.length,
    showNextMessage,
  ]);

  return (
    <>
      <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="flex justify-center">
            <a
              className="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-sm text-gray-800 p-1 ps-3 rounded-full transition hover:border-gray-300 focus:outline-none focus:border-gray-300"
              onClick={handleGetStarted}
            >
              Join the Habitual Hub Today!
              <span className="py-1.5 px-2.5 inline-flex justify-center items-center gap-x-2 rounded-full bg-gray-200 font-semibold text-sm text-gray-600">
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          </div>

          <div className="mt-5 max-w-2xl text-center mx-auto">
            <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl">
              Welcome to
              <span className="bg-clip-text bg-gradient-to-tl from-blue-600 to-violet-600 text-transparent">
                Habitual Hub
              </span>
            </h1>
          </div>

          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-600">
              Your ultimate platform to build, track, and sustain life-changing
              habits. Empowering you to achieve your goals, one habit at a time.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-blue-600 to-violet-600 hover:from-violet-600 hover:to-blue-600 border border-transparent text-white text-sm font-medium rounded-md focus:outline-none focus:from-violet-600 focus:to-blue-600 py-3 px-4 cursor-pointer w-full sm:w-auto"
              onClick={handleGetStarted}
            >
              Get Started
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="relative group p-2 ps-3 inline-flex items-center gap-x-2 text-sm font-mono rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none w-auto sm:w-auto"
            >
              {copied
                ? "Copied!"
                : "git clone https://github.com/your-repo.git"}
              <span className="flex justify-center items-center bg-gray-200 rounded-md size-7">
                <svg
                  className="shrink-0 size-4 group-hover:rotate-6 transition"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
              </span>
            </button>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row justify-center items-center gap-y-2 sm:gap-x-3">
            <div className="flex items-center gap-x-1 sm:gap-x-3">
              <span className="text-sm text-gray-600">Get Started with:</span>
              <span className="text-sm font-bold text-gray-900">Our AI</span>
              <svg
                className="size-5 text-gray-300"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 13L10 3"
                  stroke="currentColor"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <a
              className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium cursor-pointer"
              onClick={handleStartGuide}
            >
              Learn How to Integrate GitHub with Habitual Hub
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
          </div>
        </div>

        {isGuideOpen && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                className="inline-flex justify-center items-center gap-x-2 rounded-lg font-medium text-gray-800 hover:text-blue-600 focus:outline-none focus:text-blue-600 text-xs sm:text-sm"
                onClick={() => {
                  setIsGuideOpen(false);
                  setMessages([]);
                  setCurrentMessageIndex(0);
                }}
              >
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                New chat
              </button>

              <button
                type="button"
                disabled
                className="py-1.5 px-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                <svg
                  className="size-3"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" />
                </svg>
                Stop generating
              </button>
            </div>

            <div className="space-y-4 mb-4">
              {messages.map((message, index) => (
                <div key={index} className="flex justify-start">
                  <div className="inline-block max-w-xl rounded-lg p-4 bg-gray-100 text-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg
                          className="size-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">GitHub Assistant</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="inline-block max-w-xl rounded-lg p-4 bg-gray-100 text-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg
                          className="size-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">GitHub Assistant</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {displayedText}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                className="p-4 pb-12 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                placeholder="Ask me anything..."
                disabled
              ></textarea>

              <div className="absolute bottom-px inset-x-px p-2 rounded-b-lg bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-gray-100 focus:z-10 focus:outline-none focus:bg-gray-100"
                      disabled
                    >
                      <svg
                        className="shrink-0 size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <line x1="9" x2="15" y1="15" y2="9" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-gray-100 focus:z-10 focus:outline-none focus:bg-gray-100"
                      disabled
                    >
                      <svg
                        className="shrink-0 size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-x-1">
                    <button
                      type="button"
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-gray-100 focus:z-10 focus:outline-none focus:bg-gray-100"
                      disabled
                    >
                      <svg
                        className="shrink-0 size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:bg-blue-500"
                      disabled
                    >
                      <svg
                        className="shrink-0 size-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <p className="text-xs text-gray-600">© 2025 Habitual Hub.</p>
              </div>
              <ul className="flex flex-wrap items-center gap-3">
                <li>
                  <a
                    className="text-xs text-gray-500 underline hover:text-gray-800"
                    href="#"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    className="text-xs text-gray-500 underline hover:text-gray-800"
                    href="#"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    className="text-xs text-gray-500 underline hover:text-gray-800"
                    href="#"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Home;
