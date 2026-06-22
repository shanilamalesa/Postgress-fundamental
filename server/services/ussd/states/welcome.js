// server/services/ussd/states/welcome.js
const { t } = require("../i18n");
const session = require("../session");

module.exports = async function welcome({  input, context, lang, phoneNumber }) {
  const currentLang = context.lang || lang || "en";

  if (input === "") {
    const draft = await session.getDraft(phoneNumber);
    const menu = draft
      ? `${t(currentLang, "welcome_menu")}\n5. Continue draft`
      : t(currentLang, "welcome_menu");
    return {
      response: `CON ${t(currentLang, "welcome_title")}\n${menu}`,
      nextState: "welcome",
      nextContext: { ...context, lang: currentLang },
    };
}

  if (input === "5") {
  const draft = await session.getDraft(phoneNumber);
  if (draft) {
    return {
      response: `CON Confirm? "${draft.message.slice(0, 60)}..."\n1. Yes, submit\n2. Re-type`,
      nextState: "new_ticket_confirm",
      nextContext: { ...context, ...draft },
    };
  }
}

  if (input === "4") {
    // Language toggle
    const newLang = currentLang === "en" ? "sw" : "en";
    return {
      response: `CON ${t(newLang, "welcome_title")}\n${t(newLang, "welcome_menu")}`,
      nextState: "welcome",
      nextContext: { ...context, lang: newLang },
    };
  }

  if (input === "1") {
    return {
      response: `CON ...`, // see my_tickets; pass-through
      nextState: "my_tickets",
      nextContext: context,
    };
  }

  if (input === "2") {
    return {
      response: `CON ${t(currentLang, "prompt_category")}\n${t(currentLang, "back")}`,
      nextState: "new_ticket_category",
      nextContext: context,
    };
  }

  if (input === "3") {
    return {
      response: `END ${t(currentLang, "call_support")}`,
      nextState: "done",
      nextContext: {},
    };
  }

  return {
    response: `CON ${t(currentLang, "invalid")}\n${t(currentLang, "welcome_title")}\n${t(currentLang, "welcome_menu")}`,
    nextState: "welcome",
    nextContext: context,
  };
};