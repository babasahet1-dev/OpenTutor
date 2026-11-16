
"use client";

import { useEffect, useRef, useState } from "react";

type QuizSummary = { totalMistakes: number };

type WriterInstance = {
  animateCharacter: () => void;
  quiz: (options?: {
    onComplete?: (result: QuizSummary) => void;
  }) => void;
  cancelQuiz: () => void;
};

type WriterAPI = {
  create: (
    element: HTMLElement,
    character: string,
    options: {
      width: number;
      height: number;
      padding: number;
      showCharacter: boolean;
      showOutline: boolean;
      strokeAnimationSpeed: number;
      onLoadCharDataSuccess?: () => void;
      onLoadCharDataError?: (error: unknown) => void;
    }
  ) => WriterInstance;
};

declare global {
  interface Window {
    HanziWriter?: WriterAPI;
  }
}

export default function HanziPage() {
  const [character, setCharacter] = useState("我");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Hanzi Writer ýüklenýär...");

  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<WriterInstance | null>(null);

  useEffect(() => {
    if (window.HanziWriter) {
      setReady(true);
      setStatus("Taýýar! Harp saýla.");
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js";
    script.async = true;

    script.onload = () => {
      setReady(true);
      setStatus("Taýýar! Harp saýla.");
    };

    script.onerror = () => {
      setStatus("Ýüklenmedi. Interneti barla.");
    };

    document.head.appendChild(script);

    return () => {
      writerRef.current?.cancelQuiz();
      script.remove();
    };
  }, []);

  function startPractice(mode: "animate" | "quiz") {
    const selected = Array.from(character.trim())[0];

    if (!selected) {
      setStatus("Ilki bir hytaý harpyny giriz.");
      return;
    }

    if (!window.HanziWriter || !targetRef.current) {
      setStatus("Biraz garaş, ulgam ýüklenýär.");
      return;
    }

    writerRef.current?.cancelQuiz();
    targetRef.current.innerHTML = "";

    setStatus("Harpyň maglumatlary ýüklenýär...");

    const writer = window.HanziWriter.create(
      targetRef.current,
      selected,
      {
        width: 250,
        height: 250,
        padding: 16,
        showCharacter: false,
        showOutline: true,
        strokeAnimationSpeed: 1.2,

        onLoadCharDataSuccess: () => {
          if (mode === "animate") {
            writerRef.current?.animateCharacter();
            setStatus(`${selected} harpynyň ýazuw tertibi görkezilýär.`);
          } else {
            setStatus("Indi harpy barmagyň bilen ýaz!");

            writerRef.current?.quiz({
              onComplete: (result) => {
                setStatus(
                  `Tamamlandy! Ýalňyş sany: ${result.totalMistakes}`
                );
              },
            });
          }
        },

        onLoadCharDataError: () => {
          setStatus("Harp maglumatlary ýüklenmedi. Interneti barla.");
        },
      }
    );

    writerRef.current = writer;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
        padding: "28px 16px",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <header style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "12px", letterSpacing: "2px" }}>
            CHINESE IS THE GREAT
          </p>

          <h1 style={{ fontSize: "30px" }}>
            汉字书写练习
          </h1>

          <p>
            Hytaý harplarynyň ýazuw tertibini öwren
            we özüň ýazyp gör.
          </p>
        </header>

        <section
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <label htmlFor="hanzi-character">
            Hytaý harpyny giriz
          </label>

          <input
            id="hanzi-character"
            value={character}
            maxLength={1}
            onChange={(event) => setCharacter(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: "24px",
              padding: "12px",
              border: "1px solid #ccd4e2",
              borderRadius: "12px",
              marginTop: "8px",
            }}
          />

          <p>Mysal: 我 (wǒ) — men.</p>

          <div
            ref={targetRef}
            style={{
              width: "250px",
              height: "250px",
              maxWidth: "100%",
              margin: "18px auto",
              background: "#fff",
              border: "1px solid #e1e6ef",
              borderRadius: "12px",
            }}
          />

          <p role="status">{status}</p>

          <button
            type="button"
            onClick={() => startPractice("animate")}
            disabled={!ready}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "10px",
              border: 0,
              borderRadius: "12px",
              background: "#315fd4",
              color: "#fff",
            }}
          >
            Ýazuw animasiýasyny görkez
          </button>

          <button
            type="button"
            onClick={() => startPractice("quiz")}
            disabled={!ready}
            style={{
              width: "100%",
              padding: "14px",
              border: 0,
              borderRadius: "12px",
              background: "#16865d",
              color: "#fff",
            }}
          >
            Özüm ýazyp göreýin
          </button>
        </section>

        <p style={{ fontSize: "12px", marginTop: "16px" }}>
          Ilkinji wersiýa harp maglumatlaryny internetden
          ýükleýär. Soňra ýerli ZIP maglumatlaryny hem
          birikdireris.
        </p>
      </div>
    </main>
  );
}
