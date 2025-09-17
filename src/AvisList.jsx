import { useEffect, useState } from "react";
import axios from "axios";
import { Star, User, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import custom from "./custom";

export default function AvisList({ slug }) {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const avisPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  // Vérification du secret code
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!secretCode) return setError("Veuillez saisir le code secret.");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/clients/${slug}/verify-secret`,
        { secretCode }
      );
      if (res.data.success) {
        setVerified(true);
        setError("");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Erreur serveur lors de la vérification."
      );
    }
  };

  // Récupération des avis après vérification
  useEffect(() => {
    const fetchAvis = async () => {
      if (!verified) return;

      try {
        setLoading(true);
        const res = await custom.get(`/clients/${slug}/avis`);
        document.title = res.data[0]?.nom || "Avis";

        // favicon
        const favicon =
          document.querySelector("link[rel='icon']") ||
          document.createElement("link");
        favicon.rel = "icon";
        favicon.type = "image/png";
        favicon.href = res.data[0]?.logo
          ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${res.data[0].logo}`
          : "/default-favicon.png";
        document.head.appendChild(favicon);

        setAvis(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAvis();
  }, [verified, slug]);

  // Pagination
  const indexOfLast = currentPage * avisPerPage;
  const indexOfFirst = indexOfLast - avisPerPage;
  const currentAvis = avis.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(avis.length / avisPerPage);

  // Calcul de la moyenne
  const moyenne = avis.length
    ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
    : 0;

  // Distribution des notes
  const noteDistribution = [3, 2, 1].map(note => ({
    note,
    count: avis.filter(a => a.note === note).length,
    percentage: avis.length ? (avis.filter(a => a.note === note).length / avis.length) * 100 : 0
  }));

  const renderStars = (rating, size = "w-5 h-5") => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`${size} ${
          idx < Math.round(rating) 
            ? "text-amber-400 fill-amber-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (!verified) {
    // Formulaire de saisie du code secret
    return (
      <div className="max-w-md mx-auto py-16 px-4">
<h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
      Accès aux avis
    </h2>
    <form onSubmit={handleVerify} className="space-y-5">
      <input
        type="text"
        placeholder="Entrez le code secret"
        value={secretCode}
        onChange={(e) => setSecretCode(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
      />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition"
      >
        Vérifier
      </button>
    </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-2">
                {[1,2,3,4,5].map(j => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="avis-section" className="max-w-4xl mx-auto py-12 px-4">
      {/* En-tête avec titre et stats */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <TrendingUp className="w-4 h-4" />
          Avis Clients Vérifiés
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Avis des consommateurs
        </h2>
        <p className="text-gray-600 text-lg">
          Découvrez les retours d'expérience de notre communauté
        </p>
      </div>

      {/* Statistiques globales */}
      {avis.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="text-5xl font-bold text-amber-500">{moyenne}</div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(moyenne)}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Basé sur {avis.length} avis client{avis.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {noteDistribution.map(({ note, count, percentage }) => (
                <div key={note} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-gray-600">{note}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-500 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      {avis.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun avis pour le moment
            </h3>
            <p className="text-gray-500">
              Soyez le premier à partager votre expérience !
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {currentAvis.map((a, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {renderStars(a.note, "w-5 h-5")}
                    </div>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      {a.note}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(a.date_soumission).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {a.commentaire && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {a.commentaire}
                    </p>
                  </div>
                )}

                {a.contact && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-600 font-medium">{a.contact}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
            }`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Précédent
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={i}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
            }`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
