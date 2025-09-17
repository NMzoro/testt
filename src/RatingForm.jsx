import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import custom from "./custom";

export default function RatingForm({ slug, place_id, onNewAvis, lang, text }) {
  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // tooltips étoiles
  const tooltips = {
    1: lang === "كيف كانت تجربتك؟" ? "سيئ جدًا" : lang === "How was your experience?" ? "Terrible" : "Très mauvais",
    2: lang === "كيف كانت تجربتك؟" ? "سيئ" : lang === "How was your experience?" ? "Bad" : "Mauvais",
    3: lang === "كيف كانت تجربتك؟" ? "متوسط" : lang === "How was your experience?" ? "Average" : "Moyen",
    4: lang === "كيف كانت تجربتك؟" ? "جيد" : lang === "How was your experience?" ? "Good" : "Bon",
    5: lang === "كيف كانت تجربتك؟" ? "ممتاز" : lang === "How was your experience?" ? "Excellent" : "Excellent",
  };

  // messages de remerciement multilingues
  const thankMessages = {
    fr: {
      title: "Merci pour vos commentaires 🙏",
      text: "Nous sommes vraiment désolés que votre expérience n'ait pas été parfaite, et nous allons travailler pour l'améliorer. Vos commentaires nous aident à progresser.",
      back: "← Laisser un autre avis",
    },
    en: {
      title: "Thank you for your feedback 🙏",
      text: "We are truly sorry that your experience wasn’t perfect, and we will work hard to improve. Your feedback helps us get better.",
      back: "← Leave another review",
    },
    ar: {
      title: "🙏 شكراً على ملاحظاتك",
      text: "نحن آسفون حقًا لأن تجربتك لم تكن مثالية، وسنعمل جاهدين على تحسين خدماتنا. ملاحظاتك تساعدنا على التطور.",
      back: "← اترك تقييماً آخر",
    },
  };

  // détecter la langue choisie
  const currentLang =
    lang === "كيف كانت تجربتك؟"
      ? "ar"
      : lang === "How was your experience?"
      ? "en"
      : "fr";

  const handleNoteClick = async (n) => {
    setNote(n);
    setHover(null);

    if (n >= 4) {
      const googleMapsUrl = `https://search.google.com/local/writereview?placeid=${place_id}`;
      window.open(googleMapsUrl, "_blank");
      setNote(0);
      setCommentaire("");
      setContact("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (note <= 3 && !commentaire.trim()) {
        setError(
          currentLang === "ar"
            ? "المرجو ترك تعليق لمساعدتنا على تحسين خدماتنا."
            : currentLang === "en"
            ? "Please leave a comment to help us improve."
            : "Merci de laisser un commentaire pour nous aider à nous améliorer."
        );
        return;
      }

      await custom.post(`/clients/${slug}/avis`, {
        note,
        commentaire: commentaire.trim(),
        ...(contact.trim() && { contact: contact.trim() }),
      });

      setSubmitted(true);
      setCommentaire("");
      setNote(0);
      setContact("");
      setError("");
      if (onNewAvis) onNewAvis();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          (currentLang === "ar"
            ? "حدث خطأ أثناء إرسال تعليقك."
            : currentLang === "en"
            ? "An error occurred while submitting your feedback."
            : "Erreur lors de l'envoi de votre avis.")
      );
    }
  };

  return (
    <div className="mx-auto px-4 sm:px-6 max-w-2xl">
      <Toaster />
      <AnimatePresence mode="wait">
        {/* --- Étoiles --- */}
        {!submitted && note === 0 && (
          <motion.div
            key="stars"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-[#EAE5D7] p-6 sm:p-10 md:p-12 rounded-2xl shadow-2xl text-center border border-slate-200"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-500 via-lime-500 to-yellow-500 bg-clip-text text-transparent mb-4">
              {lang}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-6">{text}</p>

            <div className="flex flex-wrap justify-center gap-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNoteClick(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <span
                    className={`text-5xl transition-colors ${
                      n <= (hover || note) ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                  {hover === n && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {tooltips[n]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- Formulaire si note ≤ 3 --- */}
        {!submitted && note > 0 && note <= 3 && (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-[#E4DECF] p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl mt-6"
          >
            <button
              type="button"
              onClick={() => setNote(0)}
              className="text-gray-500 font-bold mb-6 hover:underline flex items-center text-lg"
            >
              ⬅ {currentLang === "ar" ? "رجوع إلى التقييم" : currentLang === "en" ? "Back to rating" : "Retour à la notation"}
            </button>

            <h3 className="text-2xl text-center font-semibold text-slate-800 mb-8">
              {currentLang === "ar"
                ? "ساعدنا على تحسين خدماتنا 🙏"
                : currentLang === "en"
                ? "Help us improve 🙏"
                : "Aidez-nous à nous améliorer 🙏"}
            </h3>

            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows="4"
              placeholder={
                currentLang === "ar"
                  ? "أخبرنا بما لم يعجبك..."
                  : currentLang === "en"
                  ? "Tell us what didn’t work well..."
                  : "Dites-nous ce qui n’a pas fonctionné..."
              }
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-[#EAE5D7] mb-6 text-lg"
              required
            />

            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={
                currentLang === "ar"
                  ? "اسمك أو وسيلة اتصال (اختياري)"
                  : currentLang === "en"
                  ? "Your name or contact (optional)"
                  : "Votre nom ou contact (optionnel)"
              }
              className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-[#EAE5D7] mb-6 text-lg"
            />

            {error && (
              <div className="p-4 mb-5 bg-red-100 border border-red-300 rounded-xl text-red-700 text-base">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!commentaire.trim()}
              className={`w-full py-4 text-lg font-semibold rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  commentaire.trim()
                    ? "bg-[#55B3B7] text-white hover:bg-[#499AA2]"
                    : "bg-[#93C5C1] text-gray-200 cursor-not-allowed"
                }`}
            >
              {currentLang === "ar"
                ? "إرسال تعليقي"
                : currentLang === "en"
                ? "Submit Feedback"
                : "Envoyer mes commentaires"}
            </button>
          </motion.form>
        )}

        {/* --- Message de remerciement --- */}
        {submitted && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-[#E2DDCF] border border-none p-8 rounded-2xl shadow-lg text-center mt-8"
          >
            <h3 className="text-2xl font-bold text-black mb-4">
              {thankMessages[currentLang].title}
            </h3>
            <p className="text-gray-700 mb-6">
              {thankMessages[currentLang].text}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-600 font-semibold hover:underline"
            >
              {thankMessages[currentLang].back}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
