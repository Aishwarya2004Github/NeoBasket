import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";

const AIShopping = () => {
  const navigate = useNavigate();

  const categoryData = useSelector(
    (state) => state.product.allCategory || []
  );

  const subCategoryData = useSelector(
    (state) => state.product.allSubCategory || []
  );

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! 🤖 I'm your Shopping Assistant. Tell me what you want to buy and I'll help you find the right category.",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  // --------------------------------------------------
  // NORMALIZE TEXT
  // --------------------------------------------------

  const normalize = (text = "") => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/gi, " ");
  };

  // --------------------------------------------------
  // CATEGORY NAVIGATION
  // --------------------------------------------------

  const openCategory = (category) => {
    if (!category) return;

    const subcategory = subCategoryData.find(
      (item) => item.categoryId === category.id
    );

    if (!subcategory) {
      navigate(`/${valideURLConvert(category.name)}-${category.id}`);
      return;
    }

    const url = `/${valideURLConvert(
      category.name
    )}-${category.id}/${valideURLConvert(
      subcategory.name
    )}-${subcategory.id}`;

    navigate(url);
  };

  // --------------------------------------------------
  // SMART CATEGORY MATCHING
  // --------------------------------------------------

  const findMatchingCategories = (query) => {
    const cleanQuery = normalize(query);

    if (!cleanQuery) return [];

    const words = cleanQuery.split(/\s+/);

    const scoredCategories = categoryData
      .map((category) => {
        const categoryName = normalize(category.name);

        let score = 0;

        // Exact category match
        if (categoryName === cleanQuery) {
          score += 100;
        }

        // Query contains category
        if (cleanQuery.includes(categoryName)) {
          score += 50;
        }

        // Category contains query
        if (categoryName.includes(cleanQuery)) {
          score += 40;
        }

        // Word matching
        words.forEach((word) => {
          if (word.length < 2) return;

          if (categoryName.includes(word)) {
            score += 15;
          }
        });

        // Check subcategories
        const relatedSubcategories = subCategoryData.filter(
          (sub) => sub.categoryId === category.id
        );

        relatedSubcategories.forEach((sub) => {
          const subName = normalize(sub.name);

          if (subName === cleanQuery) {
            score += 80;
          }

          if (cleanQuery.includes(subName)) {
            score += 40;
          }

          if (subName.includes(cleanQuery)) {
            score += 30;
          }

          words.forEach((word) => {
            if (word.length >= 2 && subName.includes(word)) {
              score += 10;
            }
          });
        });

        return {
          ...category,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scoredCategories.slice(0, 5);
  };

  // --------------------------------------------------
  // SMART RESPONSE
  // --------------------------------------------------

  const generateResponse = (query) => {
    const matches = findMatchingCategories(query);

    const cleanQuery = normalize(query);

    // Greetings
    const greetings = [
      "hi",
      "hello",
      "hey",
      "hii",
      "namaste",
      "good morning",
      "good evening",
    ];

    if (greetings.some((item) => cleanQuery.includes(item))) {
      return {
        text: "Hey! 👋 What are you looking for today? You can ask me things like **milk**, **fruits**, **snacks**, **vegetables**, etc.",
        categories: [],
      };
    }

    // Empty
    if (!cleanQuery) {
      return {
        text: "Tell me what you want to shop for 😊",
        categories: [],
      };
    }

    // Matches found
    if (matches.length > 0) {
      const topMatch = matches[0];

      return {
        text: `I found something that matches **${topMatch.name}**. 🎯 Here are the best options I found for you:`,
        categories: matches,
      };
    }

    // No match
    return {
      text: `Hmm 🤔 I couldn't find an exact match for **"${query}"**. Try searching with a category or product type such as **fruits, vegetables, dairy, snacks, beverages, personal care**, etc.`,
      categories: [],
    };
  };

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const handleSend = () => {
    const query = message.trim();

    if (!query || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(query);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: response.text,
        categories: response.categories,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  // --------------------------------------------------
  // ENTER KEY
  // --------------------------------------------------

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --------------------------------------------------
  // QUICK SEARCH
  // --------------------------------------------------

  const quickSearch = (query) => {
    setMessage(query);

    setTimeout(() => {
      const userMessage = {
        id: Date.now(),
        type: "user",
        text: query,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(() => {
        const response = generateResponse(query);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: "bot",
            text: response.text,
            categories: response.categories,
          },
        ]);

        setIsTyping(false);
      }, 500);
    }, 50);
  };

  // --------------------------------------------------
  // POPULAR CATEGORIES
  // --------------------------------------------------

  const popularCategories = useMemo(() => {
    return categoryData.slice(0, 8);
  }, [categoryData]);

  return (
    <section className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

      {/* Ambient Glow */}

      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* Header */}

        <div className="text-center mb-8">

          <div
            className="
              inline-flex
              items-center
              justify-center
              w-20
              h-20
              rounded-3xl
              bg-gradient-to-br
              from-cyan-400
              via-blue-500
              to-purple-600
              shadow-[0_0_40px_rgba(34,211,238,0.3)]
              mb-4
            "
          >
            <span className="text-4xl">🤖</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black">
            AI Shopping Assistant
          </h1>

          <p className="mt-2 text-slate-400">
            Find products faster with your smart shopping robot.
          </p>

          <div
            className="
              mt-3
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-emerald-400/20
              bg-emerald-400/5
              px-4
              py-2
              text-xs
              font-bold
              text-emerald-400
            "
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            No API key required
          </div>

        </div>

        {/* Main Chat */}

        <div
          className="
            max-w-4xl
            mx-auto
            rounded-3xl
            border
            border-slate-800
            bg-slate-900/70
            backdrop-blur-xl
            overflow-hidden
            shadow-[0_20px_80px_rgba(0,0,0,0.4)]
          "
        >

          {/* Chat Header */}

          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
              border-slate-800
              bg-slate-900/80
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-gradient-to-br
                  from-cyan-400
                  to-purple-600
                  flex
                  items-center
                  justify-center
                  text-xl
                "
              >
                🤖
              </div>

              <div>
                <p className="font-black">
                  ShopBot
                </p>

                <p className="text-xs text-emerald-400">
                  ● Online
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: Date.now(),
                    type: "bot",
                    text: "Chat cleared! 👋 What would you like to shop for?",
                  },
                ])
              }
              className="
                text-xs
                font-bold
                text-slate-400
                hover:text-white
                transition
              "
            >
              Clear Chat
            </button>

          </div>

          {/* Messages */}

          <div
            className="
              h-[480px]
              overflow-y-auto
              p-4
              md:p-6
              space-y-4
            "
          >

            {messages.map((msg) => (

              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`
                    max-w-[85%]
                    md:max-w-[70%]
                    rounded-2xl
                    px-4
                    py-3
                    ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-md"
                        : "bg-slate-800 text-slate-200 rounded-bl-md"
                    }
                  `}
                >

                  <p className="text-sm leading-6 whitespace-pre-line">
                    {msg.text}
                  </p>

                  {/* Category Suggestions */}

                  {msg.categories &&
                    msg.categories.length > 0 && (

                      <div className="mt-4 space-y-2">

                        {msg.categories.map((category) => (

                          <button
                            key={category.id}
                            onClick={() =>
                              openCategory(category)
                            }
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              p-3
                              rounded-xl
                              bg-slate-900
                              border
                              border-slate-700
                              hover:border-cyan-400/60
                              hover:bg-slate-950
                              transition-all
                              duration-300
                              text-left
                              group
                            "
                          >

                            <div
                              className="
                                w-12
                                h-12
                                rounded-xl
                                bg-gradient-to-br
                                from-cyan-400
                                to-purple-600
                                p-1
                                flex
                                items-center
                                justify-center
                              "
                            >

                              {category.image ? (
                                <img
                                  src={
                                    category.image.startsWith(
                                      "http"
                                    )
                                      ? category.image
                                      : `http://localhost:8080${category.image}`
                                  }
                                  alt={category.name}
                                  className="
                                    w-full
                                    h-full
                                    object-contain
                                    rounded-lg
                                  "
                                />
                              ) : (
                                <span className="text-xl">
                                  🛒
                                </span>
                              )}

                            </div>

                            <div className="flex-1">

                              <p className="font-bold text-sm">
                                {category.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                Browse products
                              </p>

                            </div>

                            <span
                              className="
                                text-cyan-400
                                group-hover:translate-x-1
                                transition-transform
                              "
                            >
                              →
                            </span>

                          </button>

                        ))}

                      </div>

                    )}

                </div>

              </div>

            ))}

            {/* Typing */}

            {isTyping && (

              <div className="flex justify-start">

                <div
                  className="
                    bg-slate-800
                    rounded-2xl
                    rounded-bl-md
                    px-5
                    py-4
                    flex
                    gap-1
                  "
                >

                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />

                  <span
                    className="
                      w-2
                      h-2
                      bg-cyan-400
                      rounded-full
                      animate-bounce
                    "
                    style={{ animationDelay: "0.15s" }}
                  />

                  <span
                    className="
                      w-2
                      h-2
                      bg-cyan-400
                      rounded-full
                      animate-bounce
                    "
                    style={{ animationDelay: "0.3s" }}
                  />

                </div>

              </div>

            )}

          </div>

          {/* Quick Suggestions */}

          <div
            className="
              px-4
              pb-3
              flex
              gap-2
              overflow-x-auto
            "
          >

            {[
              "Fruits",
              "Vegetables",
              "Dairy",
              "Snacks",
              "Beverages",
              "Personal Care",
            ].map((item) => (

              <button
                key={item}
                onClick={() => quickSearch(item)}
                className="
                  whitespace-nowrap
                  rounded-full
                  border
                  border-slate-700
                  bg-slate-800
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-slate-300
                  hover:border-cyan-400
                  hover:text-cyan-300
                  transition
                "
              >
                {item}
              </button>

            ))}

          </div>

          {/* Input */}

          <div
            className="
              p-4
              border-t
              border-slate-800
              bg-slate-900/80
            "
          >

            <div className="flex gap-2">

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you looking for? e.g. milk, fruits..."
                className="
                  flex-1
                  min-w-0
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400
                  focus:ring-2
                  focus:ring-cyan-400/10
                  transition
                "
              />

              <button
                onClick={handleSend}
                disabled={!message.trim() || isTyping}
                className="
                  w-12
                  h-12
                  shrink-0
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  flex
                  items-center
                  justify-center
                  text-xl
                  shadow-[0_0_20px_rgba(34,211,238,0.25)]
                  hover:scale-105
                  disabled:opacity-40
                  disabled:hover:scale-100
                  transition-all
                "
              >
                ➤
              </button>

            </div>

            <p className="text-[10px] text-slate-600 mt-2 text-center">
              Powered by your store's existing product & category data
            </p>

          </div>

        </div>

        {/* Popular Categories */}

        {popularCategories.length > 0 && (

          <div className="max-w-4xl mx-auto mt-8">

            <h2 className="text-lg font-black mb-4">
              🔥 Explore Categories
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {popularCategories.map((category) => (

                <button
                  key={category.id}
                  onClick={() => openCategory(category)}
                  className="
                    group
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900/60
                    p-4
                    hover:border-cyan-400/50
                    hover:-translate-y-1
                    transition-all
                    duration-300
                  "
                >

                  <div
                    className="
                      w-14
                      h-14
                      mx-auto
                      rounded-xl
                      bg-gradient-to-br
                      from-slate-800
                      to-slate-950
                      flex
                      items-center
                      justify-center
                      mb-3
                      border
                      border-slate-700
                    "
                  >

                    {category.image ? (

                      <img
                        src={
                          category.image.startsWith("http")
                            ? category.image
                            : `http://localhost:8080${category.image}`
                        }
                        alt={category.name}
                        className="w-full h-full object-contain"
                      />

                    ) : (

                      <span className="text-2xl">
                        🛒
                      </span>

                    )}

                  </div>

                  <p className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition">
                    {category.name}
                  </p>

                </button>

              ))}

            </div>

          </div>

        )}

      </div>

    </section>
  );
};

export default AIShopping;